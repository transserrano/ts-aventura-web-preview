/* First-party enhancement of native links to owner-authorized photographs. */
(() => {
  const galleries = [...document.querySelectorAll('[data-activity-gallery]')];
  if (!galleries.length || typeof window.HTMLDialogElement !== 'function'
    || typeof window.HTMLDialogElement.prototype.showModal !== 'function') return;
  const imageRoot = '/wp-content/themes/ts-aventura/assets/images/';
  const ownedJpeg = value => typeof value === 'string' && value.startsWith(imageRoot)
    && value.endsWith('.jpg') && value.slice(imageRoot.length).split('/').every(part =>
      /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(part) && part !== '.' && part !== '..');
  let dialog, image, caption, counter, heading, previous, next, close;
  let photos = [], current = 0, opener = null, labels, scrollStyles = [];
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const restore = () => {
    for (const [style, value, priority] of scrollStyles) {
      if (value) style.setProperty('overflow', value, priority);
      else style.removeProperty('overflow');
    }
    scrollStyles = [];
    image.removeAttribute('src');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  };
  const showPhoto = index => {
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    image.alt = photo.alt;
    image.src = photo.href;
    counter.textContent = `${current + 1} / ${photos.length}`;
    caption.textContent = photo.caption || photo.alt;
  };
  const createDialog = () => {
    dialog = element('dialog', 'ts-activity-gallery-dialog');
    dialog.setAttribute('aria-labelledby', 'activity-gallery-dialog-heading');
    dialog.setAttribute('aria-describedby', 'activity-gallery-dialog-caption');
    const header = element('div', 'ts-activity-gallery-dialog__header');
    heading = element('h2', 'ts-activity-gallery-dialog__heading');
    heading.id = 'activity-gallery-dialog-heading';
    close = element('button', 'ts-activity-gallery-dialog__close');
    close.type = 'button';
    close.autofocus = true;
    header.append(heading, close);
    const figure = element('figure', 'ts-activity-gallery-dialog__figure');
    image = element('img', 'ts-activity-gallery-dialog__image');
    image.decoding = 'async';
    const description = element('figcaption', 'ts-activity-gallery-dialog__description');
    description.id = 'activity-gallery-dialog-caption';
    description.setAttribute('aria-live', 'polite');
    description.setAttribute('aria-atomic', 'true');
    counter = element('span', 'ts-activity-gallery-dialog__counter');
    caption = element('span', 'ts-activity-gallery-dialog__caption');
    description.append(counter, caption);
    figure.append(image, description);
    const controls = element('nav', 'ts-activity-gallery-dialog__controls');
    previous = element('button', 'ts-activity-gallery-dialog__previous');
    next = element('button', 'ts-activity-gallery-dialog__next');
    previous.type = next.type = 'button';
    controls.append(previous, next);
    dialog.append(header, figure, controls);
    document.body.append(dialog);
    close.addEventListener('click', () => dialog.close());
    previous.addEventListener('click', () => showPhoto(current - 1));
    next.addEventListener('click', () => showPhoto(current + 1));
    dialog.addEventListener('close', restore);
    dialog.addEventListener('cancel', event => { event.preventDefault(); dialog.close(); });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'Escape') { event.preventDefault(); dialog.close(); }
      if (photos.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        showPhoto(current + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
  };
  for (const gallery of galleries) gallery.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const link = event.target.closest('a[data-gallery-photo]');
    if (!link || !gallery.contains(link) || !ownedJpeg(link.getAttribute('href'))) return;
    const links = [...gallery.querySelectorAll('a[data-gallery-photo]')].filter(node => ownedJpeg(node.getAttribute('href')));
    const selected = links.indexOf(link);
    if (selected < 0) return;
    if (!dialog) createDialog();
    if (dialog.open) return;
    const en = gallery.dataset.galleryLocale === 'en';
    labels = en ? { close: 'Close photographs', previous: 'Previous photograph', next: 'Next photograph', navigation: 'Photograph navigation', title: 'Activity photographs' }
      : { close: 'Fechar fotografias', previous: 'Fotografia anterior', next: 'Fotografia seguinte', navigation: 'Navegação das fotografias', title: 'Fotografias da atividade' };
    heading.textContent = gallery.dataset.galleryTitle || labels.title;
    close.textContent = labels.close;
    previous.textContent = `← ${labels.previous}`;
    next.textContent = `${labels.next} →`;
    previous.parentElement.setAttribute('aria-label', labels.navigation);
    previous.hidden = next.hidden = links.length < 2;
    photos = links.map(node => ({ href: node.getAttribute('href'), alt: node.dataset.galleryAlt || node.querySelector('img')?.alt || '', caption: node.dataset.galleryCaption || '' }));
    opener = link;
    try {
      dialog.showModal();
      scrollStyles = [document.documentElement.style, document.body.style].map(style =>
        [style, style.getPropertyValue('overflow'), style.getPropertyPriority('overflow')]);
      for (const [style] of scrollStyles) style.setProperty('overflow', 'hidden');
      showPhoto(selected);
      close.focus({ preventScroll: true });
      event.preventDefault();
    } catch {
      if (dialog.open) dialog.close();
      else restore();
    }
  });
  window.addEventListener('pagehide', () => { if (dialog?.open) dialog.close(); });
})();
