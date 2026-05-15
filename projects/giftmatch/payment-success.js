const toast = document.getElementById('toast');
const successTitle = document.getElementById('successTitle');
const successSubtitle = document.getElementById('successSubtitle');
const successPlanBadge = document.getElementById('successPlanBadge');

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
      successTitle.textContent = 'Активация завершена';
      successSubtitle.textContent = 'Если вы уже входили в аккаунт, просто вернитесь в GiftMatch и авторизуйтесь снова, чтобы увидеть обновленный план.';
      successPlanBadge.textContent = 'План: не определен';
      showToast('Откройте аккаунт после входа, чтобы увидеть актуальный план.');
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
