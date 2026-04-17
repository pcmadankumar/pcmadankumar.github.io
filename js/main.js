/* ============================================================
   main.js — Shared JavaScript
   Portfolio: Madan Kumar PC
   ============================================================ */

/* --- Active Nav Link --- */
(function setActiveNav() {
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

/* --- Scroll Fade-Up Animations --- */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up');
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
    parent.querySelectorAll('.fade-up').forEach((child, i) => {
      child.style.transitionDelay = `${i * delay}ms`;
    });
  });
})();

/* --- Animated Counters (stats row) --- */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

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
        if (progress < 1) requestAnimationFrame(update);
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

/* --- Hero Typewriter (suggestion 4) --- */
(function initHeroTypewriter() {
  var el = document.querySelector('.hero-title');
  if (!el) return;

  var raw = el.textContent.replace(/\s+/g, ' ').trim();
  el.textContent = '';
  el.classList.remove('fade-up');
  el.style.opacity = '1';
  el.style.transform = 'none';

  var cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  el.appendChild(cursor);

  var i = 0;
  setTimeout(function () {
    var timer = setInterval(function () {
      if (i < raw.length) {
        cursor.insertAdjacentText('beforebegin', raw[i++]);
      } else {
        clearInterval(timer);
        setTimeout(function () { cursor.remove(); }, 900);
      }
    }, 22);
  }, 700);
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
