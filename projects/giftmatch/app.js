const uiKeys = {
  currentRequest: 'giftmatch_current_request',
  currentResults: 'giftmatch_current_results',
  paywallSeen: 'giftmatch_paywall_seen',
  signupDraft: 'giftmatch_signup_draft',
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

const appState = {
  session: null,
  profile: null,
  savedRecommendations: [],
  currentRequest: readJson(uiKeys.currentRequest, null),
  currentResults: readJson(uiKeys.currentResults, []),
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
  }, 2800);
}

function initialsFromName(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'GM';
}

function getPaywallSeen() {
  return localStorage.getItem(uiKeys.paywallSeen) === '1';
}

function setPaywallSeen() {
  localStorage.setItem(uiKeys.paywallSeen, '1');
}

function fillForm(data) {
  occasionInput.value = data.occasion || '';
  budgetInput.value = data.budget || '';
  relationInput.value = data.relation || '';
  interestsInput.value = data.interests || '';
  notesInput.value = data.notes || '';
}

function requestRows(request) {
  return [
    ['Повод', request.occasion],
    ['Бюджет', request.budget],
    ['Интересы', request.interests],
    ['Кто это для вас', request.relation || 'Не указано'],
    ['Дополнительно', request.notes || 'Без дополнительных условий'],
  ];
}

