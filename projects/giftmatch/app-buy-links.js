(() => {
  function safeEscape(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(value);
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function normalizePart(value) {
    return String(value ?? '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function compactText(value, maxLength = 110) {
    const text = normalizePart(value);
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).replace(/[,;:\-\s]+$/g, '');
  }

  window.buildPurchaseSearchQuery = function buildPurchaseSearchQuery(item, request) {
    const currentRequest = request || item?.request || window.state?.currentRequest || {};
    const parts = [
      'купить подарок',
      item?.title,
      item?.category,
      currentRequest?.occasion,
      compactText(currentRequest?.interests, 120),
    ];

    return parts
      .map(normalizePart)
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  window.buildPurchaseSearchUrl = function buildPurchaseSearchUrl(item, request) {
    const query = window.buildPurchaseSearchQuery(item, request);
    return `https://yandex.ru/search/?text=${encodeURIComponent(query)}`;
  };

  window.renderPurchaseAction = function renderPurchaseAction(item, request, className = 'result-actions') {
    const url = window.buildPurchaseSearchUrl(item, request);
    const query = window.buildPurchaseSearchQuery(item, request);
    return `<div class="${className}"><a class="buy-gift-link" href="${safeEscape(url)}" target="_blank" rel="noopener noreferrer" aria-label="Найти где купить: ${safeEscape(item?.title || 'подарок')}" title="${safeEscape(query)}">Найти где купить</a><span class="buy-gift-hint">Откроется внешний поиск</span></div>`;
  };

  window.resultCardMarkup = function resultCardMarkup(item, index) {
    const request = item?.request || window.state?.currentRequest || null;
    return `<article class="result-card"><div class="result-topline"><span class="result-label">Вариант ${index + 1}</span><span class="rank-badge">#${index + 1}</span></div><h3>${safeEscape(item.title)}</h3><p class="result-meta result-main-text">${safeEscape(item.reason)}</p><p class="result-meta result-note-text"><strong>Почему подходит:</strong> ${safeEscape(item.explanation ?? '')}</p><div class="confidence-row"><span class="confidence-caption">Уместность рекомендации</span><strong class="confidence-value">${item.score ?? 0}%</strong></div><div class="confidence-track"><span style="width:${item.score ?? 0}%"></span></div><div class="chip-row"><span class="chip">${safeEscape(item.price_hint ?? '')}</span><span class="chip">${safeEscape(item.category ?? 'Рекомендация')}</span><span class="chip">${safeEscape(item.tone ?? 'Готовый сценарий')}</span></div>${window.renderPurchaseAction(item, request, 'result-actions')}</article>`;
  };

  window.savedCardMarkup = function savedCardMarkup(item) {
    const request = item.request || window.state?.currentRequest || {};
    return `<article class="saved-card"><div class="saved-topline"><span class="saved-label">Сохранено</span><span class="chip">${safeEscape(item.category || request.relation || 'Без категории')}</span></div><h3>${safeEscape(item.title || request.occasion || 'Подборка')}</h3><p class="saved-meta">Повод: ${safeEscape(request.occasion || window.state?.currentRequest?.occasion || 'Не указано')}</p><p class="saved-meta">Бюджет: ${safeEscape(request.budget || window.state?.currentRequest?.budget || 'Не указано')}</p><p class="saved-meta">Интересы: ${safeEscape(request.interests || window.state?.currentRequest?.interests || 'Не указано')}</p><p class="saved-meta saved-date">Дата сохранения: ${safeEscape(item.saved_at ? new Date(item.saved_at).toLocaleString('ru-RU') : 'Только что')}</p>${window.renderPurchaseAction(item, request, 'saved-actions')}</article>`;
  };

  function rerenderWithPurchaseLinks() {
    try { if (typeof renderResults === 'function') renderResults(); } catch {}
    try { if (typeof renderSaved === 'function') renderSaved(); } catch {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rerenderWithPurchaseLinks, { once: true });
  } else {
    rerenderWithPurchaseLinks();
  }
})();
