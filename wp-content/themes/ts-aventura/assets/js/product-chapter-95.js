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
    if (catalog.hasAttribute('data-choice-explorer')) continue;
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
    if (library.hasAttribute('data-preparation-explorer')) continue;
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
  if(composer.querySelector('[data-message-activity]'))return;
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

// Shared choice continuity contains public product identifiers, never personal fields.
(() => {
  const en=document.documentElement.lang==='en',catalogPath=en?'/en/activities/':'/atividades/';
  const query=new URLSearchParams(location.search),one=key=>query.getAll(key).length===1?query.get(key):'';
  const families=['water','canyoning','tours','walking','team','cycling','rentals'];
  let choices=[...new Set((one('choices')||'').split(',').filter(x=>/^activity\.[a-z0-9-]{1,70}$/.test(x)))].slice(0,3);
  let search=(one('q')||one('from_q')||'').slice(0,80);
  let family=one('from_family')||location.hash.replace('#family-','');if(!families.includes(family))family='all';
  const transferable=link=>link.origin===location.origin&&/^\/(?:en\/)?(?:activities|atividades|contact|contactos|plan|planear)(?:\/|$)/.test(link.pathname);
  const carry=()=>{for(const a of document.querySelectorAll('a[href]')){if(a.getAttribute('href').startsWith('#'))continue;const url=new URL(a.href,location.href);if(!transferable(url)||url.pathname.endsWith('.pdf')||a.hasAttribute('data-product-filter'))continue;
    if(choices.length)url.searchParams.set('choices',choices.join(','));else url.searchParams.delete('choices');
    if(url.pathname===catalogPath||(a.hreflang&&['/atividades/','/en/activities/'].includes(url.pathname))){url.searchParams.delete('from_q');url.searchParams.delete('from_family');if(search)url.searchParams.set('q',search);else url.searchParams.delete('q');if(family!=='all')url.hash='family-'+family;else if(url.hash.startsWith('#family-'))url.hash='';}
    else{if(search)url.searchParams.set('from_q',search);else url.searchParams.delete('from_q');if(family!=='all')url.searchParams.set('from_family',family);else url.searchParams.delete('from_family');}
    a.href=url.pathname+url.search+url.hash;
  }};
  const save=(push=false)=>{const url=new URL(location.href);if(choices.length)url.searchParams.set('choices',choices.join(','));else url.searchParams.delete('choices');
    if(document.querySelector('[data-choice-explorer]')){if(search)url.searchParams.set('q',search);else url.searchParams.delete('q');url.hash=family==='all'?'':'family-'+family;}
    history[push?'pushState':'replaceState'](null,'',url.pathname+url.search+url.hash);carry();};
  const catalog=document.querySelector('[data-choice-explorer]');
  if(catalog){
    const cards=[...catalog.querySelectorAll('[data-choice-id]')],known=new Set(cards.map(c=>c.dataset.choiceId));choices=choices.filter(x=>known.has(x));
    const input=catalog.querySelector('[data-catalog-search]'),filters=[...catalog.querySelectorAll('[data-product-filter]')],clear=catalog.querySelector('[data-catalog-clear]');
    const legacy=catalog.querySelector('[data-legacy-choice-context]');
    const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
    const renderLegacy=()=>{legacy.hidden=!choices.length;
      legacy.querySelector('[data-legacy-choice-names]').textContent=choices.map(id=>cards.find(c=>c.dataset.choiceId===id).querySelector('h3').textContent).join(' · ');
      const a=legacy.querySelector('[data-choice-enquiry]'),url=new URL(en?'/en/contact/':'/contactos/',location.href),audience=one('audience');
      if(['general','groups','schools','companies','families'].includes(audience))url.searchParams.set('audience',audience);
      url.searchParams.set('locale',en?'en':'pt-PT');a.href=url.pathname+url.search;carry();
    };
    const update=()=>{let count=0;for(const section of catalog.querySelectorAll('[data-product-family]')){let n=0;for(const card of section.querySelectorAll('[data-choice-id]')){card.hidden=!(family==='all'||section.dataset.productFamily===family)||!normalize(card.dataset.catalogName).includes(normalize(search.trim()));if(!card.hidden)n++;}section.hidden=!n;count+=n;}
      filters.forEach(a=>{if(a.dataset.productFilter===family)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});catalog.querySelector('[data-product-count]').textContent=`${count} ${en?'experiences':'experiências'}`;catalog.querySelector('[data-product-empty]').hidden=!!count;clear.disabled=family==='all'&&!search;const familySummary=catalog.querySelector('.ts101-family-picker>summary');if(familySummary)familySummary.textContent=family==='all'?(en?'Filter by experience':'Filtrar por experiência'):(en?'Experience: ':'Experiência: ')+filters.find(a=>a.dataset.productFilter===family).textContent;carry();};
    input.value=search;input.maxLength=80;input.addEventListener('input',()=>{search=input.value;update();save();});filters.forEach(a=>a.addEventListener('click',event=>{event.preventDefault();family=a.dataset.productFilter;update();save(true);const picker=catalog.querySelector('.ts101-family-picker');if(picker&&matchMedia('(max-width:782px)').matches){picker.open=false;picker.querySelector('summary').focus();}}));
    clear.addEventListener('click',()=>{family='all';search='';input.value='';update();save(true);input.focus();});
    const familyPicker=catalog.querySelector('.ts101-family-picker');if(familyPicker)familyPicker.open=matchMedia('(min-width:783px)').matches;catalog.querySelector('[data-catalog-tools]').hidden=false;renderLegacy();update();save();
    addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);search=(p.get('q')||'').slice(0,80);input.value=search;const f=location.hash.replace('#family-','');family=families.includes(f)?f:'all';choices=[...new Set((p.get('choices')||'').split(','))].filter(x=>known.has(x)).slice(0,3);renderLegacy();update();});
  }
  const planner=document.querySelector('[data-preparation-explorer]');
  if(planner){
    const directory=planner.querySelector('[data-preparation-directory]'),entries=[...directory.querySelectorAll('[data-document-entry]')],selected=planner.querySelector('[data-selected-preparation]'),input=planner.querySelector('[data-document-search]'),filters=[...planner.querySelectorAll('[data-document-filter]')];
    const places=new Map(entries.map(e=>{const p=document.createComment('directory position');e.before(p);return[e,p];}));
    const globalLinks=new Map([...document.querySelectorAll('a[href]')].filter(a=>!a.closest('[data-document-entry]')&&(/\/(?:contactos|contact)\//.test(new URL(a.href,location.href).pathname)||a.hreflang)).map(a=>[a,a.getAttribute('href')]));
    const returnEntry=e=>{e.open=false;places.get(e).after(e);};
    const checklist=e=>{
      const block=e.querySelector('[data-preparation-checklist]');if(!block||block.dataset.ready)return;
      const label=block.dataset.practicalLabel,text=block.textContent,prefix=label+': ';
      const section=document.createElement('section');section.dataset.preparationChecklist='';section.dataset.ready='true';
      const heading=document.createElement('h2');heading.textContent=label;
      const note=document.createElement('p');note.className='ts101-checklist-note';note.textContent=en?'Optional checklist, kept on this page only.':'Checklist opcional, apenas nesta página.';
      const ul=document.createElement('ul');
      for(const sentence of (text.startsWith(prefix)?text.slice(prefix.length):text).split(/(?<=\.)\s+(?=\p{Lu})/u)){
        const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.className='ts101-check';button.setAttribute('aria-pressed','false');button.textContent=sentence;
        button.addEventListener('click',()=>button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true')));li.append(button);ul.append(li);
      }
      section.append(heading,note,ul);block.replaceWith(section);
    };
    let language='all',active=null,audience='general';const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
    const update=()=>{let count=0;for(const entry of entries){if(entry===active){entry.hidden=false;for(const row of entry.querySelectorAll('[data-document-languages]'))row.hidden=false;continue;}const match=normalize(entry.querySelector('summary').textContent).includes(normalize(input.value.trim()));let has=false;for(const row of entry.querySelectorAll('[data-document-languages]')){row.hidden=language!=='all'&&!row.dataset.documentLanguages.split(' ').includes(language);has||=!row.hidden;}entry.hidden=!match||!has;if(!entry.hidden)count++;}planner.querySelector('[data-document-count]').textContent=`${count} ${active?(en?'other experiences':'outras experiências'):(en?'experiences':'experiências')}`;planner.querySelector('[data-document-empty]').hidden=count>0;};
    const select=entry=>{if(active&&active!==entry)returnEntry(active);active=entry;selected.hidden=!entry;planner.querySelector('[data-directory-reset]').hidden=!entry;if(entry){entry.hidden=false;entry.open=true;selected.replaceChildren(entry);checklist(entry);
        const back=entry.querySelector('[data-preparation-return]'),href=new URL(back.href,location.href);if(audience==='general'){href.searchParams.delete('audience');href.hash='';}else{href.searchParams.set('audience',audience);href.hash='audience-'+audience;}back.href=href.pathname+href.search+href.hash;
        for(const a of document.querySelectorAll('a[hreflang]')){const u=new URL(globalLinks.get(a)||a.href,location.href);if(!/\/(?:plan|planear)\//.test(u.pathname)||(a.closest('[data-document-entry]')&&!entry.contains(a)))continue;const targetEn=a.hreflang==='en',safety=planner.dataset.preparationMode==='preparation';u.pathname=safety?(targetEn?'/en/plan/safety-insurance/':'/planear/seguranca-seguros/'):(targetEn?'/en/plan/activity-sheets/':'/planear/fichas-preparacao/');u.hash='prepare-'+(targetEn===en?entry.dataset.preparationSlug:entry.dataset.preparationOther)+'-'+audience;u.searchParams.delete('activity_id');u.searchParams.delete('activity');u.searchParams.set('audience',audience);a.href=u.pathname+u.search+u.hash;}
        // Match the immutable original role, not the contextual URL from the previous selection.
        for(const [a,original]of globalLinks){const u=new URL(original,location.href);if(u.origin!==location.origin||u.pathname!==(en?'/en/contact/':'/contactos/'))continue;const target=entry.querySelector('[data-preparation-audience="'+audience+'"]');if(target)a.href=target.getAttribute('href');}
      }update();carry();};
    const restore=()=>{const hash=location.hash.slice(1),p=new URLSearchParams(location.search);let entry=entries.find(e=>e.id===hash||e.dataset.documentActivity===p.get('activity_id'));const match=/^prepare-(.+)-(general|groups|schools|companies|families)$/.exec(hash);if(match){entry=entries.find(e=>e.dataset.preparationSlug===match[1]);audience=match[2];}else if(['general','groups','schools','companies','families'].includes(p.get('audience')))audience=p.get('audience');if(entry)select(entry);};
    for(const entry of entries)entry.addEventListener('toggle',()=>{if(entry.open&&entry!==active){const url=new URL(location.href);url.hash='prepare-'+entry.dataset.preparationSlug+'-'+audience;for(const k of ['activity_id','activity'])url.searchParams.delete(k);if(audience==='general')url.searchParams.delete('audience');else url.searchParams.set('audience',audience);history.replaceState(null,'',url.pathname+url.search+url.hash);select(entry);const summary=entry.querySelector('summary');summary.focus();}});
    input.addEventListener('input',update);for(const button of filters)button.addEventListener('click',()=>{language=button.dataset.documentFilter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update();});
    planner.querySelector('[data-directory-reset]').addEventListener('click',event=>{event.preventDefault();if(active)returnEntry(active);active=null;selected.replaceChildren();selected.hidden=true;input.value='';language='all';audience='general';for(const [a,href]of globalLinks)a.setAttribute('href',href);const u=new URL(location.href);for(const k of ['activity_id','activity','audience'])u.searchParams.delete(k);u.hash='document-directory';history.replaceState(null,'',u.pathname+u.search+u.hash);filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.documentFilter==='all')));update();carry();input.focus();});
    planner.querySelector('[data-document-tools]').hidden=false;update();restore();addEventListener('hashchange',restore);
  }
  addEventListener('ts-contact-context-ready',carry);
  addEventListener('ts-choices-updated',event=>{choices=event.detail.filter(x=>/^activity\.[a-z0-9-]{1,70}$/.test(x)).slice(0,3);carry();});
  carry();
})();

// TSA101 optional composer extends the same page-local privacy contract.
(() => {
  const composer=document.querySelector('[data-message-composer]'),select=composer?.querySelector('[data-message-activity]');if(!select)return;
  const en=document.documentElement.lang==='en',preview=composer.querySelector('[data-message-preview]'),audience=composer.querySelector('[data-message-audience]'),status=composer.querySelector('[data-message-status]');
  const clean=(text,limit)=>String(text??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').slice(0,limit),known=new Map([...select.options].filter(o=>o.value).map(o=>[o.value,o.textContent]));
  const interestLabels={'pack-basico':en?'Pack Basic':'Pack Básico','pack-standard':'Pack Standard','pack-premium':'Pack Premium','pack-deluxe':'Pack Deluxe','despedidas':en?'Stag & hen groups':'Despedidas','finalistas':en?'School leavers':'Finalistas'};
  const interestAudience=key=>key==='finalistas'?'schools':interestLabels[key]?'groups':'';
  function contextForMessage101(params, hash, fallbackAudience, fallbackInterest) {
    const one=key=>params.getAll(key).length===1?params.get(key):'';
    const native=/^#request-(general|groups|schools|companies|families)(?:-(pack-(?:basico|standard|premium|deluxe)|despedidas|finalistas))?$/.exec(hash);
    const candidate=one('audience')||native?.[1]||fallbackAudience||'general';
    const audience=['general','individuals','families','groups','schools','companies'].includes(candidate)?candidate:'general';
    const key=one('interest')||native?.[2]||fallbackInterest||'';
    const owner=key==='finalistas'?'schools':['pack-basico','pack-standard','pack-premium','pack-deluxe','despedidas'].includes(key)?'groups':'';
    return {audience,interest:owner===audience?key:''};
  }
  function productIDsForMessage101(params, nativeId, known) {
    const one=key=>params.getAll(key).length===1?params.get(key):'';
    if(params.has('choices'))return [...new Set((one('choices')||'').split(','))].filter(id=>known.has(id)).slice(0,3);
    const id=one('activity_id')||one('activity')||nativeId;
    return known.has(id)?[id]:[];
  }
  let chosen=[],interestKey='',manualEdited=false,contextText='';
  const updateLinks=()=>{const message=clean([contextText,preview.value].filter(Boolean).join('\n\n'),4000);composer.querySelector('[data-message-whatsapp]').href='https://wa.me/351961787772?text='+encodeURIComponent(message);composer.querySelector('[data-message-email]').href='mailto:geral@transserrano.com?subject='+encodeURIComponent(en?'Activity enquiry':'Pedido de informação')+'&body='+encodeURIComponent(message);for(const [key,target]of [['whatsapp','[data-message-whatsapp]'],['email','[data-message-email]']]){const immediate=document.querySelector('[data-immediate-'+key+']');if(immediate)immediate.href=composer.querySelector(target).href;}};
  const syncLanguage=()=>{const self=new URL(location.href);self.searchParams.set('choices',chosen.join(','));self.searchParams.set('audience',audience.value);const interest=interestAudience(interestKey)===audience.value?interestKey:'';if(interest)self.searchParams.set('interest',interest);else self.searchParams.delete('interest');self.searchParams.delete('activity_id');self.searchParams.delete('activity');if(self.hash.startsWith('#request'))self.hash=audience.value==='general'?'request':'request-'+audience.value+(interest?'-'+interest:'');history.replaceState(null,'',self.pathname+self.search+self.hash);dispatchEvent(new CustomEvent('ts-choices-updated',{detail:chosen}));
    for(const link of document.querySelectorAll('a[hreflang]')){const url=new URL(link.href,location.href);if(!/\/(?:contactos|contact)\//.test(url.pathname))continue;url.pathname=link.hreflang==='en'?'/en/contact/':'/contactos/';url.searchParams.delete('activity_id');url.searchParams.delete('activity');url.searchParams.set('choices',chosen.join(','));url.searchParams.set('audience',audience.value);url.searchParams.set('locale',link.hreflang);if(interest)url.searchParams.set('interest',interest);else url.searchParams.delete('interest');url.hash=audience.value==='general'?'request':'request-'+audience.value+(interest?'-'+interest:'');link.href=url.pathname+url.search+url.hash;}};
  const prepare=()=>{const people=composer.querySelector('[data-message-people]');if(!people.checkValidity()){people.reportValidity();return false;}const names=chosen.map(id=>known.get(id)),interest=interestAudience(interestKey)===audience.value?interestLabels[interestKey]:'';const summary=[...names,interest,audience.value!=='general'?audience.selectedOptions[0].textContent:''].filter(Boolean).join(' · ');
    composer.querySelector('[data-message-summary]').textContent=summary||(en?'Help choosing an experience':'Ajuda para escolher uma experiência');
    const parts=[summary];const date=composer.querySelector('[data-message-date]').value;if(date){const [year,month,day]=date.split('-');parts.push((en?'Preferred date: ':'Data pretendida: ')+day+'/'+month+'/'+year);}if(people.value)parts.push((en?'Participants: ':'Participantes: ')+people.value);const question=clean(composer.querySelector('[data-message-question]').value.trim(),1500);if(question)parts.push((en?'Your question: ':'A sua pergunta: ')+question);contextText=parts.filter(Boolean).join('\n\n');composer.querySelector('[data-message-summary]').textContent=contextText||(en?'Help choosing an experience':'Ajuda para escolher uma experiência');
    if(!manualEdited)preview.value=en?'Hello, I would like information.':'Olá, gostaria de informações.';composer.querySelector('[data-message-output]').hidden=false;updateLinks();syncLanguage();return true;
  };
  const list=()=>{const root=composer.querySelector('[data-message-selection]');root.replaceChildren();for(const id of chosen){const li=document.createElement('li'),text=document.createElement('span'),remove=document.createElement('button');text.textContent=known.get(id);remove.type='button';remove.textContent=en?'Remove':'Retirar';remove.setAttribute('aria-label',(en?'Remove ':'Retirar ')+text.textContent);remove.addEventListener('click',()=>{chosen=chosen.filter(x=>x!==id);list();prepare();select.focus();});li.append(text,remove);root.append(li);}composer.querySelector('[data-message-add]').disabled=chosen.length===3;};
  const restore=()=>{const params=new URLSearchParams(location.search),one=k=>params.getAll(k).length===1?params.get(k):'',context=document.querySelector('[data-enquiry-preview]'),pane=document.querySelector('.ts-contact-context-variant:target');chosen=productIDsForMessage101(params,context?.dataset.selectedActivityId,known);const state=contextForMessage101(params,location.hash,pane?.dataset.nativeAudience||context?.dataset.prefillAudience,pane?.dataset.nativeInterest||context?.dataset.prefillInterest);audience.value=state.audience;interestKey=state.interest;list();prepare();};
  composer.hidden=false;document.body.dataset.choiceComposer='ready';const fallback=document.querySelector('[data-contact-fallback]');if(fallback){const immediate=document.createElement('details'),title=document.createElement('summary');title.textContent=en?'Contacts and how the website form works':'Contactos e funcionamento do formulário';fallback.before(immediate);immediate.append(title,fallback);}
  composer.querySelector('[data-message-add]').addEventListener('click',()=>{if(select.value&&!chosen.includes(select.value)&&chosen.length<3){chosen.push(select.value);list();prepare();}status.textContent=chosen.length===3?(en?'Three options. Remove one to change the shortlist.':'Três opções. Retire uma para alterar a seleção.'):'';});
  composer.querySelector('[data-message-prepare]').addEventListener('click',()=>{if(!prepare())return;status.textContent=en?'Message updated locally. Nothing has been sent.':'Mensagem atualizada nesta página. Nada foi enviado.';preview.focus();});audience.addEventListener('change',()=>{if(interestAudience(interestKey)!==audience.value)interestKey='';prepare();});preview.addEventListener('input',()=>{manualEdited=true;updateLinks();});for(const field of composer.querySelectorAll('[data-message-date],[data-message-people],[data-message-question]'))field.addEventListener('input',()=>{prepare();if(manualEdited)status.textContent=en?'Your edited message is preserved; the activity, audience, date, participants and question are shown above it.':'A mensagem editada foi preservada; atividade, público, data, participantes e pergunta são apresentados acima.';});
  restore();addEventListener('ts-contact-context-ready',restore);addEventListener('hashchange',restore);addEventListener('popstate',restore);addEventListener('pageshow',event=>{if(event.persisted)restore();});
  window.addEventListener('pagehide',()=>{for(const input of composer.querySelectorAll('input,textarea'))input.value='';contextText='';manualEdited=false;composer.querySelector('[data-message-output]').hidden=true;status.textContent='';updateLinks();});
})();
