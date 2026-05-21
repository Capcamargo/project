(() => {
  const cabinetUrl = 'cabinet.html';
  const registerUrl = 'register.html?mode=signin';

  function qs(selector) {
    return document.querySelector(selector);
  }

  function setHidden(element, hidden) {
    if (!element) return;
    element.classList.toggle('hidden', Boolean(hidden));
    element.hidden = Boolean(hidden);
  }

  function showElement(element) {
    if (!element) return;
    element.classList.remove('hidden');
    element.hidden = false;
  }

  function hideGuestAuthUi() {
    setHidden(qs('#profileCard'), true);
    setHidden(qs('#guestState'), true);
    setHidden(qs('#createProfileBtn'), true);
    setHidden(qs('#profileEmailInput'), true);
    setHidden(qs('#profileNameInput'), true);

    const profileCard = qs('#profileCard');
    if (profileCard) {
      profileCard.style.display = 'none';
    }
  }

  function showGuestAuthUi() {
    const profileCard = qs('#profileCard');
    if (profileCard) {
      profileCard.style.display = '';
      showElement(profileCard);
    }
    showElement(qs('#guestState'));
    showElement(qs('#createProfileBtn'));
    showElement(qs('#profileEmailInput'));
    showElement(qs('#profileNameInput'));
    setHidden(qs('#userState'), true);
  }

  function renderHeaderForAuth(isAuthenticated) {
    const headerAccountLink = qs('#headerAccountLink');
    if (!headerAccountLink) return;

    showElement(headerAccountLink);
    if (isAuthenticated) {
      headerAccountLink.textContent = 'Кабинет';
      headerAccountLink.href = cabinetUrl;
      headerAccountLink.classList.remove('btn-secondary');
      headerAccountLink.classList.add('btn-primary');
      headerAccountLink.setAttribute('aria-label', 'Открыть личный кабинет');
    } else {
      headerAccountLink.textContent = 'Войти';
      headerAccountLink.href = registerUrl;
      headerAccountLink.classList.remove('btn-primary');
      headerAccountLink.classList.add('btn-secondary');
      headerAccountLink.setAttribute('aria-label', 'Войти в аккаунт');
    }
  }

  function applyAuthenticatedUi() {
    hideGuestAuthUi();
    renderHeaderForAuth(true);

    const userState = qs('#userState');
    if (userState) {
      setHidden(userState, true);
      userState.style.display = 'none';
    }
  }

  function applyGuestUi() {
    renderHeaderForAuth(false);
    showGuestAuthUi();
  }

  async function isSessionActive() {
    try {
      if (!window.ensureGiftmatchClient) return false;
      const client = await window.ensureGiftmatchClient(18000);
      const session = await client.getSession();
      return Boolean(session?.user);
    } catch {
      return false;
    }
  }

  async function refreshAuthUi() {
    const active = await isSessionActive();
    if (active) {
      applyAuthenticatedUi();
    } else {
      applyGuestUi();
    }
  }

  function start() {
    refreshAuthUi();
    window.setTimeout(refreshAuthUi, 600);
    window.setTimeout(refreshAuthUi, 1800);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refreshAuthUi();
    });

    window.addEventListener('pageshow', refreshAuthUi);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
