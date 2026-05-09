/* ============================================================
   SYRACUSE GRAND — Cookie Consent Banner
   Operated by Kevidco LLC. US-style notice with category opt-in/out.
   Stores preferences in localStorage (key: sg_cookie_consent).
   Integrates with Google Consent Mode v2 if gtag is present.
   ============================================================ */

(function () {
  const STORAGE_KEY = 'sg_cookie_consent';
  const VERSION = '1';

  // ---- Default state (before consent): only essential allowed ----
  const DEFAULTS = {
    version: VERSION,
    timestamp: null,
    essential: true,        // always on, cannot be disabled
    analytics: false,
    advertising: false,
    functional: false,
  };

  function readConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.version !== VERSION) return null;
      return parsed;
    } catch (e) { return null; }
  }

  function writeConsent(state) {
    state.version = VERSION;
    state.timestamp = new Date().toISOString();
    state.essential = true;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    applyConsent(state);
  }

  function applyConsent(state) {
    // Google Consent Mode v2 — emit gtag updates if Google tags are present
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage:        state.advertising ? 'granted' : 'denied',
        ad_user_data:      state.advertising ? 'granted' : 'denied',
        ad_personalization:state.advertising ? 'granted' : 'denied',
        analytics_storage: state.analytics  ? 'granted' : 'denied',
        functionality_storage: state.functional ? 'granted' : 'denied',
        personalization_storage: state.functional ? 'granted' : 'denied',
        security_storage: 'granted',
      });
    }
    // Custom event so other scripts can react
    document.dispatchEvent(new CustomEvent('sg:consentUpdated', { detail: state }));
  }

  // ---- Banner DOM ----
  function buildBanner() {
    const wrap = document.createElement('div');
    wrap.className = 'cookie-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-live', 'polite');
    wrap.setAttribute('aria-label', 'Cookie consent');
    wrap.innerHTML = `
      <button class="cookie-banner__close" aria-label="Close cookie notice" data-cookie-close>&times;</button>
      <div class="cookie-banner__inner">
        <div class="cookie-banner__copy">
          <p class="cookie-banner__title">We value your privacy</p>
          <p class="cookie-banner__text">
            This website uses cookies to enhance your experience, analyze traffic, and personalize content.
            We also share information about your use of our site with our analytics and advertising partners.
            See our <a href="/cookies.html">Cookie Policy</a> and <a href="/privacy.html">Privacy Policy</a>.
          </p>
        </div>
        <div class="cookie-banner__actions">
          <button class="cookie-btn cookie-btn--ghost" data-cookie-action="reject">Reject All</button>
          <button class="cookie-btn cookie-btn--ghost" data-cookie-action="manage">Manage Preferences</button>
          <button class="cookie-btn cookie-btn--gold" data-cookie-action="accept">Accept All</button>
        </div>
      </div>`;
    return wrap;
  }

  function buildModal(currentState) {
    const overlay = document.createElement('div');
    overlay.className = 'cookie-modal__overlay';
    overlay.innerHTML = `
      <div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
        <button class="cookie-modal__close" aria-label="Close" data-cookie-close-modal>&times;</button>
        <div class="cookie-modal__head">
          <h2 id="cookie-modal-title">Manage Cookie Preferences</h2>
          <p>Choose which categories of cookies you allow on syracusegrand.com. Essential cookies are always on because the site needs them to work. You can change these settings any time by selecting "Cookie Settings" in the footer.</p>
        </div>
        <div class="cookie-modal__categories">
          <label class="cookie-cat">
            <div class="cookie-cat__head">
              <span class="cookie-cat__name">Strictly Necessary</span>
              <span class="cookie-cat__toggle cookie-cat__toggle--locked">Always On</span>
            </div>
            <p>Required for the site to function: navigation, secure areas, and form submission. Cannot be disabled.</p>
          </label>
          <label class="cookie-cat">
            <div class="cookie-cat__head">
              <span class="cookie-cat__name">Functional</span>
              <input type="checkbox" data-cookie-cat="functional" ${currentState.functional ? 'checked' : ''} />
            </div>
            <p>Remembers preferences such as language, region, and chat widgets to personalize your experience.</p>
          </label>
          <label class="cookie-cat">
            <div class="cookie-cat__head">
              <span class="cookie-cat__name">Analytics &amp; Performance</span>
              <input type="checkbox" data-cookie-cat="analytics" ${currentState.analytics ? 'checked' : ''} />
            </div>
            <p>Helps us understand how visitors use the site so we can improve it. Includes Google Analytics.</p>
          </label>
          <label class="cookie-cat">
            <div class="cookie-cat__head">
              <span class="cookie-cat__name">Advertising</span>
              <input type="checkbox" data-cookie-cat="advertising" ${currentState.advertising ? 'checked' : ''} />
            </div>
            <p>Used to deliver and measure relevant ads on third-party sites, including Google Ads and Meta Pixel.</p>
          </label>
        </div>
        <div class="cookie-modal__actions">
          <button class="cookie-btn cookie-btn--ghost" data-cookie-modal-action="reject">Reject All</button>
          <button class="cookie-btn cookie-btn--ghost" data-cookie-modal-action="accept">Accept All</button>
          <button class="cookie-btn cookie-btn--gold" data-cookie-modal-action="save">Save Preferences</button>
        </div>
      </div>`;
    return overlay;
  }

  // ---- Initial Google Consent Mode v2 default (denied) ----
  // Set BEFORE any tag fires. Safe even if gtag not yet loaded — queues into dataLayer.
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  if (!window.gtag) window.gtag = gtag;
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  });

  // ---- Wire up ----
  document.addEventListener('DOMContentLoaded', function () {
    const existing = readConsent();
    if (existing) applyConsent(existing);

    let bannerEl = null;
    let modalEl = null;

    function showBanner() {
      if (bannerEl) return;
      bannerEl = buildBanner();
      document.body.appendChild(bannerEl);
      requestAnimationFrame(() => bannerEl.classList.add('cookie-banner--in'));
    }
    function hideBanner() {
      if (!bannerEl) return;
      bannerEl.classList.remove('cookie-banner--in');
      setTimeout(() => { bannerEl && bannerEl.remove(); bannerEl = null; }, 240);
    }
    function showModal(state) {
      if (modalEl) return;
      modalEl = buildModal(state || readConsent() || DEFAULTS);
      document.body.appendChild(modalEl);
      requestAnimationFrame(() => modalEl.classList.add('cookie-modal__overlay--in'));
      document.body.style.overflow = 'hidden';
    }
    function hideModal() {
      if (!modalEl) return;
      modalEl.classList.remove('cookie-modal__overlay--in');
      document.body.style.overflow = '';
      setTimeout(() => { modalEl && modalEl.remove(); modalEl = null; }, 240);
    }

    // Banner clicks
    document.addEventListener('click', function (e) {
      const action = e.target.closest('[data-cookie-action]');
      if (action) {
        const a = action.getAttribute('data-cookie-action');
        if (a === 'accept') {
          writeConsent({ analytics: true, advertising: true, functional: true });
          hideBanner();
        } else if (a === 'reject') {
          writeConsent({ analytics: false, advertising: false, functional: false });
          hideBanner();
        } else if (a === 'manage') {
          showModal();
        }
        return;
      }
      if (e.target.closest('[data-cookie-close]')) {
        // "Close" = treat as reject-all (US standard) but keep banner closed
        writeConsent({ analytics: false, advertising: false, functional: false });
        hideBanner();
        return;
      }
      if (e.target.closest('[data-cookie-close-modal]')) {
        hideModal();
        return;
      }
      const modalAction = e.target.closest('[data-cookie-modal-action]');
      if (modalAction) {
        const a = modalAction.getAttribute('data-cookie-modal-action');
        if (a === 'accept') {
          writeConsent({ analytics: true, advertising: true, functional: true });
        } else if (a === 'reject') {
          writeConsent({ analytics: false, advertising: false, functional: false });
        } else if (a === 'save') {
          const state = { analytics: false, advertising: false, functional: false };
          modalEl.querySelectorAll('[data-cookie-cat]').forEach(input => {
            state[input.getAttribute('data-cookie-cat')] = !!input.checked;
          });
          writeConsent(state);
        }
        hideModal();
        hideBanner();
        return;
      }
      // Footer "Cookie Settings" link
      if (e.target.closest('[data-cookie-settings]')) {
        e.preventDefault();
        showModal();
        return;
      }
    });

    // First-visit banner
    if (!existing) showBanner();
  });
})();
