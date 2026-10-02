(() => {
  'use strict';
  if (navigator.connection?.saveData || window.matchMedia('(prefers-reduced-data: reduce)').matches) document.documentElement.dataset.tsReducedData = '';

  // Carry only a curated audience through an activity, never arbitrary URL data.
  const audienceParams = new URLSearchParams(location.search);
  const audience = audienceParams.has('audience')
    ? audienceParams.getAll('audience').length === 1 ? audienceParams.get('audience') : null
    : /^#audience-(groups|schools|companies|families)$/.exec(location.hash)?.[1];
  if (['groups', 'schools', 'companies', 'families'].includes(audience)) {
    for (const link of document.querySelectorAll('main a[href*="activity_id="], .ts-language-switcher a[hreflang]')) {
      const target = new URL(link.getAttribute('href'), location.origin);
      if (target.origin !== location.origin) continue;
      if (/^\/(?:en\/)?(?:activities|atividades)\/.+/.test(target.pathname)
          || (/\/(?:contact|contactos)\//.test(target.pathname) && target.searchParams.has('activity_id'))) {
        target.searchParams.set('audience', audience);
        if (target.searchParams.has('activity_id')) {
          target.searchParams.set('source', audience === 'families' ? 'catalog' : audience);
          target.hash = `request-${audience}`;
        } else target.hash = `audience-${audience}`;
        link.setAttribute('href', target.pathname + target.search + target.hash);
      }
    }
  }

  // Native fragments filter without JS; enhancement adds announcements and
  // preserves that same allowlisted choice when following the equivalent locale.
  const catalogueChoices = [...document.querySelectorAll('[data-catalog-filter]')];
  if (catalogueChoices.length) {
    const syncCatalogueChoice = () => {
      const selected = catalogueChoices.find(link => link.getAttribute('href') === location.hash);
      for (const link of catalogueChoices) {
        if (link === selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
      const cards = selected
        ? document.querySelectorAll(`${selected.getAttribute('href')} [data-discovery-category]`)
        : document.querySelectorAll('[data-discovery-category]');
      const status = document.querySelector('[data-catalog-summary]');
      if (status) {
        status.hidden = false;
        status.textContent = `${cards.length} ${document.documentElement.lang === 'en' ? 'activities' : 'atividades'}`;
      }
      for (const link of document.querySelectorAll('a[hreflang]')) {
        const target = new URL(link.getAttribute('href'), location.origin);
        if (target.origin === location.origin && ['/atividades/', '/en/activities/'].includes(target.pathname)) {
          target.hash = selected ? selected.getAttribute('href') : '';
          link.setAttribute('href', target.pathname + target.search + target.hash);
        }
      }
    };
    syncCatalogueChoice();
    window.addEventListener('hashchange', syncCatalogueChoice);
  }

  const menu = document.querySelector('.ts-mobile-menu');
  if (!(menu instanceof HTMLDetailsElement)) {
    return;
  }

  const summary = menu.querySelector('.ts-mobile-menu__toggle');
  const panel = menu.querySelector('.ts-mobile-menu__panel');
  const closeButton = menu.querySelector('[data-menu-close]');
  if (!(summary instanceof HTMLElement) || !(panel instanceof HTMLElement) || !(closeButton instanceof HTMLButtonElement)) {
    return;
  }

  const root = document.documentElement;
  const body = document.body;
  const styleProperties = {
    root: new Map(),
    body: new Map(),
  };
  let scrollPosition = 0;
  let scrollLocked = false;

  const remember = (element, properties, target) => {
    for (const property of properties) {
      target.set(property, [element.style.getPropertyValue(property), element.style.getPropertyPriority(property)]);
    }
  };

  const restore = (element, saved) => {
    for (const [property, [value, priority]] of saved) {
      if (value) {
        element.style.setProperty(property, value, priority);
      } else {
        element.style.removeProperty(property);
      }
    }
    saved.clear();
  };

  const lockScroll = () => {
    if (scrollLocked) {
      return;
    }

    scrollPosition = window.scrollY;
    remember(root, ['overflow'], styleProperties.root);
    remember(body, ['position', 'top', 'left', 'right', 'width', 'overscroll-behavior'], styleProperties.body);
    root.style.setProperty('overflow', 'hidden');
    body.style.setProperty('position', 'fixed');
    body.style.setProperty('top', `-${scrollPosition}px`);
    body.style.setProperty('left', '0');
    body.style.setProperty('right', '0');
    body.style.setProperty('width', '100%');
    body.style.setProperty('overscroll-behavior', 'contain');
    scrollLocked = true;
  };

  const unlockScroll = (restorePosition = true) => {
    if (!scrollLocked) {
      return;
    }

    restore(body, styleProperties.body);
    restore(root, styleProperties.root);
    scrollLocked = false;
    if (restorePosition) {
      window.scrollTo({ left: 0, top: scrollPosition, behavior: 'instant' });
    }
  };

  const closeMenu = ({ returnFocus = false } = {}) => {
    if (menu.open) {
      menu.open = false;
    }
    if (returnFocus) {
      const restoreAt = scrollPosition;
      unlockScroll(false);
      summary.focus({ preventScroll: true });
      window.scrollTo({ left: 0, top: restoreAt, behavior: 'instant' });
    } else {
      unlockScroll();
    }
  };

  closeButton.hidden = false;
  menu.classList.add('is-enhanced');
  menu.addEventListener('toggle', () => {
    if (menu.open) {
      lockScroll();
    } else {
      unlockScroll();
    }
  });
  closeButton.addEventListener('click', () => closeMenu({ returnFocus: true }));
  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a[href]')) {
      closeMenu();
    }
  });
  document.addEventListener('keydown', (event) => {
    if ('Escape' === event.key && menu.open) {
      event.preventDefault();
      closeMenu({ returnFocus: true });
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) {
      closeMenu();
    }
  });

  // This is a disclosure, not a modal: Tab may leave, but must unlock the page.
  document.addEventListener('focusin', (event) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) {
      closeMenu();
    }
  });
  window.addEventListener('pagehide', () => closeMenu());

  const desktopQuery = window.matchMedia('(min-width: 64.0001rem)');
  const closeOnDesktop = (event) => {
    if (event.matches) {
      closeMenu();
    }
  };
  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', closeOnDesktop);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(closeOnDesktop);
  }
})();
