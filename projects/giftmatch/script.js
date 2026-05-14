const storageKeys = {
  profile: 'giftmatch_profile',
  results: 'giftmatch_results',
  saved: 'giftmatch_saved',
  request: 'giftmatch_request',
};

const presets = {
  friend: {
    label: 'Другу на день рождения',
    occasion: 'День рождения',
    budget: 'до 5000 ₽',
    relation: 'Друг',
    interests: 'настольные игры, кофе, путешествия',
    notes: 'Хочется, чтобы подарок был небанальным и полезным.',
  },
  romantic: {
    label: 'Романтический подарок',
    occasion: 'Годовщина отношений',
    budget: 'до 10000 ₽',
    relation: 'Партнер',
    interests: 'совместные впечатления, уют, эстетика',
    notes: 'Важно, чтобы подарок подчеркивал внимание и заботу.',
  },
  parents: {
    label: 'Подарок родителям',
    occasion: 'Юбилей',
    budget: 'до 15000 ₽',
    relation: 'Родители',
    interests: 'дом, отдых, семейные вещи',
    notes: 'Нужен теплый, символичный и уместный подарок.',
  },
  colleague: {
    label: 'Коллеге быстро',
    occasion: 'День рождения коллеги',
    budget: 'до 3000 ₽',
    relation: 'Коллега',
    interests: 'офис, кофе, минималистичные вещи',
    notes: 'Нужен быстрый и безопасный выбор без лишнего риска.',
  },
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
const giftForm = document.getElementById('giftForm');
const occasionInput = document.getElementById('occasionInput');
const budgetInput = document.getElementById('budgetInput');
const interestsInput = document.getElementById('interestsInput');
const relationInput = document.getElementById('relationInput');
const notesInput = document.getElementById('notesInput');
const formCard = document.getElementById('formSection');
const helperCard = document.querySelector('.helper-card');
const resultsSection = document.getElementById('resultsSection');

let explainPanel;
let explainGrid;

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

function getProfile() {
  return readJson(storageKeys.profile, null);
}

function getSaved() {
  return readJson(storageKeys.saved, []);
}

function getResults() {
  return readJson(storageKeys.results, []);
}

function getRequest() {
  return readJson(storageKeys.request, null);
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

function renderExplainPanel() {
  const request = getRequest();
  const results = getResults();

  if (!request || !results.length) {
    explainPanel.classList.add('hidden');
    explainGrid.innerHTML = '';
    return;
  }

  const blocks = [
    {
      title: 'Повод',
      text: request.occasion,
    },
    {
      title: 'Бюджет',
      text: request.budget,
    },
    {
      title: 'Интересы',
      text: request.interests,
    },
    {
      title: 'Близость',
      text: request.relation || 'Не указана, поэтому подборка остается универсальной.',
    },
  ];

  explainGrid.innerHTML = '';
  blocks.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'explain-card';
    article.innerHTML = `<h4>${item.title}</h4><p>${item.text}</p>`;
    explainGrid.appendChild(article);
  });

  explainPanel.classList.remove('hidden');
}

function injectPresetRow() {
  const presetRow = document.createElement('div');
  presetRow.className = 'preset-row';
  presetRow.setAttribute('aria-label', 'Быстрые пресеты');
  presetRow.innerHTML = `
    <button type="button" class="preset-chip" data-preset="friend">Другу на день рождения</button>
    <button type="button" class="preset-chip" data-preset="romantic">Романтический подарок</button>
    <button type="button" class="preset-chip" data-preset="parents">Подарок родителям</button>
    <button type="button" class="preset-chip" data-preset="colleague">Коллеге быстро</button>
  `;
  formCard.insertBefore(presetRow, giftForm);
}

function injectHelperActions() {
  const actions = document.createElement('div');
  actions.className = 'helper-actions';
  actions.innerHTML = `
    <button id="fillDemoBtn" class="secondary-btn full-width">Заполнить demo-данные</button>
    <button id="resetDemoBtn" class="ghost-btn full-width">Сбросить demo-режим</button>
  `;
  helperCard.appendChild(actions);
}

function injectExplainPanel() {
  explainPanel = document.createElement('div');
  explainPanel.id = 'explainPanel';
  explainPanel.className = 'explain-panel hidden';
  explainPanel.innerHTML = `
    <div class="section-heading compact">
      <h3>Что уже учитывает этот MVP</h3>
      <p>Даже в демонстрационной версии подборка строится не случайно, а по понятным параметрам пользователя.</p>
    </div>
    <div class="explain-grid" id="explainGrid"></div>
  `;
  explainGrid = explainPanel.querySelector('#explainGrid');
  resultsSection.appendChild(explainPanel);
}

