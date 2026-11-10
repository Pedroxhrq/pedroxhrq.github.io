(() => {
  'use strict';

  const messages = globalThis.portfolioMessages;
  if (!messages) return;
  const storageKey = 'portfolio-language';
  const siteBase = new URL('./', document.currentScript.src);
  const publicBase = new URL(document.documentElement.dataset.siteUrl);
  const paths = { en: 'en/', 'pt-BR': 'pt-br/' };
  let locale = 'en';

  // Root-to-language navigation changes URL depth without replacing the document.
  // Keep loaded resource URLs anchored to their original location; fragment links
  // still resolve against the current language route.
  document.querySelectorAll('link[href], script[src]').forEach((node) => {
    const attribute = node.tagName === 'SCRIPT' ? 'src' : 'href';
    node.setAttribute(attribute, new URL(node.getAttribute(attribute), document.baseURI).href);
  });

  const normalizeLocale = (value) => {
    if (typeof value !== 'string') return null;
    const normalized = value.toLowerCase();
    if (normalized === 'en') return 'en';
    if (normalized === 'pt' || normalized === 'pt-br') return 'pt-BR';
    return null;
  };

  const t = (key, params = {}) => {
    const message = messages[locale][key] ?? messages.en[key] ?? key;
    return message.replace(/\{(\w+)\}/g, (match, name) => params[name] === undefined ? match : String(params[name]));
  };

  const preferredLocale = () => {
    let saved;
    try { saved = normalizeLocale(localStorage.getItem(storageKey)); } catch { /* Storage is optional. */ }
    const browserLanguage = navigator.languages?.[0] || navigator.language || 'en';
    return saved || (/^pt(?:-|$)/i.test(browserLanguage) ? 'pt-BR' : 'en');
  };

  const localeFromLocation = () => {
    const url = new URL(window.location.href);
    const requested = normalizeLocale(url.searchParams.get('lang'));
    if (requested) return requested;
    const localPath = url.pathname.startsWith(siteBase.pathname)
      ? url.pathname.slice(siteBase.pathname.length).replace(/index\.html$/, '') : '';
    const routed = Object.keys(paths).find((key) => paths[key] === localPath);
    // Root history entries remember their original locale after preferences change.
    return routed || normalizeLocale(history.state?.portfolioLocale) || preferredLocale();
  };

  const languageUrl = (nextLocale) => {
    const url = new URL(paths[nextLocale], siteBase);
    const current = new URL(window.location.href);
    url.search = current.search;
    url.searchParams.delete('lang');
    url.hash = current.hash;
    return url;
  };

  const updateLinks = () => {
    document.querySelectorAll('[data-language]').forEach((anchor) => {
      anchor.href = languageUrl(anchor.dataset.language).href;
    });
  };

  const render = () => {
    document.documentElement.lang = locale;
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    ['aria-label', 'placeholder', 'title', 'content'].forEach((attribute) => {
      document.querySelectorAll(`[data-i18n-${attribute}]`).forEach((node) => {
        node.setAttribute(attribute, t(node.getAttribute(`data-i18n-${attribute}`)));
      });
    });
    document.querySelectorAll('[data-language]').forEach((anchor) => {
      if (anchor.dataset.language === locale) anchor.setAttribute('aria-current', 'true');
      else anchor.removeAttribute('aria-current');
    });
    const canonical = new URL(paths[locale], publicBase).href;
    const setMeta = (selector, content) => document.querySelector(selector)?.setAttribute('content', content);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
    setMeta('meta[property="og:url"]', canonical);
    setMeta('meta[property="og:locale"]', locale === 'en' ? 'en_US' : 'pt_BR');
    setMeta('meta[property="og:locale:alternate"]', locale === 'en' ? 'pt_BR' : 'en_US');
    updateLinks();
  };

  const applyLocale = (nextLocale, announce = true) => {
    const scrollPosition = { left: window.scrollX, top: window.scrollY };
    const changed = locale !== nextLocale;
    locale = nextLocale;
    render();
    if (changed) {
      document.dispatchEvent(new CustomEvent('portfolio:languagechange', { detail: { locale } }));
      if (announce) {
        const status = document.querySelector('#language-status');
        if (status) status.textContent = t('language.changed');
      }
    }
    window.scrollTo({ ...scrollPosition, behavior: 'instant' });
  };

  const setLocale = (value) => {
    const nextLocale = normalizeLocale(value);
    if (!nextLocale) return false;
    const url = languageUrl(nextLocale);
    try {
      if (url.href !== window.location.href) {
        history.pushState({ ...history.state, portfolioLocale: nextLocale }, '', url);
      }
    } catch { /* File previews may disallow history updates. */ }
    try { localStorage.setItem(storageKey, nextLocale); } catch { /* A blocked store must not prevent switching. */ }
    applyLocale(nextLocale);
    return true;
  };

  locale = localeFromLocation();
  try { history.replaceState({ ...history.state, portfolioLocale: locale }, '', window.location.href); } catch { /* History is optional in file previews. */ }
  window.portfolioI18n = Object.freeze({ getLocale: () => locale, setLocale, t });
  render();
  document.querySelectorAll('[data-language]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      setLocale(anchor.dataset.language);
    });
  });
  window.addEventListener('popstate', () => applyLocale(localeFromLocation()));
  window.addEventListener('hashchange', updateLinks);
})();
