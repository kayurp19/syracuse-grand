/* Syracuse Grand: run synchronously in <head>, before any optional resources.
   Basic consent mode: no Google Analytics script or requests until opt-in. */
(function () {
  'use strict';
  const KEY = 'sg_cookie_consent';
  const HISTORY = 'sg_cookie_consent_history';
  const VERSION = '2026-10-28';
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const GA = 'G-9PGM0017B6';
  const denied = { essential: true, analytics: false, functional: false, advertising: false };
  let current = { ...denied };
  let loaded = false;
  window.dataLayer = window.dataLayer || [];
  const queue = function () { window.dataLayer.push(arguments); };
  // Do not retain pre-consent interactions for later replay.
  window.gtag = function () {
    if (arguments[0] === 'consent' || current.analytics) queue.apply(null, arguments);
  };
  queue('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied',
    ad_personalization: 'denied', functionality_storage: 'denied',
    personalization_storage: 'denied', security_storage: 'granted'
  });
  window['ga-disable-' + GA] = true;

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY));
      if (!value || value.version !== VERSION || value.essential !== true ||
          typeof value.analytics !== 'boolean' || typeof value.functional !== 'boolean' ||
          !Number.isFinite(Date.parse(value.timestamp)) ||
          Date.parse(value.timestamp) > Date.now() + 60000 ||
          Date.parse(value.expiresAt) <= Date.now() ||
          Date.parse(value.expiresAt) > Date.parse(value.timestamp) + MAX_AGE ||
          !Number.isFinite(Date.parse(value.expiresAt))) return null;
      return { ...value, advertising: false };
    } catch (_) { return null; }
  }

  function clearAnalyticsCookies() {
    const host = location.hostname;
    const parts = host.split('.');
    const domains = ['', host, '.' + host];
    for (let i = 1; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    let cookies = '';
    try { cookies = document.cookie; } catch (_) { return; }
    cookies.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (!/^(_ga(?:_|$)|_gid$|_gat|_gcl_|_fbp$|_fbc$|_uet)/.test(name)) return;
      domains.forEach(domain => {
        try {
          document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' + (domain ? '; domain=' + domain : '');
        } catch (_) {}
      });
    });
  }

  function syncEmbeds() {
    document.querySelectorAll('iframe[data-consent-src]').forEach(frame => {
      const placeholder = frame.previousElementSibling;
      if (current.functional) {
        if (!frame.getAttribute('src')) frame.src = frame.dataset.consentSrc;
        frame.hidden = false;
        if (placeholder && placeholder.matches('[data-map-placeholder]')) placeholder.hidden = true;
      } else {
        frame.removeAttribute('src');
        frame.hidden = true;
        if (placeholder && placeholder.matches('[data-map-placeholder]')) placeholder.hidden = false;
      }
    });
  }

  function apply(state) {
    current = { ...denied, ...state, advertising: false };
    window['ga-disable-' + GA] = !current.analytics;
    if (!current.analytics) clearAnalyticsCookies();
    queue('consent', 'update', {
      analytics_storage: current.analytics ? 'granted' : 'denied',
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
      functionality_storage: current.functional ? 'granted' : 'denied',
      personalization_storage: 'denied', security_storage: 'granted'
    });
    if (current.analytics && !loaded) {
      loaded = true;
      queue('js', new Date());
      queue('config', GA, {
        allow_google_signals: false, allow_ad_personalization_signals: false,
        cookie_expires: 15552000
      });
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
      script.id = 'sg-consented-analytics';
      document.head.appendChild(script);
    }
    syncEmbeds();
    document.dispatchEvent(new CustomEvent('sg:consentUpdated', { detail: { ...current } }));
  }

  function history() {
    try {
      const list = JSON.parse(localStorage.getItem(HISTORY) || '[]');
      return Array.isArray(list) ? list.filter(x => x && Date.parse(x.expiresAt) > Date.now()).slice(-20) : [];
    } catch (_) { return []; }
  }

  function save(state, action) {
    const withdrawAnalytics = loaded && current.analytics && !state.analytics;
    const now = Date.now();
    const receipt = {
      ...denied, analytics: !!state.analytics, functional: !!state.functional,
      version: VERSION, timestamp: new Date(now).toISOString(),
      expiresAt: new Date(now + MAX_AGE).toISOString(),
      action: action || 'save-preferences',
      recordId: window.crypto && crypto.randomUUID ? crypto.randomUUID() : now.toString(36),
      globalPrivacyControl: navigator.globalPrivacyControl === true
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(receipt));
      localStorage.setItem(HISTORY, JSON.stringify([...history(), receipt].slice(-20)));
    } catch (_) { /* Choice applies for this page; unavailable storage never grants consent. */ }
    apply(receipt);
    // A loaded third-party library cannot be reliably unloaded: reload after withdrawal.
    if (withdrawAnalytics) location.reload();
    return receipt;
  }
  window.SGConsent = { read, save, apply, history, defaults: denied, version: VERSION,
    has: category => current[category] === true };
  apply(read() || denied);
  document.addEventListener('DOMContentLoaded', syncEmbeds);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-enable-map]')) save({ ...current, functional: true }, 'enable-map');
  });
  window.addEventListener('storage', event => {
    if (event.key === KEY || event.key === null) {
      const next = read() || denied;
      const withdraw = loaded && current.analytics && !next.analytics;
      apply(next);
      if (withdraw) location.reload();
    }
  });
})();
