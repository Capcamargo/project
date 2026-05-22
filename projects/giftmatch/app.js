const uiKeys = {
  currentRequest: 'giftmatch_current_request',
  currentResults: 'giftmatch_current_results',
  paywallSeen: 'giftmatch_paywall_seen',
  signupDraft: 'giftmatch_signup_draft',
  postAuthAction: 'giftmatch_post_auth_action',
  afterAuthRedirect: 'giftmatch_after_auth_redirect',
};

const assetVersion = '20260522-clean-2';
const cabinetUrl = 'cabinet.html';
const registerUrl = 'register.html';

const presets = {
  friend: {
    label: 'Кофе и настольная игра',
    occasion: 'Подарок для уютного вечера',
    budget: 'до 5000 ₽',
    relation: 'Друг',
    interests: 'настольные игры, кофе, спокойные вечера',
    notes: 'Нужен небанальный, полезный и уютный подарок для человека, который любит кофе и настольные игры.',
  },
  romantic: {
    label: 'Мастер-класс на двоих',
    occasion: 'Совместный подарок-впечатление',
    budget: 'до 10000 ₽',
    relation: 'Партнер',
    interests: 'совместные впечатления, творчество, уютные вечера',
    notes: 'Нужен подарок-впечатление для двоих, а не просто вещь. Важно, чтобы подарок подчеркивал внимание и заботу.',
  },
  parents: {
    label: 'Семейный фотоальбом',
    occasion: 'Памятный семейный подарок',
    budget: 'до 15000 ₽',
    relation: 'Родители или близкие родственники',
    interests: 'семейные воспоминания, дом, памятные вещи',
    notes: 'Нужен теплый, личный и памятный подарок с семейной историей.',
  },
  colleague: {
    label: 'Набор для рабочего дня',
    occasion: 'Нейтральный подарок коллеге',
    budget: 'до 3000 ₽',
    relation: 'Коллега',
    interests: 'офис, кофе, минималистичные вещи, рабочий день',
    notes: 'Нужен нейтральный, аккуратный и уместный подарок без лишнего риска.',
  },
  handmade: {
    label: 'Свечи ручной работы',
    occasion: 'Домашний уют',
    budget: 'до 4000 ₽',
    relation: 'Друг или близкий человек',
    interests: 'уют, дом, ароматические свечи, ручная работа',
    notes: 'Нужен спокойный домашний подарок для человека, который любит атмосферные детали и уют.',
  },
  sport: {
    label: 'Набор для восстановления',
    occasion: 'Подарок для активного образа жизни',
    budget: 'до 6000 ₽',
    relation: 'Друг или близкий человек',
    interests: 'спорт, тренировки, восстановление, активный образ жизни',
    notes: 'Нужен полезный подарок для человека, который занимается спортом и любит практичные вещи.',
  },
};

