const uiKeys = {
  currentRequest: 'giftmatch_current_request',
  currentResults: 'giftmatch_current_results',
  paywallSeen: 'giftmatch_paywall_seen',
  signupDraft: 'giftmatch_signup_draft',
  postAuthAction: 'giftmatch_post_auth_action',
  afterAuthRedirect: 'giftmatch_after_auth_redirect',
};

const assetVersion = '20260522-auth-final-1';
const cabinetUrl = 'cabinet.html';
const registerUrl = 'register.html';

const presets = {
  friend: {
    label: 'Кофе и настольная игра',
    occasion: 'День рождения',
    budget: 'до 5000 ₽',
    relation: 'Друг',
    interests: 'настольные игры, кофе, спокойные вечера',
    notes: 'Нужен небанальный, полезный и уютный подарок для человека, который любит кофе и настольные игры.',
  },
  romantic: {
    label: 'Мастер-класс на двоих',
    occasion: 'Годовщина отношений',
    budget: 'до 10000 ₽',
    relation: 'Партнер',
    interests: 'совместные впечатления, творчество, уютные вечера',
    notes: 'Нужен подарок-впечатление для двоих, а не просто вещь. Важно, чтобы подарок подчеркивал внимание и заботу.',
  },
  parents: {
    label: 'Семейный фотоальбом',
    occasion: 'Юбилей',
    budget: 'до 15000 ₽',
    relation: 'Родители или близкие родственники',
    interests: 'семейные воспоминания, дом, памятные вещи',
    notes: 'Нужен теплый, личный и памятный подарок с семейной историей.',
  },
  colleague: {
    label: 'Набор для рабочего дня',
    occasion: 'День рождения коллеги',
    budget: 'до 3000 ₽',
    relation: 'Коллега',
    interests: 'офис, кофе, минималистичные вещи, рабочий день',
    notes: 'Нужен нейтральный, аккуратный и уместный подарок без лишнего риска.',
  },
  handmade: {
    label: 'Свечи ручной работы',
    occasion: 'Небольшой личный подарок',
    budget: 'до 4000 ₽',
    relation: 'Друг или близкий человек',
    interests: 'уют, дом, ароматические свечи, ручная работа',
    notes: 'Нужен спокойный домашний подарок для человека, который любит атмосферные детали и уют.',
  },
  sport: {
    label: 'Набор для восстановления',
    occasion: 'День рождения',
    budget: 'до 6000 ₽',
    relation: 'Друг или близкий человек',
    interests: 'спорт, тренировки, восстановление, активный образ жизни',
    notes: 'Нужен полезный подарок для человека, который занимается спортом и любит практичные вещи.',
  },
};

