/* Allowlisted, non-persistent context for the disabled contact preview. */
(() => {
  const preview = document.querySelector('[data-enquiry-preview]');
  if (!preview) return;

  const audiences = new Set(['general', 'individuals', 'families', 'groups', 'schools', 'companies', 'professionals']);
  const sources = new Set(['homepage', 'catalog', 'activity', 'groups', 'schools', 'companies', 'faq', 'navigation', 'footer', 'other']);
  const safeToken = (value) => typeof value === 'string'
    && value.length > 0
    && value.length <= 80
    && /^[a-z0-9][a-z0-9._-]*$/i.test(value);
  const params = new URLSearchParams(window.location.search);
  // Reject ambiguous repeated keys. Read only the four non-personal hints.
  const unique = (key) => params.getAll(key).length === 1 ? params.get(key) : null;
  const activityId = unique('activity_id');
  const activitySlug = unique('activity');
  const audienceValue = unique('audience');
  const sourceValue = unique('source');
  const activitySelect = preview.querySelector('[data-prefill-activity]');
  const activityOptions = activitySelect ? [...activitySelect.options] : [...preview.querySelectorAll('[data-contact-activities] [data-activity-id]')].map(node => ({ value: node.getAttribute('value'), dataset: node.dataset, textContent: node.textContent }));
  const hasActivityHint = params.has('activity_id') || params.has('activity');
  // The generated activity route is a trusted no-JS fallback, not query data.
  let selectedOption = hasActivityHint ? null : activityOptions.find((option) =>
    option.dataset.activityId === 'true' && option.value === preview.dataset.selectedActivityId) ?? null;
  const ambiguousActivity = params.getAll('activity_id').length > 1 || params.getAll('activity').length > 1;
  if (!ambiguousActivity && safeToken(activityId)) {
    const idOption = activityOptions.find((option) => option.dataset.activityId === 'true' && option.value === activityId) ?? null;
    const slugMatchesId = !activitySlug || (safeToken(activitySlug) && idOption && [idOption.dataset.slugPt, idOption.dataset.slugEn].includes(activitySlug));
    if (idOption && slugMatchesId) selectedOption = idOption;
  }
  if (!ambiguousActivity && !selectedOption && !params.has('activity_id') && safeToken(activitySlug)) {
    selectedOption = activityOptions.find((option) => option.dataset.activityId === 'true' && (option.dataset.slugPt === activitySlug || option.dataset.slugEn === activitySlug)) ?? null;
  }
  if (activitySelect) activitySelect.value = selectedOption?.value ?? '';
  preview.dataset.selectedActivityId = selectedOption?.value ?? '';

  if (audienceValue && audiences.has(audienceValue)) preview.dataset.prefillAudience = audienceValue;
  if (sourceValue && sources.has(sourceValue)) preview.dataset.prefillSource = sourceValue;

  // Locale comes from the active PT/EN route, never from a query-string hint.
  const locale = document.documentElement.lang === 'en' ? 'en' : 'pt-PT';
  preview.dataset.prefillLocale = locale;
  const audienceLabels = locale === 'en'
    ? { individuals: 'Individuals', families: 'Families', groups: 'Groups', schools: 'Schools', companies: 'Companies', professionals: 'Professionals' }
    : { individuals: 'Particulares', families: 'Famílias', groups: 'Grupos', schools: 'Escolas', companies: 'Empresas', professionals: 'Profissionais' };
  const summary = [
    selectedOption?.textContent?.trim(),
    preview.dataset.prefillAudience !== 'general' ? audienceLabels[preview.dataset.prefillAudience] : '',
  ].filter(Boolean);
  const contextNode = preview.querySelector('[data-enquiry-context]');
  if (contextNode) contextNode.textContent = summary.length ? summary.join(' · ')
    : preview.hasAttribute('data-public-contact') ? (locale === 'en' ? 'We can help you choose an activity.' : 'Podemos ajudá-lo a escolher uma atividade.')
    : locale === 'en' ? 'No request details selected.' : 'Nenhum detalhe do pedido selecionado.';

  // Context is exclusively a curated activity/audience label, never raw URL input or personal details.
  if (preview.hasAttribute('data-public-contact')) {
    const en = locale === 'en';
    const label = summary.join(' · ').replace(/[\r\n\x00-\x1f]/g, ' ').slice(0, 360);
    const subject = `${en ? 'Activity enquiry' : 'Pedido de informação'}${label ? ` — ${label}` : ''}`;
    const body = en ? `Hello, I would like information${label ? ` about ${label}` : ' about your activities'}.\nPreferred date and group size: ` : `Olá, gostaria de informações${label ? ` sobre ${label}` : ' sobre as vossas atividades'}.\nData pretendida e número de participantes: `;
    preview.querySelector('[data-context-channel="email"]')?.setAttribute('href', `mailto:geral@transserrano.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    preview.querySelector('[data-context-channel="whatsapp"]')?.setAttribute('href', `https://wa.me/351961787772?text=${encodeURIComponent(body)}`);
  }

  // Rebuild the language links from safe context, never copying the query.
  for (const link of document.querySelectorAll('.ts-language-switcher a[hreflang]')) {
    const targetLocale = link.getAttribute('hreflang');
    if (!['pt-PT', 'en'].includes(targetLocale)) continue;
    const target = new URL(link.getAttribute('href'), window.location.href);
    // Keep server-issued native draft addressing only in the opted-in private lab.
    const nativePreview = document.body.classList.contains('ts-local-private-lab')
      && target.origin === window.location.origin && target.searchParams.get('preview') === 'true';
    const nativeAddress = nativePreview ? ['page_id', 'p', 'post_type', 'preview']
      .flatMap(key => target.searchParams.has(key) ? [[key, target.searchParams.get(key)]] : []) : [];
    if (target.origin !== window.location.origin) continue;
    target.search = '';
    for (const [key, value] of nativeAddress) target.searchParams.set(key, value);
    const translatedSlug = targetLocale === 'en' ? selectedOption?.dataset.slugEn : selectedOption?.dataset.slugPt;
    // Rejecting an explicit activity hint must not retain a stale activity path.
    const contactMatch = target.pathname.match(/^(.*\/(?:contactos|contact)\/)/);
    if (contactMatch) target.pathname = contactMatch[1] + (translatedSlug ? `${translatedSlug}/` : '');
    if (selectedOption) {
      target.searchParams.set('activity_id', selectedOption.value);
      target.searchParams.set('activity', translatedSlug);
    }
    target.searchParams.set('audience', audiences.has(preview.dataset.prefillAudience) ? preview.dataset.prefillAudience : 'general');
    target.searchParams.set('source', sources.has(preview.dataset.prefillSource) ? preview.dataset.prefillSource : 'other');
    target.searchParams.set('locale', targetLocale);
    target.hash = 'request';
    link.setAttribute('href', `${target.pathname}${target.search}${target.hash}`);
  }

  const composition = preview.querySelector('.ts-enquiry-preview__composition');
  if (composition && ['schools', 'families'].includes(preview.dataset.prefillAudience)) composition.open = true;

  // Connectivity changes the explanation, never enables the form or transport.
  const status = preview.querySelector('#enquiry-preview-status');
  const statusTitle = status?.querySelector('strong');
  const statusBody = status?.querySelector('p');
  const initialStatus = [statusTitle?.textContent, statusBody?.textContent];
  const updateConnection = () => {
    const offline = navigator.onLine === false;
    preview.dataset.enquiryState = offline ? 'offline' : 'unavailable';
    if (!statusTitle || !statusBody) return;
    statusTitle.textContent = offline ? (locale === 'en' ? 'You are offline' : 'Está sem ligação à internet') : initialStatus[0];
    statusBody.textContent = offline ? (locale === 'en'
      ? 'The form is still disabled. Nothing is sent or saved. Telephone numbers remain visible; online channels need a connection.'
      : 'O formulário continua desativado. Nada é enviado ou guardado. Os números de telefone continuam visíveis; os canais online precisam de ligação.') : initialStatus[1];
  };
  window.addEventListener('offline', updateConnection);
  window.addEventListener('online', updateConnection);
  updateConnection();
})();