function injectLogicSection() {
  const section = document.createElement('section');
  section.className = 'logic-section';
  section.id = 'logicSection';
  section.innerHTML = `
    <div class="container section-stack">
      <div class="section-heading">
        <p class="eyebrow eyebrow-dark">Роли, данные и защита</p>
        <h2>Сайт уже помогает объяснить базовую логику продукта на защите</h2>
        <p>Этот блок нужен не только для красоты: он помогает быстро показать, что в MVP продуманы роли, данные и ограничение доступа.</p>
      </div>
      <div class="logic-grid">
        <article class="logic-card">
          <span class="logic-icon">Роли</span>
          <h3>Гость и пользователь</h3>
          <p>Гость видит лендинг и форму. Пользователь получает профиль и историю сохраненных подборок.</p>
        </article>
        <article class="logic-card">
          <span class="logic-icon">Данные</span>
          <h3>Запросы и рекомендации</h3>
          <p>В полной версии GiftMatch хранятся профиль пользователя, запрос на подбор и список рекомендаций.</p>
        </article>
        <article class="logic-card">
          <span class="logic-icon">Защита</span>
          <h3>Paywall без ложного unlock</h3>
          <p>Отдельный экран после ограничения не открывает premium автоматически, а лишь демонстрирует следующий шаг сценария.</p>
        </article>
      </div>
    </div>
  `;
  document.querySelector('.site-footer').before(section);
}

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .preset-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .preset-chip,
    .ghost-btn {
      appearance: none;
      border: 1px solid rgba(138, 101, 67, 0.18);
      border-radius: 999px;
      padding: 10px 12px;
      background: rgba(255, 252, 247, 0.88);
      color: #5f4f3f;
      font: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
    }
    .preset-chip:hover,
    .ghost-btn:hover {
      transform: translateY(-1px);
      border-color: rgba(138, 101, 67, 0.42);
      background: rgba(255, 248, 239, 0.96);
    }
    .helper-actions {
      display: grid;
      gap: 10px;
      margin-top: 16px;
    }
    .ghost-btn {
      border-radius: 16px;
      padding: 13px 18px;
      background: transparent;
    }
    .explain-panel {
      margin-top: 18px;
      padding: 18px;
      border-radius: 20px;
      background: rgba(255, 251, 245, 0.86);
      border: 1px solid rgba(223, 210, 193, 0.82);
    }
    .explain-panel h3 {
      margin: 0;
      font-size: 22px;
      letter-spacing: -0.03em;
    }
    .explain-grid,
    .logic-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-top: 14px;
    }
    .logic-section {
      padding: 0 0 32px;
    }
    .logic-card,
    .explain-card {
      padding: 18px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.84);
      border: 1px solid rgba(223, 210, 193, 0.82);
      box-shadow: 0 14px 32px rgba(48, 35, 22, 0.08);
    }
    .logic-icon {
      display: inline-flex;
      padding: 8px 10px;
      border-radius: 999px;
      background: rgba(138, 101, 67, 0.12);
      color: #8a6543;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .logic-card h3,
    .explain-card h4 {
      margin: 14px 0 10px;
      font-size: 20px;
    }
    .logic-card p,
    .explain-card p {
      margin: 0;
      color: #695a4a;
      line-height: 1.65;
    }
    @media (max-width: 720px) {
      .explain-grid,
      .logic-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}

function fillForm(data) {
  occasionInput.value = data.occasion || '';
  budgetInput.value = data.budget || '';
  relationInput.value = data.relation || '';
  interestsInput.value = data.interests || '';
  notesInput.value = data.notes || '';
}

function resetDemo() {
  removeKey(storageKeys.profile);
  removeKey(storageKeys.results);
  removeKey(storageKeys.saved);
  removeKey(storageKeys.request);
  giftForm.reset();
  renderProfile();
  renderResults();
  renderSaved();
  renderExplainPanel();
  showToast('Demo-режим сброшен. Можно снова пройти сценарий с начала.');
}

function bindDynamicActions() {
  document.querySelectorAll('.preset-chip').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.preset;
      const preset = presets[key];
      if (!preset) return;
      fillForm(preset);
      showToast(`Пресет «${preset.label}» заполнен.`);
    });
  });

  document.getElementById('fillDemoBtn').addEventListener('click', () => {
    fillForm(presets.friend);
    showToast('Форма заполнена demo-данными.');
  });

  document.getElementById('resetDemoBtn').addEventListener('click', resetDemo);
}

function init() {
  injectStyles();
  injectPresetRow();
  injectHelperActions();
  injectExplainPanel();
  injectLogicSection();
  bindDynamicActions();
  renderProfile();
  renderResults();
  renderSaved();
  renderExplainPanel();
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
  removeKey(storageKeys.profile);
  renderProfile();
  showToast('Вы вышли из demo-профиля.');
});

giftForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const request = {
    occasion: occasionInput.value.trim(),
    budget: budgetInput.value.trim(),
    interests: interestsInput.value.trim(),
    relation: relationInput.value.trim(),
    notes: notesInput.value.trim(),
  };

  const recommendations = buildRecommendations(
    request.occasion,
    request.budget,
    request.interests,
    request.relation,
    request.notes
  );

  writeJson(storageKeys.request, request);
  writeJson(storageKeys.results, recommendations);
  renderResults();
  renderExplainPanel();
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

  const request = getRequest();
  if (!request?.occasion || !request?.budget || !request?.interests) {
    showToast('Сначала заполните форму и получите результаты.');
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