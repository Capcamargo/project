const pendingEmailKey = 'giftmatch_pending_email';
const toast = document.getElementById('toast');
const pricingGrid = document.getElementById('pricingGrid');
const checkoutForm = document.getElementById('checkoutForm');
const selectedPlanBadge = document.getElementById('selectedPlanBadge');
const selectedPlanTitle = document.getElementById('selectedPlanTitle');
const selectedPlanDescription = document.getElementById('selectedPlanDescription');
const selectedPlanPrice = document.getElementById('selectedPlanPrice');

const planDescriptions = {
  Free: 'Базовый доступ с первыми сохранениями и основной формой подбора.',
  Plus: 'Больше сохранений и расширенные подборки для регулярного использования.',
  Team: 'Общий сценарий для нескольких подборок и более широких рабочих задач.',
};

let selectedPlan = {
  plan: 'Plus',
  label: '490 ₽ / месяц',
};

function getPendingEmail() {
  return String(localStorage.getItem(pendingEmailKey) || '').trim().toLowerCase();
}

function redirectToAuthEntry() {
  const pendingEmail = getPendingEmail();
  const target = pendingEmail ? 'verify.html' : 'register.html';
  window.setTimeout(() => {
    window.location.href = target;
  }, 700);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 2600);
}

function applySelectedPlan(card) {
  pricingGrid.querySelectorAll('.plan-card').forEach((item) => {
    item.classList.toggle('is-selected', item === card);
  });

  selectedPlan = {
    plan: card.dataset.plan,
    label: card.dataset.label,
  };

  selectedPlanBadge.textContent = selectedPlan.plan;
  selectedPlanTitle.textContent = `GiftMatch ${selectedPlan.plan}`;
  selectedPlanDescription.textContent = planDescriptions[selectedPlan.plan] ?? '';
  selectedPlanPrice.textContent = selectedPlan.label;
}

pricingGrid.querySelectorAll('.plan-card').forEach((card) => {
  card.addEventListener('click', () => applySelectedPlan(card));
});

async function hydrateBillingFields() {
  try {
    const session = await window.giftmatchSupabase.getSession();
    if (!session?.user) {
      showToast(getPendingEmail() ? 'Сначала подтвердите код из письма, чтобы открыть тарифы.' : 'Сначала войдите в аккаунт, чтобы активировать тариф.');
      redirectToAuthEntry();
      return;
    }

    if (!window.giftmatchSupabase.isEmailVerified(session.user)) {
      showToast('Сначала подтвердите email кодом из письма.');
      redirectToAuthEntry();
      return;
    }

    const profile = await window.giftmatchSupabase.getProfile();
    if (!profile) {
      showToast('Не удалось загрузить профиль. Попробуйте войти снова.');
      redirectToAuthEntry();
      return;
    }

    if (profile.email) {
      document.getElementById('billingEmail').value = profile.email;
    }
    if (profile.full_name) {
      document.getElementById('cardholderName').value = profile.full_name;
    }

    const currentPlan = String(profile.plan || 'free').toLowerCase();
    const currentCard = Array.from(pricingGrid.querySelectorAll('.plan-card')).find((card) => {
      return String(card.dataset.plan || '').toLowerCase() === currentPlan;
    });

    if (currentCard) {
      applySelectedPlan(currentCard);
    }
  } catch (error) {
    showToast(error.message || 'Не удалось загрузить профиль для активации тарифа.');
  }
}

checkoutForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('billingEmail').value.trim().toLowerCase();
  const cardholderName = document.getElementById('cardholderName').value.trim();
  const consent = document.getElementById('checkoutConsent').checked;

  if (!email || !cardholderName) {
    showToast('Заполните email и имя владельца аккаунта.');
    return;
  }

  if (!window.giftmatchSupabase.validateEmail(email)) {
    showToast('Введите корректный email владельца аккаунта.');
    return;
  }

  if (!consent) {
    showToast('Подтвердите согласие с условиями активации.');
    return;
  }

  try {
    const user = await window.giftmatchSupabase.getUser();
    if (!user) {
      showToast('Сначала войдите в аккаунт, чтобы активировать тариф.');
      redirectToAuthEntry();
      return;
    }

    if (!window.giftmatchSupabase.isEmailVerified(user)) {
      showToast('Сначала подтвердите email кодом из письма.');
      redirectToAuthEntry();
      return;
    }

    await window.giftmatchSupabase.ensureProfile(user, {
      email,
      full_name: cardholderName,
    });
    await window.giftmatchSupabase.updatePlan(selectedPlan.plan, {
      email,
      full_name: cardholderName,
    });

    showToast('Тариф обновлен. Перенаправляем дальше.');
    window.setTimeout(() => {
      window.location.href = 'payment-success.html';
    }, 900);
  } catch (error) {
    showToast(error.message || 'Не удалось обновить тариф.');
  }
});

hydrateBillingFields();
