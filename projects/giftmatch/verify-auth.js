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

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => toast.classList.add('hidden'), 3000);
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
  verifySubmitBtn.disabled = isSubmitting;
  verifySubmitBtn.textContent = isSubmitting ? 'Проверяем код…' : 'Подтвердить вход по коду';
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
  if (!email) return;
  verifyEmailInput.value = email;
  verifyLead.textContent = `Мы отправили подтверждение на ${email}. Если в письме есть код, введите его ниже. Если в письме только ссылка, откройте ее — GiftMatch завершит вход автоматически.`;
}

async function redirectIfSignedIn() {
  if (!window.giftmatchSupabase) return false;
  try {
    await window.giftmatchSupabase.finalizeAuthFromUrl();
    const session = await window.giftmatchSupabase.getSession();
    const user = session?.user ?? await window.giftmatchSupabase.getUser();
    if (!user) return false;
    await window.giftmatchSupabase.ensureProfile(user, {
      email: user.email ?? null,
      full_name: readDraft()?.name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    });
    clearPendingState();
    window.location.href = 'account.html';
    return true;
  } catch {
    return false;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideVerifyState();

  if (!window.giftmatchSupabase) {
    renderVerifyState('warning', 'Модуль входа не загрузился', 'Обновите страницу и попробуйте еще раз.');
    return;
  }

  const email = verifyEmailInput.value.trim().toLowerCase();
  const code = verifyCodeInput.value.trim();

  if (!window.giftmatchSupabase.validateEmail(email)) {
    renderVerifyState('warning', 'Проверьте email', 'Введите корректный email, на который пришло письмо.');
    return;
  }

  if (!/^\d{6,10}$/.test(code)) {
    renderVerifyState('warning', 'Неверный формат кода', 'Код должен состоять из цифр и содержать от 6 до 10 символов.');
    return;
  }

  try {
    setSubmitting(true);
    setPendingEmail(email);
    const response = await window.giftmatchSupabase.verifyEmailOtp(email, code);
    const user = response?.user || response?.session?.user || await window.giftmatchSupabase.getUser();
    if (!user) {
      throw new Error('Не удалось создать активную сессию после проверки кода.');
    }
    await window.giftmatchSupabase.ensureProfile(user, {
      email,
      full_name: readDraft()?.name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    });
    clearPendingState();
    renderVerifyState('success', 'Email подтвержден', 'Вход завершен. Сейчас откроем ваш личный кабинет.');
    showToast('Код подтвержден.');
    window.setTimeout(() => {
      window.location.href = 'account.html';
    }, 700);
  } catch (error) {
    renderVerifyState('warning', 'Не удалось подтвердить код', error.message || 'Проверьте код и попробуйте снова.');
  } finally {
    setSubmitting(false);
  }
});

resendCodeBtn.addEventListener('click', async () => {
  hideVerifyState();

  if (!window.giftmatchSupabase) {
    renderVerifyState('warning', 'Модуль входа не загрузился', 'Обновите страницу и попробуйте еще раз.');
    return;
  }

  const email = verifyEmailInput.value.trim().toLowerCase();
  const draft = readDraft();

  if (!window.giftmatchSupabase.validateEmail(email)) {
    renderVerifyState('warning', 'Проверьте email', 'Укажите корректный email, чтобы отправить письмо повторно.');
    return;
  }

  try {
    setPendingEmail(email);
    await window.giftmatchSupabase.sendEmailOtp(email, {
      data: {
        full_name: draft?.name ?? '',
        name: draft?.name ?? '',
      },
    });
    renderVerifyState('success', 'Письмо отправлено повторно', `Мы отправили новое письмо для входа на ${email}.`);
    showToast('Письмо отправлено повторно.');
  } catch (error) {
    renderVerifyState('warning', 'Не удалось отправить письмо', error.message || 'Попробуйте снова через несколько секунд.');
  }
});

(async () => {
  if (!window.giftmatchSupabase) {
    renderVerifyState('warning', 'Модуль входа не загрузился', 'GiftMatch не смог инициализировать клиент авторизации. Обновите страницу.');
    return;
  }

  window.giftmatchSupabase.onAuthStateChange(async (_event, session) => {
    if (!session?.user) return;
    try {
      await window.giftmatchSupabase.ensureProfile(session.user, {
        email: session.user.email ?? null,
        full_name: readDraft()?.name ?? session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null,
      });
    } finally {
      clearPendingState();
      window.location.href = 'account.html';
    }
  });

  hydrateEmail();
  await redirectIfSignedIn();
})();
