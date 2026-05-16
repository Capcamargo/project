const draftKey = 'giftmatch_signup_draft';
const pendingEmailKey = 'giftmatch_pending_email';
const toast = document.getElementById('toast');
const form = document.getElementById('verifyForm');
const resendCodeBtn = document.getElementById('resendCodeBtn');
const verifySubmitBtn = document.getElementById('verifySubmitBtn');
const verifyState = document.getElementById('verifyState');
const verifyEmailInput = document.getElementById('verifyEmail');
const verifyCodeInput = document.getElementById('verifyCode');
const verifyLead = document.getElementById('verifyLead');

async function getGiftmatchClient(timeoutMs = 4000, intervalMs = 200) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (
      window.giftmatchSupabase &&
      typeof window.giftmatchSupabase.getSession === 'function' &&
      typeof window.giftmatchSupabase.verifyEmailOtp === 'function' &&
      typeof window.giftmatchSupabase.sendEmailOtp === 'function'
    ) {
      return window.giftmatchSupabase;
    }
    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
  }
  return null;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function renderVerifyState(type, title, message) {
  verifyState.className = `auth-notice ${type ? `is-${type}` : ''}`.trim();
  verifyState.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
  verifyState.classList.remove('hidden');
}

function hideVerifyState() {
  verifyState.className = 'auth-notice hidden';
  verifyState.innerHTML = '';
}

function setSubmitting(isSubmitting) {
  if (!verifySubmitBtn) return;
  verifySubmitBtn.disabled = isSubmitting;
  verifySubmitBtn.textContent = isSubmitting ? 'Проверяем код…' : 'Подтвердить вход';
}

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(draftKey)) ?? null;
  } catch {
    return null;
  }
}

function getPendingEmail() {
  return String(localStorage.getItem(pendingEmailKey) || '').trim().toLowerCase();
}

function setPendingEmail(email) {
  localStorage.setItem(pendingEmailKey, String(email || '').trim().toLowerCase());
}

function clearPendingState() {
  localStorage.removeItem(pendingEmailKey);
  localStorage.removeItem(draftKey);
}

function hydrateEmail() {
  const pendingEmail = getPendingEmail();
  const draft = readDraft();
  const email = pendingEmail || draft?.email || '';

  if (email) {
    verifyEmailInput.value = email;
    verifyLead.textContent = `Мы отправили код на ${email}. Введите его ниже, чтобы завершить вход и открыть личный кабинет GiftMatch.`;
  }
}

async function redirectIfSignedIn() {
  const client = await getGiftmatchClient();
  if (!client) return false;

  const session = await client.getSession();
  if (!session?.user) return false;

  if (!client.isEmailVerified(session.user)) {
    return false;
  }

  try {
    await client.ensureProfile(session.user);
    clearPendingState();
    window.location.href = 'account.html';
    return true;
  } catch {
    window.location.href = 'account.html';
    return true;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideVerifyState();

  const client = await getGiftmatchClient();
  if (!client) {
    renderVerifyState('warning', 'Модуль входа не загрузился', 'Обновите страницу и попробуйте еще раз.');
    showToast('Модуль входа еще не загрузился.');
    return;
  }

  const email = verifyEmailInput.value.trim().toLowerCase();
  const code = verifyCodeInput.value.trim();

  if (!client.validateEmail(email)) {
    renderVerifyState('warning', 'Проверьте email', 'Введите тот же email, на который вы запросили код.');
    showToast('Введите корректный email.');
    return;
  }

  if (!/^\d{6,10}$/.test(code)) {
    renderVerifyState('warning', 'Неверный формат кода', 'Код подтверждения должен состоять только из цифр и содержать от 6 до 10 символов.');
    showToast('Введите код из письма целиком.');
    return;
  }

  try {
    setSubmitting(true);
    setPendingEmail(email);
    const { user } = await client.verifyEmailOtp(email, code);
    if (user) {
      await client.ensureProfile(user, {
        email,
        full_name: readDraft()?.name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      });
    }
    clearPendingState();
    renderVerifyState('success', 'Email подтвержден', 'Вход завершен. Сейчас откроем ваш личный кабинет.');
    showToast('Код подтвержден. Перенаправляем в кабинет.');
    window.setTimeout(() => {
      window.location.href = 'account.html';
    }, 700);
  } catch (error) {
    renderVerifyState('warning', 'Не удалось подтвердить код', error.message || 'Проверьте код и попробуйте снова.');
    showToast(error.message || 'Не удалось подтвердить код.');
  } finally {
    setSubmitting(false);
  }
});

resendCodeBtn.addEventListener('click', async () => {
  hideVerifyState();

  const client = await getGiftmatchClient();
  if (!client) {
    renderVerifyState('warning', 'Модуль входа не загрузился', 'Обновите страницу и попробуйте снова.');
    showToast('Модуль входа еще не загрузился.');
    return;
  }

  const email = verifyEmailInput.value.trim().toLowerCase();
  const draft = readDraft();

  if (!client.validateEmail(email)) {
    renderVerifyState('warning', 'Проверьте email', 'Укажите корректный email, чтобы мы могли отправить код повторно.');
    showToast('Введите корректный email.');
    return;
  }

  try {
    setPendingEmail(email);
    await client.sendEmailOtp(email, {
      data: {
        full_name: draft?.name ?? '',
        name: draft?.name ?? '',
      },
    });
    renderVerifyState('success', 'Новый код отправлен', `Мы повторно отправили код подтверждения на ${email}.`);
    showToast('Код отправлен повторно.');
  } catch (error) {
    renderVerifyState('warning', 'Не удалось отправить код', error.message || 'Попробуйте снова через несколько секунд.');
    showToast(error.message || 'Не удалось отправить код повторно.');
  }
});

(async () => {
  const client = await getGiftmatchClient();
  if (!client) return;

  client.onAuthStateChange(async (_event, session) => {
    if (!session?.user) return;
    if (!client.isEmailVerified(session.user)) return;

    try {
      await client.ensureProfile(session.user);
    } finally {
      clearPendingState();
      window.location.href = 'account.html';
    }
  });
})();

hydrateEmail();
redirectIfSignedIn().catch(() => {});
