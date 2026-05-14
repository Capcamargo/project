const storageKeys = {
  profile: 'giftmatch_profile',
  results: 'giftmatch_results',
  saved: 'giftmatch_saved',
};

const guestView = document.getElementById('guestView');
const userView = document.getElementById('userView');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profilePlan = document.getElementById('profilePlan');
const savedCount = document.getElementById('savedCount');
const resultsEmpty = document.getElementById('resultsEmpty');
const resultsList = document.getElementById('resultsList');
const savedList = document.getElementById('savedList');
const paywallModal = document.getElementById('paywallModal');

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getProfile() {
  return readJson(storageKeys.profile, null);
}

function getSaved() {
  return readJson(storageKeys.saved, []);
}

function getResults() {
  return readJson(storageKeys.results, []);
}

function renderProfile() {
  const profile = getProfile();
  if (!profile) {
    guestView.classList.remove('hidden');
    userView.classList.add('hidden');
    return;
  }

  guestView.classList.add('hidden');
  userView.classList.remove('hidden');
  profileName.textContent = profile.name;
  profileEmail.textContent = profile.email;
  profilePlan.textContent = `Тариф: ${profile.paid ? 'Pro' : 'Free'}`;
}

function renderResults() {
  const results = getResults();
  resultsList.innerHTML = '';

  if (!results.length) {
    resultsEmpty.classList.remove('hidden');
    return;
  }

  resultsEmpty.classList.add('hidden');
  results.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'result-card';
    article.innerHTML = `
      <h3>${item.title}</h3>
      <div class="result-meta">${item.reason}</div>
      <div class="result-meta">Ценовой ориентир: ${item.price}</div>
    `;
    resultsList.appendChild(article);
  });
}

function renderSaved() {
  const saved = getSaved();
  savedCount.textContent = String(saved.length);
  savedList.innerHTML = '';

  if (!saved.length) {
    savedList.innerHTML = '<div class="empty-state">Пока нет сохраненных подборок.</div>';
    return;
  }

  saved.forEach((entry) => {
    const article = document.createElement('article');
    article.className = 'saved-card';
    article.innerHTML = `
      <h3>${entry.occasion}</h3>
      <div class="saved-meta">Бюджет: ${entry.budget}</div>
      <div class="saved-meta">Интересы: ${entry.interests}</div>
    `;
    savedList.appendChild(article);
  });
}

function buildRecommendations(occasion, budget, interests) {
  return [
    {
      title: 'Персональный тематический набор',
      reason: `Подходит для повода «${occasion}» и учитывает интересы: ${interests}.`,
      price: budget,
    },
    {
      title: 'Подарок-впечатление',
      reason: 'Хороший вариант, если хочется сделать подарок более запоминающимся и личным.',
      price: budget,
    },
    {
      title: 'Авторский подарок ручной работы',
      reason: 'Подходит для более теплого и продуманного сценария дарения.',
      price: budget,
    },
  ];
}

function init() {
  renderProfile();
  renderResults();
  renderSaved();
}

document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('formSection').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('registerBtn').addEventListener('click', () => {
  const email = document.getElementById('emailInput').value.trim();
  const name = document.getElementById('nameInput').value.trim();

  if (!email || !name) {
    alert('Заполните email и имя.');
    return;
  }

  writeJson(storageKeys.profile, {
    email,
    name,
    paid: false,
  });
  renderProfile();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem(storageKeys.profile);
  renderProfile();
});

document.getElementById('giftForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const occasion = document.getElementById('occasionInput').value.trim();
  const budget = document.getElementById('budgetInput').value.trim();
  const interests = document.getElementById('interestsInput').value.trim();

  const recommendations = buildRecommendations(occasion, budget, interests);
  writeJson(storageKeys.results, recommendations);
  renderResults();
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const profile = getProfile();
  if (!profile) {
    alert('Сначала создайте профиль.');
    return;
  }

  const saved = getSaved();
  if (!profile.paid && saved.length >= 2) {
    paywallModal.classList.remove('hidden');
    return;
  }

  const occasion = document.getElementById('occasionInput').value.trim();
  const budget = document.getElementById('budgetInput').value.trim();
  const interests = document.getElementById('interestsInput').value.trim();

  if (!occasion || !budget || !interests) {
    alert('Сначала заполните форму и получите результаты.');
    return;
  }

  saved.push({ occasion, budget, interests });
  writeJson(storageKeys.saved, saved);
  renderSaved();
});

document.getElementById('closePaywallBtn').addEventListener('click', () => {
  paywallModal.classList.add('hidden');
});

init();
