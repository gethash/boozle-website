(function () {
  'use strict';

  /* ── Mobile nav toggle ──────────────────────────────────────────────── */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links  = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    // Close on outside click
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Tab controller ─────────────────────────────────────────────────── */
  function initTabs() {
    document.querySelectorAll('[role="tablist"]').forEach(tablist => {
      const buttons = [...tablist.querySelectorAll('[role="tab"]')];
      const panels  = buttons.map(b =>
        document.getElementById(b.getAttribute('aria-controls'))
      ).filter(Boolean);

      function activate(btn) {
        buttons.forEach((b, i) => {
          const active = b === btn;
          b.setAttribute('aria-selected', String(active));
          if (panels[i]) {
            panels[i].classList.toggle('is-active', active);
          }
        });
        btn.focus();
      }

      buttons.forEach((btn, idx) => {
        btn.addEventListener('click', () => activate(btn));
        btn.addEventListener('keydown', e => {
          const len = buttons.length;
          if (e.key === 'ArrowRight') { e.preventDefault(); activate(buttons[(idx + 1) % len]); }
          if (e.key === 'ArrowLeft')  { e.preventDefault(); activate(buttons[(idx - 1 + len) % len]); }
          if (e.key === 'Home')       { e.preventDefault(); activate(buttons[0]); }
          if (e.key === 'End')        { e.preventDefault(); activate(buttons[len - 1]); }
        });
      });
    });
  }

  /* ── Copy buttons ───────────────────────────────────────────────────── */
  function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const el = targetId ? document.getElementById(targetId) : btn.closest('.code-block')?.querySelector('pre');
        if (!el) return;
        const text = el.innerText.trim();
        navigator.clipboard.writeText(text).then(() => {
          const orig = btn.textContent;
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
        }).catch(() => {});
      });
    });
  }

  /* ── Countdown animation ────────────────────────────────────────────── */
  class Countdown {
    constructor({ timerEl, barEl, pageEl, totalSlides, intervalSecs, startSlide, startRemaining }) {
      this.timerEl      = timerEl;
      this.barEl        = barEl;
      this.pageEl       = pageEl;
      this.totalSlides  = totalSlides;
      this.intervalSec  = intervalSecs;
      this.slide        = startSlide || 1;
      this.remaining    = startRemaining != null ? startRemaining : intervalSecs;
      this._raf         = null;
      this._last        = null;
    }

    start() {
      this._last = performance.now();
      this._raf  = requestAnimationFrame(ts => this._tick(ts));
    }

    stop() {
      if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    }

    _tick(ts) {
      const dt = (ts - this._last) / 1000;
      this._last = ts;
      this.remaining -= dt;
      if (this.remaining <= 0) {
        this.slide = (this.slide % this.totalSlides) + 1;
        this.remaining = this.intervalSec + this.remaining; // carry over
      }
      this._render();
      this._raf = requestAnimationFrame(ts => this._tick(ts));
    }

    _render() {
      const secs = Math.max(0, Math.ceil(this.remaining));
      const mm   = String(Math.floor(secs / 60)).padStart(2, '0');
      const ss   = String(secs % 60).padStart(2, '0');
      const pct  = Math.min(100, ((this.intervalSec - this.remaining) / this.intervalSec) * 100);

      if (this.timerEl) this.timerEl.textContent = `${mm}:${ss}`;
      if (this.barEl)   this.barEl.style.width   = `${pct}%`;
      if (this.pageEl)  this._renderPage();
    }

    _renderPage() {
      const s  = String(this.slide).padStart(2, '0');
      const t  = String(this.totalSlides).padStart(2, '0');
      const el = this.pageEl;
      if (el.dataset.format === 'short') {
        el.textContent = `Slide ${s} of ${t}`;
      } else {
        el.textContent = `${s} / ${t}`;
      }
    }
  }

  function initCountdowns() {
    // Hero terminal countdown
    const heroTimer = document.getElementById('hero-timer');
    const heroBar   = document.getElementById('hero-bar');
    const heroPage  = document.getElementById('hero-page');
    if (heroTimer) {
      const c = new Countdown({
        timerEl: heroTimer, barEl: heroBar, pageEl: heroPage,
        totalSlides: 12, intervalSecs: 20,
        startSlide: 3, startRemaining: 14,
      });
      c.start();
    }

    // Usage HUD countdown
    const hudTimer = document.getElementById('hud-timer');
    const hudBar   = document.getElementById('hud-bar');
    const hudPage  = document.getElementById('hud-page');
    if (hudTimer) {
      const c = new Countdown({
        timerEl: hudTimer, barEl: hudBar, pageEl: hudPage,
        totalSlides: 12, intervalSecs: 30,
        startSlide: 5, startRemaining: 22,
      });
      c.start();
    }
  }

  /* ── FAQ accordion ──────────────────────────────────────────────────── */
  function initFaq() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item    = btn.closest('.faq-item');
        const isOpen  = item.classList.contains('is-open');
        // Close all
        document.querySelectorAll('.faq-item.is-open').forEach(i => i.classList.remove('is-open'));
        if (!isOpen) item.classList.add('is-open');
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }

  /* ── Scroll animations ──────────────────────────────────────────────── */
  function initScrollAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = document.querySelectorAll('.anim-fade-up');
    if (!targets.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const siblings = [...entry.target.parentElement.children].filter(c => c.classList.contains('anim-fade-up'));
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 65}ms`;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    targets.forEach(el => io.observe(el));
  }

  /* ── Docs sidebar active state ──────────────────────────────────────── */
  function initDocsNav() {
    const navLinks = document.querySelectorAll('.docs-sidebar__nav a');
    if (!navLinks.length) return;

    const sections = [...navLinks].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))}px 0px -60% 0px` });

    sections.forEach(s => io.observe(s));
  }

  /* ── Bootstrap ──────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initTabs();
    initCopyButtons();
    initCountdowns();
    initFaq();
    initScrollAnimations();
    initDocsNav();
  });

})();
