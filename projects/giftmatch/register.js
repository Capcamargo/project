const draftKey = 'giftmatch_signup_draft';
const toast = document.getElementById('toast');
const form = document.getElementById('registerForm');
const verificationState = document.getElementById('emailVerificationState');

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

function accountRedirectUrl() {
  return new URL('account.html', window.location.href).toString();
}

async function hydrateFromSession() {
  const session = await window.giftmatchSupabase.getSession();
  if (!session?.user) return false;

  const user = session.user;
  document.getElementById('registerName').value = user.user_metadata?.full_name ?? user.user_metadata?.name ?? '';
  document.getElementById('registerEmail').value = user.email ?? '';

  if (!window.giftmatchSupabase.isEmailVerified(user)) {
    renderVerificationState(
      'warning',
      'Подтвердите вход через письмо',
      `Мы уже отправили ссылку на ${user.email ?? 'ваш email'}. Откройте письмо и перейдите по ссылке, чтобы завершить вход.`
    );
    showToast('Письмо отправлено. Для входа нужно подтвердить email через ссылку в письме.');
    return false;
  }

  showToast('Вы уже вошли в аккаунт. Перенаправляем в личный кабинет.');
  window.setTimeout(() => {
    window.location.href = 'account.html';
  }, 700);
  return true;
}

const draft = readDraft();
if (draft) {
  document.getElementById('registerName').value = draft.name ?? '';
  document.getElementById('registerEmail').value = draft.email ?? '';
}

hydrateFromSession().catch(() => {});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideVerificationState();

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim().toLowerCase();
  const consent = document.getElementById('registerConsent').checked;

  if (!name || !email) {
    showToast('Заполните имя и email.');
    return;
  }

  if (!window.giftmatchSupabase.validateEmail(email)) {
    renderVerificationState('warning', 'Проверьте email', 'Адрес выглядит некорректно. Укажите рабочий email в формате name@example.com.');
    showToast('Введите корректный email.');
    return;
  }

  if (!consent) {
    showToast('Нужно согласиться с условиями.');
    return;
  }

  try {
    writeDraft({ name, email });
    const { error } = await window.giftmatchSupabase.supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: accountRedirectUrl(),
        data: {
          full_name: name,
          name,
        },
      },
    });

    if (error) throw error;

    renderVerificationState(
      'success',
      'Письмо отправлено',
      `Мы отправили ссылку для входа на ${email}. Откройте письмо и перейдите по ссылке, чтобы подтвердить email и войти в GiftMatch.`
    );
    showToast('Мы отправили magic link на вашу почту. Откройте письмо, чтобы войти в GiftMatch.');
  } catch (error) {
    renderVerificationState('warning', 'Не удалось отправить письмо', error.message || 'Попробуйте снова через несколько секунд.');
    showToast(error.message || 'Не удалось отправить magic link.');
  }
});

window.giftmatchSupabase.onAuthStateChange(async (_event, session) => {
  if (!session?.user) return;

  if (!window.giftmatchSupabase.isEmailVerified(session.user)) {
    renderVerificationState(
      'warning',
      'Подтвердите email',
      `Вход будет завершен после перехода по ссылке, отправленной на ${session.user.email ?? 'ваш email'}.`
    );
    return;
  }

  try {
    await window.giftmatchSupabase.ensureProfile(session.user);
    clearDraft();
    window.location.href = 'account.html';
  } catch {
    window.location.href = 'account.html';
  }
});
