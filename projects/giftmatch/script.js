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
const toast = document.getElementById('toast');

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

function initialsFromName(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'GM';
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 2600);
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
  document.querySelector('.avatar-badge').textContent = initialsFromName(profile.name);
  profileName.textContent = profile.name;
  profileEmail.textContent = profile.email;
  profilePlan.textContent = `Тариф: ${profile.paid ? 'Pro' : 'Free'}`;
}

function createResultCard(item) {
  const article = document.createElement('article');
  article.className = 'result-card';
  article.innerHTML = `
    <div class="result-kicker">Gift recommendation</div>
    <h3>${item.title}</h3>
    <div class="result-meta">${item.reason}</div>
    <div class="result-meta">Почему это выглядит уместно: ${item.explanation}</div>
    <div class="result-chip-row">
      <span class="chip">${item.price}</span>
      <span class="chip">${item.category}</span>
      <span class="chip">${item.tone}</span>
    </div>
  `;
  return article;
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
    resultsList.appendChild(createResultCard(item));
  });
}

function createSavedCard(entry) {
  const article = document.createElement('article');
  article.className = 'saved-card';
  article.innerHTML = `
    <div class="saved-kicker">Saved selection</div>
    <h3>${entry.occasion}</h3>
    <div class="saved-meta">Бюджет: ${entry.budget}</div>
    <div class="saved-meta">Интересы: ${entry.interests}</div>
    <div class="saved-meta">Дата сохранения: ${entry.createdAt}</div>
    <div class="saved-chip-row">
      <span class="chip">${entry.relation || 'Без категории близости'}</span>
    </div>
  `;
  return article;
}

function renderSaved() {
  const saved = getSaved();
  savedCount.textContent = String(saved.length);
  savedList.innerHTML = '';

  if (!saved.length) {
    savedList.innerHTML = '<div class="empty-state big-empty">Пока нет сохраненных подборок. Сначала пройдите сценарий подбора.</div>';
    return;
  }

  saved.forEach((entry) => {
    savedList.appendChild(createSavedCard(entry));
  });
}

function buildRecommendations(occasion, budget, interests, relation, notes) {
  return [
    {
      title: 'Персональный тематический набор',
      reason: `Подходит для повода «${occasion}» и учитывает интересы: ${interests}.`,
      explanation: 'Это безопасный, но не банальный вариант, который легко адаптируется под конкретного человека.',
      price: `Бюджет: ${budget}`,
      category: 'Персонализированный подарок',
      tone: relation ? `Для категории: ${relation}` : 'Универсальный сценарий',
    },
    {
      title: 'Подарок-впечатление',
      reason: 'Хороший вариант, если хочется сделать подарок более запоминающимся и личным.',
      explanation: notes ? `Дополнительный контекст тоже учтен: ${notes}.` : 'Подходит, когда важны эмоции и совместные воспоминания.',
      price: `Ориентир: ${budget}`,
      category: 'Впечатление',
      tone: 'Эмоциональный сценарий',
    },
    {
      title: 'Авторский подарок ручной работы',
      reason: 'Подходит для более теплого и продуманного сценария дарения.',
      explanation: 'Такой вариант делает подборку визуально и смыслово более разнообразной.',
      price: `До ${budget}`,
      category: 'Handmade',
      tone: 'Небанальный выбор',
    },
  ];
}

function init() {
  renderProfile();
  renderResults();
  renderSaved();
}

document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('formSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('registerBtn').addEventListener('click', () => {
  const email = document.getElementById('emailInput').value.trim();
  const name = document.getElementById('nameInput').value.trim();

  if (!email || !name) {
    showToast('Заполните имя и email, чтобы войти в demo-сценарий.');
    return;
  }

  writeJson(storageKeys.profile, {
    email,
    name,
    paid: false,
  });
  renderProfile();
  showToast('Профиль создан. Теперь можно пройти основной сценарий MVP.');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem(storageKeys.profile);
  renderProfile();
  showToast('Вы вышли из demo-профиля.');
});

document.getElementById('giftForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const occasion = document.getElementById('occasionInput').value.trim();
  const budget = document.getElementById('budgetInput').value.trim();
  const interests = document.getElementById('interestsInput').value.trim();
  const relation = document.getElementById('relationInput').value.trim();
  const notes = document.getElementById('notesInput').value.trim();

  const recommendations = buildRecommendations(occasion, budget, interests, relation, notes);
  writeJson(storageKeys.results, recommendations);
  renderResults();
  showToast('Подборка готова. Проверьте рекомендации ниже.');
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const profile = getProfile();
  if (!profile) {
    showToast('Сначала создайте профиль пользователя.');
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
  const relation = document.getElementById('relationInput').value.trim();

  if (!occasion || !budget || !interests) {
    showToast('Сначала заполните форму и получите результаты.');
    return;
  }

  saved.unshift({
    occasion,
    budget,
    interests,
    relation,
    createdAt: new Date().toLocaleString('ru-RU'),
  });
  writeJson(storageKeys.saved, saved);
  renderSaved();
  showToast('Подборка сохранена в истории пользователя.');
});

document.getElementById('closePaywallBtn').addEventListener('click', () => {
  paywallModal.classList.add('hidden');
});

paywallModal.addEventListener('click', (event) => {
  if (event.target === paywallModal) {
    paywallModal.classList.add('hidden');
  }
});

init();