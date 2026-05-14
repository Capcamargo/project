const storageKeys = {
  profile: 'giftmatch_exam_profile',
  request: 'giftmatch_exam_request',
  results: 'giftmatch_exam_results',
  saved: 'giftmatch_exam_saved',
  paywallSeen: 'giftmatch_exam_paywall_seen',
};

const presets = {
  friend: {
    label: 'Другу на день рождения',
    occasion: 'День рождения',
    budget: 'до 5000 ₽',
    relation: 'Друг',
    interests: 'настольные игры, кофе, путешествия',
    notes: 'Хочется, чтобы подарок был небанальным, полезным и визуально приятным.',
  },
  romantic: {
    label: 'Партнеру на годовщину',
    occasion: 'Годовщина отношений',
    budget: 'до 10000 ₽',
    relation: 'Партнер',
    interests: 'совместные впечатления, уют, эстетика',
    notes: 'Важно, чтобы подарок подчеркивал внимание и заботу.',
  },
  parents: {
    label: 'Родителям на юбилей',
    occasion: 'Юбилей',
    budget: 'до 15000 ₽',
    relation: 'Родители',
    interests: 'дом, отдых, семейные вещи',
    notes: 'Нужен теплый, символичный и уместный подарок.',
  },
  colleague: {
    label: 'Коллеге без долгого поиска',
    occasion: 'День рождения коллеги',
    budget: 'до 3000 ₽',
    relation: 'Коллега',
    interests: 'офис, кофе, минималистичные вещи',
    notes: 'Нужен быстрый и безопасный выбор без лишнего риска.',
  },
};

const guestState = document.getElementById('guestState');
const userState = document.getElementById('userState');
const profileNameText = document.getElementById('profileNameText');
const profileEmailText = document.getElementById('profileEmailText');
const profilePlanText = document.getElementById('profilePlanText');
const avatarBadge = document.getElementById('avatarBadge');
const profileEmailInput = document.getElementById('profileEmailInput');
const profileNameInput = document.getElementById('profileNameInput');
const createProfileBtn = document.getElementById('createProfileBtn');
const logoutProfileBtn = document.getElementById('logoutProfileBtn');
const headerAccountLink = document.getElementById('headerAccountLink');

const giftForm = document.getElementById('giftForm');
const occasionInput = document.getElementById('occasionInput');
const budgetInput = document.getElementById('budgetInput');
const relationInput = document.getElementById('relationInput');
const interestsInput = document.getElementById('interestsInput');
const notesInput = document.getElementById('notesInput');

const requestSummary = document.getElementById('requestSummary');
const summaryGrid = document.getElementById('summaryGrid');
const resultsEmptyState = document.getElementById('resultsEmptyState');
const resultsContainer = document.getElementById('resultsContainer');
const explainBlock = document.getElementById('explainBlock');
const explainGrid = document.getElementById('explainGrid');
const saveSelectionBtn = document.getElementById('saveSelectionBtn');
const savedCounter = document.getElementById('savedCounter');
const savedSelections = document.getElementById('savedSelections');
const fillScenarioBtn = document.getElementById('fillScenarioBtn');
const resetScenarioBtn = document.getElementById('resetScenarioBtn');
const paywallModal = document.getElementById('paywallModal');
const closePaywallBtn = document.getElementById('closePaywallBtn');
const toast = document.getElementById('toast');
const scenarioBadge = document.getElementById('scenarioBadge');
const scenarioSteps = document.getElementById('scenarioSteps');
const catalogGrid = document.getElementById('catalogGrid');

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

function removeKey(key) {
  localStorage.removeItem(key);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 2600);
}

function initialsFromName(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'GM';
}

function getProfile() {
  return readJson(storageKeys.profile, null);
}

function getRequest() {
  return readJson(storageKeys.request, null);
}

function getResults() {
  return readJson(storageKeys.results, []);
}

function getSaved() {
  return readJson(storageKeys.saved, []);
}

function getPaywallSeen() {
  return localStorage.getItem(storageKeys.paywallSeen) === '1';
}