const fallbackCatalogCards = [
  { slug: 'friend', title: 'Кофе и настольная игра', short_description: 'Хороший вариант для друга, который любит спокойные вечера, кофе и вещи, которыми хочется пользоваться сразу.', badge_text: '☕ Для уютного вечера', tags: ['уютный вечер', 'друг', 'до 5000 ₽'], filter_tags: ['friend', 'cozy'], starting_price: 3900, image_path: 'assets/gifts/coffee-weekend.png' },
  { slug: 'romantic', title: 'Мастер-класс на двоих', short_description: 'Подойдет паре, если хочется подарить не вещь, а совместное впечатление и время вместе.', badge_text: '🎨 Для совместного вечера', tags: ['для двоих', 'впечатление', 'до 10000 ₽'], filter_tags: ['romantic', 'experience'], starting_price: 6500, image_path: 'assets/gifts/pottery-date.png' },
  { slug: 'parents', title: 'Семейный фотоальбом', short_description: 'Теплый подарок для родителей или близких, когда хочется выбрать что-то личное и памятное.', badge_text: '📖 Подарок с историей', tags: ['семья', 'памятный', 'история'], filter_tags: ['family', 'warm'], starting_price: 4800, image_path: 'assets/gifts/family-album.png' },
  { slug: 'colleague', title: 'Набор для рабочего дня', short_description: 'Удобный подарок для коллеги: аккуратный, нейтральный и уместный даже тогда, когда времени на поиск почти нет.', badge_text: '🗂 Нейтрально и уместно', tags: ['коллеге', 'до 3000 ₽', 'универсально'], filter_tags: ['work', 'colleague', 'fast'], starting_price: 2400, image_path: 'assets/gifts/office-set.png' },
  { slug: 'handmade', title: 'Свечи ручной работы', short_description: 'Небольшой, но приятный подарок для тех, кто любит уют, детали для дома и спокойную атмосферу.', badge_text: '🕯 Спокойный домашний подарок', tags: ['ручная работа', 'дом', 'уют'], filter_tags: ['handmade', 'home', 'calm'], starting_price: 3100, image_path: 'assets/gifts/handmade-candles.png' },
  { slug: 'sport', title: 'Набор для восстановления', short_description: 'Подойдет человеку, который занимается спортом и любит полезные вещи для ежедневного использования.', badge_text: '🏃 Для активной жизни', tags: ['спорт', 'полезное', 'активный образ жизни'], filter_tags: ['sport', 'active'], starting_price: 4200, image_path: 'assets/gifts/sport-recovery.png' },
];

const state = {
  client: null,
  session: null,
  profile: null,
  savedRecommendations: [],
  currentRequest: readJson(uiKeys.currentRequest, null),
  currentResults: readJson(uiKeys.currentResults, []),
  catalogRecords: [...fallbackCatalogCards],
  authResolved: false,
  syncingAuth: null,
};

const el = {
  guestState: document.getElementById('guestState'),
  userState: document.getElementById('userState'),
  profileNameText: document.getElementById('profileNameText'),
  profileEmailText: document.getElementById('profileEmailText'),
  profilePlanText: document.getElementById('profilePlanText'),
  avatarBadge: document.getElementById('avatarBadge'),
  profileEmailInput: document.getElementById('profileEmailInput'),
  profileNameInput: document.getElementById('profileNameInput'),
  createProfileBtn: document.getElementById('createProfileBtn'),
  logoutProfileBtn: document.getElementById('logoutProfileBtn'),
  headerAccountLink: document.getElementById('headerAccountLink'),
  giftForm: document.getElementById('giftForm'),
  occasionInput: document.getElementById('occasionInput'),
  budgetInput: document.getElementById('budgetInput'),
  relationInput: document.getElementById('relationInput'),
  interestsInput: document.getElementById('interestsInput'),
  notesInput: document.getElementById('notesInput'),
  requestSummary: document.getElementById('requestSummary'),
  summaryGrid: document.getElementById('summaryGrid'),
  resultsEmptyState: document.getElementById('resultsEmptyState'),
  resultsContainer: document.getElementById('resultsContainer'),
  explainBlock: document.getElementById('explainBlock'),
  explainGrid: document.getElementById('explainGrid'),
  saveSelectionBtn: document.getElementById('saveSelectionBtn'),
  savedCounter: document.getElementById('savedCounter'),
  savedSelections: document.getElementById('savedSelections'),
  fillScenarioBtn: document.getElementById('fillScenarioBtn'),
  resetScenarioBtn: document.getElementById('resetScenarioBtn'),
  paywallModal: document.getElementById('paywallModal'),
  closePaywallBtn: document.getElementById('closePaywallBtn'),
  toast: document.getElementById('toast'),
  scenarioBadge: document.getElementById('scenarioBadge'),
  scenarioSteps: document.getElementById('scenarioSteps'),
  catalogGrid: document.getElementById('catalogGrid'),
  resultsSection: document.querySelector('.results-card'),
};

