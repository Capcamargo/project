const uiKeys = {
  currentRequest: 'giftmatch_current_request',
  currentResults: 'giftmatch_current_results',
  paywallSeen: 'giftmatch_paywall_seen',
  signupDraft: 'giftmatch_signup_draft',
};

const cabinetUrl = 'cabinet.html';
const registerUrl = 'register.html';

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

const fallbackCatalogCards = [
  {
    slug: 'friend',
    title: 'Кофе и настольная игра',
    short_description: 'Хороший вариант для друга, который любит спокойные вечера, кофе и вещи, которыми хочется пользоваться сразу.',
    badge_text: '☕ Для уютного вечера',
    tags: ['день рождения', 'друг', 'до 5000 ₽'],
    filter_tags: ['birthday', 'friend', 'cozy'],
    starting_price: 3900,
    image_path: 'assets/gifts/coffee-weekend.png',
  },
  {
    slug: 'romantic',
    title: 'Мастер-класс на двоих',
    short_description: 'Подойдет паре, если хочется подарить не вещь, а совместное впечатление и время вместе.',
    badge_text: '🎨 Для совместного вечера',
    tags: ['годовщина', 'для двоих', 'впечатление'],
    filter_tags: ['romantic', 'experience', 'anniversary'],
    starting_price: 6500,
    image_path: 'assets/gifts/pottery-date.png',
  },
  {
    slug: 'parents',
    title: 'Семейный фотоальбом',
    short_description: 'Теплый подарок для родителей или близких, когда хочется выбрать что-то личное и памятное.',
    badge_text: '📖 Подарок с историей',
    tags: ['юбилей', 'семья', 'памятный'],
    filter_tags: ['family', 'anniversary', 'warm'],
    starting_price: 4800,
    image_path: 'assets/gifts/family-album.png',
  },
  {
    slug: 'colleague',
    title: 'Набор для рабочего дня',
    short_description: 'Удобный подарок для коллеги: аккуратный, нейтральный и уместный даже тогда, когда времени на поиск почти нет.',
    badge_text: '🗂 Нейтрально и уместно',
    tags: ['коллеге', 'до 3000 ₽', 'универсально'],
    filter_tags: ['work', 'colleague', 'fast'],
    starting_price: 2400,
    image_path: 'assets/gifts/office-set.png',
  },
  {
    slug: 'handmade',
    title: 'Свечи ручной работы',
    short_description: 'Небольшой, но приятный подарок для тех, кто любит уют, детали для дома и спокойную атмосферу.',
    badge_text: '🕯 Спокойный домашний подарок',
    tags: ['ручная работа', 'дом', 'уют'],
    filter_tags: ['handmade', 'home', 'calm'],
    starting_price: 3100,
    image_path: 'assets/gifts/handmade-candles.png',
  },
  {
    slug: 'sport',
    title: 'Набор для восстановления',
    short_description: 'Подойдет человеку, который занимается спортом и любит полезные вещи для ежедневного использования.',
    badge_text: '🏃 Для активной жизни',
    tags: ['спорт', 'полезное', 'активный образ жизни'],
    filter_tags: ['sport', 'active', 'birthday'],
    starting_price: 4200,
    image_path: 'assets/gifts/sport-recovery.png',
  },
];

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

const appState = {
  client: null,
  session: null,
  profile: null,
  savedRecommendations: [],
  currentRequest: readJson(uiKeys.currentRequest, null),
  currentResults: readJson(uiKeys.currentResults, []),
  catalogRecords: [...fallbackCatalogCards],
  authResolved: false,
};

let authBootstrapPromise = null;

async function getClient() {
  if (appState.client) {
    return appState.client;
  }
  if (!window.ensureGiftmatchClient) {
    throw new Error('Модуль входа не загрузился');
  }
  appState.client = await window.ensureGiftmatchClient();
  return appState.client;
}

async function resolveAuthState(force = false) {
  if (!force && authBootstrapPromise) {
    return authBootstrapPromise;
  }

  authBootstrapPromise = (async () => {
    const client = await getClient();
    try {
      await client.finalizeAuthFromUrl();
    } catch {
      // keep current session if URL does not contain auth params
    }

    const session = (await client.waitForSession(2500, 180)) || (await client.getSession()) || null;
    appState.session = session;
    appState.authResolved = true;

    if (session?.user) {
      await loadAccountState(client);
    } else {
      appState.profile = null;
      appState.savedRecommendations = [];
      renderProfile();
      renderSaved();
    }

    return { client, session };
  })();

  try {
    return await authBootstrapPromise;
  } finally {
    authBootstrapPromise = null;
  }
}

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

