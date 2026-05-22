const SUPABASE_URL = 'https://bozxbfosvzlayylrhtix.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_v4Ie4IkPj6LgCOp0ixK1YA_4bYpvgyZ';
const SUPABASE_AUTH_STORAGE_KEY = 'sb-bozxbfosvzlayylrhtix-auth-token';
const APP_ORIGIN = 'https://giftmatch-qqdu.onrender.com';
const EMAIL_REDIRECT_TO = `${APP_ORIGIN}/callback.html`;
const OTP_SENT_AT_KEY = 'giftmatch_otp_sent_at';
const OTP_COOLDOWN_MS = 65000;
const OTP_ALLOWED_PAGES = new Set(['register.html', 'verify-step.html']);

let supabase = null;
let initPromise = null;

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function getCurrentPageName() {
  const page = window.location.pathname.split('/').filter(Boolean).pop() || 'app.html';
  return page;
}

function isOtpAllowedPage() {
  return OTP_ALLOWED_PAGES.has(getCurrentPageName());
}

function getOtpCooldownInfo(email) {
  try {
    const raw = window.localStorage.getItem(OTP_SENT_AT_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed?.sent_at) return { blocked: false, waitMs: 0 };
    if (parsed.email && parsed.email !== email) return { blocked: false, waitMs: 0 };
    const elapsed = Date.now() - Number(parsed.sent_at || 0);
    const waitMs = OTP_COOLDOWN_MS - elapsed;
    return { blocked: waitMs > 0, waitMs: Math.max(0, waitMs) };
  } catch {
    return { blocked: false, waitMs: 0 };
  }
}

function markOtpSent(email) {
  try {
    window.localStorage.setItem(OTP_SENT_AT_KEY, JSON.stringify({ email, sent_at: Date.now() }));
  } catch {}
}

function getUrlSearchParams() {
  return new URLSearchParams(window.location.search);
}

function getUrlHashParams() {
  return new URLSearchParams(window.location.hash.replace(/^#/, ''));
}

function getPersistentStorage() {
  try {
    const testKey = '__giftmatch_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function clearGiftmatchStorage() {
  try {
    Object.keys(window.localStorage).forEach((key) => {
      if (
        key === SUPABASE_AUTH_STORAGE_KEY ||
        key.startsWith(`${SUPABASE_AUTH_STORAGE_KEY}-`) ||
        key.startsWith('giftmatch_') ||
        key.includes('bozxbfosvzlayylrhtix')
      ) {
        window.localStorage.removeItem(key);
      }
    });
  } catch {}
}

async function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForSupabaseGlobal(timeoutMs = 16000, intervalMs = 120) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      return window.supabase;
    }
    await wait(intervalMs);
  }
  throw new Error('Supabase CDN не загрузился');
}

