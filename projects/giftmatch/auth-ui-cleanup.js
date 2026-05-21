(() => {
  const cabinetUrl = 'cabinet.html';
  const registerUrl = 'register.html?mode=signin';

  function qs(selector) {
    return document.querySelector(selector);
  }

  function findProfileCard() {
    return qs('#profileCard') || qs('#guestState')?.closest('.profile-card') || qs('#userState')?.closest('.profile-card') || qs('.profile-card');
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
    element.style.display = '';
  }

  function hideElement(element) {
    if (!element) return;
    element.classList.add('hidden');
    element.hidden = true;
    element.style.display = 'none';
  }

  function hideGuestAuthUi() {
    hideElement(findProfileCard());
    hideElement(qs('#guestState'));
    hideElement(qs('#userState'));
    hideElement(qs('#createProfileBtn'));
    hideElement(qs('#profileEmailInput'));
    hideElement(qs('#profileNameInput'));
  }

  function showGuestAuthUi() {
    showElement(findProfileCard());
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
    if (active) applyAuthenticatedUi();
    else applyGuestUi();
  }

  function start() {
    refreshAuthUi();
    window.setTimeout(refreshAuthUi, 250);
    window.setTimeout(refreshAuthUi, 800);
    window.setTimeout(refreshAuthUi, 2000);

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
