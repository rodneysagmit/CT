/* ClinTrainers CT1 — page behaviors (no dependencies) */
(function () {
  var cfg = window.CT_CONFIG || {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ---- Demo links: build the mailto from config ---- */
  var d = cfg.demo || {};
  if (d.email) {
    var href = 'mailto:' + d.email + '?subject=' + encodeURIComponent(d.subject || '') + '&body=' + encodeURIComponent(d.body || '');
    document.querySelectorAll('[data-demo-link]').forEach(function (a) { a.setAttribute('href', href); });
    document.querySelectorAll('[data-demo-email]').forEach(function (a) { a.textContent = d.email; a.setAttribute('href', 'mailto:' + d.email); });
  }

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

  /* ---- Tabs (used by some layouts): [data-tabs] > [role=tab][aria-controls] ---- */
  document.querySelectorAll('[data-tabs]').forEach(function (wrap) {
    var tabs = Array.prototype.slice.call(wrap.querySelectorAll('[role="tab"]'));
    var select = function (t, focus) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) t.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (e.key === 'Home') n = -i; if (e.key === 'End') n = tabs.length - 1 - i;
        if (n === undefined) return;
        e.preventDefault(); select(tabs[(i + n + tabs.length) % tabs.length], true);
      });
    });
    // Links like #tracheostomy open the matching tab
    var fromHash = function () {
      var id = location.hash.slice(1);
      tabs.forEach(function (t) { if (t.getAttribute('aria-controls') === id) select(t); });
    };
    window.addEventListener('hashchange', fromHash); fromHash();
  });

  /* ---- Chapters (used by some layouts): sticky image swaps as text chapters scroll ---- */
  document.querySelectorAll('[data-chapters]').forEach(function (wrap) {
    var imgs = wrap.querySelectorAll('[data-chapter-img]');
    var show = function (key) {
      imgs.forEach(function (im) { im.classList.toggle('is-active', im.getAttribute('data-chapter-img') === key); });
    };
    if (!('IntersectionObserver' in window)) return;
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        wrap.querySelectorAll('[data-chapter]').forEach(function (c) { c.classList.toggle('is-current', c === en.target); });
        show(en.target.getAttribute('data-chapter'));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    wrap.querySelectorAll('[data-chapter]').forEach(function (c) { co.observe(c); });
  });

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
