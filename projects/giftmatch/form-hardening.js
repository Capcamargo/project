(() => {
  const FORM_LOCK_MS = 8000;
  const form = document.getElementById('giftForm');
  if (!form) return;

  let lockedUntil = 0;

  function getSubmitButton() {
    return form.querySelector('button[type="submit"]');
  }

  function setButtonState(isLocked) {
    const button = getSubmitButton();
    if (!button) return;

    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent || 'Показать идеи';
    }

    button.disabled = isLocked;
    button.classList.toggle('is-disabled', isLocked);
    button.textContent = isLocked ? 'Собираем подборку…' : button.dataset.originalText;
  }

  function unlockLater() {
    window.setTimeout(() => {
      if (Date.now() >= lockedUntil) {
        setButtonState(false);
      }
    }, FORM_LOCK_MS + 150);
  }

  form.addEventListener('submit', (event) => {
    const now = Date.now();

    if (now < lockedUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = 'Подборка уже собирается. Подождите несколько секунд.';
        toast.classList.remove('hidden');
        window.clearTimeout(window.__giftmatchHardeningToastTimer);
        window.__giftmatchHardeningToastTimer = window.setTimeout(() => toast.classList.add('hidden'), 2400);
      }
      return;
    }

    lockedUntil = now + FORM_LOCK_MS;
    setButtonState(true);
    unlockLater();
  }, true);
})();
