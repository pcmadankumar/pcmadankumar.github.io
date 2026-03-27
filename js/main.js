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
      link.classList.add('active');
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
