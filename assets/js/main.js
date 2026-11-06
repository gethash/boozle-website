/* ============================================================
   Boozle — boozle.io behaviours (vanilla, no dependencies)
   Motion rules: Boozle design system → Motion. UI ≤ 300ms, custom
   curves live in CSS; this file only toggles state.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersLight = window.matchMedia('(prefers-color-scheme: light)');
  var THEME_KEY = 'boozle-theme';

  /* ---------- Theme toggle ----------
     No stored choice = follow the OS. A click stores the opposite of what is
     showing. Colours switch instantly; only the icon crossfades. */
  function currentTheme() {
    var set = document.documentElement.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return prefersLight.matches ? 'light' : 'dark';
  }
  function syncThemeButtons() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
      btn.setAttribute('title', 'Switch to ' + next + ' theme');
    });
    var meta = document.querySelectorAll('meta[name="theme-color"]');
    meta.forEach(function (m) { m.setAttribute('content', currentTheme() === 'dark' ? '#0b0b12' : '#f7f7fb'); m.removeAttribute('media'); });
  }
  function initTheme() {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* private mode: theme still applies for this page */ }
        syncThemeButtons();
      });
    });
    prefersLight.addEventListener('change', syncThemeButtons);
    syncThemeButtons();
  }

  /* ---------- Mobile menu sheet ---------- */
  function initMenu() {
    var btn = document.querySelector('[data-menu]');
    if (!btn) return;
    var sheet = document.getElementById(btn.getAttribute('aria-controls'));
    function set(open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      sheet.setAttribute('data-open', String(open));
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      set(btn.getAttribute('aria-expanded') !== 'true');
    });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('click', function (e) {
      if (btn.getAttribute('aria-expanded') === 'true' && !sheet.contains(e.target)) set(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
  }

  /* ---------- Tabs: clip-path indicator, roving tabindex ---------- */
  function initTabs() {
    document.querySelectorAll('.bz-tabs').forEach(function (tabs) {
      var list = tabs.querySelector('.bz-tablist');
      var btns = [].slice.call(list.querySelectorAll('[role="tab"]'));
      var act = list.querySelector('.bz-tablist__active');
      function place(b) {
        if (!act) return;
        var inner = list.clientWidth - 8;
        var l = b.offsetLeft - 4;
        act.style.setProperty('--clip-l', l + 'px');
        act.style.setProperty('--clip-r', Math.max(0, inner - l - b.offsetWidth) + 'px');
      }
      function select(i, focus) {
        btns.forEach(function (b, k) {
          var on = k === i;
          b.setAttribute('aria-selected', String(on));
          b.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(b.getAttribute('aria-controls'));
          if (panel) panel.hidden = !on;
        });
        place(btns[i]);
        if (focus) btns[i].focus();
      }
      btns.forEach(function (b, i) {
        b.addEventListener('click', function () { select(i); });
        b.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (e.key === 'Home') { e.preventDefault(); select(0, true); return; }
          if (e.key === 'End') { e.preventDefault(); select(btns.length - 1, true); return; }
          if (d) { e.preventDefault(); select((i + d + btns.length) % btns.length, true); }
        });
      });
      var start = Math.max(0, btns.findIndex(function (b) { return b.getAttribute('aria-selected') === 'true'; }));
      if (act) act.style.transition = 'none';
      select(start);
      if (act) { void act.offsetWidth; act.style.transition = ''; }
      var raf;
      window.addEventListener('resize', function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var cur = btns.findIndex(function (b) { return b.getAttribute('aria-selected') === 'true'; });
          if (act) act.style.transition = 'none';
          place(btns[cur]);
          if (act) { void act.offsetWidth; act.style.transition = ''; }
        });
      });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { select(btns.findIndex(function (b) { return b.getAttribute('aria-selected') === 'true'; })); });
    });
  }

  /* ---------- Copy buttons: "Copy" → "Copied" morph, resets after 1.6s ---------- */
  function initCopy() {
    var live = document.createElement('div');
    live.setAttribute('aria-live', 'polite');
    live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
    document.body.appendChild(live);
    document.querySelectorAll('.bz-copy').forEach(function (btn) {
      var timer;
      btn.addEventListener('click', function () {
        var src = btn.closest('.bz-code, .bz-cmd');
        var node = src && (src.querySelector('pre') || src.querySelector('code'));
        if (!node) return;
        var text = node.innerText.replace(/^\$ /gm, '').replace(/\s+$/, '');
        var done = function () {
          btn.setAttribute('data-copied', 'true');
          live.textContent = 'Copied to clipboard';
          clearTimeout(timer);
          timer = setTimeout(function () { btn.setAttribute('data-copied', 'false'); live.textContent = ''; }, 1600);
        };
        var fallback = function () {
          var r = document.createRange(); r.selectNodeContents(node);
          var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
          try { document.execCommand('copy'); } catch (e) { /* selection stays for manual copy */ }
          done();
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
        else fallback();
      });
    });
  }

  /* ---------- Countdown rings (Ignite card) ---------- */
  function initRings() {
    document.querySelectorAll('[data-ring]').forEach(function (ring) {
      var secs = +ring.getAttribute('data-ring') || 15, left = secs;
      var t = ring.querySelector('.bz-ring__time');
      ring.style.setProperty('--dur', secs + 's');
      if (!reduceMotion.matches) ring.classList.add('is-running');
      var pad = function (v) { return (v < 10 ? '0' : '') + v; };
      setInterval(function () {
        if (document.hidden) return;
        left = left <= 1 ? secs : left - 1;
        if (t) t.textContent = '00:' + pad(left);
      }, 1000);
    });
  }

  /* ---------- Docs: scroll-spy. The highlight jumps; it is never animated. ---------- */
  function initDocsNav() {
    var links = [].slice.call(document.querySelectorAll('.bz-docnav a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = byId[en.target.id];
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Reveal: only sections below the fold, once, one entrance per container.
     Pages are complete without JS; nothing above the fold is ever hidden. ---------- */
  function initReveal() {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) return;
    var targets = [].slice.call(document.querySelectorAll('.pg-section > .pg-wrap, .pg-uc, .pg-cta__inner'));
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.setAttribute('data-inview', 'true');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -80px 0px' });
    targets.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh) return;
      el.classList.add('bz-reveal');
      el.setAttribute('data-inview', 'false');
      io.observe(el);
    });
  }

  function init() {
    initTheme();
    initMenu();
    initTabs();
    initCopy();
    initRings();
    initDocsNav();
    initReveal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