el.profileCard = el.guestState?.closest('.profile-card') || el.userState?.closest('.profile-card') || document.querySelector('.profile-card');

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
      existing.addEventListener('load', resolve, { once: true });
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

function showToast(message) {
  if (!el.toast) return;
  el.toast.textContent = message;
  el.toast.classList.remove('hidden');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => el.toast.classList.add('hidden'), 3000);
}

function initialsFromName(name) {
  return String(name || 'Gift Match').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'GM';
}

function isAuthenticated() {
  return Boolean(state.session?.user);
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
  if (state.client) return state.client;
  await ensureClientBootstrapLoaded();
  if (window.ensureGiftmatchClient) state.client = await window.ensureGiftmatchClient();
  else if (window.initializeGiftmatchSupabase) state.client = await window.initializeGiftmatchSupabase();
  else if (window.giftmatchSupabase) state.client = window.giftmatchSupabase;
  if (!state.client) throw new Error('Модуль входа не загрузился');
  return state.client;
}

async function getFreshSession(client) {
  let session = null;
  try { session = await client.getSession(); } catch {}
  if (!session?.user) {
    try { session = await client.waitForSession(2500, 180); } catch {}
  }
  return session || null;
}

async function syncAuth(force = false) {
  if (state.syncingAuth && !force) return state.syncingAuth;
  state.syncingAuth = (async () => {
    const client = await getClient();
    const session = await getFreshSession(client);
    state.session = session;
    state.authResolved = true;

    if (!session?.user) {
      state.profile = null;
      state.savedRecommendations = [];
      renderAllAuthDependent();
      return { client, session };
    }

    try {
      const account = await client.getAccountData();
      state.profile = account.profile || await client.ensureProfile(session.user);
      state.savedRecommendations = account.savedRecommendations || [];
    } catch {
      state.profile = await client.ensureProfile(session.user).catch(() => ({
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Пользователь GiftMatch',
        plan: 'free',
      }));
      state.savedRecommendations = [];
    }

    renderAllAuthDependent();
    return { client, session };
  })();

  try { return await state.syncingAuth; }
  finally { state.syncingAuth = null; }
}

function getActiveProfileViewModel() {
  const user = state.session?.user || null;
  return {
    email: state.profile?.email || user?.email || '',
    full_name: state.profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Пользователь GiftMatch',
    plan: state.profile?.plan || 'free',
  };
}

function renderHeaderAccount() {
  if (!el.headerAccountLink) return;
  if (!state.authResolved) {
    el.headerAccountLink.classList.add('hidden');
    el.headerAccountLink.hidden = true;
    return;
  }

  el.headerAccountLink.classList.remove('hidden');
  el.headerAccountLink.hidden = false;

  if (!isAuthenticated()) {
    el.headerAccountLink.textContent = 'Войти';
    el.headerAccountLink.href = `${registerUrl}?mode=signin`;
    el.headerAccountLink.classList.remove('btn-primary');
    el.headerAccountLink.classList.add('btn-secondary');
    return;
  }

  el.headerAccountLink.textContent = 'Кабинет';
  el.headerAccountLink.href = cabinetUrl;
  el.headerAccountLink.classList.remove('btn-secondary');
  el.headerAccountLink.classList.add('btn-primary');
}

function renderProfile() {
  renderHeaderAccount();

  if (!state.authResolved) {
    if (el.profileCard) {
      el.profileCard.classList.add('hidden');
      el.profileCard.hidden = true;
      el.profileCard.style.display = 'none';
    }
    return;
  }

  if (!isAuthenticated()) {
    if (el.profileCard) {
      el.profileCard.classList.remove('hidden');
      el.profileCard.hidden = false;
      el.profileCard.style.display = '';
    }
    el.guestState?.classList.remove('hidden');
    el.userState?.classList.add('hidden');
    renderScenarioProgress();
    return;
  }

  if (el.profileCard) {
    el.profileCard.classList.add('hidden');
    el.profileCard.hidden = true;
    el.profileCard.style.display = 'none';
  }

  const viewModel = getActiveProfileViewModel();
  if (el.avatarBadge) el.avatarBadge.textContent = initialsFromName(viewModel.full_name || viewModel.email || 'Gift Match');
  if (el.profileNameText) el.profileNameText.textContent = viewModel.full_name || 'Пользователь GiftMatch';
  if (el.profileEmailText) el.profileEmailText.textContent = viewModel.email || '';
  if (el.profilePlanText) el.profilePlanText.textContent = `План: ${String(viewModel.plan || 'free').toUpperCase()}`;
  renderScenarioProgress();
}

