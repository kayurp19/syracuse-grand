/* Header scroll, mobile nav, scroll reveal, current-page highlight */
(function () {
  const header = document.querySelector('.header');
  const setHeader = () => {
    if (!header) return;
    const solid = window.scrollY > 40 || header.dataset.solid === 'true';
    header.classList.toggle('header--solid', solid);
    header.classList.toggle('header--transparent', !solid);
  };
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  // Mobile nav
  const menuBtn = document.querySelector('.header__menu-btn');
  const drawer = document.querySelector('.mobile-nav');
  const closeBtn = document.querySelector('.mobile-nav__close');
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => drawer.classList.add('open'));
    closeBtn?.addEventListener('click', () => drawer.classList.remove('open'));
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => drawer.classList.remove('open')));
  }

  // Active page highlight
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.getAttribute('href') === path || (path === '' && a.getAttribute('href') === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Scroll reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Current year in footer
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
