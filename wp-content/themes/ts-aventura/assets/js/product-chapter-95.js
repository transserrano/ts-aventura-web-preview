(() => {
  'use strict';
  const en = document.documentElement.lang === 'en';
  const root = document.querySelector('[data-photo-rotation]');
  if (root) {
    const slides = [...root.querySelectorAll('[data-photo-slide]')];
    const controls = root.querySelector('.ts95-photo-controls');
    const pause = root.querySelector('[data-photo-pause]');
    const status = root.querySelector('[data-photo-status]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let paused = reduced.matches;
    let timer = null;
    const updateLabel = () => { pause.textContent = paused ? (en ? 'Resume photographs' : 'Retomar fotografias') : (en ? 'Pause photographs' : 'Pausar fotografias'); pause.setAttribute('aria-pressed', String(paused)); };
    const stop = () => { clearTimeout(timer); timer = null; };
    const show = (next, announce = false) => {
      index = (next + slides.length) % slides.length;
      const template = slides[index].querySelector('[data-photo-template]');
      if (template) { template.replaceWith(template.content.cloneNode(true)); }
      slides.forEach((slide, i) => { slide.hidden = i !== index; });
      status.textContent = announce ? `${index + 1} / ${slides.length}` : '';
    };
    const schedule = () => {
      stop();
      if (!paused && !reduced.matches && !document.hidden && !root.contains(document.activeElement)) {
        timer = setTimeout(() => { show(index + 1); schedule(); }, 9000);
      }
    };
    controls.hidden = false;
    pause.addEventListener('click', () => { paused = !paused; updateLabel(); schedule(); });
    for (const [selector, direction] of [['[data-photo-prev]', -1], ['[data-photo-next]', 1]]) root.querySelector(selector).addEventListener('click', () => { paused = true; updateLabel(); stop(); show(index + direction, true); });
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', () => { queueMicrotask(schedule); });
    root.addEventListener('pointerdown', event => { if (event.target.closest('.ts95-photo-controls')) return; paused = true; updateLabel(); stop(); });
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', () => { if (reduced.matches) { paused = true; show(0); updateLabel(); } schedule(); });
    updateLabel(); schedule();
  }
  for (const menu of document.querySelectorAll('[data-product-menu]')) {
    menu.addEventListener('toggle', event => { const family=event.target; if(family.open){ const template=family.querySelector(':scope > [data-menu-links]'); if(template)template.replaceWith(template.content.cloneNode(true)); } },true);
    menu.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); event.stopPropagation(); } });
    menu.addEventListener('click', event => { if (event.target.closest('a')) menu.open = false; });
  }
  for (const catalog of document.querySelectorAll('[data-product-catalog]')) {
    const sections = [...catalog.querySelectorAll('[data-product-family]')];
    const filters = [...catalog.querySelectorAll('[data-product-filter]')];
    const filter = id => {
      if (id !== 'all' && !sections.some(s => s.dataset.productFamily === id)) id = 'all';
      sections.forEach(s => { s.hidden = id !== 'all' && s.dataset.productFamily !== id; });
      filters.forEach(a => a.setAttribute('aria-current', String(a.dataset.productFilter === id)));
      const count = sections.filter(s => !s.hidden).reduce((n,s) => n + s.querySelectorAll('.ts95-card').length,0);
    catalog.querySelector('[data-product-count]').textContent = `${count} ${en ? (count === 1 ? 'experience' : 'experiences') : (count === 1 ? 'experiência' : 'experiências')}`;
      catalog.querySelector('[data-product-empty]').hidden = count !== 0;
    };
    filters.forEach(a => a.addEventListener('click', event => { event.preventDefault(); filter(a.dataset.productFilter); history.replaceState(null,'',a.hash || location.pathname); }));
    filter(location.hash.replace('#family-','') || 'all');
    addEventListener('hashchange', () => filter(location.hash.replace('#family-','') || 'all'));
  }
  for (const button of document.querySelectorAll('[data-video-id]')) {
    button.addEventListener('click', () => {
      const id = button.dataset.videoId;
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0`;
      frame.title = `${en ? 'Trans Serrano video' : 'Vídeo Trans Serrano'}: ${button.dataset.videoTitle}`;
      frame.allow = 'fullscreen'; frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      button.replaceWith(frame);
      frame.tabIndex = 0;
      frame.focus();
    }, {once: true});
  }
})();
