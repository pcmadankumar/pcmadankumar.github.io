/* ============================================================
   main.js — Shared JavaScript
   Portfolio: Madan Kumar PC
   ============================================================ */

/* --- Reduced Motion preference (F1) --- */
var REDUCED_MOTION = window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Active Nav Link --- */
(function setActiveNav() {
  // Skip if nav-active is already set in HTML (e.g. blog pages set it manually)
  if (document.querySelector('.nav-links a.nav-active')) return;

  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (
      href === page ||
      (page === '' && href === 'index.html') ||
      (page === 'index.html' && href === 'index.html')
    ) {
      link.classList.add('nav-active');
    }
  });
})();

/* --- Hamburger Menu --- */
(function initHamburger() {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');

  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a non-dropdown link is clicked
  links.querySelectorAll('a:not(.nav-dropdown-toggle)').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close when the viewport crosses the desktop breakpoint (F7) —
  // otherwise the open menu can stick over the page after a resize/rotation
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }, { passive: true });
})();

/* --- Mobile Dropdown Toggle --- */
(function initMobileDropdowns() {
  document.querySelectorAll('.nav-dropdown-toggle').forEach(toggleBtn => {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdown = toggleBtn.closest('.nav-dropdown');
      const isOpen = dropdown.classList.toggle('open');
      // Close other dropdowns
      document.querySelectorAll('.nav-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });
    });
  });
})();

/* --- Scroll Fade-Up Animations (+ directional variants, A2) --- */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();

/* --- Staggered Children Animation --- */
(function initStaggered() {
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    const delay = parseInt(parent.dataset.stagger) || 80;
    parent.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach((child, i) => {
      child.style.transitionDelay = `${i * delay}ms`;
    });
  });
})();