function setPaywallSeen() {
  localStorage.setItem(storageKeys.paywallSeen, '1');
}

function renderScenarioProgress() {
  const state = {
    profile: !!getProfile(),
    request: !!getRequest(),
    results: getResults().length > 0,
    saved: getSaved().length > 0,
    paywall: getPaywallSeen(),
  };

  let completed = 0;
  scenarioSteps.querySelectorAll('[data-step]').forEach((item) => {
    const key = item.dataset.step;
    const done = Boolean(state[key]);
    item.classList.toggle('is-done', done);
    if (done) completed += 1;
  });

  scenarioBadge.textContent = `${completed} / 5`;
  scenarioBadge.classList.toggle('muted', completed < 5);
}

function renderHeaderAccount() {
  const profile = getProfile();
  if (!headerAccountLink) return;

  if (!profile) {
    headerAccountLink.textContent = 'Войти';
    headerAccountLink.href = 'register.html';
    return;
  }

  headerAccountLink.textContent = profile.name || 'Профиль';
  headerAccountLink.href = 'register.html';
}

function renderProfile() {
  const profile = getProfile();
  renderHeaderAccount();

  if (!profile) {
    guestState.classList.remove('hidden');
    userState.classList.add('hidden');
    renderScenarioProgress();
    return;
  }

  guestState.classList.add('hidden');
  userState.classList.remove('hidden');
  avatarBadge.textContent = initialsFromName(profile.name);
  profileNameText.textContent = profile.name;
  profileEmailText.textContent = profile.email;
  profilePlanText.textContent = `План: ${profile.plan || (profile.paid ? 'Plus' : 'Free')}`;
  renderScenarioProgress();
}

function fillForm(data) {
  occasionInput.value = data.occasion || '';
  budgetInput.value = data.budget || '';
  relationInput.value = data.relation || '';
  interestsInput.value = data.interests || '';
  notesInput.value = data.notes || '';
}

function confidenceScore(request, shift = 0) {
  let score = 62;
  if (request.occasion) score += 8;
  if (request.relation) score += 6;
  if (request.notes) score += 4;
  if (request.interests && request.interests.split(',').length >= 2) score += 10;
  return Math.min(Math.max(score + shift, 54), 95);
}

function buildRecommendations(request) {
  return [
    {
      title: 'Персональный тематический набор',
      reason: `Подходит для повода «${request.occasion}» и учитывает интересы: ${request.interests}.`,
      explanation: 'Такой вариант легко подстроить под конкретного человека и при этом не уйти в банальность.',
      price: `Бюджет: ${request.budget}`,
      category: 'Персональный подарок',
      tone: request.relation ? `Для категории: ${request.relation}` : 'Универсальный сценарий',
      score: confidenceScore(request, 0),
    },
    {
      title: 'Подарок-впечатление',
      reason: 'Хороший выбор, если хочется оставить после подарка эмоцию и воспоминание.',
      explanation: request.notes
        ? `Дополнительный контекст тоже учтен: ${request.notes}.`
        : 'Подходит, когда важны не только вещь, но и само впечатление.',
      price: `Ориентир: ${request.budget}`,
      category: 'Впечатление',
      tone: 'Более личный вариант',
      score: confidenceScore(request, -4),
    },
    {
      title: 'Авторская вещь ручной работы',
      reason: 'Подходит, когда хочется выбрать что-то спокойное, неброское и с ощущением внимания к деталям.',
      explanation: 'Такая идея делает подборку более живой и помогает уйти от шаблонных решений.',
      price: `До ${request.budget}`,
      category: 'Ручная работа',
      tone: 'Нешаблонный выбор',
      score: confidenceScore(request, -7),
    },
  ];
}

function renderSummary() {
  const request = getRequest();
  if (!request) {
    requestSummary.classList.add('hidden');
    summaryGrid.innerHTML = '';
    renderScenarioProgress();
    return;
  }

  const rows = [
    ['Повод', request.occasion],
    ['Бюджет', request.budget],
    ['Интересы', request.interests],
    ['Кто это для вас', request.relation || 'Не указано'],
    ['Дополнительно', request.notes || 'Без дополнительных условий'],
  ];

  summaryGrid.innerHTML = '';
  rows.forEach(([label, value]) => {
    const item = document.createElement('article');
    item.className = 'summary-item';
    item.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
    summaryGrid.appendChild(item);
  });
  requestSummary.classList.remove('hidden');
  renderScenarioProgress();
}

