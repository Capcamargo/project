const profileKey = 'giftmatch_exam_profile';
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
  price: '490',
  label: '490 ₽ / месяц',
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 2600);
}

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem(profileKey)) ?? null;
  } catch {
    return null;
  }
}

function writeProfile(profile) {
  localStorage.setItem(profileKey, JSON.stringify(profile));
}

function maskCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function applySelectedPlan(card) {
  pricingGrid.querySelectorAll('.plan-card').forEach((item) => {
    item.classList.toggle('is-selected', item === card);
  });

  selectedPlan = {
    plan: card.dataset.plan,
    price: card.dataset.price,
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

document.getElementById('cardNumber').addEventListener('input', (event) => {
  event.target.value = maskCardNumber(event.target.value);
});

document.getElementById('cardExpiry').addEventListener('input', (event) => {
  event.target.value = formatExpiry(event.target.value);
});

document.getElementById('cardCvc').addEventListener('input', (event) => {
  event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4);
});

const existingProfile = readProfile();
if (existingProfile?.email) {
  document.getElementById('billingEmail').value = existingProfile.email;
}
if (existingProfile?.name) {
  document.getElementById('cardholderName').value = existingProfile.name;
}

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = document.getElementById('billingEmail').value.trim();
  const cardholderName = document.getElementById('cardholderName').value.trim();
  const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const cardExpiry = document.getElementById('cardExpiry').value.trim();
  const cardCvc = document.getElementById('cardCvc').value.trim();
  const consent = document.getElementById('checkoutConsent').checked;

  if (!email || !cardholderName) {
    showToast('Заполните email и имя владельца карты.');
    return;
  }

  if (selectedPlan.plan !== 'Free' && cardNumber.length < 16) {
    showToast('Проверьте номер карты.');
    return;
  }

  if (selectedPlan.plan !== 'Free' && cardExpiry.length !== 5) {
    showToast('Проверьте срок действия карты.');
    return;
  }

  if (selectedPlan.plan !== 'Free' && cardCvc.length < 3) {
    showToast('Проверьте CVC.');
    return;
  }

  if (!consent) {
    showToast('Подтвердите согласие с условиями оплаты.');
    return;
  }

  const previous = readProfile();
  writeProfile({
    email,
    name: previous?.name ?? cardholderName,
    paid: selectedPlan.plan !== 'Free',
    plan: selectedPlan.plan,
  });

  showToast('Платежные данные приняты. Перенаправляем дальше.');
  window.setTimeout(() => {
    window.location.href = 'payment-success.html';
  }, 900);
});