/* --- Animated Counters (stats row) --- */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  if (REDUCED_MOTION) {
    counters.forEach(el => {
      el.textContent = el.dataset.count + (el.dataset.suffix || '');
    });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1200;
      const start  = performance.now();

      function update(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.classList.add('counted'); // one-shot pop (A11)
        }
      }

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* --- Nav Scroll Shrink --- */
(function initNavShrink() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* --- Hero Rotating Roles (A12) ---
   The full credentials line stays in the HTML for crawlers and
   no-JS visitors; with JS the roles type/erase one at a time in a
   fixed-height container (no wrap jank on mobile). */
(function initHeroRoles() {
  var el = document.querySelector('.hero-title');
  if (!el) return;

  /* Reduced motion: keep the full title static. */
  if (REDUCED_MOTION) return;

  var raw = el.textContent.replace(/\s+/g, ' ').trim();
  var roles = raw.split('·').map(function (s) { return s.trim(); }).filter(Boolean);
  if (roles.length < 2) return; // unexpected markup — leave static

  el.textContent = '';
  el.classList.remove('fade-up');
  el.style.opacity = '1';
  el.style.transform = 'none';

  var textSpan = document.createElement('span');
  el.appendChild(textSpan);

  var cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  el.appendChild(cursor);

  var roleIdx = 0;
  var TYPE_MS = 26, ERASE_MS = 12, HOLD_MS = 2100;

  function typeRole() {
    var text = roles[roleIdx];
    var i = 0;
    var t = setInterval(function () {
      if (i < text.length) {
        textSpan.textContent += text[i++];
      } else {
        clearInterval(t);
        setTimeout(eraseRole, HOLD_MS);
      }
    }, TYPE_MS);
  }

  function eraseRole() {
    var t = setInterval(function () {
      if (textSpan.textContent.length > 0) {
        textSpan.textContent = textSpan.textContent.slice(0, -1);
      } else {
        clearInterval(t);
        roleIdx = (roleIdx + 1) % roles.length;
        setTimeout(typeRole, 300);
      }
    }, ERASE_MS);
  }

  setTimeout(typeRole, 700);
})();

/* --- Timeline Scroll Progress + Dot Ignite (A3, experience page) --- */
(function initTimelineProgress() {
  var timelines = document.querySelectorAll('.timeline');
  if (!timelines.length) return;

  timelines.forEach(function (tl) {
    var bar = document.createElement('div');
    bar.className = 'timeline-progress';
    tl.appendChild(bar);

    function update() {
      var rect = tl.getBoundingClientRect();
      var viewH = window.innerHeight;
      /* progress = how far the viewport's 70% line has travelled
         through the timeline element */
      var passed = Math.min(Math.max(viewH * 0.7 - rect.top, 0), rect.height);
      bar.style.height = passed + 'px';
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  });

  // Dots ignite once as their card enters view
  var items = document.querySelectorAll('.timeline-item');
  if (items.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('lit');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -20% 0px' });
    items.forEach(function (item) { io.observe(item); });
  }
})();

/* --- Card Cursor Spotlight (A4, desktop pointer only) --- */
(function initCardSpotlight() {
  if (REDUCED_MOTION) return;
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var cards = document.querySelectorAll(
    '.edu-card, .cert-card, .achievement-card, .proj-card, .testimonial-card, .timeline-card'
  );
  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();

/* --- Skill Pill Stagger (suggestion 6) --- */
(function initSkillPillStagger() {
  document.querySelectorAll('.skill-pills').forEach(function (container) {
    var pills = Array.from(container.querySelectorAll('.skill-pill'));
    if (!pills.length) return;

    pills.forEach(function (pill, i) {
      pill.style.opacity = '0';
      pill.style.transform = 'translateY(10px)';
      pill.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      pill.style.transitionDelay = (i * 55) + 'ms';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        pills.forEach(function (pill) {
          pill.style.opacity = '1';
          pill.style.transform = 'translateY(0)';
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

    observer.observe(container);
  });
})();

/* --- Footer Quote Rotator --- */
(function initQuoteRotator() {
  const quotes = [
    {
      text: "Technology is best when it brings people together.",
      author: "Matt Mullenweg, Founder of WordPress"
    },
    {
      text: "The only source of knowledge is experience.",
      author: "Albert Einstein"
    },
    {
      text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
      author: "Mahatma Gandhi"
    },
    {
      text: "The more I learn, the more I realize how much I don't know.",
      author: "Albert Einstein"
    },
    {
      text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
      author: "Zig Ziglar"
    },
    {
      text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
      author: "Brian Herbert"
    },
    {
      text: "To know that even one life has breathed easier because you have lived — that is to have succeeded.",
      author: "Ralph Waldo Emerson"
    },
    {
      text: "The best way to predict the future is to create it.",
      author: "Peter Drucker"
    },
    {
      text: "The art of communication is the language of leadership.",
      author: "James C. Humes, Presidential Speechwriter"
    }
  ];

  const q      = quotes[Math.floor(Math.random() * quotes.length)];
  const textEl = document.querySelector('.footer-quote-text');
  const authEl = document.querySelector('.footer-quote-author');
  if (textEl) textEl.textContent = '\u201c' + q.text + '\u201d';
  if (authEl) authEl.textContent = '\u2014 ' + q.author;
})();

/* --- Hero Scroll Cue fade-out (A9) --- */
(function initScrollCue() {
  var cue = document.querySelector('.hero-scroll-cue');
  if (!cue) return;
  window.addEventListener('scroll', function onScroll() {
    if (window.scrollY > 80) {
      cue.classList.add('hidden');
      window.removeEventListener('scroll', onScroll);
    }
  }, { passive: true });
})();

/* --- Back to Top Button --- */
(function initBackToTop() {
  var btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
  document.body.appendChild(btn);

  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
  });
})();

/* --- Footer Nav Links --- */
(function initFooterNav() {
  // Use the About link's href to compute path depth robustly
  var aboutLink = document.querySelector('.nav-links a[href$="index.html"]');
  if (!aboutLink) return;
  var aboutHref = aboutLink.getAttribute('href');
  var prefix = aboutHref.replace('index.html', '').replace(/\/$/, '') || '.';

  var linkedinLink = document.querySelector('.footer-link');
  if (!linkedinLink) return;

  var nav = document.createElement('nav');
  nav.className = 'footer-nav';
  nav.setAttribute('aria-label', 'Quick links');
  nav.innerHTML =
    '<a href="' + prefix + '/resources.html" class="footer-nav-link">Resources</a>' +
    '<span class="footer-nav-sep">\u00b7</span>' +
    '<a href="' + prefix + '/blog/index.html" class="footer-nav-link">Blog</a>' +
    '<span class="footer-nav-sep">\u00b7</span>' +
    '<a href="' + prefix + '/contact.html" class="footer-nav-link">Contact</a>' +
    '<span class="footer-nav-sep">\u00b7</span>' +
    '<a href="https://github.com/pcmadankumar" target="_blank" rel="noopener" class="footer-nav-link">GitHub</a>';

  linkedinLink.parentNode.insertBefore(nav, linkedinLink.nextSibling);
})();