function resultCardMarkup(item, index) {
  return `
    <article class="result-card">
      <div class="result-topline">
        <span class="result-label">Вариант ${index + 1}</span>
        <span class="rank-badge">#${index + 1}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="result-meta">${escapeHtml(item.reason)}</p>
      <p class="result-meta">Почему это может подойти: ${escapeHtml(item.explanation)}</p>
      <div class="confidence-row">
        <span class="confidence-caption">Уместность рекомендации</span>
        <strong class="confidence-value">${item.score}%</strong>
      </div>
      <div class="confidence-track"><span style="width:${item.score}%"></span></div>
      <div class="chip-row">
        <span class="chip">${escapeHtml(item.price)}</span>
        <span class="chip">${escapeHtml(item.category)}</span>
        <span class="chip">${escapeHtml(item.tone)}</span>
      </div>
    </article>
  `;
}

function renderResults() {
  const results = getResults();
  if (!results.length) {
    resultsEmptyState.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    saveSelectionBtn.disabled = true;
    saveSelectionBtn.classList.add('is-disabled');
    renderScenarioProgress();
    return;
  }

  resultsEmptyState.classList.add('hidden');
  resultsContainer.innerHTML = results.map(resultCardMarkup).join('');
  saveSelectionBtn.disabled = false;
  saveSelectionBtn.classList.remove('is-disabled');
  renderScenarioProgress();
}

function renderExplain() {
  const request = getRequest();
  const results = getResults();

  if (!request || !results.length) {
    explainBlock.classList.add('hidden');
    explainGrid.innerHTML = '';
    return;
  }

  const explainData = [
    ['Повод', request.occasion],
    ['Бюджет', request.budget],
    ['Интересы', request.interests],
    ['Кто это для вас', request.relation || 'Не указано, поэтому подборка остается более универсальной.'],
  ];

  explainGrid.innerHTML = explainData
    .map(([label, value]) => `<article class="explain-card"><h4>${escapeHtml(label)}</h4><p>${escapeHtml(value)}</p></article>`)
    .join('');

  explainBlock.classList.remove('hidden');
}

function savedCardMarkup(item, index) {
  return `
    <article class="saved-card">
      <div class="saved-topline">
        <span class="saved-label">Сохранено</span>
        <div class="saved-actions">
          <span class="chip">${escapeHtml(item.relation || 'Без категории')}</span>
          <button type="button" class="icon-btn" data-remove-index="${index}" aria-label="Удалить подборку">×</button>
        </div>
      </div>
      <h3>${escapeHtml(item.occasion)}</h3>
      <p class="saved-meta">Бюджет: ${escapeHtml(item.budget)}</p>
      <p class="saved-meta">Интересы: ${escapeHtml(item.interests)}</p>
      <p class="saved-meta">Дата сохранения: ${escapeHtml(item.createdAt)}</p>
    </article>
  `;
}

function renderSaved() {
  const saved = getSaved();
  savedCounter.textContent = String(saved.length);
  if (!saved.length) {
    savedSelections.innerHTML = '<div class="empty-state">Пока здесь пусто. Когда сохраните подборку, она появится в этом блоке.</div>';
    renderScenarioProgress();
    return;
  }

  savedSelections.innerHTML = saved.map(savedCardMarkup).join('');
  renderScenarioProgress();
}

