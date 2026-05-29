/* ======================================================================
   POLISH — additive behaviour layer, loaded after script.js
   Status pill · editorial injections · scroll progress · link fixes
====================================================================== */
(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────────
     TAB VISIBILITY GUARD
     If the page was hidden during CSS entrance animations the elements
     can get trapped at opacity:0. When visibility returns, force them
     into their final visible state.
  ────────────────────────────────────────────────────────────────── */
  function checkVisibility() {
    if (document.visibilityState !== 'visible') return;
    const entranceEls = document.querySelectorAll(
      '.hero-title, .hero-subtitle, .hero-description, .hero-links, ' +
      '.hero-photo-wrap, .status-pill, .hero-annotation'
    );
    let anyStuck = false;
    entranceEls.forEach(function (el) {
      if (parseFloat(window.getComputedStyle(el).opacity) < 0.05) {
        anyStuck = true;
      }
    });
    if (anyStuck) {
      document.body.classList.add('force-visible');
    }
  }

  document.addEventListener('visibilitychange', checkVisibility);
  // Also check after a short delay on first load (animations may still be running)
  setTimeout(checkVisibility, 2000);

  /* ──────────────────────────────────────────────────────────────────
     SCROLL PROGRESS BAR
  ────────────────────────────────────────────────────────────────── */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);

    function update() {
      var doc = document.documentElement;
      var scrolled = window.scrollY;
      var total = doc.scrollHeight - doc.clientHeight;
      var pct = total > 0 ? scrolled / total : 0;
      bar.style.transform = 'scaleX(' + Math.min(pct, 1) + ')';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ──────────────────────────────────────────────────────────────────
     DOM READY
  ────────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    initScrollProgress();
    initScrollTop();
    initCopyToast();

    /* Only run home-page enhancements when the hero section is present */
    var isHome = !!document.querySelector('.hero');

    if (isHome) {
      injectStatusPill();
      splitHeroTitle();
      injectHeroAnnotation();
    }

    /* Project detail pages */
    var isProject = !!document.querySelector('.project-detail-page');
    if (isProject) {
      splitProjectTitle();
      injectProjectEyebrow();
    }

    injectSectionEyebrows();
    fixLinks();

  });

  /* ──────────────────────────────────────────────────────────────────
     STATUS PILL
     Replaces the plain "Hello, I'm" greeting with a glass pill showing
     an availability indicator and location.
  ────────────────────────────────────────────────────────────────── */
  function injectStatusPill() {
    var greeting = document.querySelector('.hero-greeting');
    var heroText = document.querySelector('.hero-text');
    if (!heroText) return;

    /* Hide the original plain-text greeting */
    if (greeting) greeting.style.display = 'none';

    /* Don't double-inject */
    if (document.querySelector('.status-pill')) return;

    var pill = document.createElement('div');
    pill.className = 'status-pill';
    pill.innerHTML =
      '<span class="status-dot"></span>' +
      '<span>Available for work&nbsp;&middot;&nbsp;USA&nbsp;&mdash;&nbsp;NYC focus</span>';

    /* Insert as first child of .hero-text so it appears above the title */
    heroText.insertBefore(pill, heroText.firstChild);
  }

  /* ──────────────────────────────────────────────────────────────────
     HERO TITLE ITALIC SPLIT
     Wraps the last word ("Muchhala") in Instrument Serif italic with
     a slow cyan↔indigo gradient drift animation.
  ────────────────────────────────────────────────────────────────── */
  function splitHeroTitle() {
    var title = document.querySelector('.hero-title');
    if (!title || title.querySelector('.ital')) return;

    var raw = title.textContent.trim();
    var words = raw.split(/\s+/);
    if (words.length < 2) return;

    var last  = words.pop();
    var first = words.join(' ');

    title.innerHTML = first + ' <span class="ital">' + last + '</span>';
  }

  /* ──────────────────────────────────────────────────────────────────
     HERO ANNOTATION
     One italic-serif whisper line under the subtitle.
  ────────────────────────────────────────────────────────────────── */
  function injectHeroAnnotation() {
    if (document.querySelector('.hero-annotation')) return;

    var subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    var ann = document.createElement('em');
    ann.className = 'hero-annotation';
    ann.textContent = 'three years shipping production AI · agentic systems & document intel';
    subtitle.insertAdjacentElement('afterend', ann);
  }

  /* ──────────────────────────────────────────────────────────────────
     SECTION EYEBROWS
     Injects a monospace label + drawing hairline above each section
     title, animated in when the header scrolls into view.
  ────────────────────────────────────────────────────────────────── */
  var EYEBROW_MAP = {
    'about':          'Profile',
    'education':      'Background',
    'experience':     'Trajectory',
    'projects':       'Selected work',
    'blogs':          'Writing',
    'certifications': 'Credentials',
  };

  function injectSectionEyebrows() {
    var sections = document.querySelectorAll('section[id]');
    sections.forEach(function (section) {
      var id     = section.id;
      var label  = EYEBROW_MAP[id];
      if (!label) return;

      var header = section.querySelector('.section-header');
      var title  = section.querySelector('.section-title');
      if (!header || !title || header.querySelector('.polish-eyebrow')) return;

      var eyebrow = document.createElement('div');
      eyebrow.className = 'polish-eyebrow';
      eyebrow.innerHTML =
        '<span class="eyebrow-text">' + label + '</span>' +
        '<span class="eyebrow-line"></span>';
      header.insertBefore(eyebrow, title);
    });

    /* IntersectionObserver — triggers eyebrow line draw-in + title tighten */
    if (!('IntersectionObserver' in window)) {
      /* Fallback: show all immediately */
      document.querySelectorAll('.section-header').forEach(function (h) {
        h.classList.add('in-view');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.20 });

    document.querySelectorAll('.section-header').forEach(function (h) {
      observer.observe(h);
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     SCROLL-TO-TOP BUTTON
  ────────────────────────────────────────────────────────────────── */
  function initScrollTop() {
    var btn = document.createElement('button');
    btn.id = 'scroll-top';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(btn);

    var heroHeight = 0;
    var hero = document.querySelector('.hero');
    if (hero) heroHeight = hero.offsetHeight;

    function onScroll() {
      if (window.scrollY > (heroHeight || 400)) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     COPY-EMAIL TOAST
     Clicking any mailto: link also copies the address and shows toast.
  ────────────────────────────────────────────────────────────────── */
  function initCopyToast() {
    var toast = document.createElement('div');
    toast.id = 'copy-toast';
    toast.textContent = 'Email copied';
    document.body.appendChild(toast);

    var timer = null;

    function showToast() {
      toast.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    }

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="mailto:"]');
      if (!link) return;
      var email = link.href.replace('mailto:', '').split('?')[0];
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(email).then(showToast).catch(function () {});
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     PROJECT DETAIL PAGE — title split + eyebrow
  ────────────────────────────────────────────────────────────────── */
  function splitProjectTitle() {
    var title = document.querySelector('.blog-post-title');
    if (!title || title.querySelector('.ital')) return;

    var words = title.textContent.trim().split(/\s+/);
    if (words.length < 2) return;

    var last  = words.pop();
    var first = words.join(' ');
    title.innerHTML = first + ' <span class="ital">' + last + '</span>';
  }

  function injectProjectEyebrow() {
    var header = document.querySelector('.project-detail-page .blog-header');
    var title  = document.querySelector('.blog-post-title');
    if (!header || !title || header.querySelector('.project-page-eyebrow')) return;

    var eyebrow = document.createElement('div');
    eyebrow.className = 'project-page-eyebrow';
    eyebrow.innerHTML =
      '<span class="eyebrow-text">Project</span>' +
      '<span class="eyebrow-line"></span>';
    header.insertBefore(eyebrow, title);
  }

  /* ──────────────────────────────────────────────────────────────────
     LINK FIXES
  ────────────────────────────────────────────────────────────────── */
  function fixLinks() {
    /* Cursor-following specular highlight on project cards (visual only) */
    if (window.matchMedia('(pointer: fine)').matches) {
      document.querySelectorAll('.project-card').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
          var r  = card.getBoundingClientRect();
          var x  = ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%';
          var y  = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
          card.style.setProperty('--mx', x);
          card.style.setProperty('--my', y);
        });
      });
    }
  }

})();