async function initSupabaseClient() {
  if (window.giftmatchSupabase?.supabase) {
    supabase = window.giftmatchSupabase.supabase;
    return window.giftmatchSupabase;
  }

  if (initPromise) return initPromise;

  initPromise = (async () => {
    const supabaseGlobal = await waitForSupabaseGlobal();
    const persistentStorage = getPersistentStorage();

    supabase = supabaseGlobal.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: SUPABASE_AUTH_STORAGE_KEY,
        storage: persistentStorage,
      },
    });

    function isEmailVerified(user) {
      return Boolean(user?.email_confirmed_at || user?.confirmed_at);
    }

    async function waitForSession(timeoutMs = 9000, intervalMs = 250) {
      const startedAt = Date.now();
      while (Date.now() - startedAt < timeoutMs) {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session?.user) return data.session;
        await wait(intervalMs);
      }
      return null;
    }

    async function waitForUser(timeoutMs = 9000, intervalMs = 250) {
      const session = await waitForSession(timeoutMs, intervalMs);
      return session?.user ?? null;
    }

    async function sendEmailOtp(email, options = {}) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      if (!validateEmail(normalizedEmail)) {
        throw new Error('Введите корректный email.');
      }

      if (!isOtpAllowedPage()) {
        throw new Error('Отправка письма разрешена только со страницы входа или страницы подтверждения. Откройте register.html или verify-step.html.');
      }

      const cooldown = getOtpCooldownInfo(normalizedEmail);
      if (cooldown.blocked) {
        const seconds = Math.ceil(cooldown.waitMs / 1000);
        throw new Error(`Письмо уже отправлено. Подождите ${seconds} сек. перед повторной отправкой.`);
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: options.shouldCreateUser ?? true,
          emailRedirectTo: options.emailRedirectTo ?? EMAIL_REDIRECT_TO,
          data: options.data ?? {},
        },
      });
      if (error) throw error;
      markOtpSent(normalizedEmail);
      return data;
    }

    async function verifyEmailOtp(email, token) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const normalizedToken = String(token || '').trim();
      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: normalizedToken,
        type: 'email',
      });
      if (error) throw error;
      return data;
    }

    async function finalizeAuthFromUrl() {
      const searchParams = getUrlSearchParams();
      const hashParams = getUrlHashParams();
      const code = searchParams.get('code');
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const hashAccessToken = hashParams.get('access_token');
      const hashRefreshToken = hashParams.get('refresh_token');
      const hashError = hashParams.get('error_description') || searchParams.get('error_description');

      if (hashError) throw new Error(hashError);

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        return data.session ?? null;
      }

      if (tokenHash && type) {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (error) throw error;
        return data.session ?? null;
      }

      if (hashAccessToken && hashRefreshToken) {
        const { data, error } = await supabase.auth.setSession({ access_token: hashAccessToken, refresh_token: hashRefreshToken });
        if (error) throw error;
        return data.session ?? null;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session ?? null;
    }

    async function getSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session ?? null;
    }

    async function getUser() {
      const session = await getSession();
      if (!session?.user) return null;
      const { data, error } = await supabase.auth.getUser();
      if (error) return session.user;
      return data.user ?? session.user;
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
        .select('id, email, full_name, plan, is_paid, role, avatar_url, created_at, updated_at')
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
        supabase.from('gift_requests').select('id, occasion, budget, relation, interests, notes, source, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('gift_recommendations').select('id, title, reason, explanation, price_hint, category, tone, score, is_saved, saved_at, created_at, request:gift_requests(occasion, budget, relation, interests)').eq('user_id', user.id).eq('is_saved', true).order('saved_at', { ascending: false }).limit(20),
      ]);
      if (savedError) throw savedError;
      return { profile, lastRequest, savedRecommendations: savedRecommendations ?? [] };
    }

    async function getAccountData() {
      const user = await getUser();
      if (!user) return { profile: null, lastRequest: null, savedRecommendations: [] };
      try {
        const { data, error } = await supabase.functions.invoke('giftmatch-account');
        if (error) throw error;
        const ensuredProfile = data?.profile ?? (await ensureProfile(user));
        return { profile: ensuredProfile, lastRequest: data?.last_request ?? null, savedRecommendations: data?.saved_recommendations ?? [] };
      } catch {
        return getAccountDataFallback(user);
      }
    }

    async function requestRecommendations(payload) {
      const { data, error } = await supabase.functions.invoke('giftmatch-recommendations', { body: payload });
      if (error) throw error;
      return data;
    }

    async function saveRecommendations(recommendationIds) {
      try {
        const { data, error } = await supabase.functions.invoke('giftmatch-save-selection', { body: { recommendationIds } });
        if (error) throw error;
        return data?.saved ?? [];
      } catch {
        const { data, error } = await supabase.from('gift_recommendations').update({ is_saved: true, saved_at: new Date().toISOString() }).in('id', recommendationIds).select('id, title, is_saved, saved_at');
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

    async function clearAuthState() {
      try { await supabase.auth.signOut({ scope: 'local' }); } catch {}
      clearGiftmatchStorage();
    }

    async function signOut() {
      await clearAuthState();
    }

    window.giftmatchSupabase = {
      supabase,
      APP_ORIGIN,
      EMAIL_REDIRECT_TO,
      SUPABASE_AUTH_STORAGE_KEY,
      OTP_COOLDOWN_MS,
      OTP_SENT_AT_KEY,
      isOtpAllowedPage,
      getOtpCooldownInfo,
      isEmailVerified,
      validateEmail,
      waitForSession,
      waitForUser,
      sendEmailOtp,
      verifyEmailOtp,
      finalizeAuthFromUrl,
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
      clearAuthState,
      clearGiftmatchStorage,
    };

    return window.giftmatchSupabase;
  })();

  try { return await initPromise; }
  catch (error) { initPromise = null; throw error; }
}

window.initializeGiftmatchSupabase = initSupabaseClient;
initSupabaseClient().catch((error) => {
  window.__giftmatchClientInitError = error;
  console.error('GiftMatch supabase init failed:', error);
});
