(() => {
  if (!/verify-step\.html$/.test(location.pathname)) return;

  const pendingEmailKey = 'giftmatch_pending_email';
  const draftKey = 'giftmatch_signup_draft';
  const afterAuthRedirectKey = 'giftmatch_after_auth_redirect';
  const authModeKey = 'giftmatch_auth_mode';
  const otpSentAtKey = 'giftmatch_otp_sent_at';
  const cabinetUrl = 'cabinet.html';

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(window.__giftmatchVerifyRescueToastTimer);
    window.__giftmatchVerifyRescueToastTimer = window.setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  function setState(type, title, message) {
    const box = document.getElementById('verifyState');
    if (!box) return;
    box.className = `auth-notice is-${type}`;
    box.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
    box.classList.remove('hidden');
  }

  function getDraft() {
    try { return JSON.parse(localStorage.getItem(draftKey) || 'null'); } catch { return null; }
  }

  function getEmail() {
    return String(localStorage.getItem(pendingEmailKey) || getDraft()?.email || document.getElementById('verifyEmail')?.value || '').trim().toLowerCase();
  }

  async function getClient() {
    if (!window.ensureGiftmatchClient) throw new Error('Модуль входа не загрузился. Обновите страницу.');
    return window.ensureGiftmatchClient(22000);
  }

  function getRedirectTarget() {
    return localStorage.getItem(afterAuthRedirectKey) || cabinetUrl;
  }

  function clearPending() {
    localStorage.removeItem(pendingEmailKey);
    localStorage.removeItem(draftKey);
    localStorage.removeItem(afterAuthRedirectKey);
  }

  function hydrateEmail() {
    const email = getEmail();
    const input = document.getElementById('verifyEmail');
    if (email && input) input.value = email;
  }

  async function verifyCode(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();

    const email = getEmail();
    const token = String(document.getElementById('verifyCode')?.value || '').trim();
    const submit = document.getElementById('verifySubmitBtn');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('warning', 'Проверьте email', 'Введите email, на который пришло письмо с кодом.');
      return;
    }
    if (!/^\d{6,10}$/.test(token)) {
      setState('warning', 'Введите код', 'Код должен состоять из цифр из письма Supabase.');
      return;
    }

    try {
      if (submit) { submit.disabled = true; submit.textContent = 'Проверяем код…'; }
      const client = await getClient();
      const data = await client.verifyEmailOtp(email, token);
      const session = data?.session || await client.waitForSession(9000, 250);
      const user = data?.user || session?.user || await client.getUser();
      if (!user) throw new Error('Код принят, но активная сессия не создана. Попробуйте запросить новое письмо.');
      await client.ensureProfile(user, {
        email,
        full_name: getDraft()?.name || user.user_metadata?.full_name || user.user_metadata?.name || null,
      });
      const redirect = getRedirectTarget();
      clearPending();
      setState('success', 'Вход подтвержден', 'Сессия сохранена. Открываем кабинет.');
      showToast('Вход завершен.');
      setTimeout(() => { location.href = redirect; }, 650);
    } catch (error) {
      setState('warning', 'Не удалось подтвердить код', error?.message || 'Проверьте код и попробуйте снова.');
      showToast(error?.message || 'Не удалось подтвердить код.');
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = 'Подтвердить'; }
    }
  }

  async function resendCode(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();

    const email = getEmail();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('warning', 'Проверьте email', 'Укажите корректный email, чтобы отправить письмо повторно.');
      return;
    }

    try {
      const client = await getClient();
      const draft = getDraft();
      const mode = localStorage.getItem(authModeKey) === 'signin' ? 'signin' : 'signup';
      localStorage.setItem(pendingEmailKey, email);
      await client.sendEmailOtp(email, {
        emailRedirectTo: client.EMAIL_REDIRECT_TO,
        shouldCreateUser: mode !== 'signin',
        data: mode === 'signup' ? { full_name: draft?.name || '', name: draft?.name || '' } : {},
      });
      localStorage.setItem(otpSentAtKey, JSON.stringify({ email, sent_at: Date.now() }));
      setState('success', 'Письмо отправлено', `Мы отправили новое письмо на ${email}.`);
      showToast('Письмо отправлено.');
    } catch (error) {
      setState('warning', 'Не удалось отправить письмо', error?.message || 'Попробуйте еще раз через несколько секунд.');
    }
  }

  async function checkExistingSession() {
    try {
      const client = await getClient();
      await client.finalizeAuthFromUrl().catch(() => {});
      const session = await client.getSession();
      if (session?.user) {
        document.getElementById('verifyCabinetShortcut')?.classList.remove('hidden');
        const redirect = getRedirectTarget();
        clearPending();
        location.href = redirect;
      }
    } catch {}
  }

  function init() {
    hydrateEmail();
    document.getElementById('verifyForm')?.addEventListener('submit', verifyCode, true);
    document.getElementById('resendCodeBtn')?.addEventListener('click', resendCode, true);
    checkExistingSession();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