function renderScenarioProgress() {
  if (!el.scenarioSteps || !el.scenarioBadge) return;
  const progress = {
    profile: isAuthenticated(),
    request: Boolean(state.currentRequest),
    results: state.currentResults.length > 0,
    saved: state.savedRecommendations.length > 0,
    paywall: getPaywallSeen(),
  };
  let completed = 0;
  el.scenarioSteps.querySelectorAll('[data-step]').forEach((item) => {
    const done = Boolean(progress[item.dataset.step]);
    item.classList.toggle('is-done', done);
    if (done) completed += 1;
  });
  el.scenarioBadge.textContent = `${completed} / 5`;
  el.scenarioBadge.classList.toggle('muted', completed < 5);
}

function renderAllAuthDependent() {
  renderProfile();
  renderSaved();
  renderScenarioProgress();
}

function fillForm(data) {
  if (!data) return;
  if (el.occasionInput) el.occasionInput.value = data.occasion || '';
  if (el.budgetInput) el.budgetInput.value = data.budget || '';
  if (el.relationInput) el.relationInput.value = data.relation || '';
  if (el.interestsInput) el.interestsInput.value = data.interests || '';
  if (el.notesInput) el.notesInput.value = data.notes || '';
}

function clearCurrentResultsOnly() {
  state.currentRequest = null;
  state.currentResults = [];
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
  state.catalogRecords = records.map((record) => ({
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

function renderCatalog() {
  if (!el.catalogGrid || !state.catalogRecords.length) return;
  el.catalogGrid.innerHTML = state.catalogRecords.map((record) => {
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
  bindCatalogActionButtons();
}

function renderSummary() {
  if (!el.requestSummary || !el.summaryGrid) return;
  if (!state.currentRequest) {
    el.requestSummary.classList.add('hidden');
    el.summaryGrid.innerHTML = '';
    renderScenarioProgress();
    return;
  }
  const rows = [
    ['Повод', state.currentRequest.occasion],
    ['Бюджет', state.currentRequest.budget],
    ['Интересы', state.currentRequest.interests],
    ['Кто это для вас', state.currentRequest.relation || 'Не указано'],
    ['Дополнительно', state.currentRequest.notes || 'Без дополнительных условий'],
  ];
  el.summaryGrid.innerHTML = rows.map(([label, value]) => `<article class="summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join('');
  el.requestSummary.classList.remove('hidden');
  renderScenarioProgress();
}

function resultCardMarkup(item, index) {
  return `<article class="result-card"><div class="result-topline"><span class="result-label">Вариант ${index + 1}</span><span class="rank-badge">#${index + 1}</span></div><h3>${escapeHtml(item.title)}</h3><p class="result-meta">${escapeHtml(item.reason)}</p><p class="result-meta">Почему это может подойти: ${escapeHtml(item.explanation ?? '')}</p><div class="confidence-row"><span class="confidence-caption">Уместность рекомендации</span><strong class="confidence-value">${item.score ?? 0}%</strong></div><div class="confidence-track"><span style="width:${item.score ?? 0}%"></span></div><div class="chip-row"><span class="chip">${escapeHtml(item.price_hint ?? '')}</span><span class="chip">${escapeHtml(item.category ?? 'Рекомендация')}</span><span class="chip">${escapeHtml(item.tone ?? 'Готовый сценарий')}</span></div></article>`;
}

function renderResults() {
  if (!el.resultsEmptyState || !el.resultsContainer || !el.saveSelectionBtn) return;
  if (!state.currentResults.length) {
    el.resultsEmptyState.classList.remove('hidden');
    el.resultsContainer.innerHTML = '';
    el.saveSelectionBtn.disabled = true;
    el.saveSelectionBtn.classList.add('is-disabled');
    renderScenarioProgress();
    return;
  }
  el.resultsEmptyState.classList.add('hidden');
  el.resultsContainer.innerHTML = state.currentResults.map(resultCardMarkup).join('');
  el.saveSelectionBtn.disabled = false;
  el.saveSelectionBtn.classList.remove('is-disabled');
  renderScenarioProgress();
}

function renderExplain() {
  if (!el.explainBlock || !el.explainGrid) return;
  if (!state.currentRequest || !state.currentResults.length) {
    el.explainBlock.classList.add('hidden');
    el.explainGrid.innerHTML = '';
    return;
  }
  const rows = [
    ['Повод', state.currentRequest.occasion],
    ['Бюджет', state.currentRequest.budget],
    ['Интересы', state.currentRequest.interests],
    ['Кто это для вас', state.currentRequest.relation || 'Не указано, поэтому подборка остается более универсальной.'],
  ];
  el.explainGrid.innerHTML = rows.map(([label, value]) => `<article class="explain-card"><h4>${escapeHtml(label)}</h4><p>${escapeHtml(value)}</p></article>`).join('');
  el.explainBlock.classList.remove('hidden');
}

function savedCardMarkup(item) {
  const request = item.request || {};
  return `<article class="saved-card"><div class="saved-topline"><span class="saved-label">Сохранено</span><span class="chip">${escapeHtml(item.category || request.relation || 'Без категории')}</span></div><h3>${escapeHtml(item.title || request.occasion || 'Подборка')}</h3><p class="saved-meta">Повод: ${escapeHtml(request.occasion || state.currentRequest?.occasion || 'Не указано')}</p><p class="saved-meta">Бюджет: ${escapeHtml(request.budget || state.currentRequest?.budget || 'Не указано')}</p><p class="saved-meta">Интересы: ${escapeHtml(request.interests || state.currentRequest?.interests || 'Не указано')}</p><p class="saved-meta">Дата сохранения: ${escapeHtml(item.saved_at ? new Date(item.saved_at).toLocaleString('ru-RU') : 'Только что')}</p></article>`;
}

function renderSaved() {
  if (!el.savedCounter || !el.savedSelections) return;
  el.savedCounter.textContent = String(state.savedRecommendations.length);
  if (!state.savedRecommendations.length) {
    el.savedSelections.innerHTML = '<div class="empty-state">Пока здесь пусто. Когда сохраните подборку, она появится в этом блоке.</div>';
    renderScenarioProgress();
    return;
  }
  el.savedSelections.innerHTML = state.savedRecommendations.map(savedCardMarkup).join('');
  renderScenarioProgress();
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

async function regenerateCurrentResults(client) {
  if (!state.currentRequest) return false;
  const payload = { ...state.currentRequest, source: 'web_app', save: false };
  const data = await client.requestRecommendations(payload);
  const request = {
    occasion: data.request?.occasion ?? payload.occasion,
    budget: data.request?.budget ?? payload.budget,
    relation: data.request?.relation ?? payload.relation,
    interests: data.request?.interests ?? payload.interests,
    notes: data.request?.notes ?? payload.notes,
    id: data.request?.id ?? state.currentRequest?.id ?? null,
  };
  const freshResults = (data.recommendations ?? []).map((item) => ({ ...item, request }));
  if (!freshResults.length) throw new Error('Не удалось пересобрать подборку после входа.');
  state.currentRequest = request;
  state.currentResults = freshResults;
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
  const session = await getFreshSession(client);

  if (!session?.user) {
    setPostAuthAction('save-selection');
    setAfterAuthRedirect('app.html#mvp');
    showToast('Сначала войдите в аккаунт. После входа GiftMatch вернет вас к подборке.');
    window.setTimeout(() => { window.location.href = `${registerUrl}?mode=signin`; }, 700);
    return;
  }

  state.session = session;
  if (!state.profile) {
    state.profile = await client.ensureProfile(session.user).catch(() => ({ id: session.user.id, email: session.user.email, plan: 'free' }));
  }
  state.authResolved = true;
  renderProfile();

  if (!state.currentResults.length) {
    showToast('Сначала заполните форму и получите подборку.');
    return;
  }

  if (state.currentResults.some((item) => !item.id)) {
    try { await regenerateCurrentResults(client); }
    catch {
      clearPostAuthAction();
      showToast('Не удалось восстановить подборку. Нажмите «Показать идеи» еще раз и попробуйте сохранить снова.');
      return;
    }
  }

  try {
    const account = await client.getAccountData();
    state.profile = account.profile || state.profile;
    state.savedRecommendations = account.savedRecommendations || [];
  } catch {}

  if ((state.profile?.plan || 'free') === 'free' && state.savedRecommendations.length >= 2) {
    el.paywallModal?.classList.remove('hidden');
    setPaywallSeen();
    clearPostAuthAction();
    renderScenarioProgress();
    return;
  }

  const ids = state.currentResults.filter((item) => !item.is_saved).map((item) => item.id).filter(Boolean);
  if (!ids.length) {
    clearPostAuthAction();
    showToast('Эта подборка уже сохранена.');
    return;
  }

  try {
    await client.saveRecommendations(ids);
    const savedAt = new Date().toISOString();
    state.currentResults = state.currentResults.map((item) => ({ ...item, is_saved: true, saved_at: savedAt, request: state.currentRequest }));
    writeJson(uiKeys.currentResults, state.currentResults);
    await syncAuth(true);
    clearPostAuthAction();
    showToast(fromPostAuth ? 'Вход выполнен. Подборка сразу сохранена в кабинете.' : 'Подборка сохранена в вашем аккаунте.');
  } catch (error) {
    showToast(error.message || 'Не удалось сохранить подборку.');
  }
}

async function runPostAuthAction() {
  if (getPostAuthAction() !== 'save-selection') return;
  const { session } = await syncAuth(true);
  if (session?.user) await saveCurrentSelection({ fromPostAuth: true });
}

function resetCurrentFlow() {
  removeKey(uiKeys.currentRequest);
  removeKey(uiKeys.currentResults);
  clearPostAuthAction();
  el.giftForm?.reset();
  state.currentRequest = null;
  state.currentResults = [];
  renderSummary();
  renderResults();
  renderExplain();
  renderScenarioProgress();
  showToast('Форма очищена. Можно собрать новую подборку.');
}

function bindCatalogActionButtons() {
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

  document.querySelectorAll('.catalog-filter-chip').forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      document.querySelectorAll('.catalog-filter-chip').forEach((chip) => chip.classList.remove('is-active'));
      button.classList.add('is-active');
      el.catalogGrid?.querySelectorAll('.gift-showcase-card').forEach((card) => {
        const tags = card.dataset.tags || '';
        card.style.display = filter === 'all' || tags.includes(filter) ? '' : 'none';
      });
    });
  });

  el.createProfileBtn?.addEventListener('click', () => {
    if (isAuthenticated()) { window.location.href = cabinetUrl; return; }
    const email = el.profileEmailInput?.value.trim();
    const name = el.profileNameInput?.value.trim();
    if (!email || !name) { showToast('Введите имя и email, чтобы перейти к регистрации.'); return; }
    writeJson(uiKeys.signupDraft, { email, name, mode: 'signup' });
    showToast('Перенаправляем ко входу, чтобы завершить создание аккаунта.');
    window.setTimeout(() => { window.location.href = `${registerUrl}?mode=signup`; }, 600);
  });

  el.logoutProfileBtn?.addEventListener('click', async () => {
    try {
      const client = await getClient();
      await client.signOut();
      state.session = null;
      state.profile = null;
      state.savedRecommendations = [];
      state.authResolved = true;
      renderAllAuthDependent();
      showToast('Вы вышли из аккаунта.');
    } catch (error) {
      showToast(error.message || 'Не удалось выйти из аккаунта.');
    }
  });

  el.fillScenarioBtn?.addEventListener('click', () => applyPreset('friend', false));
  el.resetScenarioBtn?.addEventListener('click', resetCurrentFlow);

  el.giftForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const request = {
      occasion: el.occasionInput.value.trim(),
      budget: el.budgetInput.value.trim(),
      relation: el.relationInput.value.trim(),
      interests: el.interestsInput.value.trim(),
      notes: el.notesInput.value.trim(),
      source: 'web_app',
      save: false,
    };
    if (!request.occasion || !request.budget || !request.interests) {
      showToast('Укажите повод, бюджет и интересы получателя.');
      return;
    }

    await syncAuth(true).catch(() => {});

    const useLocal = async () => {
      state.currentRequest = { ...request, id: null };
      state.currentResults = buildLocalRecommendations(request).map((item) => ({ ...item, request: state.currentRequest }));
      writeJson(uiKeys.currentRequest, state.currentRequest);
      writeJson(uiKeys.currentResults, state.currentResults);
      renderSummary();
      renderResults();
      renderExplain();
      showToast(isAuthenticated() ? 'Подборка показана. При сохранении GiftMatch пересоберет ее в аккаунте.' : 'Подборка готова. Чтобы сохранить ее в кабинете, сначала войдите в аккаунт.');
      el.resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (!isAuthenticated()) {
      await useLocal();
      return;
    }

    try {
      const client = await getClient();
      const data = await client.requestRecommendations(request);
      state.currentRequest = {
        occasion: data.request?.occasion ?? request.occasion,
        budget: data.request?.budget ?? request.budget,
        relation: data.request?.relation ?? request.relation,
        interests: data.request?.interests ?? request.interests,
        notes: data.request?.notes ?? request.notes,
        id: data.request?.id ?? null,
      };
      state.currentResults = (data.recommendations ?? []).map((item) => ({ ...item, request: state.currentRequest }));
      if (!state.currentResults.length) throw new Error('Пустой ответ рекомендаций');
      writeJson(uiKeys.currentRequest, state.currentRequest);
      writeJson(uiKeys.currentResults, state.currentResults);
      renderSummary();
      renderResults();
      renderExplain();
      showToast('Подборка готова. Можно сохранить ее в кабинете.');
      el.resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      await useLocal();
    }
  });

  el.saveSelectionBtn?.addEventListener('click', () => saveCurrentSelection());
  el.closePaywallBtn?.addEventListener('click', () => el.paywallModal?.classList.add('hidden'));
  el.paywallModal?.addEventListener('click', (event) => { if (event.target === el.paywallModal) el.paywallModal.classList.add('hidden'); });
}

async function init() {
  renderHeaderAccount();
  if (el.profileCard) {
    el.profileCard.classList.add('hidden');
    el.profileCard.hidden = true;
    el.profileCard.style.display = 'none';
  }

  renderSummary();
  renderResults();
  renderExplain();
  renderCatalog();
  bindEvents();

  try {
    const client = await getClient();
    const presetRecords = await client.getPresets().catch(() => []);
    syncPresetsFromDatabase(presetRecords);
    renderCatalog();
    await syncAuth(true);
    await runPostAuthAction();
    client.onAuthStateChange(async (_event, session) => {
      state.session = session;
      state.authResolved = true;
      await syncAuth(true);
      await runPostAuthAction();
    });
  } catch (error) {
    state.authResolved = true;
    renderAllAuthDependent();
    showToast(error.message || 'Не удалось подключиться к Supabase.');
  }

  renderScenarioProgress();
}

init();
