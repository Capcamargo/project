(() => {
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(window.__giftmatchSwitchToastTimer);
    window.__giftmatchSwitchToastTimer = window.setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  function initials(value) {
    return String(value || 'Gift Match')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'GM';
  }

  function createBox(profile, user) {
    if (document.getElementById('accountSwitcherBox')) return;
    const formCard = document.querySelector('.auth-form-card');
    if (!formCard) return;

    const name = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Пользователь GiftMatch';
    const email = profile?.email || user?.email || '';
    const box = document.createElement('section');
    box.id = 'accountSwitcherBox';
    box.className = 'card auth-form-card';
    box.style.marginBottom = '24px';
    box.innerHTML = `
      <div class="card-topline"><p class="mini-label">Активный аккаунт</p><span class="status-tag">Сессия найдена</span></div>
      <div class="profile-summary" style="margin-top: 8px;">
        <div class="avatar-badge">${initials(name || email)}</div>
        <div><p class="profile-title">${name}</p><p class="profile-subtitle">${email}</p></div>
      </div>
      <div class="auth-actions" style="margin-top:18px;">
        <a class="btn btn-primary" href="cabinet.html">Продолжить как этот пользователь</a>
        <button id="switchAccountBtn" class="btn btn-secondary" type="button">Выйти и войти в другой аккаунт</button>
      </div>
    `;
    formCard.parentNode.insertBefore(box, formCard);

    document.getElementById('switchAccountBtn')?.addEventListener('click', async () => {
      const button = document.getElementById('switchAccountBtn');
      button.disabled = true;
      button.textContent = 'Выходим…';
      try {
        const client = await window.ensureGiftmatchClient(20000);
        await client.clearAuthState();
      } catch {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('giftmatch_') || key.includes('bozxbfosvzlayylrhtix')) localStorage.removeItem(key);
        });
      }
      box.remove();
      const emailInput = document.getElementById('registerEmail');
      const nameInput = document.getElementById('registerName');
      const consent = document.getElementById('registerConsent');
      if (emailInput) emailInput.value = '';
      if (nameInput) nameInput.value = '';
      if (consent) consent.checked = false;
      showToast('Сессия очищена. Теперь можно войти другим email.');
    });
  }

  async function init() {
    if (!location.pathname.endsWith('/register.html') && !location.pathname.endsWith('register.html')) return;
    try {
      const client = await window.ensureGiftmatchClient(20000);
      const session = await client.getSession();
      if (!session?.user) return;
      const profile = await client.ensureProfile(session.user).catch(() => null);
      createBox(profile, session.user);
      document.getElementById('cabinetShortcutLink')?.classList.remove('hidden');
    } catch {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
