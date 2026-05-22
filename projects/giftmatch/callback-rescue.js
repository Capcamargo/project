(() => {
  if (!/callback\.html$/.test(location.pathname)) return;

  const SUPABASE_URL = 'https://bozxbfosvzlayylrhtix.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_v4Ie4IkPj6LgCOp0ixK1YA_4bYpvgyZ';
  const STORAGE_KEY = 'sb-bozxbfosvzlayylrhtix-auth-token';
  const redirectKey = 'giftmatch_after_auth_redirect';
  const draftKey = 'giftmatch_signup_draft';
  const pendingEmailKey = 'giftmatch_pending_email';

  let rescueStarted = false;

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setState(type, title, message) {
    const box = document.getElementById('callbackState');
    if (!box) return;
    box.className = `auth-notice is-${type}`;
    box.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(window.__giftmatchCallbackRescueToastTimer);
    window.__giftmatchCallbackRescueToastTimer = window.setTimeout(() => toast.classList.add('hidden'), 2600);
  }

  function readDraft() {
    try { return JSON.parse(localStorage.getItem(draftKey) || 'null'); } catch { return null; }
  }

  function getRedirectUrl() {
    return localStorage.getItem(redirectKey) || 'cabinet.html';
  }

  function cleanAuthUrl() {
    if (window.history.replaceState) window.history.replaceState({}, document.title, 'callback.html');
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function loadScript(src, id) {
    return new Promise((resolve, reject) => {
      const existing = id ? document.getElementById(id) : null;
      if (existing) {
        if (existing.dataset.loaded === '1') return resolve();
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      if (id) script.id = id;
      script.addEventListener('load', () => { script.dataset.loaded = '1'; resolve(); }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  async function ensureSupabaseGlobal() {
    if (window.supabase?.createClient) return window.supabase;
    await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', 'giftmatch-callback-rescue-cdn').catch(() => {});
    if (window.supabase?.createClient) return window.supabase;
    await loadScript('https://unpkg.com/@supabase/supabase-js@2', 'giftmatch-callback-rescue-cdn-2');
    return window.supabase;
  }

  async function getClient() {
    if (window.ensureGiftmatchClient) {
      try { return await window.ensureGiftmatchClient(6000); } catch {}
    }
    const global = await ensureSupabaseGlobal();
    return {
      supabase: global.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storageKey: STORAGE_KEY,
          storage: window.localStorage,
        },
      }),
    };
  }

  async function getSessionFromUrl(client) {
    const supabaseClient = client.supabase || client;
    const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    const search = new URLSearchParams(location.search);
    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');
    const code = search.get('code');
    const tokenHash = search.get('token_hash');
    const type = search.get('type');
    const errorDescription = hash.get('error_description') || search.get('error_description');

    if (errorDescription) throw new Error(errorDescription);

    if (accessToken && refreshToken) {
      const { data, error } = await supabaseClient.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (error) throw error;
      return data.session;
    }

    if (code) {
      const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);
      if (error) throw error;
      return data.session;
    }

    if (tokenHash && type) {
      const { data, error } = await supabaseClient.auth.verifyOtp({ token_hash: tokenHash, type });
      if (error) throw error;
      return data.session;
    }

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function ensureProfile(client, user) {
    if (!user) return null;
    if (client.ensureProfile) {
      try { return await client.ensureProfile(user); } catch {}
    }
    const supabaseClient = client.supabase || client;
    const draft = readDraft();
    const payload = {
      id: user.id,
      email: user.email || draft?.email || null,
      full_name: draft?.name || user.user_metadata?.full_name || user.user_metadata?.name || null,
    };
    await supabaseClient.from('profiles').upsert(payload, { onConflict: 'id' });
    return payload;
  }

  async function rescueCallback() {
    if (rescueStarted) return;
    rescueStarted = true;

    const hasAuthParams = location.hash.includes('access_token=') || location.search.includes('code=') || location.search.includes('token_hash=');
    if (!hasAuthParams) return;

    setText('callbackTitle', 'Завершаем вход');
    setText('callbackSubtitle', 'GiftMatch сохраняет сессию из письма и откроет кабинет.');
    setState('success', 'Идет авторизация', 'Проверяем ссылку и сохраняем активную сессию в браузере.');

    try {
      const client = await getClient();
      const session = await Promise.race([
        getSessionFromUrl(client),
        wait(12000).then(() => { throw new Error('Авторизация заняла слишком много времени. Попробуйте открыть письмо еще раз.'); }),
      ]);

      if (!session?.user) throw new Error('Ссылка не создала активную сессию. Запросите новое письмо для входа.');
      await ensureProfile(client, session.user);
      localStorage.removeItem(pendingEmailKey);
      localStorage.removeItem(draftKey);
      const redirectUrl = getRedirectUrl();
      localStorage.removeItem(redirectKey);
      cleanAuthUrl();
      setText('callbackTitle', 'Вход завершен');
      setText('callbackSubtitle', 'Сессия сохранена. Сейчас откроется нужная страница.');
      setState('success', 'Аккаунт готов', 'Переходим дальше.');
      showToast('Вход завершен.');
      setTimeout(() => { location.href = redirectUrl; }, 550);
    } catch (error) {
      setText('callbackTitle', 'Не удалось завершить вход');
      setText('callbackSubtitle', 'Ссылка из письма не создала активную сессию.');
      setState('warning', 'Ошибка авторизации', error?.message || 'Запросите новое письмо и попробуйте снова.');
      showToast(error?.message || 'Не удалось завершить вход.');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', rescueCallback, { once: true });
  else rescueCallback();
  setTimeout(rescueCallback, 800);
})();
