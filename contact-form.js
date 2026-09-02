/**
 * Syracuse Grand contact form — submit handler.
 * Posts JSON to /api/contact and shows inline status.
 */
(function () {
  function init() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var statusEl = form.querySelector('.contact-form__status');
    var submitBtn = form.querySelector('.contact-form__submit');
    var btnLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;

    function setStatus(kind, msg) {
      if (!statusEl) return;
      statusEl.className = 'contact-form__status contact-form__status--' + kind;
      statusEl.textContent = msg;
    }

    function setBusy(busy) {
      if (!submitBtn) return;
      submitBtn.disabled = busy;
      submitBtn.classList.toggle('is-busy', !!busy);
      if (btnLabel) btnLabel.textContent = busy ? 'Sending…' : 'Send message';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');

      // Native validation first
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var fd = new FormData(form);
      var payload = {};
      fd.forEach(function (v, k) { payload[k] = typeof v === 'string' ? v : ''; });

      setBusy(true);

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (data) { return { status: r.status, data: data }; });
        })
        .then(function (res) {
          if (res.status >= 200 && res.status < 300 && res.data && res.data.ok) {
            form.reset();
            setStatus('success', 'Thanks — your message is on its way. We will reply within one business day.');
            if (typeof window.gtag === 'function') {
              window.gtag('event', 'contact_form_submit', {
                page_location: window.location.href,
                form_id: 'contactForm',
              });
            }
          } else {
            var err = (res.data && res.data.error) || 'Something went wrong. Please try again or call (315) 701-4400.';
            setStatus('error', err);
          }
        })
        .catch(function () {
          setStatus('error', 'Could not send right now. Please try again or call (315) 701-4400.');
        })
        .finally(function () {
          setBusy(false);
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
