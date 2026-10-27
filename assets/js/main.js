/* ClinTrainers CT1 — page behaviors (no dependencies) */
(function () {
  var cfg = window.CT_CONFIG || {};
  var inq = cfg.inquiry || {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---- Header shadow + active section ---- */
  var header = document.querySelector('.site-header');
  var onScroll = function () { header && header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = document.querySelector(l.getAttribute('href')); if (s) io.observe(s); });
  }

  /* ---- Scroll reveals ---- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- Annotated view: toggle labels ---- */
  document.querySelectorAll('[data-annotate-toggle]').forEach(function (btn) {
    var fig = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      btn.querySelector('[data-label]').textContent = on ? 'Hide labels' : 'Show labels';
      fig.classList.toggle('labels-off', !on);
    });
  });

  /* ---- Cartridge library: cards or list (remembered per visitor) ---- */
  var lib = document.querySelector('[data-lib]');
  if (lib) {
    var viewBtns = lib.querySelectorAll('[data-lib-view]');
    var setLibView = function (v) {
      lib.classList.toggle('is-list', v === 'list');
      viewBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lib-view') === v)); });
      try { localStorage.setItem('ct-lib-view', v); } catch (e) {}
    };
    viewBtns.forEach(function (b) { b.addEventListener('click', function () { setLibView(b.getAttribute('data-lib-view')); }); });
    var saved = null;
    try { saved = localStorage.getItem('ct-lib-view'); } catch (e) {}
    if (saved) setLibView(saved);
  }

  /* ---- Gallery lightbox (native <dialog>) ---- */
  var dlg = document.getElementById('lightbox');
  if (dlg && typeof dlg.showModal === 'function') {
    var img = dlg.querySelector('img'), cap = dlg.querySelector('figcaption');
    document.querySelectorAll('[data-lightbox]').forEach(function (b) {
      b.addEventListener('click', function () {
        img.src = b.getAttribute('data-lightbox'); img.alt = b.getAttribute('data-alt') || '';
        cap.textContent = b.getAttribute('data-caption') || '';
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  }

  /* ---- Email address shown on the page ---- */
  document.querySelectorAll('[data-inquiry-email]').forEach(function (a) {
    if (!inq.email) return;
    a.textContent = inq.email; a.setAttribute('href', 'mailto:' + inq.email);
  });

  /* ---- Inquiry form (native <dialog>) ---- */
  var idlg = document.getElementById('inquiry');
  var form = idlg && idlg.querySelector('form');
  var done = idlg && idlg.querySelector('[data-inquiry-done]');
  var note = idlg && idlg.querySelector('[data-form-status]');
  var sendBtn = form && form.querySelector('[type="submit"]');

  function mailtoFrom(data) {
    var lines = [
      'Name: ' + data.name,
      'Email: ' + data.email,
      'Phone: ' + (data.phone || '—'),
      'Organization: ' + data.organization,
      'Inquiry type: ' + data.topic,
      '',
      data.message
    ];
    return 'mailto:' + inq.email + '?subject=' + encodeURIComponent((inq.subject || 'CT1 inquiry') + ' — ' + data.topic) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function showError(field, msg) {
    var box = form.querySelector('[data-error-for="' + field.name + '"]');
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (box) box.textContent = msg || '';
  }

  function messageFor(f) {
    var v = f.validity;
    if (v.valueMissing) return {
      name: 'Please enter your name.', email: 'Please enter your email.', organization: 'Please enter your organization.', message: 'Please tell us what you’d like to know.'
    }[f.name] || 'This field is required.';
    if (v.typeMismatch && f.type === 'email') return 'Please enter a valid email, like name@hospital.org.';
    if (v.patternMismatch && f.type === 'tel') return 'Please enter a valid phone number.';
    return '';
  }

  function validate() {
    var first = null;
    form.querySelectorAll('input:not([type="radio"]):not([tabindex="-1"]), textarea').forEach(function (f) {
      var msg = f.checkValidity() ? '' : messageFor(f);
      showError(f, msg);
      if (msg && !first) first = f;
    });
    if (first) first.focus();
    return !first;
  }

  function openDialog(topic) {
    if (!idlg) return false;
    if (typeof idlg.showModal !== 'function') return false;
    form.hidden = false; done.hidden = true; note.textContent = '';
    if (topic) { var r = form.querySelector('input[name="topic"][value="' + topic + '"]'); if (r) r.checked = true; }
    idlg.showModal();
    document.documentElement.classList.add('modal-open');
    var firstField = form.querySelector('#f-name'); if (firstField) firstField.focus();
    return true;
  }

  /* Demo buttons: in 'email' mode they are plain mailto links built from config.js;
     in 'form' mode they open the inquiry dialog (the mailto href stays as a fallback). */
  var demoHref = 'mailto:' + inq.email + '?subject=' + encodeURIComponent(inq.subject || 'CT1 demo request') +
    (inq.body ? '&body=' + encodeURIComponent(inq.body) : '');
  document.querySelectorAll('[data-inquiry]').forEach(function (b) {
    if (inq.email) b.setAttribute('href', demoHref);
    if (inq.mode !== 'form') return;
    b.addEventListener('click', function (e) {
      if (openDialog(b.getAttribute('data-inquiry'))) e.preventDefault();
    });
  });

  if (idlg && form) {
    idlg.addEventListener('close', function () { document.documentElement.classList.remove('modal-open'); });
    idlg.addEventListener('click', function (e) { if (e.target === idlg || e.target.closest('[data-close]')) idlg.close(); });
    form.querySelectorAll('input, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { if (f.getAttribute('aria-invalid') === 'true' || f.value) showError(f, f.checkValidity() ? '' : messageFor(f)); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true' && f.checkValidity()) showError(f, ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      note.textContent = '';
      if (!validate()) { note.textContent = 'Please check the highlighted fields.'; return; }
      if (form.querySelector('[name="_gotcha"]').value) return; // spam trap
      var fd = new FormData(form);
      var data = {
        name: fd.get('name').trim(), email: fd.get('email').trim(), phone: (fd.get('phone') || '').trim(),
        organization: fd.get('organization').trim(), topic: fd.get('topic') || 'Question', message: fd.get('message').trim()
      };
      var finish = function (viaEmail) {
        form.hidden = true; done.hidden = false; note.textContent = '';
        done.querySelector('[data-done-text]').textContent = viaEmail
          ? 'Your email app should open with your message ready to send. If it doesn’t, email us at ' + inq.email + '.'
          : 'Thanks, ' + data.name.split(' ')[0] + '. We’ve received your message and will follow up at ' + data.email + '.';
        form.reset();
        done.querySelector('h2').focus();
      };

      if (!inq.endpoint) { window.location.href = mailtoFrom(data); finish(true); return; }

      sendBtn.disabled = true; sendBtn.setAttribute('aria-busy', 'true'); note.textContent = 'Sending…';
      fd.append('_subject', (inq.subject || 'CT1 inquiry') + ' — ' + data.topic);
      fetch(inq.endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); finish(false); })
        .catch(function () {
          note.innerHTML = '';
          note.append('We couldn’t send that just now. ');
          var a = document.createElement('a'); a.href = mailtoFrom(data); a.textContent = 'Send it by email instead';
          note.append(a, '.');
        })
        .then(function () { sendBtn.disabled = false; sendBtn.removeAttribute('aria-busy'); });
    });
  }

  /* ---- Footer year ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- Load the 3D viewer only after the page (and hero poster) has loaded ---- */
  function webgl() {
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
  }
  var host = document.querySelector('[data-viewer]');
  if (!host) return;
  if (!webgl()) { host.classList.add('is-static'); return; }
  var load = function () {
    var s = document.createElement('script');
    s.src = host.getAttribute('data-viewer-src') || 'assets/js/viewer.bundle.js';
    s.async = true;
    s.onerror = function () { host.classList.add('is-static'); };
    document.body.appendChild(s);
  };
  var start = function () { ('requestIdleCallback' in window) ? requestIdleCallback(load, { timeout: 1500 }) : setTimeout(load, 300); };
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
