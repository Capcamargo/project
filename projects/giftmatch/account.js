const keys = {
  profile: 'giftmatch_exam_profile',
  request: 'giftmatch_exam_request',
  saved: 'giftmatch_exam_saved',
};

const toast = document.getElementById('toast');

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initials(name) {
  return (name || 'Gift Match')
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
  }, 2500);
}

function renderProfile() {
  const profile = readJson(keys.profile, null);
  const saved = readJson(keys.saved, []);

  if (!profile) {
    document.getElementById('accountTitle').textContent = 'Профиль пока не создан';
    document.getElementById('accountSubtitle').textContent = 'Создайте аккаунт, чтобы сохранять подборки и возвращаться к ним позже.';
    document.getElementById('accountName').textContent = 'Гость';
    document.getElementById('accountEmail').textContent = 'Нет сохраненных данных';
    document.getElementById('accountAvatar').textContent = 'GM';
    document.getElementById('accountPlanBadge').textContent = 'Free';
    document.getElementById('accountPlanTitle').textContent = 'План Free';
    document.getElementById('accountPlanText').textContent = 'До двух сохраненных подборок и базовый подбор по форме.';
    document.getElementById('accountSavedCount').textContent = '0 подборок';
    document.getElementById('accountOverviewPlan').textContent = 'Free';
    document.getElementById('accountOverviewSaved').textContent = '0';
    document.getElementById('accountOverviewState').textContent = 'Старт';
    return;
  }

  const plan = profile.plan || (profile.paid ? 'Plus' : 'Free');
  document.getElementById('accountTitle').textContent = `Здравствуйте, ${profile.name}`;
  document.getElementById('accountSubtitle').textContent = 'Ниже — ваш текущий план, сохраненные подборки и последний запрос.';
  document.getElementById('accountName').textContent = profile.name;
  document.getElementById('accountEmail').textContent = profile.email;
  document.getElementById('accountAvatar').textContent = initials(profile.name);
  document.getElementById('accountPlanBadge').textContent = plan;
  document.getElementById('accountPlanTitle').textContent = `План ${plan}`;
  document.getElementById('accountPlanText').textContent = plan === 'Free'
    ? 'До двух сохраненных подборок и базовый подбор по форме.'
    : 'Расширенный доступ к сохранениям и дополнительным сценариям.';
  document.getElementById('accountSavedCount').textContent = `${saved.length} подборок`;
  document.getElementById('accountOverviewPlan').textContent = plan;
  document.getElementById('accountOverviewSaved').textContent = String(saved.length);
  document.getElementById('accountOverviewState').textContent = plan === 'Free' ? 'Базовый доступ' : 'Расширенный доступ';
}

function renderSaved() {
  const saved = readJson(keys.saved, []);
  document.getElementById('accountSavedBadge').textContent = String(saved.length);
  const grid = document.getElementById('accountSavedGrid');

  if (!saved.length) {
    grid.innerHTML = '<div class="empty-state">Здесь появятся подборки, которые вы сохраните на главной странице.</div>';
    return;
  }

  grid.innerHTML = saved.map((item) => `
    <article class="saved-card">
      <div class="saved-topline">
        <span class="saved-label">Сохранено</span>
        <span class="chip">${escapeHtml(item.relation || 'Без категории')}</span>
      </div>
      <h3>${escapeHtml(item.occasion)}</h3>
      <p class="saved-meta">Бюджет: ${escapeHtml(item.budget)}</p>
      <p class="saved-meta">Интересы: ${escapeHtml(item.interests)}</p>
      <p class="saved-meta">Дата сохранения: ${escapeHtml(item.createdAt)}</p>
    </article>
  `).join('');
}

function renderLastRequest() {
  const request = readJson(keys.request, null);
  const wrap = document.getElementById('lastRequestSummary');

  if (!request) {
    wrap.innerHTML = '<div class="empty-state">Последний запрос пока не сохранен. Сначала воспользуйтесь подбором на главной странице.</div>';
    return;
  }

  const rows = [
    ['Повод', request.occasion],
    ['Бюджет', request.budget],
    ['Интересы', request.interests],
    ['Кто это для вас', request.relation || 'Не указано'],
    ['Дополнительно', request.notes || 'Без дополнительных условий'],
  ];

  wrap.innerHTML = rows.map(([label, value]) => `
    <article class="summary-item">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </article>
  `).join('');
}

renderProfile();
renderSaved();
renderLastRequest();
showToast('Личный кабинет открыт.');
