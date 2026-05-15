const draftKey = 'giftmatch_signup_draft';
const pendingEmailKey = 'giftmatch_pending_email';
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

function writePendingEmail(email) {
  localStorage.setItem(pendingEmailKey, String(email || '').trim().toLowerCase());
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
      'Нужно завершить вход',
      `Код уже отправлен на ${user.email ?? 'ваш email'}. Введите его на следующем шаге, чтобы завершить вход.`
    );
    window.setTimeout(() => {
      window.location.href = 'verify.html';
    }, 900);
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
    writePendingEmail(email);
    await window.giftmatchSupabase.sendEmailOtp(email, {
      data: {
        full_name: name,
        name,
      },
    });

    renderVerificationState(
      'success',
      'Код отправлен',
      `Мы отправили код подтверждения на ${email}. Сейчас откроем следующий шаг, где можно ввести код и завершить вход.`
    );
    showToast('Код подтверждения отправлен на email.');
    window.setTimeout(() => {
      window.location.href = 'verify.html';
    }, 850);
  } catch (error) {
    renderVerificationState('warning', 'Не удалось отправить код', error.message || 'Попробуйте снова через несколько секунд.');
    showToast(error.message || 'Не удалось отправить код подтверждения.');
  }
});

window.giftmatchSupabase.onAuthStateChange(async (_event, session) => {
  if (!session?.user) return;

  if (!window.giftmatchSupabase.isEmailVerified(session.user)) {
    writePendingEmail(session.user.email ?? '');
    return;
  }

  try {
    await window.giftmatchSupabase.ensureProfile(session.user);
    clearDraft();
    localStorage.removeItem(pendingEmailKey);
    window.location.href = 'account.html';
  } catch {
    window.location.href = 'account.html';
  }
});
