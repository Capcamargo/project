(() => {
  const cabinetUrl = 'cabinet.html';
  const registerUrl = 'register.html?mode=signin';
  const currentRequestKey = 'giftmatch_current_request';
  const currentResultsKey = 'giftmatch_current_results';

  let activeClient = null;
  let activeSession = null;
  let activeProfile = null;

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(window.__giftmatchAuthSaveToastTimer);
    window.__giftmatchAuthSaveToastTimer = window.setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  function setHeaderAuthenticated(isAuthenticated) {
    const link = document.getElementById('headerAccountLink');
    if (!link) return;
    link.classList.remove('hidden');
    link.hidden = false;
    link.style.display = '';
    if (isAuthenticated) {
      link.textContent = 'Кабинет';
      link.href = cabinetUrl;
      link.classList.remove('btn-secondary');
      link.classList.add('btn-primary');
    } else {
      link.textContent = 'Войти';
      link.href = registerUrl;
      link.classList.remove('btn-primary');
      link.classList.add('btn-secondary');
    }
  }

  function hideProfileCardWhenAuthenticated() {
    const profileCard = document.querySelector('#profileCard') || document.querySelector('#guestState')?.closest('.profile-card') || document.querySelector('.profile-card');
    if (profileCard) {
      profileCard.classList.add('hidden');
      profileCard.hidden = true;
      profileCard.style.display = 'none';
    }
  }

  function renderAuthenticatedUi() {
    setHeaderAuthenticated(true);
    hideProfileCardWhenAuthenticated();
  }

  async function getClient() {
    if (activeClient) return activeClient;
    if (!window.ensureGiftmatchClient) throw new Error('Модуль входа не загрузился.');
    activeClient = await window.ensureGiftmatchClient(22000);
    return activeClient;
  }

  async function refreshSession() {
    try {
      const client = await getClient();
      await client.finalizeAuthFromUrl().catch(() => {});
      activeSession = (await client.getSession()) || (await client.waitForSession(2500, 200));
      if (activeSession?.user) {
        try {
          activeProfile = await client.ensureProfile(activeSession.user);
        } catch {
          activeProfile = { id: activeSession.user.id, email: activeSession.user.email, plan: 'free' };
        }
        renderAuthenticatedUi();
        return activeSession;
      }
      setHeaderAuthenticated(false);
      return null;
    } catch {
      return null;
    }
  }

  function getCurrentResults() {
    return readJson(currentResultsKey, []);
  }

  function getCurrentRequest() {
    return readJson(currentRequestKey, null);
  }

  async function regenerateOnlineResults(client, request) {
    const payload = {
      occasion: request.occasion,
      budget: request.budget,
      relation: request.relation,
      interests: request.interests,
      notes: request.notes,
      source: 'web_app_save_fix',
      save: false,
    };
    const data = await client.requestRecommendations(payload);
    const freshRequest = {
      occasion: data.request?.occasion ?? payload.occasion,
      budget: data.request?.budget ?? payload.budget,
      relation: data.request?.relation ?? payload.relation,
      interests: data.request?.interests ?? payload.interests,
      notes: data.request?.notes ?? payload.notes,
      id: data.request?.id ?? null,
    };
    const freshResults = (data.recommendations || []).map((item) => ({ ...item, request: freshRequest }));
    if (!freshResults.length) throw new Error('Пустой ответ рекомендаций');
    writeJson(currentRequestKey, freshRequest);
    writeJson(currentResultsKey, freshResults);
    return freshResults;
  }

  async function saveSelectionAsAuthenticated(event) {
    const button = event.target.closest('#saveSelectionBtn');
    if (!button) return;

    const session = activeSession || await refreshSession();
    if (!session?.user) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const client = await getClient();
    let results = getCurrentResults();
    const request = getCurrentRequest();

    if (!results.length) {
      showToast('Сначала заполните форму и получите подборку.');
      return;
    }

    try {
      button.disabled = true;
      button.textContent = 'Сохраняем…';

      if (results.some((item) => !item.id)) {
        if (!request) throw new Error('Нет данных запроса для восстановления подборки.');
        results = await regenerateOnlineResults(client, request);
      }

      const ids = results.map((item) => item.id).filter(Boolean);
      if (!ids.length) throw new Error('Нет рекомендаций для сохранения.');

      const profile = activeProfile || await client.ensureProfile(session.user);
      let savedCount = 0;
      try {
        const account = await client.getAccountData();
        savedCount = account?.savedRecommendations?.length || 0;
        activeProfile = account?.profile || profile;
      } catch {
        savedCount = 0;
      }

      if ((activeProfile?.plan || profile?.plan || 'free') === 'free' && savedCount >= 2) {
        const modal = document.getElementById('paywallModal');
        if (modal) modal.classList.remove('hidden');
        showToast('Лимит Free исчерпан. Откройте тарифный шаг.');
        return;
      }

      await client.saveRecommendations(ids);
      const savedAt = new Date().toISOString();
      const updated = results.map((item) => ({ ...item, is_saved: true, saved_at: savedAt }));
      writeJson(currentResultsKey, updated);
      showToast('Подборка сохранена в вашем аккаунте.');
      window.setTimeout(() => { window.location.href = cabinetUrl; }, 650);
    } catch (error) {
      showToast(error?.message || 'Не удалось сохранить подборку.');
    } finally {
      button.disabled = false;
      button.textContent = 'Сохранить подборку';
    }
  }

  function start() {
    refreshSession();
    window.setTimeout(refreshSession, 700);
    window.setTimeout(refreshSession, 2000);
    document.addEventListener('click', saveSelectionAsAuthenticated, true);
    window.addEventListener('pageshow', refreshSession);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refreshSession();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
