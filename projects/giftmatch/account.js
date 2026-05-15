const pendingEmailKey = 'giftmatch_pending_email';
const toast = document.getElementById('toast');
const logoutButton = document.getElementById('accountLogoutBtn');

function getPendingEmail() {
  return String(localStorage.getItem(pendingEmailKey) || '').trim().toLowerCase();
}

function authEntryUrl() {
  return getPendingEmail() ? 'verify.html' : 'register.html';
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

function applyGuestState() {
  document.getElementById('accountTitle').textContent = 'Профиль пока не создан';
  document.getElementById('accountSubtitle').textContent = 'Войдите через email и код подтверждения, чтобы сохранять подборки и возвращаться к ним позже.';
  document.getElementById('accountName').textContent = 'Гость';
  document.getElementById('accountEmail').textContent = 'Нет активной сессии';
  document.getElementById('accountAvatar').textContent = 'GM';
  document.getElementById('accountPlanBadge').textContent = 'Free';
  document.getElementById('accountPlanTitle').textContent = 'План Free';
  document.getElementById('accountPlanText').textContent = 'Сначала завершите вход, чтобы привязать данные к профилю.';
  document.getElementById('accountSavedCount').textContent = '0 подборок';
  document.getElementById('accountOverviewPlan').textContent = 'Free';
  document.getElementById('accountOverviewSaved').textContent = '0';
  document.getElementById('accountOverviewState').textContent = 'Старт';
  document.getElementById('accountSavedBadge').textContent = '0';
  document.getElementById('accountSavedGrid').innerHTML = '<div class="empty-state">Здесь появятся подборки после авторизации и сохранения результатов.</div>';
  document.getElementById('lastRequestSummary').innerHTML = '<div class="empty-state">Последний запрос пока не сохранен. Сначала воспользуйтесь подбором на главной странице.</div>';
}

function renderProfile(profile, savedCount) {
  const plan = (profile.plan || 'free').toUpperCase();
  document.getElementById('accountTitle').textContent = `Здравствуйте, ${profile.full_name || 'пользователь GiftMatch'}`;
  document.getElementById('accountSubtitle').textContent = 'Ниже — ваш текущий план, сохраненные подборки и последний запрос.';
  document.getElementById('accountName').textContent = profile.full_name || 'Пользователь GiftMatch';
  document.getElementById('accountEmail').textContent = profile.email || 'Email не указан';
  document.getElementById('accountAvatar').textContent = initials(profile.full_name || profile.email || 'Gift Match');
  document.getElementById('accountPlanBadge').textContent = plan;
  document.getElementById('accountPlanTitle').textContent = `План ${plan}`;
  document.getElementById('accountPlanText').textContent = plan === 'FREE'
    ? 'До двух сохраненных подборок и базовый подбор по форме.'
    : 'Расширенный доступ к сохранениям и дополнительным сценариям.';
  document.getElementById('accountSavedCount').textContent = `${savedCount} подборок`;
  document.getElementById('accountOverviewPlan').textContent = plan;
  document.getElementById('accountOverviewSaved').textContent = String(savedCount);
  document.getElementById('accountOverviewState').textContent = plan === 'FREE' ? 'Базовый доступ' : 'Расширенный доступ';
}

function renderSaved(savedRecommendations) {
  document.getElementById('accountSavedBadge').textContent = String(savedRecommendations.length);
  const grid = document.getElementById('accountSavedGrid');

  if (!savedRecommendations.length) {
    grid.innerHTML = '<div class="empty-state">Здесь появятся подборки, которые вы сохраните на главной странице.</div>';
    return;
  }

  grid.innerHTML = savedRecommendations.map((item) => {
    const request = item.request || {};
    return `
      <article class="saved-card">
        <div class="saved-topline">
          <span class="saved-label">Сохранено</span>
          <span class="chip">${escapeHtml(item.category || request.relation || 'Без категории')}</span>
        </div>
        <h3>${escapeHtml(item.title || request.occasion || 'Подборка')}</h3>
        <p class="saved-meta">Повод: ${escapeHtml(request.occasion || 'Не указано')}</p>
        <p class="saved-meta">Бюджет: ${escapeHtml(request.budget || 'Не указано')}</p>
        <p class="saved-meta">Интересы: ${escapeHtml(request.interests || 'Не указано')}</p>
        <p class="saved-meta">Дата сохранения: ${escapeHtml(item.saved_at ? new Date(item.saved_at).toLocaleString('ru-RU') : 'Недавно')}</p>
      </article>
    `;
  }).join('');
}

function renderLastRequest(request) {
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

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    try {
      await window.giftmatchSupabase.signOut();
      localStorage.removeItem(pendingEmailKey);
      showToast('Вы вышли из аккаунта.');
      window.setTimeout(() => {
        window.location.href = 'register.html';
      }, 500);
    } catch (error) {
      showToast(error.message || 'Не удалось выйти из аккаунта.');
    }
  });
}

async function init() {
  try {
    const session = await window.giftmatchSupabase.getSession();
    if (!session?.user) {
      applyGuestState();
      showToast(getPendingEmail() ? 'Сначала введите код подтверждения из письма.' : 'Войдите в аккаунт, чтобы открыть личный кабинет.');
      window.setTimeout(() => {
        window.location.href = authEntryUrl();
      }, 900);
      return;
    }

    if (!window.giftmatchSupabase.isEmailVerified(session.user)) {
      applyGuestState();
      showToast('Сначала подтвердите email кодом из письма.');
      window.setTimeout(() => {
        window.location.href = 'verify.html';
      }, 900);
      return;
    }

    const data = await window.giftmatchSupabase.getAccountData();
    renderProfile(data.profile, data.savedRecommendations.length);
    renderSaved(data.savedRecommendations);
    renderLastRequest(data.lastRequest);
  } catch (error) {
    applyGuestState();
    showToast(error.message || 'Не удалось загрузить кабинет.');
  }
}

init();
