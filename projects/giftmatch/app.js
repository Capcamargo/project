const SUPABASE_URL = 'https://bozxbfosvzlayylrhtix.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_v4Ie4IkPj6LgCOp0ixK1YA_4bYpvgyZ';
const STORAGE_KEY = 'sb-bozxbfosvzlayylrhtix-auth-token';

const keys = {
  currentRequest: 'giftmatch_current_request',
  currentResults: 'giftmatch_current_results',
  signupDraft: 'giftmatch_signup_draft',
  postAuthAction: 'giftmatch_post_auth_action',
  afterAuthRedirect: 'giftmatch_after_auth_redirect',
};

const limitsByPlan = { free: 2, plus: 20, team: 100 };
const registerUrl = 'register.html';
const cabinetUrl = 'cabinet.html';

const presets = {
  friend: { label: 'Кофе и настольная игра', occasion: 'Подарок для уютного вечера', budget: 'до 5000 ₽', relation: 'Друг', interests: 'настольные игры, кофе, спокойные вечера', notes: 'Нужен небанальный, полезный и уютный подарок для человека, который любит кофе и настольные игры.' },
  romantic: { label: 'Мастер-класс на двоих', occasion: 'Совместный подарок-впечатление', budget: 'до 10000 ₽', relation: 'Партнер', interests: 'совместные впечатления, творчество, уютные вечера', notes: 'Нужен подарок-впечатление для двоих, а не просто вещь. Важно, чтобы подарок подчеркивал внимание и заботу.' },
  parents: { label: 'Семейный фотоальбом', occasion: 'Памятный семейный подарок', budget: 'до 15000 ₽', relation: 'Родители или близкие родственники', interests: 'семейные воспоминания, дом, памятные вещи', notes: 'Нужен теплый, личный и памятный подарок с семейной историей.' },
  colleague: { label: 'Набор для рабочего дня', occasion: 'Нейтральный подарок коллеге', budget: 'до 3000 ₽', relation: 'Коллега', interests: 'офис, кофе, минималистичные вещи, рабочий день', notes: 'Нужен нейтральный, аккуратный и уместный подарок без лишнего риска.' },
  handmade: { label: 'Свечи ручной работы', occasion: 'Домашний уют', budget: 'до 4000 ₽', relation: 'Друг или близкий человек', interests: 'уют, дом, ароматические свечи, ручная работа', notes: 'Нужен спокойный домашний подарок для человека, который любит атмосферные детали и уют.' },
  sport: { label: 'Набор для восстановления', occasion: 'Подарок для активного образа жизни', budget: 'до 6000 ₽', relation: 'Друг или близкий человек', interests: 'спорт, тренировки, восстановление, активный образ жизни', notes: 'Нужен полезный подарок для человека, который занимается спортом и любит практичные вещи.' },
};

