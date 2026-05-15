const SUPABASE_URL = 'https://bozxbfosvzlayylrhtix.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_v4Ie4IkPj6LgCOp0ixK1YA_4bYpvgyZ';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

async function ensureProfile(user, fallback = {}) {
  if (!user) return null;

  const payload = {
    id: user.id,
    email: fallback.email ?? user.email ?? null,
    full_name: fallback.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' });

  if (error) throw error;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, plan, is_paid, avatar_url, created_at, updated_at')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;
  return profile;
}

async function getProfile() {
  const user = await getUser();
  if (!user) return null;
  return ensureProfile(user);
}

async function getAccountData() {
  const user = await getUser();
  if (!user) {
    return {
      profile: null,
      lastRequest: null,
      savedRecommendations: [],
    };
  }

  const profile = await ensureProfile(user);

  const [{ data: lastRequest }, { data: savedRecommendations, error: savedError }] = await Promise.all([
    supabase
      .from('gift_requests')
      .select('id, occasion, budget, relation, interests, notes, source, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('gift_recommendations')
      .select('id, title, reason, explanation, price_hint, category, tone, score, is_saved, saved_at, created_at, request:gift_requests(occasion, budget, relation, interests)')
      .eq('user_id', user.id)
      .eq('is_saved', true)
      .order('saved_at', { ascending: false })
      .limit(20),
  ]);

  if (savedError) throw savedError;

  return {
    profile,
    lastRequest,
    savedRecommendations: savedRecommendations ?? [],
  };
}

async function requestRecommendations(payload) {
  const { data, error } = await supabase.functions.invoke('giftmatch-recommendations', {
    body: payload,
  });

  if (error) throw error;
  return data;
}

async function saveRecommendations(recommendationIds) {
  const { data, error } = await supabase
    .from('gift_recommendations')
    .update({
      is_saved: true,
      saved_at: new Date().toISOString(),
    })
    .in('id', recommendationIds)
    .select('id, title, is_saved, saved_at');

  if (error) throw error;
  return data ?? [];
}

async function updatePlan(plan) {
  const user = await getUser();
  if (!user) throw new Error('Пользователь не авторизован.');

  const updates = {
    plan: String(plan).toLowerCase(),
    is_paid: plan !== 'Free',
    email: user.email ?? null,
    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
  };

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) throw error;
  return ensureProfile(user);
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

window.giftmatchSupabase = {
  supabase,
  getSession,
  getUser,
  getProfile,
  ensureProfile,
  getAccountData,
  requestRecommendations,
  saveRecommendations,
  updatePlan,
  signOut,
};
