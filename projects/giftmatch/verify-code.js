(() => {
  const SUPABASE_URL = 'https://bozxbfosvzlayylrhtix.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_v4Ie4IkPj6LgCOp0ixK1YA_4bYpvgyZ';
  const STORAGE_KEY = 'sb-bozxbfosvzlayylrhtix-auth-token';
  const pendingEmailKey = 'giftmatch_pending_email';
  const draftKey = 'giftmatch_signup_draft';
  const redirectKey = 'giftmatch_after_auth_redirect';
  const otpSentAtKey = 'giftmatch_otp_sent_at';
  const cooldownMs = 65000;

  let client = null;

  function qs(id) {
    return document.getElementById(id);
  }

  function setMessage(type, title, text) {
    const box = qs('verifyMessage');
    if (!box) return;
    box.className = `auth-notice is-${type}`;
    box.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
    box.classList.remove('hidden');
  }

  function showToast(message) {
    const toast = qs('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(window.__giftmatchVerifyCodeToastTimer);
    window.__giftmatchVerifyCodeToastTimer = window.setTimeout(() => toast.classList.add('hidden'), 2800);
  }

  function readDraft() {
    try { return JSON.parse(localStorage.getItem(draftKey) || 'null'); } catch { return null; }
  }

  function getStoredEmail() {
    return String(localStorage.getItem(pendingEmailKey) || readDraft()?.email || '').trim().toLowerCase();
  }

  function getRedirectTarget() {
    return localStorage.getItem(redirectKey) || 'cabinet.html';
  }

  function clearPendingAuthState() {
    localStorage.removeItem(pendingEmailKey);
    localStorage.removeItem(draftKey);
    localStorage.removeItem(redirectKey);
  }

  function getCooldown(email) {
    try {
      const info = JSON.parse(localStorage.getItem(otpSentAtKey) || 'null');
      if (!info?.sent_at || info.email !== email) return 0;
      return Math.max(0, cooldownMs - (Date.now() - Number(info.sent_at)));
    } catch {
      return 0;
    }
  }

  function markSent(email) {
    localStorage.setItem(otpSentAtKey, JSON.stringify({ email, sent_at: Date.now() }));
  }

  async function ensureSupabase() {
    if (client) return client;
    if (!window.supabase?.createClient) throw new Error('Supabase CDN не загрузился. Обновите страницу.');
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: STORAGE_KEY,
        storage: window.localStorage,
      },
    });
    return client;
  }

  async function ensureProfile(user, email) {
    const draft = readDraft();
    const payload = {
      id: user.id,
      email: user.email || email,
      full_name: draft?.name || user.user_metadata?.full_name || user.user_metadata?.name || null,
    };
    const supabaseClient = await ensureSupabase();
    await supabaseClient.from('profiles').upsert(payload, { onConflict: 'id' });
  }

  async function verifyOtp(event) {
    event.preventDefault();
    const email = String(qs('verifyEmail')?.value || '').trim().toLowerCase();
    const token = String(qs('verifyCode')?.value || '').replace(/\s+/g, '').trim();
    const button = qs('verifySubmitBtn');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('warning', 'Проверьте email', 'Введите email, на который пришло письмо с кодом.');
      return;
    }
    if (!/^\d{6,10}$/.test(token)) {
      setMessage('warning', 'Проверьте код', 'Введите цифровой код из письма.');
      return;
    }

    try {
      button.disabled = true;
      button.textContent = 'Проверяем…';
      const supabaseClient = await ensureSupabase();
      const { data, error } = await supabaseClient.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw error;
      const user = data?.user || data?.session?.user;
      if (!user) throw new Error('Код принят, но сессия не создана. Запросите новое письмо.');
      await ensureProfile(user, email);
      const redirect = getRedirectTarget();
      clearPendingAuthState();
      setMessage('success', 'Вход подтвержден', 'Сессия сохранена. Открываем кабинет.');
      showToast('Вход выполнен.');
      setTimeout(() => { window.location.href = redirect; }, 600);
    } catch (error) {
      setMessage('warning', 'Не удалось подтвердить код', error?.message || 'Проверьте код и попробуйте снова.');
      showToast('Не удалось подтвердить код.');
    } finally {
      button.disabled = false;
      button.textContent = 'Подтвердить';
    }
  }

  async function resendOtp(event) {
    event.preventDefault();
    const email = String(qs('verifyEmail')?.value || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('warning', 'Проверьте email', 'Введите email перед повторной отправкой письма.');
      return;
    }

    const waitMs = getCooldown(email);
    if (waitMs > 0) {
      setMessage('warning', 'Письмо уже отправлено', `Подождите ${Math.ceil(waitMs / 1000)} сек. перед повторной отправкой.`);
      return;
    }

    try {
      const supabaseClient = await ensureSupabase();
      const draft = readDraft();
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: 'https://giftmatch-qqdu.onrender.com/verify-code.html',
          data: draft?.name ? { full_name: draft.name, name: draft.name } : {},
        },
      });
      if (error) throw error;
      localStorage.setItem(pendingEmailKey, email);
      markSent(email);
      setMessage('success', 'Письмо отправлено', `Код отправлен на ${email}.`);
      showToast('Письмо отправлено.');
    } catch (error) {
      setMessage('warning', 'Не удалось отправить письмо', error?.message || 'Попробуйте позже.');
    }
  }

  function init() {
    const storedEmail = getStoredEmail();
    if (storedEmail && qs('verifyEmail')) qs('verifyEmail').value = storedEmail;
    qs('verifyForm')?.addEventListener('submit', verifyOtp);
    qs('resendCodeBtn')?.addEventListener('click', resendOtp);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
