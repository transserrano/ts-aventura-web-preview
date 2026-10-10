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
    const search = catalog.querySelector('[data-catalog-search]');
    const clear = catalog.querySelector('[data-catalog-clear]');
    const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
    let family = 'all';
    const update = () => {
      const query = normalize(search.value.trim());
      let count = 0;
      for (const section of sections) {
        let visible = 0;
        for (const card of section.querySelectorAll('[data-catalog-item]')) {
          card.hidden = !normalize(card.dataset.catalogName).includes(query);
          if (!card.hidden) visible++;
        }
        section.hidden = (family !== 'all' && section.dataset.productFamily !== family) || visible === 0;
        if (!section.hidden) count += visible;
        for (const table of section.querySelectorAll('.ts99-compare')) table.hidden = query.length > 0;
      }
      filters.forEach(a => a.setAttribute('aria-current',String(a.dataset.productFilter === family)));
      const active = filters.find(a => a.dataset.productFilter === family)?.textContent.trim();
      catalog.querySelector('[data-product-count]').textContent = `${count} ${en ? (count === 1 ? 'experience' : 'experiences') : (count === 1 ? 'experiência' : 'experiências')} · ${active}${search.value.trim() ? ` · “${search.value.trim()}”` : ''}`;
      catalog.querySelector('[data-product-empty]').hidden = count !== 0;
      clear.disabled = family === 'all' && !search.value;
      for (const card of catalog.querySelectorAll('a[data-catalog-item]')) {
        const destination = new URL(card.href, location.href);
        if (family === 'all') destination.searchParams.delete('from_family');
        else destination.searchParams.set('from_family', family);
        if (search.value.trim()) destination.searchParams.set('from_q', search.value.trim().slice(0, 80));
        else destination.searchParams.delete('from_q');
        card.href = destination.href;
      }
      for (const a of document.querySelectorAll('a[hreflang]')) {
        const url = new URL(a.href,location.href);
        if (['/atividades/','/en/activities/'].includes(url.pathname)) { url.search = location.search; url.hash = location.hash; a.href = url.href; }
      }
    };
    const save = push => {
      const url = new URL(location.href);url.search = '';url.hash = family === 'all' ? '' : `family-${family}`;
      if (search.value.trim()) url.searchParams.set('q',search.value.trim().slice(0,80));
      history[push ? 'pushState' : 'replaceState'](null,'',url.pathname+url.search+url.hash);update();
    };
    const restore = () => {
      const id = location.hash.replace('#family-','');family = sections.some(s=>s.dataset.productFamily===id) ? id : 'all';
      search.value = (new URLSearchParams(location.search).get('q') || '').slice(0,80);update();
    };
    search.maxLength = 80;search.addEventListener('input',()=>save(false));
    filters.forEach(a=>a.addEventListener('click',event=>{event.preventDefault();family=a.dataset.productFilter;save(true);}));
    clear.addEventListener('click',()=>{family='all';search.value='';save(true);search.focus();});
    catalog.querySelector('[data-catalog-tools]').hidden = false;
    addEventListener('popstate',restore);addEventListener('hashchange',restore);restore();
  }
  const productPage = document.querySelector('.ts100-detail');
  if (productPage) {
    const query = new URLSearchParams(location.search);
    const family = query.get('from_family');
    const search = query.get('from_q')?.slice(0, 80);
    const validFamily = ['water','canyoning','tours','walking','team','cycling','rentals'].includes(family);
    if (validFamily || search) {
      const catalogPath = en ? '/en/activities/' : '/atividades/';
      for (const link of productPage.querySelectorAll('.ts-breadcrumbs a')) {
        const destination = new URL(link.href, location.href);
        if (destination.pathname !== catalogPath) continue;
        if (search) destination.searchParams.set('q', search);
        if (validFamily) destination.hash = 'family-' + family;
        link.href = destination.href;
      }
      for (const link of document.querySelectorAll('a[hreflang]')) {
        const destination = new URL(link.href, location.href);
        if (!/^\/(?:en\/activities|atividades)\/[a-z0-9-]+\/$/.test(destination.pathname)) continue;
        if (validFamily) destination.searchParams.set('from_family', family);
        if (search) destination.searchParams.set('from_q', search);
        link.href = destination.href;
      }
    }
  }
  for (const comparison of document.querySelectorAll('.ts99-compare')) {
    comparison.addEventListener('toggle',()=>{if(comparison.open){const template=comparison.querySelector('[data-compare-table]');if(template)template.replaceWith(template.content.cloneNode(true));}});
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
  for (const library of document.querySelectorAll('[data-document-library]')) {
    const tools = library.querySelector('[data-document-tools]');
    const search = library.querySelector('[data-document-search]');
    const filters = [...library.querySelectorAll('[data-document-filter]')];
    const entries = [...library.querySelectorAll('[data-document-entry]')];
    const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
    let language = 'all';
    const update = () => {
      const query = normalize(search.value.trim());
      let count = 0;
      for (const entry of entries) {
        const nameMatches = normalize(entry.querySelector('h2').textContent).includes(query);
        let hasLanguage = false;
        for (const link of entry.querySelectorAll('[data-document-languages]')) {
          link.hidden = language !== 'all' && !link.dataset.documentLanguages.split(' ').includes(language);
          hasLanguage ||= !link.hidden;
        }
        entry.hidden = !nameMatches || !hasLanguage;
        if (!entry.hidden) count++;
      }
      library.querySelector('[data-document-count]').textContent = `${count} ${en ? 'activities with a sheet' : 'atividades com ficha'}`;
      library.querySelector('[data-document-empty]').hidden = count !== 0;
    };
    search.addEventListener('input', update);
    for (const button of filters) button.addEventListener('click', () => {
      language = button.dataset.documentFilter;
      filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      update();
    });
    tools.hidden = false;
    const selectFromFragment = () => {
      const chosen = entries.find(entry => '#' + entry.id === location.hash);
      if (!chosen) return;
      search.value = chosen.querySelector('h2 a').textContent.replace(/\s*→\s*$/, '');
      update();
      for (const link of document.querySelectorAll('header a[hreflang], footer a[hreflang]')) {
        const destination = new URL(link.href, location.href);
        if (['/planear/fichas-preparacao/','/en/plan/activity-sheets/'].includes(destination.pathname)) {
          destination.hash = chosen.id;
          link.href = destination.href;
        }
      }
    };
    update();
    selectFromFragment();
    search.addEventListener('search', () => {
      if (search.value) return;
      language = 'all';
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.documentFilter === 'all')));
      history.replaceState(null, '', location.pathname);
      for (const link of document.querySelectorAll('header a[hreflang], footer a[hreflang]')) {
        const destination = new URL(link.href, location.href);
        if (['/planear/fichas-preparacao/','/en/plan/activity-sheets/'].includes(destination.pathname)) {
          destination.hash = '';link.href = destination.href;
        }
      }
      update();
    });
    window.addEventListener('hashchange', selectFromFragment);
  }
  // One below-fold editorial movement. Content is never hidden or observer-gated.
  // A failed/unsupported observer, reduced motion or no JS leaves the final state.
  const heroMoment = document.querySelector('.ts100-home .ts95-slides');
  if (heroMoment && !matchMedia('(prefers-reduced-motion: reduce)').matches && typeof Element.prototype.animate === 'function') {
    const entry = heroMoment.animate([{transform:'translateY(16px)'},{transform:'none'}], {duration:480,easing:'cubic-bezier(.16,1,.3,1)'});
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches)entry.cancel();});
  }
  const moments = [...document.querySelectorAll('.ts98-shared-days, .ts96-history')];
  if (moments.length && 'IntersectionObserver' in window && typeof Element.prototype.animate === 'function') {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        if (!preference.matches && entry.boundingClientRect.top > 80) {
          const animation = entry.target.animate([{transform:'translateY(10px)'},{transform:'none'}], {duration:360,easing:'cubic-bezier(.16,1,.3,1)'});
          animations.add(animation);animation.finished.then(()=>animations.delete(animation)).catch(()=>animations.delete(animation));
        }
      }
    }, {threshold:0.08});
    moments.forEach(moment=>observer.observe(moment));
    preference.addEventListener('change',()=>{if(preference.matches){for(const animation of animations)animation.cancel();animations.clear();}});
  }
})();
// TSA99 optional composer: page-local only. Hrefs open an application on explicit click.
(() => {
  const composer=document.querySelector('[data-message-composer]');
  if(!composer)return;
  const en=document.documentElement.lang==='en',preview=composer.querySelector('[data-message-preview]');
  const clean=(text,limit)=>String(text??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').slice(0,limit);
  const updateLinks=()=>{const message=clean(preview.value,2400);composer.querySelector('[data-message-whatsapp]').href='https://wa.me/351961787772?text='+encodeURIComponent(message);composer.querySelector('[data-message-email]').href='mailto:geral@transserrano.com?subject='+encodeURIComponent(en?'Activity enquiry':'Pedido de informação')+'&body='+encodeURIComponent(message);};
  composer.hidden=false;
  composer.querySelector('[data-message-prepare]').addEventListener('click',()=>{
    const pane=document.querySelector('.ts-contact-context-variant:target')??document.querySelector('.ts-contact-context-default');
    const context=clean(pane?.querySelector('[data-enquiry-context]')?.textContent?.trim(),360);
    const date=composer.querySelector('[data-message-date]').value,people=composer.querySelector('[data-message-people]');
    if(!people.checkValidity()){people.reportValidity();return;}
    const parts=[en?'Hello, I would like information.':'Olá, gostaria de informações.',context];
    if(date){const [year,month,day]=date.split('-');parts.push((en?'Preferred date: ':'Data pretendida: ')+day+'/'+month+'/'+year);}
    if(people.value)parts.push((en?'Participants: ':'Participantes: ')+people.value);
    const question=clean(composer.querySelector('[data-message-question]').value.trim(),1500);if(question)parts.push(question);
    preview.value=parts.filter(Boolean).join('\n\n');composer.querySelector('[data-message-output]').hidden=false;updateLinks();preview.focus();
    composer.querySelector('[data-message-status]').textContent=en?'Text prepared locally. Nothing has been sent.':'Texto preparado nesta página. Nada foi enviado.';
  });
  preview.addEventListener('input',updateLinks);
  // Discard values on page lifecycle, including back-forward-cache entry.
  window.addEventListener('pagehide',()=>{for(const input of composer.querySelectorAll('input,textarea'))input.value='';composer.querySelector('[data-message-output]').hidden=true;composer.querySelector('[data-message-status]').textContent='';updateLinks();});
})();