function renderScenarioProgress() {
  const state = {
    profile: !!appState.session,
    request: !!appState.currentRequest,
    results: appState.currentResults.length > 0,
    saved: appState.savedRecommendations.length > 0,
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
  if (!headerAccountLink) return;

  if (!appState.profile) {
    headerAccountLink.textContent = 'Войти';
    headerAccountLink.href = 'register.html';
    return;
  }

  headerAccountLink.textContent = appState.profile.full_name || appState.profile.email || 'Профиль';
  headerAccountLink.href = 'account.html';
}

function renderProfile() {
  renderHeaderAccount();

  if (!appState.profile) {
    guestState.classList.remove('hidden');
    userState.classList.add('hidden');
    renderScenarioProgress();
    return;
  }

  guestState.classList.add('hidden');
  userState.classList.remove('hidden');
  avatarBadge.textContent = initialsFromName(appState.profile.full_name || appState.profile.email || 'Gift Match');
  profileNameText.textContent = appState.profile.full_name || 'Пользователь GiftMatch';
  profileEmailText.textContent = appState.profile.email || '';
  profilePlanText.textContent = `План: ${(appState.profile.plan || 'free').toUpperCase()}`;
  renderScenarioProgress();
}

function renderSummary() {
  if (!appState.currentRequest) {
    requestSummary.classList.add('hidden');
    summaryGrid.innerHTML = '';
    renderScenarioProgress();
    return;
  }

  summaryGrid.innerHTML = '';
  requestRows(appState.currentRequest).forEach(([label, value]) => {
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
      <p class="result-meta">Почему это может подойти: ${escapeHtml(item.explanation ?? '')}</p>
      <div class="confidence-row">
        <span class="confidence-caption">Уместность рекомендации</span>
        <strong class="confidence-value">${item.score ?? 0}%</strong>
      </div>
      <div class="confidence-track"><span style="width:${item.score ?? 0}%"></span></div>
      <div class="chip-row">
        <span class="chip">${escapeHtml(item.price_hint ?? '')}</span>
        <span class="chip">${escapeHtml(item.category ?? 'Рекомендация')}</span>
        <span class="chip">${escapeHtml(item.tone ?? 'Готовый сценарий')}</span>
      </div>
    </article>
  `;
}

function renderResults() {
  if (!appState.currentResults.length) {
    resultsEmptyState.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    saveSelectionBtn.disabled = true;
    saveSelectionBtn.classList.add('is-disabled');
    renderScenarioProgress();
    return;
  }

  resultsEmptyState.classList.add('hidden');
  resultsContainer.innerHTML = appState.currentResults.map(resultCardMarkup).join('');
  saveSelectionBtn.disabled = false;
  saveSelectionBtn.classList.remove('is-disabled');
  renderScenarioProgress();
}

function renderExplain() {
  if (!appState.currentRequest || !appState.currentResults.length) {
    explainBlock.classList.add('hidden');
    explainGrid.innerHTML = '';
    return;
  }

  const explainData = [
    ['Повод', appState.currentRequest.occasion],
    ['Бюджет', appState.currentRequest.budget],
    ['Интересы', appState.currentRequest.interests],
    ['Кто это для вас', appState.currentRequest.relation || 'Не указано, поэтому подборка остается более универсальной.'],
  ];

  explainGrid.innerHTML = explainData
    .map(([label, value]) => `<article class="explain-card"><h4>${escapeHtml(label)}</h4><p>${escapeHtml(value)}</p></article>`)
    .join('');

  explainBlock.classList.remove('hidden');
}

function savedCardMarkup(item) {
  const request = item.request || {};
  return `
    <article class="saved-card">
      <div class="saved-topline">
        <span class="saved-label">Сохранено</span>
        <div class="saved-actions">
          <span class="chip">${escapeHtml(item.category || request.relation || 'Без категории')}</span>
        </div>
      </div>
      <h3>${escapeHtml(item.title || request.occasion || 'Подборка')}</h3>
      <p class="saved-meta">Повод: ${escapeHtml(request.occasion || appState.currentRequest?.occasion || 'Не указано')}</p>
      <p class="saved-meta">Бюджет: ${escapeHtml(request.budget || appState.currentRequest?.budget || 'Не указано')}</p>
      <p class="saved-meta">Интересы: ${escapeHtml(request.interests || appState.currentRequest?.interests || 'Не указано')}</p>
      <p class="saved-meta">Дата сохранения: ${escapeHtml(item.saved_at ? new Date(item.saved_at).toLocaleString('ru-RU') : 'Только что')}</p>
    </article>
  `;
}

function renderSaved() {
  savedCounter.textContent = String(appState.savedRecommendations.length);
  if (!appState.savedRecommendations.length) {
    savedSelections.innerHTML = '<div class="empty-state">Пока здесь пусто. Когда сохраните подборку, она появится в этом блоке.</div>';
    renderScenarioProgress();
    return;
  }

  savedSelections.innerHTML = appState.savedRecommendations.map(savedCardMarkup).join('');
  renderScenarioProgress();
}

async function loadAccountState() {
  if (!appState.session) {
    appState.profile = null;
    appState.savedRecommendations = [];
    renderProfile();
    renderSaved();
    return;
  }

  try {
    const data = await window.giftmatchSupabase.getAccountData();
    appState.profile = data.profile;
    appState.savedRecommendations = data.savedRecommendations;
    renderProfile();
    renderSaved();
  } catch (error) {
    showToast(error.message || 'Не удалось загрузить данные профиля.');
  }
}

async function saveCurrentSelection() {
  if (!appState.session || !appState.profile) {
    showToast('Чтобы сохранять подборки, сначала войдите в аккаунт.');
    window.location.href = 'register.html';
    return;
  }

  if (!appState.currentResults.length) {
    showToast('Сначала заполните форму и получите подборку.');
    return;
  }

  if ((appState.profile.plan || 'free') === 'free' && appState.savedRecommendations.length >= 2) {
    paywallModal.classList.remove('hidden');
    setPaywallSeen();
    renderScenarioProgress();
    return;
  }

  const unsavedIds = appState.currentResults
    .filter((item) => !item.is_saved)
    .map((item) => item.id)
    .filter(Boolean);

  if (!unsavedIds.length) {
    showToast('Эта подборка уже сохранена.');
    return;
  }

  try {
    await window.giftmatchSupabase.saveRecommendations(unsavedIds);
    appState.currentResults = appState.currentResults.map((item) => ({
      ...item,
      is_saved: true,
      saved_at: new Date().toISOString(),
      request: appState.currentRequest,
    }));
    writeJson(uiKeys.currentResults, appState.currentResults);
    await loadAccountState();
    showToast('Подборка сохранена. Можно вернуться к ней позже.');
  } catch (error) {
    showToast(error.message || 'Не удалось сохранить подборку.');
  }
}

function resetCurrentFlow() {
  removeKey(uiKeys.currentRequest);
  removeKey(uiKeys.currentResults);
  giftForm.reset();
  appState.currentRequest = null;
  appState.currentResults = [];
  renderSummary();
  renderResults();
  renderExplain();
  renderScenarioProgress();
  showToast('Форма очищена. Можно собрать новую подборку.');
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
      showToast('Введите имя и email, чтобы перейти к регистрации.');
      return;
    }

    writeJson(uiKeys.signupDraft, { email, name });
    showToast('Перенаправляем к регистрации, чтобы завершить создание аккаунта.');
    window.setTimeout(() => {
      window.location.href = 'register.html';
    }, 600);
  });

  logoutProfileBtn.addEventListener('click', async () => {
    try {
      await window.giftmatchSupabase.signOut();
      appState.session = null;
      appState.profile = null;
      appState.savedRecommendations = [];
      renderProfile();
      renderSaved();
      showToast('Вы вышли из аккаунта.');
    } catch (error) {
      showToast(error.message || 'Не удалось выйти из аккаунта.');
    }
  });

  fillScenarioBtn.addEventListener('click', () => {
    fillForm(presets.friend);
    showToast('Форма заполнена примером.');
  });

  resetScenarioBtn.addEventListener('click', resetCurrentFlow);

  giftForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!appState.session) {
      showToast('Чтобы получить подборку и сохранить историю, сначала войдите в аккаунт.');
      window.setTimeout(() => {
        window.location.href = 'register.html';
      }, 700);
      return;
    }

    const request = {
      occasion: occasionInput.value.trim(),
      budget: budgetInput.value.trim(),
      relation: relationInput.value.trim(),
      interests: interestsInput.value.trim(),
      notes: notesInput.value.trim(),
      source: 'web_app',
      save: false,
    };

    if (!request.occasion || !request.budget || !request.interests) {
      showToast('Укажите повод, бюджет и интересы получателя.');
      return;
    }

    try {
      const data = await window.giftmatchSupabase.requestRecommendations(request);
      appState.currentRequest = {
        occasion: data.request?.occasion ?? request.occasion,
        budget: data.request?.budget ?? request.budget,
        relation: data.request?.relation ?? request.relation,
        interests: data.request?.interests ?? request.interests,
        notes: data.request?.notes ?? request.notes,
        id: data.request?.id ?? null,
      };
      appState.currentResults = (data.recommendations ?? []).map((item) => ({
        ...item,
        request: appState.currentRequest,
      }));
      writeJson(uiKeys.currentRequest, appState.currentRequest);
      writeJson(uiKeys.currentResults, appState.currentResults);
      renderSummary();
      renderResults();
      renderExplain();
      showToast('Подборка готова. Посмотрите, какие варианты получились.');
    } catch (error) {
      showToast(error.message || 'Не удалось получить подборку.');
    }
  });

  saveSelectionBtn.addEventListener('click', saveCurrentSelection);

  closePaywallBtn.addEventListener('click', () => {
    paywallModal.classList.add('hidden');
  });

  paywallModal.addEventListener('click', (event) => {
    if (event.target === paywallModal) {
      paywallModal.classList.add('hidden');
    }
  });
}

async function init() {
  bindCatalogFilters();
  bindEvents();
  renderSummary();
  renderResults();
  renderExplain();

  try {
    appState.session = await window.giftmatchSupabase.getSession();
    await loadAccountState();
  } catch (error) {
    showToast(error.message || 'Не удалось подключиться к Supabase.');
  }

  renderScenarioProgress();
}

init();