const fallbackCatalogCards = [
  { slug: 'friend', title: 'Кофе и настольная игра', short_description: 'Хороший вариант для друга, который любит спокойные вечера, кофе и вещи, которыми хочется пользоваться сразу.', badge_text: '☕ Для уютного вечера', tags: ['уютный вечер', 'друг', 'до 5000 ₽'], filter_tags: ['friend', 'cozy'], starting_price: 3900, image_path: 'assets/gifts/coffee-weekend.png' },
  { slug: 'romantic', title: 'Мастер-класс на двоих', short_description: 'Подойдет паре, если хочется подарить не вещь, а совместное впечатление и время вместе.', badge_text: '🎨 Для совместного вечера', tags: ['для двоих', 'впечатление', 'до 10000 ₽'], filter_tags: ['romantic', 'experience'], starting_price: 6500, image_path: 'assets/gifts/pottery-date.png' },
  { slug: 'parents', title: 'Семейный фотоальбом', short_description: 'Теплый подарок для родителей или близких, когда хочется выбрать что-то личное и памятное.', badge_text: '📖 Подарок с историей', tags: ['семья', 'памятный', 'история'], filter_tags: ['family', 'warm'], starting_price: 4800, image_path: 'assets/gifts/family-album.png' },
  { slug: 'colleague', title: 'Набор для рабочего дня', short_description: 'Удобный подарок для коллеги: аккуратный, нейтральный и уместный даже тогда, когда времени на поиск почти нет.', badge_text: '🗂 Нейтрально и уместно', tags: ['коллеге', 'до 3000 ₽', 'универсально'], filter_tags: ['work', 'colleague', 'fast'], starting_price: 2400, image_path: 'assets/gifts/office-set.png' },
  { slug: 'handmade', title: 'Свечи ручной работы', short_description: 'Небольшой, но приятный подарок для тех, кто любит уют, детали для дома и спокойную атмосферу.', badge_text: '🕯 Спокойный домашний подарок', tags: ['ручная работа', 'дом', 'уют'], filter_tags: ['handmade', 'home', 'calm'], starting_price: 3100, image_path: 'assets/gifts/handmade-candles.png' },
  { slug: 'sport', title: 'Набор для восстановления', short_description: 'Подойдет человеку, который занимается спортом и любит полезные вещи для ежедневного использования.', badge_text: '🏃 Для активной жизни', tags: ['спорт', 'полезное', 'активный образ жизни'], filter_tags: ['sport', 'active'], starting_price: 4200, image_path: 'assets/gifts/sport-recovery.png' },
];

let supabaseClient = null;
const state = {
  session: null,
  profile: null,
  savedRecommendations: [],
  currentRequest: readJson(keys.currentRequest, null),
  currentResults: readJson(keys.currentResults, []),
  catalogRecords: [...fallbackCatalogCards],
  authResolved: false,
};

const el = {
  guestState: document.getElementById('guestState'), userState: document.getElementById('userState'), profileNameText: document.getElementById('profileNameText'), profileEmailText: document.getElementById('profileEmailText'), profilePlanText: document.getElementById('profilePlanText'), avatarBadge: document.getElementById('avatarBadge'), profileEmailInput: document.getElementById('profileEmailInput'), profileNameInput: document.getElementById('profileNameInput'), createProfileBtn: document.getElementById('createProfileBtn'), logoutProfileBtn: document.getElementById('logoutProfileBtn'), headerAccountLink: document.getElementById('headerAccountLink'), giftForm: document.getElementById('giftForm'), occasionInput: document.getElementById('occasionInput'), budgetInput: document.getElementById('budgetInput'), relationInput: document.getElementById('relationInput'), interestsInput: document.getElementById('interestsInput'), notesInput: document.getElementById('notesInput'), requestSummary: document.getElementById('requestSummary'), summaryGrid: document.getElementById('summaryGrid'), resultsEmptyState: document.getElementById('resultsEmptyState'), resultsContainer: document.getElementById('resultsContainer'), explainBlock: document.getElementById('explainBlock'), explainGrid: document.getElementById('explainGrid'), saveSelectionBtn: document.getElementById('saveSelectionBtn'), savedCounter: document.getElementById('savedCounter'), savedSelections: document.getElementById('savedSelections'), fillScenarioBtn: document.getElementById('fillScenarioBtn'), resetScenarioBtn: document.getElementById('resetScenarioBtn'), paywallModal: document.getElementById('paywallModal'), closePaywallBtn: document.getElementById('closePaywallBtn'), toast: document.getElementById('toast'), scenarioBadge: document.getElementById('scenarioBadge'), scenarioSteps: document.getElementById('scenarioSteps'), catalogGrid: document.getElementById('catalogGrid'), resultsSection: document.querySelector('.results-card'),
};
el.profileCard = el.guestState?.closest('.profile-card') || document.querySelector('.profile-card');