function saveCurrentSelection() {
  const profile = getProfile();
  if (!profile) {
    showToast('Сначала создайте профиль, чтобы сохранять подборки.');
    return;
  }

  const request = getRequest();
  if (!request?.occasion || !request?.budget || !request?.interests) {
    showToast('Сначала заполните форму и получите подборку.');
    return;
  }

  const saved = getSaved();
  if (!profile.paid && saved.length >= 2) {
    paywallModal.classList.remove('hidden');
    setPaywallSeen();
    renderScenarioProgress();
    return;
  }

  saved.unshift({
    occasion: request.occasion,
    budget: request.budget,
    interests: request.interests,
    relation: request.relation,
    createdAt: new Date().toLocaleString('ru-RU'),
  });

  writeJson(storageKeys.saved, saved);
  renderSaved();
  showToast('Подборка сохранена. Можно вернуться к ней позже.');
}

function resetAll() {
  Object.values(storageKeys).forEach(removeKey);
  giftForm.reset();
  renderProfile();
  renderSummary();
  renderResults();
  renderExplain();
  renderSaved();
  renderScenarioProgress();
  showToast('Все данные очищены. Можно начать заново.');
}

function bindCatalogFilters() {
  document.querySelectorAll('.catalog-filter-chip').forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      document.querySelectorAll('.catalog-filter-chip').forEach((chip) => chip.classList.remove('is-active'));
      button.classList.add('is-active');

      catalogGrid.querySelectorAll('.gift-showcase-card').forEach((card) => {
        const tags = card.dataset.tags || '';
        const visible = filter === 'all' || tags.includes(filter);
        card.style.display = visible ? '' : 'none';
      });
    });
  });

  document.querySelectorAll('[data-preset-fill]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = presets[button.dataset.presetFill];
      if (!preset) return;
      fillForm(preset);
      document.getElementById('mvp').scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast(`Взяли за основу пример: «${preset.label}».`);
    });
  });
}

function bindEvents() {
  document.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = presets[button.dataset.preset];
      if (!preset) return;
      fillForm(preset);
      showToast(`Заполнили форму примером: «${preset.label}».`);
    });
  });

  document.getElementById('goToMvpBtn').addEventListener('click', () => {
    document.getElementById('mvp').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  createProfileBtn.addEventListener('click', () => {
    const email = profileEmailInput.value.trim();
    const name = profileNameInput.value.trim();

    if (!email || !name) {
      showToast('Введите имя и email, чтобы создать профиль.');
      return;
    }

    writeJson(storageKeys.profile, { email, name, paid: false, plan: 'Free' });
    renderProfile();
    showToast('Профиль готов. Теперь можно сохранять подборки.');
  });

  logoutProfileBtn.addEventListener('click', () => {
    removeKey(storageKeys.profile);
    renderProfile();
    showToast('Вы вышли из профиля.');
  });

  fillScenarioBtn.addEventListener('click', () => {
    fillForm(presets.friend);
    showToast('Форма заполнена примером.');
  });

  resetScenarioBtn.addEventListener('click', resetAll);

  giftForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const request = {
      occasion: occasionInput.value.trim(),
      budget: budgetInput.value.trim(),
      relation: relationInput.value.trim(),
      interests: interestsInput.value.trim(),
      notes: notesInput.value.trim(),
    };

    if (!request.occasion || !request.budget || !request.interests) {
      showToast('Укажите повод, бюджет и интересы получателя.');
      return;
    }

    writeJson(storageKeys.request, request);
    writeJson(storageKeys.results, buildRecommendations(request));
    renderSummary();
    renderResults();
    renderExplain();
    showToast('Подборка готова. Посмотрите, какие варианты получились.');
  });

  saveSelectionBtn.addEventListener('click', saveCurrentSelection);

  savedSelections.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-index]');
    if (!button) return;
    const index = Number(button.dataset.removeIndex);
    const saved = getSaved();
    saved.splice(index, 1);
    writeJson(storageKeys.saved, saved);
    renderSaved();
    showToast('Подборка удалена из истории.');
  });

  closePaywallBtn.addEventListener('click', () => {
    paywallModal.classList.add('hidden');
  });

  paywallModal.addEventListener('click', (event) => {
    if (event.target === paywallModal) {
      paywallModal.classList.add('hidden');
    }
  });
}

function init() {
  renderProfile();
  renderSummary();
  renderResults();
  renderExplain();
  renderSaved();
  renderScenarioProgress();
  bindCatalogFilters();
  bindEvents();
}

init();
