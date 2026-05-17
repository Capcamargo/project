(function () {
  const CDN_SRC = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  const CLIENT_SRC = 'supabase-client.js?v=20260517-3';

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function loadScript(src, id) {
    return new Promise((resolve, reject) => {
      const existing = id ? document.getElementById(id) : null;
      if (existing) {
        if (existing.dataset.loaded === '1') {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Не удалось загрузить ${src}`)), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      if (id) script.id = id;
      script.addEventListener('load', () => {
        script.dataset.loaded = '1';
        resolve();
      }, { once: true });
      script.addEventListener('error', () => reject(new Error(`Не удалось загрузить ${src}`)), { once: true });
      document.head.appendChild(script);
    });
  }

  window.ensureGiftmatchClient = async function ensureGiftmatchClient(timeoutMs = 10000) {
    if (window.giftmatchSupabase) {
      return window.giftmatchSupabase;
    }

    if (window.__giftmatchClientPromise) {
      return window.__giftmatchClientPromise;
    }

    window.__giftmatchClientPromise = (async () => {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        await loadScript(CDN_SRC, 'giftmatch-supabase-cdn');
      }

      if (!window.giftmatchSupabase) {
        await loadScript(CLIENT_SRC, 'giftmatch-supabase-client');
      }

      const startedAt = Date.now();
      while (Date.now() - startedAt < timeoutMs) {
        if (window.giftmatchSupabase) {
          return window.giftmatchSupabase;
        }
        await wait(150);
      }

      throw new Error('Модуль входа не загрузился');
    })();

    return window.__giftmatchClientPromise;
  };
})();