(() => {
  const CLARITY_ID = 'wvim0pazqa';
  const LOGO_PATH = 'assets/brand/giftmatch-logo-icon.svg';

  function loadClarity() {
    if (window.__giftmatchClarityLoaded) return;
    window.__giftmatchClarityLoaded = true;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);
      t.async=1;
      t.src='https://www.clarity.ms/tag/'+i;
      y=l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t,y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function installBrandLogo() {
    if (document.getElementById('giftmatch-brand-logo-style')) return;

    const style = document.createElement('style');
    style.id = 'giftmatch-brand-logo-style';
    style.textContent = `
      .brand-logo {
        font-size: 0 !important;
        line-height: 0 !important;
        color: transparent !important;
        overflow: hidden !important;
        background: transparent !important;
        box-shadow: var(--shadow-sm) !important;
      }
      .brand-logo::before {
        content: '';
        width: 46px;
        height: 46px;
        display: block;
        border-radius: 16px;
        background-image: url('${LOGO_PATH}');
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }
      .brand:hover .brand-logo::before,
      .brand:focus-visible .brand-logo::before {
        transform: translateY(-1px);
      }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('a.brand').forEach((brandLink) => {
      brandLink.setAttribute('href', 'app.html');
      brandLink.setAttribute('aria-label', 'GiftMatch — перейти на главную страницу');
    });
  }

  const SELECTOR = '.gift-cover-image';
  const FIRST_EAGER_COUNT = 3;

  function optimizeImage(img, index) {
    if (!img || img.dataset.optimizedImage === '1') return;

    img.dataset.optimizedImage = '1';
    img.setAttribute('decoding', 'async');
    img.setAttribute('width', '800');
    img.setAttribute('height', '450');

    if (index < FIRST_EAGER_COUNT) {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
    } else {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('fetchpriority', 'low');
    }

    img.addEventListener('load', () => {
      img.classList.add('is-loaded');
      img.closest('.gift-cover')?.classList.add('is-loaded');
    }, { once: true });

    img.addEventListener('error', () => {
      img.classList.add('is-missing');
      img.closest('.gift-cover')?.classList.add('is-missing');
    }, { once: true });
  }

  function optimizeAll() {
    document.querySelectorAll(SELECTOR).forEach((img, index) => optimizeImage(img, index));
  }

  loadClarity();
  installBrandLogo();

  if ('requestIdleCallback' in window) {
    requestIdleCallback(optimizeAll, { timeout: 1200 });
  } else {
    window.setTimeout(optimizeAll, 80);
  }

  const observer = new MutationObserver(() => {
    installBrandLogo();
    optimizeAll();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
