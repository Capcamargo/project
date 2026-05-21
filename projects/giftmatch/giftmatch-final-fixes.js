(() => {
  const isAppPage = /(^|\/)app\.html$/.test(location.pathname) || location.pathname.endsWith('/projects/giftmatch/') || location.pathname === '/';
  const registerUrl = 'register.html?mode=signin';
  const cabinetUrl = 'cabinet.html';
  const currentRequestKey = 'giftmatch_current_request';
  const currentResultsKey = 'giftmatch_current_results';
  const postAuthActionKey = 'giftmatch_post_auth_action';
  const afterAuthRedirectKey = 'giftmatch_after_auth_redirect';

  const scenarios = {
    friend: {
      label: 'Кофе и настольная игра',
      occasion: 'Подарок для уютного вечера',
      budget: 'до 5000 ₽',
      relation: 'Друг',
      interests: 'настольные игры, кофе, спокойные вечера',
      notes: 'Нужен небанальный, полезный и уютный подарок для человека, который любит кофе и настольные игры.',
    },
    coffee: {
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

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(window.__giftmatchFinalFixToastTimer);
    window.__giftmatchFinalFixToastTimer = window.setTimeout(() => toast.classList.add('hidden'), 2800);
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = value || '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function clearOldSelectionUi() {
    localStorage.removeItem(currentRequestKey);
    localStorage.removeItem(currentResultsKey);
    const summary = document.getElementById('requestSummary');
    const summaryGrid = document.getElementById('summaryGrid');
    const empty = document.getElementById('resultsEmptyState');
    const results = document.getElementById('resultsContainer');
    const explain = document.getElementById('explainBlock');
    const explainGrid = document.getElementById('explainGrid');
    const saveBtn = document.getElementById('saveSelectionBtn');
    summary?.classList.add('hidden');
    if (summaryGrid) summaryGrid.innerHTML = '';
    empty?.classList.remove('hidden');
    if (results) results.innerHTML = '';
    explain?.classList.add('hidden');
    if (explainGrid) explainGrid.innerHTML = '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.classList.add('is-disabled');
      saveBtn.textContent = 'Сохранить подборку';
    }
  }

  function scenarioFromElement(element) {
    const direct = element?.dataset?.presetFill || element?.dataset?.preset || '';
    if (direct && scenarios[direct]) return scenarios[direct];
    const card = element?.closest?.('.gift-showcase-card');
    const text = String(card?.textContent || element?.textContent || '').toLowerCase();
    if (text.includes('мастер-класс') || text.includes('совместного вечера')) return scenarios.romantic;
    if (text.includes('фотоальбом') || text.includes('подарок с историей')) return scenarios.parents;
    if (text.includes('рабочего дня') || text.includes('коллеге')) return scenarios.colleague;
    if (text.includes('свечи') || text.includes('ручной работы')) return scenarios.handmade;
    if (text.includes('восстановления') || text.includes('активной жизни') || text.includes('спорт')) return scenarios.sport;
    if (text.includes('кофе') || text.includes('настольная')) return scenarios.friend;
    return null;
  }

  function fillScenario(scenario) {
    if (!scenario) return;
    setValue('occasionInput', scenario.occasion);
    setValue('budgetInput', scenario.budget);
    setValue('relationInput', scenario.relation);
    setValue('interestsInput', scenario.interests);
    setValue('notesInput', scenario.notes);
    clearOldSelectionUi();
    document.getElementById('mvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Взяли за основу: «${scenario.label}».`);
  }

  async function getClient() {
    if (!window.ensureGiftmatchClient) throw new Error('Модуль входа не загрузился.');
    return window.ensureGiftmatchClient(22000);
  }

  async function getSession() {
    const client = await getClient();
    try { await client.finalizeAuthFromUrl(); } catch {}
    return (await client.getSession()) || (await client.waitForSession(2500, 200));
  }

  async function refreshHeaderAuth() {
    const link = document.getElementById('headerAccountLink');
    if (!link) return;
    link.classList.add('hidden');
    try {
      const session = await getSession();
      link.classList.remove('hidden');
      link.hidden = false;
      link.style.display = '';
      if (session?.user) {
        link.textContent = 'Кабинет';
        link.href = cabinetUrl;
        link.classList.remove('btn-secondary');
        link.classList.add('btn-primary');
        const profileCard = document.querySelector('.profile-card');
        if (profileCard) {
          profileCard.classList.add('hidden');
          profileCard.hidden = true;
          profileCard.style.display = 'none';
        }
      } else {
        link.textContent = 'Войти';
        link.href = registerUrl;
        link.classList.remove('btn-primary');
        link.classList.add('btn-secondary');
      }
    } catch {
      link.classList.remove('hidden');
      link.textContent = 'Войти';
      link.href = registerUrl;
      link.classList.remove('btn-primary');
      link.classList.add('btn-secondary');
    }
  }

  function localFallbackRecommendations(request) {
    return [
      {
        title: `Персональный вариант: ${request.occasion}`,
        reason: `Подходит под сценарий «${request.occasion}» и интересы: ${request.interests}.`,
        explanation: request.notes || 'GiftMatch учитывает повод, отношение к получателю и интересы.',
        price_hint: request.budget,
        category: request.relation || 'Персональная рекомендация',
        tone: 'Уместно и внимательно',
        score: 90,
      },
      {
        title: 'Подарок с практической пользой',
        reason: `Хорошо работает, если нужен вариант для ${request.relation || 'получателя'} без ощущения случайного выбора.`,
        explanation: `Основано на интересах: ${request.interests}.`,
        price_hint: request.budget,
        category: 'Практичный вариант',
        tone: 'Полезно',
        score: 86,
      },
      {
        title: 'Подарок-впечатление или атмосферная деталь',
        reason: `Подходит для сценария «${request.occasion}», когда важны эмоции и контекст.`,
        explanation: request.notes || 'Можно адаптировать под получателя и бюджет.',
        price_hint: request.budget,
        category: 'Эмоциональный вариант',
        tone: 'Тепло',
        score: 82,
      },
    ];
  }

  function renderLocalResults(request) {
    const empty = document.getElementById('resultsEmptyState');
    const results = document.getElementById('resultsContainer');
    const saveBtn = document.getElementById('saveSelectionBtn');
    const summary = document.getElementById('requestSummary');
    const summaryGrid = document.getElementById('summaryGrid');
    if (summary && summaryGrid) {
      summaryGrid.innerHTML = [
        ['Повод', request.occasion],
        ['Бюджет', request.budget],
        ['Кто это для вас', request.relation || 'Не указано'],
        ['Интересы', request.interests],
        ['Дополнительно', request.notes || 'Без дополнительных условий'],
      ].map(([label, value]) => `<article class="summary-item"><span>${label}</span><strong>${value}</strong></article>`).join('');
      summary.classList.remove('hidden');
    }
    if (results) {
      const items = localFallbackRecommendations(request);
      results.innerHTML = items.map((item, index) => `
        <article class="result-card">
          <div class="result-topline"><span class="result-label">Вариант ${index + 1}</span><span class="rank-badge">#${index + 1}</span></div>
          <h3>${item.title}</h3><p class="result-meta">${item.reason}</p><p class="result-meta">${item.explanation}</p>
          <div class="chip-row"><span class="chip">${item.price_hint}</span><span class="chip">${item.category}</span><span class="chip">${item.tone}</span></div>
        </article>`).join('');
    }
    empty?.classList.add('hidden');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.classList.remove('is-disabled');
    }
  }

  async function saveSelectionThroughSession(event) {
    const button = event.target.closest?.('#saveSelectionBtn');
    if (!button) return;
    const session = await getSession().catch(() => null);
    if (!session?.user) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const client = await getClient();
    const request = readJson(currentRequestKey, null) || {
      occasion: document.getElementById('occasionInput')?.value?.trim(),
      budget: document.getElementById('budgetInput')?.value?.trim(),
      relation: document.getElementById('relationInput')?.value?.trim(),
      interests: document.getElementById('interestsInput')?.value?.trim(),
      notes: document.getElementById('notesInput')?.value?.trim(),
    };
    if (!request.occasion || !request.budget || !request.interests) {
      showToast('Сначала получите подборку.');
      return;
    }

    button.disabled = true;
    button.textContent = 'Сохраняем…';
    try {
      let results = readJson(currentResultsKey, []);
      if (!Array.isArray(results) || !results.length || results.some((item) => !item.id)) {
        const data = await client.requestRecommendations({ ...request, source: 'web_app_final_fix', save: false });
        request.id = data.request?.id || request.id || null;
        results = (data.recommendations || []).map((item) => ({ ...item, request }));
        writeJson(currentRequestKey, request);
        writeJson(currentResultsKey, results);
        renderLocalResults(request);
      }
      const ids = results.map((item) => item.id).filter(Boolean);
      if (!ids.length) throw new Error('Нет рекомендаций для сохранения.');
      await client.saveRecommendations(ids);
      showToast('Подборка сохранена в вашем аккаунте.');
      window.setTimeout(() => { location.href = cabinetUrl; }, 700);
    } catch (error) {
      showToast(error?.message || 'Не удалось сохранить подборку.');
    } finally {
      button.disabled = false;
      button.textContent = 'Сохранить подборку';
    }
  }

  function bindAppFixes() {
    if (!isAppPage) return;
    refreshHeaderAuth();
    setTimeout(refreshHeaderAuth, 600);
    setTimeout(refreshHeaderAuth, 1800);
    window.addEventListener('pageshow', refreshHeaderAuth);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshHeaderAuth(); });

    document.addEventListener('click', (event) => {
      const target = event.target.closest?.('[data-preset-fill], [data-preset]');
      if (!target) return;
      const scenario = scenarioFromElement(target);
      if (!scenario) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      fillScenario(scenario);
    }, true);

    document.addEventListener('submit', (event) => {
      if (event.target?.id !== 'giftForm') return;
      const request = {
        occasion: document.getElementById('occasionInput')?.value?.trim(),
        budget: document.getElementById('budgetInput')?.value?.trim(),
        relation: document.getElementById('relationInput')?.value?.trim(),
        interests: document.getElementById('interestsInput')?.value?.trim(),
        notes: document.getElementById('notesInput')?.value?.trim(),
      };
      if (!request.occasion || !request.budget || !request.interests) return;
      writeJson(currentRequestKey, request);
      setTimeout(() => {
        const stored = readJson(currentRequestKey, null);
        if (stored?.occasion === request.occasion) return;
        writeJson(currentRequestKey, request);
      }, 300);
    }, true);

    document.addEventListener('click', saveSelectionThroughSession, true);
  }

  function init() {
    bindAppFixes();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
