const draftKey = 'giftmatch_signup_draft';
const pendingEmailKey = 'giftmatch_pending_email';
const toast = document.getElementById('toast');
const form = document.getElementById('registerForm');
const verificationState = document.getElementById('emailVerificationState');
const sendCodeBtn = document.getElementById('sendCodeBtn');
const nameInput = document.getElementById('registerName');
const emailInput = document.getElementById('registerEmail');
const consentInput = document.getElementById('registerConsent');

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function renderVerificationState(type, title, message) {
  verificationState.className = `auth-notice ${type ? `is-${type}` : ''}`.trim();
  verificationState.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
  verificationState.classList.remove('hidden');
}

function hideVerificationState() {
  verificationState.classList.add('hidden');
  verificationState.innerHTML = '';
  verificationState.className = 'auth-notice hidden';
}

function setSubmitting(isSubmitting) {
  sendCodeBtn.disabled = isSubmitting;
  sendCodeBtn.textContent = isSubmitting ? 'Отправляем код…' : 'Получить код';
}

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(draftKey)) ?? null;
  } catch {
    return null;
  }
}

function writeDraft(value) {
  localStorage.setItem(draftKey, JSON.stringify(value));
}

function clearDraft() {
  localStorage.removeItem(draftKey);
}

function writePendingEmail(email) {
  localStorage.setItem(pendingEmailKey, String(email || '').trim().toLowerCase());
}

async function hydrateFromSession() {
  const session = await window.giftmatchSupabase.getSession();
  if (!session?.user) return false;

  const user = session.user;
  nameInput.value = user.user_metadata?.full_name ?? user.user_metadata?.name ?? '';
  emailInput.value = user.email ?? '';

  if (!window.giftmatchSupabase.isEmailVerified(user)) {
    renderVerificationState(
      'warning',
      'Нужно завершить вход',
      `Код уже отправлен на ${user.email ?? 'ваш email'}. Сейчас откроем следующий шаг, где можно ввести код и завершить вход.`
    );
    window.setTimeout(() => {
      window.location.href = 'verify.html';
    }, 700);
    return false;
  }

  showToast('Вы уже вошли в аккаунт. Перенаправляем в личный кабинет.');
  window.setTimeout(() => {
    window.location.href = 'account.html';
  }, 700);
  return true;
}

function validateForm(name, email, consent) {
  if (!name) {
    renderVerificationState('warning', 'Добавьте имя', 'Укажите имя, чтобы мы могли корректно оформить ваш профиль.');
    showToast('Введите имя.');
    nameInput.focus();
    return false;
  }

  if (!email) {
    renderVerificationState('warning', 'Добавьте email', 'Введите рабочий email, на который мы отправим код подтверждения.');
    showToast('Введите email.');
    emailInput.focus();
    return false;
  }

  if (!window.giftmatchSupabase.validateEmail(email)) {
    renderVerificationState('warning', 'Проверьте email', 'Адрес выглядит некорректно. Укажите рабочий email в формате name@example.com.');
    showToast('Введите корректный email.');
    emailInput.focus();
    return false;
  }

  if (!consent) {
    renderVerificationState('warning', 'Нужно подтверждение', 'Поставьте галочку, чтобы продолжить и получить код подтверждения.');
    showToast('Подтвердите согласие с условиями.');
    consentInput.focus();
    return false;
  }

  return true;
}

const draft = readDraft();
if (draft) {
  nameInput.value = draft.name ?? '';
  emailInput.value = draft.email ?? '';
}

hydrateFromSession().catch(() => {});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideVerificationState();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const consent = consentInput.checked;

  if (!validateForm(name, email, consent)) {
    return;
  }

  try {
    setSubmitting(true);
    writeDraft({ name, email });
    writePendingEmail(email);

    await window.giftmatchSupabase.sendEmailOtp(email);

    renderVerificationState(
      'success',
      'Код отправлен',
      `Мы отправили код подтверждения на ${email}. Сейчас откроем следующий шаг, где можно ввести код и завершить вход.`
    );
    showToast('Код подтверждения отправлен на email.');
    window.setTimeout(() => {
      window.location.href = 'verify.html';
    }, 500);
  } catch (error) {
    renderVerificationState('warning', 'Не удалось отправить код', error.message || 'Попробуйте снова через несколько секунд.');
    showToast(error.message || 'Не удалось отправить код подтверждения.');
  } finally {
    setSubmitting(false);
  }
});

window.giftmatchSupabase.onAuthStateChange(async (_event, session) => {
  if (!session?.user) return;

  if (!window.giftmatchSupabase.isEmailVerified(session.user)) {
    writePendingEmail(session.user.email ?? '');
    return;
  }

  try {
    await window.giftmatchSupabase.ensureProfile(session.user, {
      email: session.user.email ?? emailInput.value.trim().toLowerCase(),
      full_name: readDraft()?.name ?? session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null,
    });
    clearDraft();
    localStorage.removeItem(pendingEmailKey);
    window.location.href = 'account.html';
  } catch {
    window.location.href = 'account.html';
  }
});
