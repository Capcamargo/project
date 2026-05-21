(() => {
  const scenarios = {
    coffee: {
      label: 'Кофе и настольная игра',
      occasion: 'День рождения',
      budget: 'до 5000 ₽',
      relation: 'Друг',
      interests: 'настольные игры, кофе, спокойные вечера',
      notes: 'Нужен небанальный, полезный и уютный подарок для человека, который любит кофе и настольные игры.',
    },
    pottery: {
      label: 'Мастер-класс на двоих',
      occasion: 'Годовщина отношений',
      budget: 'до 10000 ₽',
      relation: 'Партнер',
      interests: 'совместные впечатления, творчество, уютные вечера',
      notes: 'Нужен подарок-впечатление для двоих, а не просто вещь.',
    },
    album: {
      label: 'Семейный фотоальбом',
      occasion: 'Юбилей',
      budget: 'до 15000 ₽',
      relation: 'Родители или близкие родственники',
      interests: 'семейные воспоминания, дом, памятные вещи',
      notes: 'Нужен теплый, личный и памятный подарок с семейной историей.',
    },
    office: {
      label: 'Набор для рабочего дня',
      occasion: 'День рождения коллеги',
      budget: 'до 3000 ₽',
      relation: 'Коллега',
      interests: 'офис, кофе, минималистичные вещи, рабочий день',
      notes: 'Нужен нейтральный, аккуратный и уместный подарок без лишнего риска.',
    },
    candles: {
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

  function getScenarioFromCard(card) {
    const title = String(card?.querySelector('h3')?.textContent || '').toLowerCase();
    const text = String(card?.textContent || '').toLowerCase();

    if (title.includes('кофе') || text.includes('настольная игра')) return scenarios.coffee;
    if (title.includes('мастер-класс') || text.includes('совместного вечера')) return scenarios.pottery;
    if (title.includes('фотоальбом') || text.includes('подарок с историей')) return scenarios.album;
    if (title.includes('рабочего дня') || text.includes('нейтрально и уместно')) return scenarios.office;
    if (title.includes('свечи') || text.includes('ручной работы')) return scenarios.candles;
    if (title.includes('восстановления') || text.includes('активной жизни')) return scenarios.sport;

    return null;
  }

  function setField(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.value = value || '';
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(window.__giftmatchCatalogToastTimer);
    window.__giftmatchCatalogToastTimer = window.setTimeout(() => toast.classList.add('hidden'), 2600);
  }

  function fillScenario(scenario) {
    setField('occasionInput', scenario.occasion);
    setField('budgetInput', scenario.budget);
    setField('relationInput', scenario.relation);
    setField('interestsInput', scenario.interests);
    setField('notesInput', scenario.notes);
    document.getElementById('mvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Взяли за основу карточку: «${scenario.label}».`);
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.use-gift-btn[data-preset-fill], [data-preset-fill]');
    if (!button) return;

    const card = button.closest('.gift-showcase-card');
    const scenario = getScenarioFromCard(card);
    if (!scenario) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    fillScenario(scenario);
  }, true);
})();