function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function writeJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function removeKey(key) { localStorage.removeItem(key); }
function escapeHtml(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
function showToast(message) { if (!el.toast) return; el.toast.textContent = message; el.toast.classList.remove('hidden'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => el.toast.classList.add('hidden'), 3000); }
function initialsFromName(name) { return String(name || 'Gift Match').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'GM'; }
function isAuthenticated() { return Boolean(state.session?.user); }
function getPlanLimit(plan) { return limitsByPlan[String(plan || 'free').toLowerCase()] ?? 2; }
function getPostAuthAction() { return localStorage.getItem(keys.postAuthAction) || ''; }
function clearPostAuthAction() { localStorage.removeItem(keys.postAuthAction); }
function setPostAuthAction(action) { localStorage.setItem(keys.postAuthAction, action); }
function setAfterAuthRedirect(url) { localStorage.setItem(keys.afterAuthRedirect, url); }

function getClient() {
  if (supabaseClient) return supabaseClient;
  if (!window.supabase?.createClient) throw new Error('Supabase CDN не загрузился. Обновите страницу.');
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: STORAGE_KEY, storage: window.localStorage },
  });
  return supabaseClient;
}

async function getSession() {
  const { data, error } = await getClient().auth.getSession();
  if (error) throw error;
  return data.session || null;
}

async function ensureProfile(user) {
  const draft = readJson(keys.signupDraft, null);
  const payload = { id: user.id, email: user.email || draft?.email || null, full_name: user.user_metadata?.full_name || user.user_metadata?.name || draft?.name || null };
  await getClient().from('profiles').upsert(payload, { onConflict: 'id' });
  const { data, error } = await getClient().from('profiles').select('id,email,full_name,plan,is_paid,role,avatar_url,created_at,updated_at').eq('id', user.id).maybeSingle();
  if (error) throw error;
  return data || { ...payload, plan: 'free', is_paid: false };
}

