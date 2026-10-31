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

  /* ---- Scroll-linked values, one frame at a time:
     --progress (0 to 1) drives the reading line in the header;
     --hp (0 to 1) drives the hero depth (trainer drifts slower than the text, circle shrinks) ---- */
  var hero = document.querySelector('.hero');
  var root = document.documentElement;
  var ticking = false;
  var onFrame = function () {
    var max = root.scrollHeight - window.innerHeight;
    root.style.setProperty('--progress', max > 0 ? Math.min(window.scrollY / max, 1).toFixed(4) : '0');
    if (hero && !reduce) hero.style.setProperty('--hp', Math.min(Math.max(window.scrollY / (hero.offsetHeight || 1), 0), 1).toFixed(3));
    ticking = false;
  };
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
  }, { passive: true });
  onFrame();

  /* ---- Staggered reveals: cards in a grid arrive one after another ---- */
  ['.benefits', '.features', '.lib-grid', '.docs', '.thumbs'].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (grid) {
      Array.prototype.forEach.call(grid.children, function (card, i) {
        card.setAttribute('data-reveal', '');
        card.style.setProperty('--d', ((i % 3) * 0.08).toFixed(2) + 's');
      });
    });
  });

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

  /* ---- Dialogs close with a short fade (Esc, backdrop click or a close button) ---- */
  function closeDialog(d) {
    if (!d.open) return;
    if (reduce) { d.close(); return; }
    var finished = false;
    var finish = function () { if (finished) return; finished = true; d.classList.remove('is-closing'); d.close(); };
    var onEnd = function (e) { if (e.target !== d) return; d.removeEventListener('animationend', onEnd); finish(); };
    d.addEventListener('animationend', onEnd);
    d.classList.add('is-closing');
    setTimeout(finish, 320);
  }
  document.querySelectorAll('dialog').forEach(function (d) {
    d.addEventListener('cancel', function (e) { e.preventDefault(); closeDialog(d); });
  });

  /* ---- FAQ answers glide open and closed ---- */
  document.querySelectorAll('.faq details').forEach(function (d) {
    var summary = d.querySelector('summary'), answer = d.querySelector('.answer');
    if (!summary || !answer || !answer.animate) return;
    summary.addEventListener('click', function (e) {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        d.classList.add('is-closing');
        answer.animate([{ height: answer.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 220, easing: 'ease' })
          .onfinish = function () { d.open = false; d.classList.remove('is-closing'); };
      } else {
        d.open = true;
        answer.animate([{ height: '0px', opacity: 0 }, { height: answer.offsetHeight + 'px', opacity: 1 }], { duration: 280, easing: 'cubic-bezier(.2, .7, .2, 1)' });
      }
    });
  });

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
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) closeDialog(dlg); });
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

  /* Every labeled field, in form order, for the email fallback */
  var FIELDS = [
    ['topic', 'Inquiry type'], ['first_name', 'First name'], ['last_name', 'Last name'],
    ['organization', 'Organization'], ['job_title', 'Job title'], ['organization_type', 'Organization type'],
    ['email', 'Email'], ['phone', 'Phone'],
    ['starter_kits', 'Starter Kits needed'], ['learners_per_year', 'Learners per year'], ['timeline', 'Timeline'],
    ['payment_method', 'Payment method'], ['ship_to', 'Ship to'], ['tax_exempt', 'Tax-exempt'],
    ['heard_about_us', 'Heard about us'], ['message', 'Message']
  ];

  function mailtoFrom(fd) {
    var topic = fd.get('topic') || 'Question';
    var lines = [];
    FIELDS.forEach(function (f) {
      var v = (fd.get(f[0]) || '').toString().trim();
      if (!v) return;
      if (f[0] === 'message') lines.push('', v); else lines.push(f[1] + ': ' + v);
    });
    return 'mailto:' + inq.email + '?subject=' + encodeURIComponent((inq.subject || 'CT1 inquiry') + ' — ' + topic) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function showError(field, msg) {
    var box = form.querySelector('[data-error-for="' + field.name + '"]');
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (box) box.textContent = msg || '';
    // Teal check once a text, email or phone field is filled in correctly
    if (/^(text|email|tel)$/.test(field.type)) field.classList.toggle('is-valid', !msg && !!field.value.trim());
  }

  function messageFor(f) {
    var v = f.validity;
    if (v.valueMissing) return {
      first_name: 'Please enter your first name.', last_name: 'Please enter your last name.',
      organization: 'Please enter your organization.', organization_type: 'Please choose your organization type.',
      email: 'Please enter your email.', message: 'Please tell us what you’d like to know.'
    }[f.name] || 'This field is required.';
    if (v.typeMismatch && f.type === 'email') return 'Please enter a valid email, like name@hospital.org.';
    if (v.patternMismatch && f.type === 'tel') return 'Please enter a valid phone number.';
    if (v.rangeUnderflow || v.badInput || v.stepMismatch) return 'Please enter a whole number.';
    return '';
  }

  function fieldsToCheck() {
    return form.querySelectorAll('input:not([type="radio"]):not([tabindex="-1"]), textarea, select');
  }

  function validate() {
    var first = null;
    fieldsToCheck().forEach(function (f) {
      if (f.closest('[hidden]')) { showError(f, ''); return; }
      var msg = f.checkValidity() ? '' : messageFor(f);
      showError(f, msg);
      if (msg && !first) first = f;
    });
    if (first) first.focus();
    return !first;
  }

  /* Quote details appear only for quotes; the message is required only for questions */
  function syncTopic() {
    var topic = (form.querySelector('input[name="topic"]:checked') || {}).value;
    var quote = form.querySelector('[data-quote-fields]');
    var msg = form.querySelector('#f-msg');
    if (quote) quote.hidden = topic !== 'Quote request';
    var isQ = topic === 'Question';
    msg.required = isQ;
    form.querySelector('[data-msg-label]').textContent = isQ ? 'Your question' : 'Anything else we should know?';
    form.querySelector('[data-msg-opt]').hidden = isQ;
    if (!isQ) showError(msg, '');
  }

  function openDialog(topic) {
    if (!idlg) return false;
    if (typeof idlg.showModal !== 'function') return false;
    form.hidden = false; done.hidden = true; note.textContent = '';
    if (topic) { var r = form.querySelector('input[name="topic"][value="' + topic + '"]'); if (r) r.checked = true; }
    syncTopic();
    idlg.showModal();
    document.documentElement.classList.add('modal-open');
    var firstField = form.querySelector('#f-first'); if (firstField) firstField.focus();
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
    idlg.addEventListener('click', function (e) { if (e.target === idlg || e.target.closest('[data-close]')) closeDialog(idlg); });
    form.querySelectorAll('input[name="topic"]').forEach(function (r) { r.addEventListener('change', syncTopic); });
    fieldsToCheck().forEach(function (f) {
      f.addEventListener('blur', function () { if (f.getAttribute('aria-invalid') === 'true' || f.value) showError(f, f.checkValidity() ? '' : messageFor(f)); });
      f.addEventListener(f.tagName === 'SELECT' ? 'change' : 'input', function () { if (f.getAttribute('aria-invalid') === 'true' && f.checkValidity()) showError(f, ''); });
    });
    syncTopic();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      note.textContent = '';
      if (!validate()) { note.textContent = 'Please check the highlighted fields.'; return; }
      if (form.querySelector('[name="_gotcha"]').value) return; // spam trap
      var fd = new FormData(form);
      var topic = fd.get('topic') || 'Question';
      var firstName = (fd.get('first_name') || '').trim(), email = (fd.get('email') || '').trim();
      var finish = function (viaEmail) {
        form.hidden = true; done.hidden = false; note.textContent = '';
        done.querySelector('[data-done-text]').textContent = viaEmail
          ? 'Your email app should open with your message ready to send. If it doesn’t, email us at ' + inq.email + '.'
          : 'Thanks, ' + firstName + '. We’ve received your message and will follow up at ' + email + '.';
        form.reset(); syncTopic();
        form.querySelectorAll('.is-valid').forEach(function (f) { f.classList.remove('is-valid'); });
        done.querySelector('h2').focus();
      };

      if (!inq.endpoint) { window.location.href = mailtoFrom(fd); finish(true); return; }

      sendBtn.disabled = true; sendBtn.setAttribute('aria-busy', 'true'); note.textContent = 'Sending…';
      fd.append('_subject', (inq.subject || 'CT1 inquiry') + ' — ' + topic);
      fd.append('_replyto', email);
      fetch(inq.endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); finish(false); })
        .catch(function () {
          note.innerHTML = '';
          note.append('We couldn’t send that just now. ');
          var a = document.createElement('a'); a.href = mailtoFrom(fd); a.textContent = 'Send it by email instead';
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
