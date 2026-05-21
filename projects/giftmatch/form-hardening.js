(() => {
  const FORM_LOCK_MS = 8000;
  const SAVE_LOCK_MS = 5000;
  const form = document.getElementById('giftForm');
  const saveButton = document.getElementById('saveSelectionBtn');

  let formLockedUntil = 0;
  let saveLockedUntil = 0;

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(window.__giftmatchHardeningToastTimer);
    window.__giftmatchHardeningToastTimer = window.setTimeout(() => toast.classList.add('hidden'), 2400);
  }

  function setButtonState(button, isLocked, lockedText) {
    if (!button) return;

    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent || '';
    }

    button.disabled = isLocked;
    button.classList.toggle('is-disabled', isLocked);
    button.textContent = isLocked ? lockedText : button.dataset.originalText;
  }

  function getSubmitButton() {
    return form?.querySelector('button[type="submit"]') || null;
  }

  function unlockFormLater() {
    window.setTimeout(() => {
      if (Date.now() >= formLockedUntil) {
        setButtonState(getSubmitButton(), false, '');
      }
    }, FORM_LOCK_MS + 150);
  }

  function unlockSaveLater() {
    window.setTimeout(() => {
      if (Date.now() >= saveLockedUntil) {
        setButtonState(saveButton, false, '');
      }
    }, SAVE_LOCK_MS + 150);
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      const now = Date.now();

      if (now < formLockedUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showToast('Подборка уже собирается. Подождите несколько секунд.');
        return;
      }

      formLockedUntil = now + FORM_LOCK_MS;
      setButtonState(getSubmitButton(), true, 'Собираем подборку…');
      unlockFormLater();
    }, true);
  }

  if (saveButton) {
    saveButton.addEventListener('click', (event) => {
      const now = Date.now();

      if (saveButton.disabled && now >= saveLockedUntil) {
        return;
      }

      if (now < saveLockedUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showToast('Сохранение уже выполняется. Подождите несколько секунд.');
        return;
      }

      if (saveButton.disabled) {
        return;
      }

      saveLockedUntil = now + SAVE_LOCK_MS;
      setButtonState(saveButton, true, 'Сохраняем…');
      unlockSaveLater();
    }, true);
  }
})();