async function loadAccountData(user) {
  const profile = await ensureProfile(user);
  const [{ data: saved }, { data: last }] = await Promise.all([
    getClient().from('gift_recommendations').select('id,title,reason,explanation,price_hint,category,tone,score,is_saved,saved_at,created_at,request:gift_requests(occasion,budget,relation,interests,notes)').eq('user_id', user.id).eq('is_saved', true).order('saved_at', { ascending: false }).limit(100),
    getClient().from('gift_requests').select('id,occasion,budget,relation,interests,notes,source,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  state.profile = profile;
  state.savedRecommendations = saved || [];
  return { profile, savedRecommendations: saved || [], lastRequest: last || null };
}

async function syncAuth() {
  try {
    state.session = await getSession();
    state.authResolved = true;
    if (state.session?.user) await loadAccountData(state.session.user);
    else { state.profile = null; state.savedRecommendations = []; }
  } catch (error) {
    state.authResolved = true;
    state.session = null;
    state.profile = null;
    state.savedRecommendations = [];
    showToast(error.message || 'Не удалось проверить вход.');
  }
  renderAllAuthDependent();
  return state.session;
}

function renderHeaderAccount() {
  if (!el.headerAccountLink) return;
  if (!state.authResolved) { el.headerAccountLink.classList.add('hidden'); el.headerAccountLink.hidden = true; return; }
  el.headerAccountLink.classList.remove('hidden'); el.headerAccountLink.hidden = false;
  if (isAuthenticated()) { el.headerAccountLink.textContent = 'Кабинет'; el.headerAccountLink.href = cabinetUrl; el.headerAccountLink.classList.remove('btn-secondary'); el.headerAccountLink.classList.add('btn-primary'); }
  else { el.headerAccountLink.textContent = 'Войти'; el.headerAccountLink.href = `${registerUrl}?mode=signin`; el.headerAccountLink.classList.remove('btn-primary'); el.headerAccountLink.classList.add('btn-secondary'); }
}

function renderProfile() {
  renderHeaderAccount();
  if (!state.authResolved) { if (el.profileCard) { el.profileCard.classList.add('hidden'); el.profileCard.hidden = true; el.profileCard.style.display = 'none'; } return; }
  if (!isAuthenticated()) { if (el.profileCard) { el.profileCard.classList.remove('hidden'); el.profileCard.hidden = false; el.profileCard.style.display = ''; } el.guestState?.classList.remove('hidden'); el.userState?.classList.add('hidden'); renderScenarioProgress(); return; }
  if (el.profileCard) { el.profileCard.classList.add('hidden'); el.profileCard.hidden = true; el.profileCard.style.display = 'none'; }
  const user = state.session.user;
  const name = state.profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'Пользователь GiftMatch';
  const email = state.profile?.email || user.email || '';
  if (el.avatarBadge) el.avatarBadge.textContent = initialsFromName(name || email);
  if (el.profileNameText) el.profileNameText.textContent = name;
  if (el.profileEmailText) el.profileEmailText.textContent = email;
  if (el.profilePlanText) el.profilePlanText.textContent = `План: ${String(state.profile?.plan || 'free').toUpperCase()}`;
  renderScenarioProgress();
}

function renderScenarioProgress() {
  if (!el.scenarioSteps || !el.scenarioBadge) return;
  const progress = { profile: isAuthenticated(), request: Boolean(state.currentRequest), results: state.currentResults.length > 0, saved: state.savedRecommendations.length > 0, paywall: false };
  let completed = 0;
  el.scenarioSteps.querySelectorAll('[data-step]').forEach((item) => { const done = Boolean(progress[item.dataset.step]); item.classList.toggle('is-done', done); if (done) completed += 1; });
  el.scenarioBadge.textContent = `${completed} / 5`;
  el.scenarioBadge.classList.toggle('muted', completed < 5);
}

function renderAllAuthDependent() { renderProfile(); renderSaved(); renderScenarioProgress(); }
function fillForm(data) { if (!data) return; el.occasionInput.value = data.occasion || ''; el.budgetInput.value = data.budget || ''; el.relationInput.value = data.relation || ''; el.interestsInput.value = data.interests || ''; el.notesInput.value = data.notes || ''; }
function clearCurrentResultsOnly() { state.currentRequest = null; state.currentResults = []; removeKey(keys.currentRequest); removeKey(keys.currentResults); renderSummary(); renderResults(); renderExplain(); }
function applyPreset(key, scroll = true) { const preset = presets[key]; if (!preset) return; fillForm(preset); clearCurrentResultsOnly(); showToast(`Взяли за основу пример: «${preset.label}».`); if (scroll) document.getElementById('mvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function formatPrice(value) { return value ? `от ${Number(value).toLocaleString('ru-RU')} ₽` : 'по запросу'; }

async function loadCatalog() {
  try {
    const { data } = await getClient().from('gift_presets').select('id,slug,title,occasion,budget_hint,relation,interests,notes,tags,image_path,starting_price,short_description,badge_text,filter_tags').order('created_at', { ascending: true });
    if (!data?.length) return;
    data.forEach((record) => { if (presets[record.slug]) presets[record.slug] = { ...presets[record.slug], label: record.title || presets[record.slug].label, occasion: record.occasion || presets[record.slug].occasion, budget: record.budget_hint || presets[record.slug].budget, relation: record.relation || presets[record.slug].relation, interests: record.interests || presets[record.slug].interests, notes: record.notes || presets[record.slug].notes }; });
    state.catalogRecords = data.map((record) => ({ slug: record.slug, title: record.title, short_description: record.short_description || record.notes || '', badge_text: record.badge_text || '🎁 Готовый вариант', tags: Array.isArray(record.tags) ? record.tags : [], filter_tags: Array.isArray(record.filter_tags) ? record.filter_tags : [], starting_price: record.starting_price, image_path: record.image_path || '' }));
  } catch {}
}

function renderCatalog() {
  if (!el.catalogGrid) return;
  el.catalogGrid.innerHTML = state.catalogRecords.map((record) => {
    const presetKey = presets[record.slug] ? record.slug : '';
    const tags = Array.isArray(record.tags) ? record.tags.slice(0, 3) : [];
    const filterTags = (record.filter_tags || []).join(' ');
    return `<article class="card gift-showcase-card" data-tags="${escapeHtml(filterTags)}"><div class="gift-cover"><img class="gift-cover-image" src="${escapeHtml(record.image_path || '')}" alt="${escapeHtml(record.title || 'Подарок')}" /><span class="gift-cover-badge">${escapeHtml(record.badge_text || '🎁 Готовый вариант')}</span></div><h3>${escapeHtml(record.title || 'Идея подарка')}</h3><p class="gift-showcase-meta">${escapeHtml(record.short_description || 'Подходящий подарок для выбранного сценария.')}</p><div class="gift-tag-row">${tags.map((tag) => `<span class="gift-tag">${escapeHtml(tag)}</span>`).join('')}</div><div class="gift-card-footer"><span class="gift-price">${escapeHtml(formatPrice(record.starting_price))}</span>${presetKey ? `<button class="use-gift-btn" type="button" data-preset-fill="${escapeHtml(presetKey)}">Взять за основу</button>` : ''}</div></article>`;
  }).join('');
  document.querySelectorAll('[data-preset-fill]').forEach((button) => button.addEventListener('click', () => applyPreset(button.dataset.presetFill)));
}

function renderSummary() {
  if (!el.requestSummary || !el.summaryGrid) return;
  if (!state.currentRequest) { el.requestSummary.classList.add('hidden'); el.summaryGrid.innerHTML = ''; renderScenarioProgress(); return; }
  const rows = [['Повод', state.currentRequest.occasion], ['Бюджет', state.currentRequest.budget], ['Интересы', state.currentRequest.interests], ['Кто это для вас', state.currentRequest.relation || 'Не указано'], ['Дополнительно', state.currentRequest.notes || 'Без дополнительных условий']];
  el.summaryGrid.innerHTML = rows.map(([label, value]) => `<article class="summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join('');
  el.requestSummary.classList.remove('hidden'); renderScenarioProgress();
}

function resultCardMarkup(item, index) { return `<article class="result-card"><div class="result-topline"><span class="result-label">Вариант ${index + 1}</span><span class="rank-badge">#${index + 1}</span></div><h3>${escapeHtml(item.title)}</h3><p class="result-meta">${escapeHtml(item.reason)}</p><p class="result-meta">Почему это может подойти: ${escapeHtml(item.explanation ?? '')}</p><div class="confidence-row"><span class="confidence-caption">Уместность рекомендации</span><strong class="confidence-value">${item.score ?? 0}%</strong></div><div class="confidence-track"><span style="width:${item.score ?? 0}%"></span></div><div class="chip-row"><span class="chip">${escapeHtml(item.price_hint ?? '')}</span><span class="chip">${escapeHtml(item.category ?? 'Рекомендация')}</span><span class="chip">${escapeHtml(item.tone ?? 'Готовый сценарий')}</span></div></article>`; }
function renderResults() { if (!el.resultsEmptyState || !el.resultsContainer || !el.saveSelectionBtn) return; if (!state.currentResults.length) { el.resultsEmptyState.classList.remove('hidden'); el.resultsContainer.innerHTML = ''; el.saveSelectionBtn.disabled = true; el.saveSelectionBtn.classList.add('is-disabled'); renderScenarioProgress(); return; } el.resultsEmptyState.classList.add('hidden'); el.resultsContainer.innerHTML = state.currentResults.map(resultCardMarkup).join(''); el.saveSelectionBtn.disabled = false; el.saveSelectionBtn.classList.remove('is-disabled'); renderScenarioProgress(); }
function renderExplain() { if (!el.explainBlock || !el.explainGrid) return; if (!state.currentRequest || !state.currentResults.length) { el.explainBlock.classList.add('hidden'); el.explainGrid.innerHTML = ''; return; } const rows = [['Повод', state.currentRequest.occasion], ['Бюджет', state.currentRequest.budget], ['Интересы', state.currentRequest.interests], ['Кто это для вас', state.currentRequest.relation || 'Не указано']]; el.explainGrid.innerHTML = rows.map(([label, value]) => `<article class="explain-card"><h4>${escapeHtml(label)}</h4><p>${escapeHtml(value)}</p></article>`).join(''); el.explainBlock.classList.remove('hidden'); }
function savedCardMarkup(item) { const request = item.request || {}; return `<article class="saved-card"><div class="saved-topline"><span class="saved-label">Сохранено</span><span class="chip">${escapeHtml(item.category || request.relation || 'Без категории')}</span></div><h3>${escapeHtml(item.title || request.occasion || 'Подборка')}</h3><p class="saved-meta">Повод: ${escapeHtml(request.occasion || state.currentRequest?.occasion || 'Не указано')}</p><p class="saved-meta">Бюджет: ${escapeHtml(request.budget || state.currentRequest?.budget || 'Не указано')}</p><p class="saved-meta">Интересы: ${escapeHtml(request.interests || state.currentRequest?.interests || 'Не указано')}</p><p class="saved-meta">Дата сохранения: ${escapeHtml(item.saved_at ? new Date(item.saved_at).toLocaleString('ru-RU') : 'Только что')}</p></article>`; }
function renderSaved() { if (!el.savedCounter || !el.savedSelections) return; el.savedCounter.textContent = String(state.savedRecommendations.length); el.savedSelections.innerHTML = state.savedRecommendations.length ? state.savedRecommendations.map(savedCardMarkup).join('') : '<div class="empty-state">Пока здесь пусто. Когда сохраните подборку, она появится в этом блоке.</div>'; renderScenarioProgress(); }

function buildLocalRecommendations(request) {
  const subject = request.relation || 'получателя'; const interests = request.interests || 'его интересы'; const occasion = request.occasion || 'повод';
  return [
    { title: 'Персональный набор по интересам', reason: `Подходит для сценария «${occasion}», потому что опирается на интересы: ${interests}.`, explanation: `Это безопасный и уместный вариант для ${subject}, если нужен подарок с ощущением внимания к деталям.`, price_hint: request.budget || 'по бюджету', category: 'Персональный подарок', tone: 'Практично и тепло', score: 92 },
    { title: 'Небольшое впечатление или совместная активность', reason: `Хорошо работает для ${occasion}, когда хочется подарить эмоцию, а не только вещь.`, explanation: `Подход особенно уместен, если для ${subject} важны впечатления, совместное время или атмосфера.`, price_hint: request.budget || 'по бюджету', category: 'Впечатление', tone: 'Эмоционально и легко', score: 88 },
    { title: 'Уютная вещь для повседневного использования', reason: 'Такой вариант легко вписывается в обычную жизнь и не выглядит случайным или формальным.', explanation: `Если важны польза, аккуратность и комфорт, этот сценарий часто оказывается самым универсальным для ${subject}.`, price_hint: request.budget || 'по бюджету', category: 'Повседневный подарок', tone: 'Спокойно и уместно', score: 84 },
  ];
}

async function createRecommendationsInDb(request, markSaved = false) {
  const user = state.session?.user;
  if (!user) throw new Error('Пользователь не авторизован.');
  const { data: requestRow, error: requestError } = await getClient().from('gift_requests').insert({ user_id: user.id, occasion: request.occasion, budget: request.budget, relation: request.relation || null, interests: request.interests, notes: request.notes || null, source: 'web_app' }).select('id,occasion,budget,relation,interests,notes,source,created_at').single();
  if (requestError) throw requestError;
  const now = new Date().toISOString();
  const rows = buildLocalRecommendations(requestRow).map((item) => ({ user_id: user.id, request_id: requestRow.id, title: item.title, reason: item.reason, explanation: item.explanation, price_hint: item.price_hint, category: item.category, tone: item.tone, score: item.score, is_saved: markSaved, saved_at: markSaved ? now : null }));
  const { data: recs, error: recError } = await getClient().from('gift_recommendations').insert(rows).select('id,title,reason,explanation,price_hint,category,tone,score,is_saved,saved_at,created_at,request:gift_requests(occasion,budget,relation,interests,notes)');
  if (recError) throw recError;
  return { request: requestRow, recommendations: recs || [] };
}

async function createRecommendations(request) {
  if (!isAuthenticated()) {
    const localRequest = { ...request, id: null };
    return { request: localRequest, recommendations: buildLocalRecommendations(localRequest).map((item) => ({ ...item, id: null, is_saved: false, is_local_fallback: true, request: localRequest })) };
  }
  try {
    const { data, error } = await getClient().functions.invoke('giftmatch-recommendations', { body: { ...request, source: 'web_app', save: false } });
    if (error) throw error;
    if (!data?.recommendations?.length) throw new Error('Пустой ответ рекомендаций');
    return { request: data.request || request, recommendations: data.recommendations.map((item) => ({ ...item, request: data.request || request })) };
  } catch {
    const result = await createRecommendationsInDb(request, false);
    return { request: result.request, recommendations: result.recommendations.map((item) => ({ ...item, request: result.request })) };
  }
}

async function saveCurrentSelection() {
  await syncAuth();
  if (!isAuthenticated()) { setPostAuthAction('save-selection'); setAfterAuthRedirect('app.html#mvp'); showToast('Сначала войдите в аккаунт. После входа вы сможете сохранить подборку.'); setTimeout(() => { window.location.href = `${registerUrl}?mode=signin`; }, 700); return; }
  if (!state.currentResults.length || !state.currentRequest) { showToast('Сначала заполните форму и получите подборку.'); return; }
  const limit = getPlanLimit(state.profile?.plan);
  if (state.savedRecommendations.length >= limit) { el.paywallModal?.classList.remove('hidden'); showToast(`Лимит тарифа ${String(state.profile?.plan || 'FREE').toUpperCase()}: ${limit} сохранений.`); return; }
  try {
    if (state.currentResults.some((item) => !item.id)) {
      const result = await createRecommendationsInDb(state.currentRequest, true);
      state.currentRequest = result.request;
      state.currentResults = result.recommendations.map((item) => ({ ...item, request: result.request }));
    } else {
      const ids = state.currentResults.filter((item) => !item.is_saved).map((item) => item.id).filter(Boolean);
      if (ids.length) {
        const { error } = await getClient().from('gift_recommendations').update({ is_saved: true, saved_at: new Date().toISOString() }).in('id', ids).eq('user_id', state.session.user.id);
        if (error) throw error;
      }
      state.currentResults = state.currentResults.map((item) => ({ ...item, is_saved: true, saved_at: item.saved_at || new Date().toISOString(), request: state.currentRequest }));
    }
    writeJson(keys.currentRequest, state.currentRequest); writeJson(keys.currentResults, state.currentResults);
    clearPostAuthAction();
    await loadAccountData(state.session.user);
    renderSummary(); renderResults(); renderExplain(); renderAllAuthDependent();
    showToast('Подборка сохранена в вашем аккаунте.');
  } catch (error) { showToast(error.message || 'Не удалось сохранить подборку.'); }
}

async function runPostAuthAction() { if (getPostAuthAction() === 'save-selection' && isAuthenticated()) await saveCurrentSelection(); }
function resetCurrentFlow() { removeKey(keys.currentRequest); removeKey(keys.currentResults); clearPostAuthAction(); el.giftForm?.reset(); state.currentRequest = null; state.currentResults = []; renderSummary(); renderResults(); renderExplain(); renderScenarioProgress(); showToast('Форма очищена. Можно собрать новую подборку.'); }

function bindEvents() {
  document.querySelectorAll('[data-preset]').forEach((button) => button.addEventListener('click', () => applyPreset(button.dataset.preset, false)));
  document.getElementById('goToMvpBtn')?.addEventListener('click', () => document.getElementById('mvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  document.querySelectorAll('.catalog-filter-chip').forEach((button) => button.addEventListener('click', () => { const filter = button.dataset.filter; document.querySelectorAll('.catalog-filter-chip').forEach((chip) => chip.classList.remove('is-active')); button.classList.add('is-active'); el.catalogGrid?.querySelectorAll('.gift-showcase-card').forEach((card) => { const tags = card.dataset.tags || ''; card.style.display = filter === 'all' || tags.includes(filter) ? '' : 'none'; }); }));
  el.createProfileBtn?.addEventListener('click', () => { if (isAuthenticated()) { window.location.href = cabinetUrl; return; } const email = el.profileEmailInput?.value.trim(); const name = el.profileNameInput?.value.trim(); if (!email || !name) { showToast('Введите имя и email, чтобы перейти к регистрации.'); return; } writeJson(keys.signupDraft, { email, name, mode: 'signup' }); setTimeout(() => { window.location.href = `${registerUrl}?mode=signup`; }, 500); });
  el.logoutProfileBtn?.addEventListener('click', async () => { try { await getClient().auth.signOut({ scope: 'local' }); Object.keys(localStorage).forEach((key) => { if (key.startsWith('giftmatch_') || key.startsWith(STORAGE_KEY) || key.includes('bozxbfosvzlayylrhtix')) localStorage.removeItem(key); }); state.session = null; state.profile = null; state.savedRecommendations = []; state.authResolved = true; renderAllAuthDependent(); showToast('Вы вышли из аккаунта.'); } catch { showToast('Не удалось выйти из аккаунта.'); } });
  el.fillScenarioBtn?.addEventListener('click', () => applyPreset('friend', false));
  el.resetScenarioBtn?.addEventListener('click', resetCurrentFlow);
  el.giftForm?.addEventListener('submit', async (event) => { event.preventDefault(); const request = { occasion: el.occasionInput.value.trim(), budget: el.budgetInput.value.trim(), relation: el.relationInput.value.trim(), interests: el.interestsInput.value.trim(), notes: el.notesInput.value.trim() }; if (!request.occasion || !request.budget || !request.interests) { showToast('Укажите повод, бюджет и интересы получателя.'); return; } await syncAuth(); try { const result = await createRecommendations(request); state.currentRequest = result.request; state.currentResults = result.recommendations; writeJson(keys.currentRequest, state.currentRequest); writeJson(keys.currentResults, state.currentResults); renderSummary(); renderResults(); renderExplain(); showToast(isAuthenticated() ? 'Подборка готова. Можно сохранить ее в кабинете.' : 'Подборка готова. Чтобы сохранить ее, войдите в аккаунт.'); el.resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (error) { showToast(error.message || 'Не удалось собрать подборку.'); } });
  el.saveSelectionBtn?.addEventListener('click', saveCurrentSelection);
  el.closePaywallBtn?.addEventListener('click', () => el.paywallModal?.classList.add('hidden'));
  el.paywallModal?.addEventListener('click', (event) => { if (event.target === el.paywallModal) el.paywallModal.classList.add('hidden'); });
}

async function init() {
  renderHeaderAccount(); if (el.profileCard) { el.profileCard.classList.add('hidden'); el.profileCard.hidden = true; el.profileCard.style.display = 'none'; }
  renderSummary(); renderResults(); renderExplain(); renderCatalog(); bindEvents();
  try { await loadCatalog(); renderCatalog(); await syncAuth(); await runPostAuthAction(); getClient().auth.onAuthStateChange(async (_event, session) => { state.session = session; state.authResolved = true; if (session?.user) await loadAccountData(session.user); else { state.profile = null; state.savedRecommendations = []; } renderAllAuthDependent(); }); }
  catch (error) { state.authResolved = true; renderAllAuthDependent(); showToast(error.message || 'Не удалось подключиться к Supabase.'); }
}

init();
