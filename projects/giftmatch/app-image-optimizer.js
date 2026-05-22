(() => {
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

  if ('requestIdleCallback' in window) {
    requestIdleCallback(optimizeAll, { timeout: 1200 });
  } else {
    window.setTimeout(optimizeAll, 80);
  }

  const observer = new MutationObserver(() => optimizeAll());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
