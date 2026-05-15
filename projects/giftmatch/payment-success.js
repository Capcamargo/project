const pendingEmailKey = 'giftmatch_pending_email';
const toast = document.getElementById('toast');
const successTitle = document.getElementById('successTitle');
const successSubtitle = document.getElementById('successSubtitle');
const successPlanBadge = document.getElementById('successPlanBadge');

function getPendingEmail() {
  return String(localStorage.getItem(pendingEmailKey) || '').trim().toLowerCase();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 2600);
}

async function init() {
  try {
    const session = await window.giftmatchSupabase.getSession();
    if (!session?.user) {
      successTitle.textContent = 'Тариф сохранен в последнем сценарии';
      successSubtitle.textContent = 'Чтобы увидеть активный план и продолжить работу, войдите в аккаунт или завершите подтверждение email.';
      successPlanBadge.textContent = 'План: ожидает вход';
      showToast(getPendingEmail() ? 'Сначала завершите подтверждение email кодом из письма.' : 'Сначала войдите в аккаунт, чтобы открыть обновленный план.');
      window.setTimeout(() => {
        window.location.href = getPendingEmail() ? 'verify.html' : 'register.html';
      }, 1200);
      return;
    }

    if (!window.giftmatchSupabase.isEmailVerified(session.user)) {
      successTitle.textContent = 'Нужно подтвердить email';
      successSubtitle.textContent = 'План уже подготовлен, но вход будет завершен только после ввода кода подтверждения из письма.';
      successPlanBadge.textContent = 'План: ожидает подтверждения';
      showToast('Сначала подтвердите email кодом из письма.');
      window.setTimeout(() => {
        window.location.href = 'verify.html';
      }, 1200);
      return;
    }

    const profile = await window.giftmatchSupabase.getProfile();
    const plan = String(profile?.plan || 'free').toUpperCase();
    successTitle.textContent = `План ${plan} уже активен`;
    successSubtitle.textContent = 'Новый статус профиля уже сохранен. Можно перейти в личный кабинет или сразу вернуться к подбору подарков.';
    successPlanBadge.textContent = `План: ${plan}`;
    showToast('Профиль обновлен. Можно продолжать работу.');
  } catch (error) {
    showToast(error.message || 'Не удалось загрузить текущий план.');
  }
}

init();
