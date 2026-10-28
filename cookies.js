/* ============================================================
   SYRACUSE GRAND — Cookie Consent Banner
   Operated by Kevidco LLC. Optional services require an affirmative choice.
   Stores preferences in localStorage (key: sg_cookie_consent).
   Integrates with Google Consent Mode v2 if gtag is present.
   ============================================================ */

(function () {
  const engine = window.SGConsent;
  if (!engine) return;
  const DEFAULTS = engine.defaults;
  const readConsent = engine.read;
  const writeConsent = engine.save;

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
            Optional Google Analytics and embedded Google Maps stay off until you allow them.
            Accept, reject, or choose your preferences. You can change your choice using Cookie Settings at any time.
            See our <a href="/cookies">Cookie Policy</a> and <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
        <div class="cookie-banner__actions">
          <button class="cookie-btn cookie-btn--gold" data-cookie-action="reject">Reject All</button>
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
            <p>Remembers your privacy choice and dismissed notices. Booking links, navigation and the contact form work without optional tracking.</p>
          </label>
          <label class="cookie-cat">
            <div class="cookie-cat__head">
              <span class="cookie-cat__name">Functional</span>
              <input type="checkbox" data-cookie-cat="functional" ${currentState.functional ? 'checked' : ''} />
            </div>
            <p>Allows the embedded Google Maps location map. Google receives your IP address and browser information when the map loads.</p>
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
              <span class="cookie-cat__toggle cookie-cat__toggle--locked">Not in use</span>
            </div>
            <p>No Google Ads conversion tag, Meta Pixel or Bing UET tag is installed on this website. Advertising consent stays denied, including when Global Privacy Control is enabled.</p>
          </label>
        </div>
        <p class="cookie-receipt" data-cookie-receipt></p>
        <button class="cookie-btn cookie-btn--ghost" data-cookie-download>Download my consent record</button>
        <div class="cookie-modal__actions">
          <button class="cookie-btn cookie-btn--ghost" data-cookie-modal-action="reject">Reject All</button>
          <button class="cookie-btn cookie-btn--ghost" data-cookie-modal-action="accept">Accept All</button>
          <button class="cookie-btn cookie-btn--gold" data-cookie-modal-action="save">Save Preferences</button>
        </div>
      </div>`;
    return overlay;
  }

  // ---- Wire up ----
  document.addEventListener('DOMContentLoaded', function () {
    const existing = readConsent();
    let bannerEl = null;
    let modalEl = null;
    let previousFocus = null;

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
      previousFocus = document.activeElement;
      modalEl = buildModal(state || readConsent() || DEFAULTS);
      document.body.appendChild(modalEl);
      const record = readConsent();
      modalEl.querySelector('[data-cookie-receipt]').textContent = record
        ? 'Choice saved on this browser: ' + new Date(record.timestamp).toLocaleString() + '. Policy version: ' + record.version + '. Records remain on this device, not a central consent database.'
        : 'No saved choice on this browser. Your optional services remain off until you choose. Records are saved on this device for up to 180 days.';
      requestAnimationFrame(() => modalEl.classList.add('cookie-modal__overlay--in'));
      document.body.style.overflow = 'hidden';
      modalEl.querySelector('button').focus();
    }
    function hideModal() {
      if (!modalEl) return;
      modalEl.classList.remove('cookie-modal__overlay--in');
      document.body.style.overflow = '';
      setTimeout(() => { modalEl && modalEl.remove(); modalEl = null; }, 240);
      if (previousFocus) previousFocus.focus();
    }

    // Banner clicks
    document.addEventListener('click', function (e) {
      const action = e.target.closest('[data-cookie-action]');
      if (action) {
        const a = action.getAttribute('data-cookie-action');
        if (a === 'accept') {
          writeConsent({ analytics: true, functional: true }, 'accept-all');
          hideBanner();
        } else if (a === 'reject') {
          writeConsent({ analytics: false, functional: false }, 'reject-all');
          hideBanner();
        } else if (a === 'manage') {
          showModal();
        }
        return;
      }
      if (e.target.closest('[data-cookie-close]')) {
        writeConsent({ analytics: false, functional: false }, 'dismiss-reject');
        hideBanner();
        return;
      }
      if (e.target.closest('[data-cookie-close-modal]')) {
        hideModal();
        return;
      }
      if (e.target.closest('[data-cookie-download]')) {
        const blob = new Blob([JSON.stringify({ current: readConsent(), history: engine.history() }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'syracuse-grand-consent-record.json';
        a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
      }
      const modalAction = e.target.closest('[data-cookie-modal-action]');
      if (modalAction) {
        const a = modalAction.getAttribute('data-cookie-modal-action');
        if (a === 'accept') {
          writeConsent({ analytics: true, functional: true }, 'accept-all');
        } else if (a === 'reject') {
          writeConsent({ analytics: false, functional: false }, 'reject-all');
        } else if (a === 'save') {
          const state = { analytics: false, advertising: false, functional: false };
          modalEl.querySelectorAll('[data-cookie-cat]').forEach(input => {
            state[input.getAttribute('data-cookie-cat')] = !!input.checked;
          });
          writeConsent(state, 'save-preferences');
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
    document.addEventListener('keydown', function (e) {
      if (!modalEl) return;
      if (e.key === 'Escape') { hideModal(); return; }
      if (e.key !== 'Tab') return;
      const items = modalEl.querySelectorAll('button, input:not([disabled]), a[href]');
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // First-visit banner
    document.addEventListener('sg:consentUpdated', function () {
      if (readConsent()) hideBanner();
    });
    if (!existing) showBanner();
  });
})();
