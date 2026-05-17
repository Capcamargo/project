(function () {
  const CDN_SOURCES = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://unpkg.com/@supabase/supabase-js@2',
  ];
  const CLIENT_SRC = 'supabase-client.js?v=20260517-4';

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

  async function ensureSupabaseCdn() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      return window.supabase;
    }

    let lastError = null;
    for (let index = 0; index < CDN_SOURCES.length; index += 1) {
      const src = CDN_SOURCES[index];
      const id = `giftmatch-supabase-cdn-${index}`;
      try {
        await loadScript(src, id);
        const startedAt = Date.now();
        while (Date.now() - startedAt < 4000) {
          if (window.supabase && typeof window.supabase.createClient === 'function') {
            return window.supabase;
          }
          await wait(100);
        }
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Не удалось загрузить Supabase CDN');
  }

  window.ensureGiftmatchClient = async function ensureGiftmatchClient(timeoutMs = 12000) {
    if (window.giftmatchSupabase) {
      return window.giftmatchSupabase;
    }

    if (window.__giftmatchClientPromise) {
      return window.__giftmatchClientPromise;
    }

    window.__giftmatchClientPromise = (async () => {
      await ensureSupabaseCdn();
      await loadScript(CLIENT_SRC, 'giftmatch-supabase-client');

      if (window.initializeGiftmatchSupabase) {
        await window.initializeGiftmatchSupabase();
      }

      const startedAt = Date.now();
      while (Date.now() - startedAt < timeoutMs) {
        if (window.giftmatchSupabase && typeof window.giftmatchSupabase.finalizeAuthFromUrl === 'function') {
          return window.giftmatchSupabase;
        }
        if (window.initializeGiftmatchSupabase) {
          try {
            const client = await window.initializeGiftmatchSupabase();
            if (client && typeof client.finalizeAuthFromUrl === 'function') {
              return client;
            }
          } catch (error) {
            window.__giftmatchClientInitError = error;
          }
        }
        await wait(150);
      }

      throw window.__giftmatchClientInitError || new Error('Модуль входа не загрузился');
    })();

    try {
      return await window.__giftmatchClientPromise;
    } catch (error) {
      window.__giftmatchClientPromise = null;
      throw error;
    }
  };
})();