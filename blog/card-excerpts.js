(function () {
  const DEFAULT_CHARS = 180;

  function getMaxChars() {
    const grid = document.querySelector('.blog-grid');
    const v = grid && grid.dataset.excerptChars;
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_CHARS;
  }

  function summarize(html, maxChars) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const paras = doc.querySelectorAll('main p, article p, .post-content p, p');
    let text = '';
    for (const p of paras) {
      const t = (p.textContent || '').trim();
      if (t.length >= 40) { text = t; break; }
      if (!text && t) { text = t; }
    }
    if (!text) text = ((doc.body && doc.body.textContent) || '').trim();
    text = text.replace(/\s+/g, ' ').trim();
    if (text.length <= maxChars) return text;
    const cutBase = text.slice(0, maxChars);
    const cut = Math.max(cutBase.lastIndexOf('. '), cutBase.lastIndexOf(' '));
    return (cut > 60 ? cutBase.slice(0, cut) : cutBase).trim() + '…';
  }

  function init() {
    const maxChars = getMaxChars();
    document.querySelectorAll('.blog-card').forEach(card => {
      const excerptEl = card.querySelector('.card-excerpt');
      const titleEl = card.querySelector('.card-title');
      const readMore = card.querySelector('.read-more');
      if (!readMore) return;
      const href = readMore.getAttribute('href');
      if (!href) return;
      const postUrl = new URL(href, window.location.href);
      fetch(postUrl, { credentials: 'same-origin' })
        .then(r => (r.ok ? r.text() : Promise.reject()))
        .then(html => {
          if (excerptEl) excerptEl.textContent = summarize(html, maxChars);
          if (titleEl) {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const h1 = doc.querySelector('h1.post-title, main h1, article h1, h1');
            if (h1 && h1.textContent) {
              titleEl.textContent = h1.textContent.trim();
            }
          }
        })
        .catch(() => {});
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();