const fallbackCatalogCards = [
  { slug: 'friend', title: 'Кофе и настольная игра', short_description: 'Хороший вариант для друга, который любит спокойные вечера, кофе и вещи, которыми хочется пользоваться сразу.', badge_text: '☕ Для уютного вечера', tags: ['день рождения', 'друг', 'до 5000 ₽'], filter_tags: ['birthday', 'friend', 'cozy'], starting_price: 3900, image_path: 'assets/gifts/coffee-weekend.png' },
  { slug: 'romantic', title: 'Мастер-класс на двоих', short_description: 'Подойдет паре, если хочется подарить не вещь, а совместное впечатление и время вместе.', badge_text: '🎨 Для совместного вечера', tags: ['годовщина', 'для двоих', 'впечатление'], filter_tags: ['romantic', 'experience', 'anniversary'], starting_price: 6500, image_path: 'assets/gifts/pottery-date.png' },
  { slug: 'parents', title: 'Семейный фотоальбом', short_description: 'Теплый подарок для родителей или близких, когда хочется выбрать что-то личное и памятное.', badge_text: '📖 Подарок с историей', tags: ['юбилей', 'семья', 'памятный'], filter_tags: ['family', 'anniversary', 'warm'], starting_price: 4800, image_path: 'assets/gifts/family-album.png' },
  { slug: 'colleague', title: 'Набор для рабочего дня', short_description: 'Удобный подарок для коллеги: аккуратный, нейтральный и уместный даже тогда, когда времени на поиск почти нет.', badge_text: '🗂 Нейтрально и уместно', tags: ['коллеге', 'до 3000 ₽', 'универсально'], filter_tags: ['work', 'colleague', 'fast'], starting_price: 2400, image_path: 'assets/gifts/office-set.png' },
  { slug: 'handmade', title: 'Свечи ручной работы', short_description: 'Небольшой, но приятный подарок для тех, кто любит уют, детали для дома и спокойную атмосферу.', badge_text: '🕯 Спокойный домашний подарок', tags: ['ручная работа', 'дом', 'уют'], filter_tags: ['handmade', 'home', 'calm'], starting_price: 3100, image_path: 'assets/gifts/handmade-candles.png' },
  { slug: 'sport', title: 'Набор для восстановления', short_description: 'Подойдет человеку, который занимается спортом и любит полезные вещи для ежедневного использования.', badge_text: '🏃 Для активной жизни', tags: ['спорт', 'полезное', 'активный образ жизни'], filter_tags: ['sport', 'active', 'birthday'], starting_price: 4200, image_path: 'assets/gifts/sport-recovery.png' },
];

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeKey(key) {
  localStorage.removeItem(key);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function loadScriptOnce(src, id) {
  return new Promise((resolve, reject) => {
    const existing = id ? document.getElementById(id) : null;
    if (existing) {
      if (existing.dataset.loaded === '1') return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Не удалось загрузить ${src}`)), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    if (id) script.id = id;
    script.addEventListener('load', () => { script.dataset.loaded = '1'; resolve(); }, { once: true });
    script.addEventListener('error', () => reject(new Error(`Не удалось загрузить ${src}`)), { once: true });
    document.head.appendChild(script);
  });
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
let postAuthActionPromise = null;

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
const profileCard = guestState?.closest('.profile-card') || userState?.closest('.profile-card') || document.querySelector('.profile-card');

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

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => toast.classList.add('hidden'), 2800);
}

function initialsFromName(name) {
  return String(name || 'Gift Match').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'GM';
}

function getPaywallSeen() {
  return localStorage.getItem(uiKeys.paywallSeen) === '1';
}

function setPaywallSeen() {
  localStorage.setItem(uiKeys.paywallSeen, '1');
}

function setPostAuthAction(action) {
  localStorage.setItem(uiKeys.postAuthAction, action);
}

function getPostAuthAction() {
  return localStorage.getItem(uiKeys.postAuthAction) || '';
}

function clearPostAuthAction() {
  localStorage.removeItem(uiKeys.postAuthAction);
}

function setAfterAuthRedirect(url) {
  localStorage.setItem(uiKeys.afterAuthRedirect, url);
}

async function ensureClientBootstrapLoaded() {
  if (window.ensureGiftmatchClient || window.initializeGiftmatchSupabase || window.giftmatchSupabase) return;
  try { await loadScriptOnce(`auth-bootstrap.js?v=${assetVersion}`, 'giftmatch-auth-bootstrap-fallback'); } catch {}
  if (window.ensureGiftmatchClient || window.initializeGiftmatchSupabase || window.giftmatchSupabase) return;
  await loadScriptOnce(`supabase-client.js?v=${assetVersion}`, 'giftmatch-supabase-client-direct');
}

async function getClient() {
  if (appState.client) return appState.client;
  if (!window.ensureGiftmatchClient && !window.initializeGiftmatchSupabase && !window.giftmatchSupabase) {
    await ensureClientBootstrapLoaded();
  }
  if (window.ensureGiftmatchClient) appState.client = await window.ensureGiftmatchClient();
  else if (window.initializeGiftmatchSupabase) appState.client = await window.initializeGiftmatchSupabase();
  else if (window.giftmatchSupabase) appState.client = window.giftmatchSupabase;
  if (!appState.client) throw new Error('Модуль входа не загрузился');
  return appState.client;
}

async function getReliableSession(client) {
  try { await client.finalizeAuthFromUrl(); } catch {}
  let session = null;
  try { session = await client.getSession(); } catch {}
  if (!session?.user) {
    try { session = await client.waitForSession(3500, 180); } catch {}
  }
  return session || null;
}

async function syncAuthFromSupabase(force = false) {
  if (!force && authBootstrapPromise) return authBootstrapPromise;
  authBootstrapPromise = (async () => {
    const client = await getClient();
    const session = await getReliableSession(client);
    appState.session = session;
    appState.authResolved = true;
    if (session?.user) {
      try {
        const data = await client.getAccountData();
        appState.profile = data.profile || await client.ensureProfile(session.user);
        appState.savedRecommendations = data.savedRecommendations || [];
      } catch {
        appState.profile = await client.ensureProfile(session.user).catch(() => ({ id: session.user.id, email: session.user.email, plan: 'free' }));
        appState.savedRecommendations = [];
      }
    } else {
      appState.profile = null;
      appState.savedRecommendations = [];
    }
    renderProfile();
    renderSaved();
    renderScenarioProgress();
    return { client, session };
  })();
  try { return await authBootstrapPromise; } finally { authBootstrapPromise = null; }
}

function isAuthenticated() {
  return Boolean(appState.session?.user || appState.profile?.id || appState.profile?.email);
}

function getActiveProfileViewModel() {
  const sessionUser = appState.session?.user || null;
  return {
    email: appState.profile?.email || sessionUser?.email || '',
    full_name: appState.profile?.full_name || sessionUser?.user_metadata?.full_name || sessionUser?.user_metadata?.name || 'Пользователь GiftMatch',
    plan: appState.profile?.plan || 'free',
  };
}

function fillForm(data) {
  if (!data) return;
  occasionInput.value = data.occasion || '';
  budgetInput.value = data.budget || '';
  relationInput.value = data.relation || '';
  interestsInput.value = data.interests || '';
  notesInput.value = data.notes || '';
}

function clearCurrentResultsOnly() {
  appState.currentRequest = null;
  appState.currentResults = [];
  removeKey(uiKeys.currentRequest);
  removeKey(uiKeys.currentResults);
  renderSummary();
  renderResults();
  renderExplain();
}

function applyPreset(key, scroll = true) {
  const preset = presets[key];
  if (!preset) return;
  fillForm(preset);
  clearCurrentResultsOnly();
  showToast(`Взяли за основу пример: «${preset.label}».`);
  if (scroll) document.getElementById('mvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatPrice(value) {
  if (!value) return 'по запросу';
  return `от ${Number(value).toLocaleString('ru-RU')} ₽`;
}

function syncPresetsFromDatabase(records) {
  if (!Array.isArray(records) || !records.length) return;
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

function requestRows(request) {
  return [
    ['Повод', request.occasion],
    ['Бюджет', request.budget],
    ['Интересы', request.interests],
    ['Кто это для вас', request.relation || 'Не указано'],
    ['Дополнительно', request.notes || 'Без дополнительных условий'],
  ];
}

function buildLocalRecommendations(request) {
  const subject = request.relation || 'получателя';
  const interestSummary = request.interests || 'его интересы';
  const occasion = request.occasion || 'повод';
  return [
    { id: null, title: 'Персональный набор по интересам', reason: `Подходит для сценария «${occasion}», потому что опирается на интересы: ${interestSummary}.`, explanation: `Это безопасный и уместный вариант для ${subject}, если нужен подарок с ощущением внимания к деталям.`, price_hint: request.budget || 'по бюджету', category: 'Персональный подарок', tone: 'Практично и тепло', score: 92, is_saved: false, is_local_fallback: true },
    { id: null, title: 'Небольшое впечатление или совместная активность', reason: `Хорошо работает для ${occasion}, когда хочется подарить эмоцию, а не только вещь.`, explanation: `Подход особенно уместен, если для ${subject} важны впечатления, совместное время или атмосфера.`, price_hint: request.budget || 'по бюджету', category: 'Впечатление', tone: 'Эмоционально и легко', score: 88, is_saved: false, is_local_fallback: true },
    { id: null, title: 'Уютная вещь для повседневного использования', reason: 'Такой вариант легко вписывается в обычную жизнь и не выглядит случайным или формальным.', explanation: `Если важны польза, аккуратность и комфорт, этот сценарий часто оказывается самым универсальным для ${subject}.`, price_hint: request.budget || 'по бюджету', category: 'Повседневный подарок', tone: 'Спокойно и уместно', score: 84, is_saved: false, is_local_fallback: true },
  ];
}

function renderScenarioProgress() {
  if (!scenarioSteps || !scenarioBadge) return;
  const state = { profile: isAuthenticated(), request: !!appState.currentRequest, results: appState.currentResults.length > 0, saved: appState.savedRecommendations.length > 0, paywall: getPaywallSeen() };
  let completed = 0;
  scenarioSteps.querySelectorAll('[data-step]').forEach((item) => {
    const done = Boolean(state[item.dataset.step]);
    item.classList.toggle('is-done', done);
    if (done) completed += 1;
  });
  scenarioBadge.textContent = `${completed} / 5`;
  scenarioBadge.classList.toggle('muted', completed < 5);
}

function renderHeaderAccount() {
  if (!headerAccountLink) return;
  headerAccountLink.classList.remove('hidden');
  headerAccountLink.hidden = false;
  if (!isAuthenticated()) {
    headerAccountLink.textContent = 'Войти';
    headerAccountLink.href = `${registerUrl}?mode=signin`;
    headerAccountLink.classList.remove('btn-primary');
    headerAccountLink.classList.add('btn-secondary');
    return;
  }
  headerAccountLink.textContent = 'Кабинет';
  headerAccountLink.href = cabinetUrl;
  headerAccountLink.classList.remove('btn-secondary');
  headerAccountLink.classList.add('btn-primary');
}

function renderProfile() {
  renderHeaderAccount();
  if (!isAuthenticated()) {
    if (profileCard) { profileCard.classList.remove('hidden'); profileCard.hidden = false; profileCard.style.display = ''; }
    guestState?.classList.remove('hidden');
    userState?.classList.add('hidden');
    renderScenarioProgress();
    return;
  }
  if (profileCard) { profileCard.classList.add('hidden'); profileCard.hidden = true; profileCard.style.display = 'none'; }
  const viewModel = getActiveProfileViewModel();
  if (avatarBadge) avatarBadge.textContent = initialsFromName(viewModel.full_name || viewModel.email || 'Gift Match');
  if (profileNameText) profileNameText.textContent = viewModel.full_name || 'Пользователь GiftMatch';
  if (profileEmailText) profileEmailText.textContent = viewModel.email || '';
  if (profilePlanText) profilePlanText.textContent = `План: ${String(viewModel.plan || 'free').toUpperCase()}`;
  renderScenarioProgress();
}

function renderCatalog() {
  if (!catalogGrid || !appState.catalogRecords.length) return;
  catalogGrid.innerHTML = appState.catalogRecords.map((record) => {
    const presetKey = presets[record.slug] ? record.slug : '';
    const detailTags = Array.isArray(record.tags) ? record.tags.slice(0, 3) : [];
    const filterTags = (record.filter_tags || []).join(' ');
    const buttonHtml = presetKey ? `<button class="use-gift-btn" type="button" data-preset-fill="${escapeHtml(presetKey)}">Взять за основу</button>` : '';
    return `
      <article class="card gift-showcase-card" data-tags="${escapeHtml(filterTags)}">
        <div class="gift-cover">
          <img class="gift-cover-image" src="${escapeHtml(record.image_path || '')}" alt="${escapeHtml(record.title ? `Подарок: ${record.title}` : 'Подарок')}" />
          <span class="gift-cover-badge">${escapeHtml(record.badge_text || '🎁 Готовый вариант')}</span>
        </div>
        <h3>${escapeHtml(record.title || 'Идея подарка')}</h3>
        <p class="gift-showcase-meta">${escapeHtml(record.short_description || 'Подходящий подарок для выбранного сценария.')}</p>
        <div class="gift-tag-row">${detailTags.map((tag) => `<span class="gift-tag">${escapeHtml(tag)}</span>`).join('')}</div>
        <div class="gift-card-footer"><span class="gift-price">${escapeHtml(formatPrice(record.starting_price))}</span>${buttonHtml}</div>
      </article>`;
  }).join('');
}

function renderSummary() {
  if (!requestSummary || !summaryGrid) return;
  if (!appState.currentRequest) {
    requestSummary.classList.add('hidden');
    summaryGrid.innerHTML = '';
    renderScenarioProgress();
    return;
  }
  summaryGrid.innerHTML = requestRows(appState.currentRequest).map(([label, value]) => `<article class="summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join('');
  requestSummary.classList.remove('hidden');
  renderScenarioProgress();
}

function resultCardMarkup(item, index) {
  return `<article class="result-card"><div class="result-topline"><span class="result-label">Вариант ${index + 1}</span><span class="rank-badge">#${index + 1}</span></div><h3>${escapeHtml(item.title)}</h3><p class="result-meta">${escapeHtml(item.reason)}</p><p class="result-meta">Почему это может подойти: ${escapeHtml(item.explanation ?? '')}</p><div class="confidence-row"><span class="confidence-caption">Уместность рекомендации</span><strong class="confidence-value">${item.score ?? 0}%</strong></div><div class="confidence-track"><span style="width:${item.score ?? 0}%"></span></div><div class="chip-row"><span class="chip">${escapeHtml(item.price_hint ?? '')}</span><span class="chip">${escapeHtml(item.category ?? 'Рекомендация')}</span><span class="chip">${escapeHtml(item.tone ?? 'Готовый сценарий')}</span></div></article>`;
}

function renderResults() {
  if (!resultsEmptyState || !resultsContainer || !saveSelectionBtn) return;
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
  if (!explainBlock || !explainGrid) return;
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
  explainGrid.innerHTML = explainData.map(([label, value]) => `<article class="explain-card"><h4>${escapeHtml(label)}</h4><p>${escapeHtml(value)}</p></article>`).join('');
  explainBlock.classList.remove('hidden');
}

function savedCardMarkup(item) {
  const request = item.request || {};
  return `<article class="saved-card"><div class="saved-topline"><span class="saved-label">Сохранено</span><div class="saved-actions"><span class="chip">${escapeHtml(item.category || request.relation || 'Без категории')}</span></div></div><h3>${escapeHtml(item.title || request.occasion || 'Подборка')}</h3><p class="saved-meta">Повод: ${escapeHtml(request.occasion || appState.currentRequest?.occasion || 'Не указано')}</p><p class="saved-meta">Бюджет: ${escapeHtml(request.budget || appState.currentRequest?.budget || 'Не указано')}</p><p class="saved-meta">Интересы: ${escapeHtml(request.interests || appState.currentRequest?.interests || 'Не указано')}</p><p class="saved-meta">Дата сохранения: ${escapeHtml(item.saved_at ? new Date(item.saved_at).toLocaleString('ru-RU') : 'Только что')}</p></article>`;
}

function renderSaved() {
  if (!savedCounter || !savedSelections) return;
  savedCounter.textContent = String(appState.savedRecommendations.length);
  if (!appState.savedRecommendations.length) {
    savedSelections.innerHTML = '<div class="empty-state">Пока здесь пусто. Когда сохраните подборку, она появится в этом блоке.</div>';
    renderScenarioProgress();
    return;
  }
  savedSelections.innerHTML = appState.savedRecommendations.map(savedCardMarkup).join('');
  renderScenarioProgress();
}

async function regenerateCurrentResults(client) {
  if (!appState.currentRequest) return false;
  const payload = { ...appState.currentRequest, source: 'web_app', save: false };
  const data = await client.requestRecommendations(payload);
  const request = {
    occasion: data.request?.occasion ?? payload.occasion,
    budget: data.request?.budget ?? payload.budget,
    relation: data.request?.relation ?? payload.relation,
    interests: data.request?.interests ?? payload.interests,
    notes: data.request?.notes ?? payload.notes,
    id: data.request?.id ?? appState.currentRequest?.id ?? null,
  };
  const freshResults = (data.recommendations ?? []).map((item) => ({ ...item, request }));
  if (!freshResults.length) throw new Error('Не удалось пересобрать подборку после входа.');
  appState.currentRequest = request;
  appState.currentResults = freshResults;
  writeJson(uiKeys.currentRequest, request);
  writeJson(uiKeys.currentResults, freshResults);
  renderSummary();
  renderResults();
  renderExplain();
  return true;
}

async function saveCurrentSelection(options = {}) {
  const { fromPostAuth = false } = options;
  const client = await getClient();
  const session = await getReliableSession(client);
  if (!session?.user) {
    setPostAuthAction('save-selection');
    setAfterAuthRedirect('app.html#mvp');
    showToast('Сначала войдите в аккаунт. После входа GiftMatch вернет вас к подборке.');
    window.setTimeout(() => { window.location.href = `${registerUrl}?mode=signin`; }, 700);
    return;
  }

  appState.session = session;
  if (!appState.profile) {
    appState.profile = await client.ensureProfile(session.user).catch(() => ({ id: session.user.id, email: session.user.email, plan: 'free' }));
  }
  renderProfile();

  if (!appState.currentResults.length) {
    showToast('Сначала заполните форму и получите подборку.');
    return;
  }

  if (appState.currentResults.some((item) => !item.id)) {
    try { await regenerateCurrentResults(client); }
    catch {
      clearPostAuthAction();
      showToast('Не удалось восстановить подборку. Нажмите «Показать идеи» еще раз и попробуйте сохранить снова.');
      return;
    }
  }

  try {
    const account = await client.getAccountData();
    appState.profile = account.profile || appState.profile;
    appState.savedRecommendations = account.savedRecommendations || [];
  } catch {}

  if ((appState.profile?.plan || 'free') === 'free' && appState.savedRecommendations.length >= 2) {
    paywallModal?.classList.remove('hidden');
    setPaywallSeen();
    renderScenarioProgress();
    clearPostAuthAction();
    return;
  }

  const unsavedIds = appState.currentResults.filter((item) => !item.is_saved).map((item) => item.id).filter(Boolean);
  if (!unsavedIds.length) {
    clearPostAuthAction();
    showToast('Эта подборка уже сохранена.');
    return;
  }

  try {
    await client.saveRecommendations(unsavedIds);
    const savedAt = new Date().toISOString();
    appState.currentResults = appState.currentResults.map((item) => ({ ...item, is_saved: true, saved_at: savedAt, request: appState.currentRequest }));
    writeJson(uiKeys.currentResults, appState.currentResults);
    await syncAuthFromSupabase(true);
    clearPostAuthAction();
    showToast(fromPostAuth ? 'Вход выполнен. Подборка сразу сохранена в кабинете.' : 'Подборка сохранена в вашем аккаунте.');
  } catch (error) {
    showToast(error.message || 'Не удалось сохранить подборку.');
  }
}

async function runPostAuthAction() {
  if (postAuthActionPromise) return postAuthActionPromise;
  const action = getPostAuthAction();
  if (action !== 'save-selection') return;
  const { session } = await syncAuthFromSupabase(true);
  if (!session?.user) return;
  postAuthActionPromise = (async () => {
    try { await saveCurrentSelection({ fromPostAuth: true }); }
    finally { postAuthActionPromise = null; }
  })();
  return postAuthActionPromise;
}

function resetCurrentFlow() {
  removeKey(uiKeys.currentRequest);
  removeKey(uiKeys.currentResults);
  clearPostAuthAction();
  giftForm?.reset();
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
      catalogGrid?.querySelectorAll('.gift-showcase-card').forEach((card) => {
        const tags = card.dataset.tags || '';
        card.style.display = filter === 'all' || tags.includes(filter) ? '' : 'none';
      });
    });
  });

  document.querySelectorAll('[data-preset-fill]').forEach((button) => {
    button.addEventListener('click', () => applyPreset(button.dataset.presetFill));
  });
}