let userStateActions = document.getElementById('userStateActions');
let openCabinetBtn = document.getElementById('openCabinetBtn');
if (userState && logoutProfileBtn) {
  if (!userStateActions) {
    userStateActions = document.createElement('div');
    userStateActions.id = 'userStateActions';
    userStateActions.className = 'stack-12';
    userState.appendChild(userStateActions);
  }

  if (!openCabinetBtn) {
    openCabinetBtn = document.createElement('a');
    openCabinetBtn.id = 'openCabinetBtn';
    openCabinetBtn.className = 'btn btn-primary btn-block';
    openCabinetBtn.href = cabinetUrl;
    openCabinetBtn.textContent = 'Открыть кабинет';
    userStateActions.appendChild(openCabinetBtn);
  }

  if (logoutProfileBtn.parentElement !== userStateActions) {
    logoutProfileBtn.className = 'btn btn-secondary btn-block';
    userStateActions.appendChild(logoutProfileBtn);
  }
}

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
const resultsSection = document.querySelector('.results-card');

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

function formatPrice(value) {
  if (!value) return 'по запросу';
  return `от ${Number(value).toLocaleString('ru-RU')} ₽`;
}

function syncPresetsFromDatabase(records) {
  records.forEach((record) => {
    if (!record.slug || !presets[record.slug]) return;
    presets[record.slug] = {
      ...presets[record.slug],
      label: record.title || presets[record.slug].label,
      occasion: record.occasion || presets[record.slug].occasion,
      budget: record.budget_hint || presets[record.slug].budget,
      relation: record.relation || presets[record.slug].relation,
      interests: record.interests || presets[record.slug].interests,
      notes: record.notes || presets[record.slug].notes,
    };
  });

  if (Array.isArray(records) && records.length) {
    appState.catalogRecords = records.map((record) => ({
      slug: record.slug,
      title: record.title,
      short_description: record.short_description || record.notes || '',
      badge_text: record.badge_text || '🎁 Готовый вариант',
      tags: Array.isArray(record.tags) ? record.tags : [],
      filter_tags: Array.isArray(record.filter_tags) ? record.filter_tags : [],
      starting_price: record.starting_price,
      image_path: record.image_path || '',
    }));
  }
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

function isAuthenticated() {
  return Boolean(appState.session?.user || appState.profile?.id || appState.profile?.email);
}

function getActiveProfileViewModel() {
  const sessionUser = appState.session?.user || null;
  return {
    email: appState.profile?.email || sessionUser?.email || '',
    full_name:
      appState.profile?.full_name ||
      sessionUser?.user_metadata?.full_name ||
      sessionUser?.user_metadata?.name ||
      'Пользователь GiftMatch',
    plan: appState.profile?.plan || 'free',
  };
}

function renderScenarioProgress() {
  const state = {
    profile: isAuthenticated(),
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

  if (!isAuthenticated()) {
    headerAccountLink.textContent = 'Войти';
    headerAccountLink.href = `${registerUrl}?mode=signin`;
    return;
  }

  headerAccountLink.textContent = 'Кабинет';
  headerAccountLink.href = cabinetUrl;
}

function renderProfile() {
  renderHeaderAccount();

  if (!isAuthenticated()) {
    guestState.classList.remove('hidden');
    userState.classList.add('hidden');
    renderScenarioProgress();
    return;
  }

  const viewModel = getActiveProfileViewModel();
  guestState.classList.add('hidden');
  userState.classList.remove('hidden');
  avatarBadge.textContent = initialsFromName(viewModel.full_name || viewModel.email || 'Gift Match');
  profileNameText.textContent = viewModel.full_name || 'Пользователь GiftMatch';
  profileEmailText.textContent = viewModel.email || '';
  profilePlanText.textContent = `План: ${String(viewModel.plan || 'free').toUpperCase()}`;
  if (openCabinetBtn) {
    openCabinetBtn.href = cabinetUrl;
  }
  renderScenarioProgress();
}

function renderCatalog() {
  if (!catalogGrid || !appState.catalogRecords.length) return;

  catalogGrid.innerHTML = appState.catalogRecords.map((record) => {
    const filterTags = (record.filter_tags || []).join(' ');
    const detailTags = Array.isArray(record.tags) ? record.tags.slice(0, 3) : [];
    const imageAlt = record.title ? `Подарок: ${record.title}` : 'Подарок';
    const presetKey = presets[record.slug] ? record.slug : 'friend';

    return `
      <article class="card gift-showcase-card" data-tags="${escapeHtml(filterTags)}">
        <div class="gift-cover">
          <img class="gift-cover-image" src="${escapeHtml(record.image_path || '')}" alt="${escapeHtml(imageAlt)}" />
          <span class="gift-cover-badge">${escapeHtml(record.badge_text || '🎁 Готовый вариант')}</span>
        </div>
        <h3>${escapeHtml(record.title || 'Идея подарка')}</h3>
        <p class="gift-showcase-meta">${escapeHtml(record.short_description || 'Подходящий подарок для выбранного сценария.')}</p>
        <div class="gift-tag-row">
          ${detailTags.map((tag) => `<span class="gift-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="gift-card-footer">
          <span class="gift-price">${escapeHtml(formatPrice(record.starting_price))}</span>
          <button class="use-gift-btn" type="button" data-preset-fill="${escapeHtml(presetKey)}">Взять за основу</button>
        </div>
      </article>
    `;
  }).join('');
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

async function loadAccountState(client) {
  if (!appState.session) {
    appState.profile = null;
    appState.savedRecommendations = [];
    renderProfile();
    renderSaved();
    return;
  }

  try {
    const data = await client.getAccountData();
    appState.profile = data.profile;
    appState.savedRecommendations = data.savedRecommendations;
    renderProfile();
    renderSaved();
  } catch (error) {
    appState.profile = null;
    appState.savedRecommendations = [];
    renderProfile();
    renderSaved();
    showToast(error.message || 'Не удалось загрузить данные профиля.');
  }
}

async function ensureAuthenticatedBeforeAction() {
  try {
    await resolveAuthState(!appState.authResolved || !appState.session);
  } catch (error) {
    showToast(error.message || 'Не удалось проверить активную сессию.');
  }

  if (!isAuthenticated()) {
    showToast('Чтобы продолжить, сначала войдите в аккаунт.');
    window.setTimeout(() => {
      window.location.href = `${registerUrl}?mode=signin`;
    }, 700);
    return null;
  }

  return getClient();
}

async function saveCurrentSelection() {
  const client = await ensureAuthenticatedBeforeAction();
  if (!client) return;

  if (!appState.currentResults.length) {
    showToast('Сначала заполните форму и получите подборку.');
    return;
  }

  if ((appState.profile?.plan || 'free') === 'free' && appState.savedRecommendations.length >= 2) {
    paywallModal.classList.remove('hidden');
    setPaywallSeen();
    renderScenarioProgress();
    return;
  }

  const unsavedIds = appState.currentResults.filter((item) => !item.is_saved).map((item) => item.id).filter(Boolean);

  if (!unsavedIds.length) {
    showToast('Эта подборка уже сохранена.');
    return;
  }

  try {
    await client.saveRecommendations(unsavedIds);
    appState.currentResults = appState.currentResults.map((item) => ({
      ...item,
      is_saved: true,
      saved_at: new Date().toISOString(),
      request: appState.currentRequest,
    }));
    writeJson(uiKeys.currentResults, appState.currentResults);
    await loadAccountState(client);
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
    if (isAuthenticated()) {
      window.location.href = cabinetUrl;
      return;
    }

    const email = profileEmailInput.value.trim();
    const name = profileNameInput.value.trim();

    if (!email || !name) {
      showToast('Введите имя и email, чтобы перейти к регистрации.');
      return;
    }

    writeJson(uiKeys.signupDraft, { email, name });
    showToast('Перенаправляем ко входу, чтобы завершить создание аккаунта.');
    window.setTimeout(() => {
      window.location.href = `${registerUrl}?mode=signup`;
    }, 600);
  });

  logoutProfileBtn.addEventListener('click', async () => {
    try {
      const client = await getClient();
      await client.signOut();
      appState.session = null;
      appState.profile = null;
      appState.savedRecommendations = [];
      appState.authResolved = true;
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

    const client = await ensureAuthenticatedBeforeAction();
    if (!client) return;

    try {
      const data = await client.requestRecommendations(request);
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
      resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  renderSummary();
  renderResults();
  renderExplain();
  renderCatalog();
  bindCatalogFilters();
  bindEvents();
  renderHeaderAccount();
  renderProfile();

  let client;
  try {
    client = await getClient();
  } catch (error) {
    showToast(error.message || 'Не удалось подключиться к Supabase.');
    renderScenarioProgress();
    return;
  }

  try {
    const presetRecords = await client.getPresets();
    syncPresetsFromDatabase(presetRecords);
    renderCatalog();
    bindCatalogFilters();
  } catch {
    renderCatalog();
  }

  try {
    await resolveAuthState(true);

    client.onAuthStateChange(async (_event, session) => {
      appState.session = session;
      appState.authResolved = true;
      await loadAccountState(client);
      renderScenarioProgress();
    });
  } catch (error) {
    showToast(error.message || 'Не удалось подключиться к Supabase.');
  }

  renderScenarioProgress();
}

init();
