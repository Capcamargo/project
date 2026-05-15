const SUPABASE_URL = 'https://bozxbfosvzlayylrhtix.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_v4Ie4IkPj6LgCOp0ixK1YA_4bYpvgyZ';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

function isEmailVerified(user) {
  return Boolean(user?.email_confirmed_at || user?.confirmed_at);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

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

  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
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

async function getCurrentPlan() {
  const profile = await getProfile();
  return profile?.plan ?? 'free';
}

async function getPresets() {
  const { data, error } = await supabase
    .from('gift_presets')
    .select('id, slug, title, occasion, budget_hint, relation, interests, notes, tags, image_path, starting_price, short_description, badge_text, filter_tags')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function getAccountDataFallback(user) {
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

async function getAccountData() {
  const user = await getUser();
  if (!user) {
    return {
      profile: null,
      lastRequest: null,
      savedRecommendations: [],
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('giftmatch-account');
    if (error) throw error;

    const ensuredProfile = data?.profile ?? (await ensureProfile(user));
    return {
      profile: ensuredProfile,
      lastRequest: data?.last_request ?? null,
      savedRecommendations: data?.saved_recommendations ?? [],
    };
  } catch {
    return getAccountDataFallback(user);
  }
}

async function requestRecommendations(payload) {
  const { data, error } = await supabase.functions.invoke('giftmatch-recommendations', {
    body: payload,
  });

  if (error) throw error;
  return data;
}

async function saveRecommendations(recommendationIds) {
  try {
    const { data, error } = await supabase.functions.invoke('giftmatch-save-selection', {
      body: { recommendationIds },
    });

    if (error) throw error;
    return data?.saved ?? [];
  } catch {
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
}

async function updatePlan(plan, fallback = {}) {
  const user = await getUser();
  if (!user) throw new Error('Пользователь не авторизован.');

  const normalizedPlan = String(plan).toLowerCase();
  const updates = {
    plan: normalizedPlan,
    is_paid: normalizedPlan !== 'free',
    email: fallback.email ?? user.email ?? null,
    full_name: fallback.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
  };

  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
  if (error) throw error;
  return ensureProfile(user, updates);
}

function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

window.giftmatchSupabase = {
  supabase,
  isEmailVerified,
  validateEmail,
  getSession,
  getUser,
  getProfile,
  getCurrentPlan,
  getPresets,
  ensureProfile,
  getAccountData,
  requestRecommendations,
  saveRecommendations,
  updatePlan,
  onAuthStateChange,
  signOut,
};
