/* ============================================================
   SYRACUSE GRAND — Site-wide chrome (header, footer, mobile bar)
   This file is loaded at the END of every page and renders the
   shared header, mobile drawer, footer, and mobile booking bar.

   To edit nav links, phone number, address, or the booking URL,
   change them HERE — they propagate to every page automatically.
   ============================================================ */

const BOOKING_URL = "https://reservations.verticalbooking.com/premium/index.html?id_albergo=29493&dc=3887&lingua_int=usa&id_stile=22079";
const PHONE       = "(315) 701-4400";
const PHONE_TEL   = "tel:+13157014400";
const ADDRESS_1   = "136 Transistor Pkwy";
const ADDRESS_2   = "Liverpool, NY 13088";

const NAV = [
  { href: "index.html",      label: "Home"       },
  { href: "rooms.html",      label: "Rooms"      },
  { href: "amenities.html",  label: "Amenities"  },
  { href: "meetings.html",   label: "Meetings"   },
  { href: "groups.html",     label: "Groups"     },
  { href: "local-area.html", label: "Local Area" },
  { href: "blog/index.html", label: "Journal"    },
  { href: "contact.html",    label: "Contact"    },
];

// Real Syracuse Grand logo mark — gold version for light bg, white version for dark bg.
// CSS swaps which is visible based on header state (.header--transparent vs .header--solid).
const LOGO_IMG = `
  <img class="logo-mark logo-mark--gold" src="./assets/images/logo-mark.png" alt="Syracuse Grand" width="32" height="45">
  <img class="logo-mark logo-mark--white" src="./assets/images/logo-mark-white.png" alt="" aria-hidden="true" width="32" height="45">`;

const ARROW_SVG = `<svg class="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>`;

function renderHeader(transparent = false) {
  const cls = transparent ? "header header--transparent" : "header header--solid";
  return `
  <header class="${cls}" ${transparent ? '' : 'data-solid="true"'}>
    <div class="container header__inner">
      <a href="index.html" class="header__logo" aria-label="Syracuse Grand home">
        <span class="header__logo-mark">${LOGO_IMG}</span>
        <span class="header__logo-text">SYRACUSE GRAND</span>
      </a>
      <nav class="header__nav" aria-label="Primary">
        ${NAV.map(n => `<a href="${n.href}" data-nav>${n.label}</a>`).join('')}
      </nav>
      <a class="btn btn--gold header__cta" href="${BOOKING_URL}" target="_blank" rel="noopener noreferrer">Book Now ${ARROW_SVG}</a>
      <button class="header__menu-btn" aria-label="Open menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
  </header>
  <nav class="mobile-nav" aria-label="Mobile">
    <button class="mobile-nav__close" aria-label="Close menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    ${NAV.map(n => `<a href="${n.href}" data-nav>${n.label}</a>`).join('')}
    <a class="btn btn--gold" href="${BOOKING_URL}" target="_blank" rel="noopener noreferrer">Book Now</a>
  </nav>`;
}

function renderFooter() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div>
          <a href="index.html" class="footer__logo">
            <span class="footer__logo-mark"><img src="./assets/images/logo-mark.png" alt="Syracuse Grand" width="36" height="50"></span>
            <span class="footer__logo-text">SYRACUSE GRAND</span>
          </a>
          <p style="font-size: 14px; line-height: 1.7; max-width: 36ch;">A modern, welcoming hotel in Liverpool, NY — free hot breakfast, indoor pool &amp; hot tub, 24-hour fitness center, free parking, and free Wi-Fi. Minutes from the airport, Destiny USA, and Syracuse University.</p>
        </div>
        <div>
          <h4>Visit</h4>
          <ul>
            <li>${ADDRESS_1}</li>
            <li>${ADDRESS_2}</li>
            <li><a href="${PHONE_TEL}">${PHONE}</a></li>
          </ul>
        </div>
        <div>
          <h4>Stay</h4>
          <ul>
            <li><a href="rooms.html">Rooms</a></li>
            <li><a href="amenities.html">Amenities</a></li>
            <li><a href="meetings.html">Meetings</a></li>
            <li><a href="groups.html">Groups</a></li>
          </ul>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><a href="local-area.html">Local Area</a></li>
            <li><a href="blog/index.html">Journal</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="${BOOKING_URL}" target="_blank" rel="noopener noreferrer">Book Now</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© <span data-year></span> Syracuse Grand. All rights reserved.</span>
        <span>Liverpool, New York · Central NY</span>
      </div>
    </div>
  </footer>
  <div class="mobile-book">
    <a class="btn btn--ghost-light" href="${PHONE_TEL}" style="border-color: rgba(255,255,255,.4); color:#fff;">Call</a>
    <a class="btn btn--gold" href="${BOOKING_URL}" target="_blank" rel="noopener noreferrer">Book Now</a>
  </div>`;
}

// Render on DOM ready
(function () {
  const headerSlot = document.querySelector('[data-include="header"]');
  const footerSlot = document.querySelector('[data-include="footer"]');
  const transparent = headerSlot && headerSlot.dataset.transparent === "true";
  if (headerSlot) headerSlot.outerHTML = renderHeader(transparent);
  if (footerSlot) footerSlot.outerHTML = renderFooter();

  // Replace any [data-booking] href placeholders with the live booking URL
  document.querySelectorAll('[data-booking]').forEach(a => {
    a.setAttribute('href', BOOKING_URL);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
})();