function bindEvents() {
  document.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => applyPreset(button.dataset.preset, false));
  });

  document.getElementById('goToMvpBtn')?.addEventListener('click', () => {
    document.getElementById('mvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  createProfileBtn?.addEventListener('click', () => {
    if (isAuthenticated()) { window.location.href = cabinetUrl; return; }
    const email = profileEmailInput?.value.trim();
    const name = profileNameInput?.value.trim();
    if (!email || !name) { showToast('Введите имя и email, чтобы перейти к регистрации.'); return; }
    writeJson(uiKeys.signupDraft, { email, name });
    showToast('Перенаправляем ко входу, чтобы завершить создание аккаунта.');
    window.setTimeout(() => { window.location.href = `${registerUrl}?mode=signup`; }, 600);
  });

  logoutProfileBtn?.addEventListener('click', async () => {
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

  fillScenarioBtn?.addEventListener('click', () => applyPreset('friend', false));
  resetScenarioBtn?.addEventListener('click', resetCurrentFlow);

  giftForm?.addEventListener('submit', async (event) => {
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

    try { await syncAuthFromSupabase(true); } catch {}

    const useLocal = async () => {
      appState.currentRequest = { ...request, id: null };
      appState.currentResults = buildLocalRecommendations(request).map((item) => ({ ...item, request: appState.currentRequest }));
      writeJson(uiKeys.currentRequest, appState.currentRequest);
      writeJson(uiKeys.currentResults, appState.currentResults);
      renderSummary();
      renderResults();
      renderExplain();
      showToast(isAuthenticated() ? 'Подборка показана. При сохранении GiftMatch пересоберет ее в аккаунте.' : 'Подборка готова. Чтобы сохранить ее в кабинете, сначала войдите в аккаунт.');
      resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (!isAuthenticated()) {
      await useLocal();
      return;
    }

    try {
      const client = await getClient();
      const data = await client.requestRecommendations(request);
      appState.currentRequest = {
        occasion: data.request?.occasion ?? request.occasion,
        budget: data.request?.budget ?? request.budget,
        relation: data.request?.relation ?? request.relation,
        interests: data.request?.interests ?? request.interests,
        notes: data.request?.notes ?? request.notes,
        id: data.request?.id ?? null,
      };
      appState.currentResults = (data.recommendations ?? []).map((item) => ({ ...item, request: appState.currentRequest }));
      if (!appState.currentResults.length) throw new Error('Пустой ответ рекомендаций');
      writeJson(uiKeys.currentRequest, appState.currentRequest);
      writeJson(uiKeys.currentResults, appState.currentResults);
      renderSummary();
      renderResults();
      renderExplain();
      showToast('Подборка готова. Можно сохранить ее в кабинете.');
      resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      await useLocal();
    }
  });

  saveSelectionBtn?.addEventListener('click', () => saveCurrentSelection());
  closePaywallBtn?.addEventListener('click', () => paywallModal?.classList.add('hidden'));
  paywallModal?.addEventListener('click', (event) => { if (event.target === paywallModal) paywallModal.classList.add('hidden'); });
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

  try {
    const client = await getClient();
    try {
      const presetRecords = await client.getPresets();
      syncPresetsFromDatabase(presetRecords);
      renderCatalog();
      bindCatalogFilters();
    } catch {}
    await syncAuthFromSupabase(true);
    await runPostAuthAction();
    client.onAuthStateChange(async (_event, session) => {
      appState.session = session;
      appState.authResolved = true;
      await syncAuthFromSupabase(true);
      await runPostAuthAction();
    });
  } catch (error) {
    showToast(error.message || 'Не удалось подключиться к Supabase.');
    renderScenarioProgress();
  }

  renderScenarioProgress();
}

init();
