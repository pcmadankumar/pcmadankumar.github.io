/* ============================================================
   nav.js — Dynamic Navigation Injection
   Portfolio: Madan Kumar PC
   Edit THIS file to add/remove/rename nav items.
   ============================================================ */
(function () {
  'use strict';

  var nav = document.querySelector('nav.nav');
  if (!nav) return;

  /* --- Compute relative prefix based on URL depth --- */
  var depth;
  if (window.location.protocol === 'file:') {
    // Local file:// — detect depth from known directory names
    var segs = window.location.pathname.replace(/\\/g, '/').split('/');
    depth = segs.indexOf('posts') !== -1 ? 2 : segs.indexOf('blog') !== -1 ? 1 : 0;
  } else {
    // HTTP/HTTPS — count directory levels from path
    var parts = window.location.pathname.replace(/^\//, '').split('/');
    parts.pop(); // remove filename
    depth = parts.filter(function (s) { return s.length > 0; }).length;
  }
  var p = depth === 0 ? '.' : Array(depth).fill('..').join('/');

  /* --- Active state detection --- */
  var pathname = window.location.pathname;
  var onBlog = pathname.indexOf('/blog') !== -1;
  var filename = pathname.split('/').pop() || 'index.html';
  var onIndex = (filename === 'index.html' || filename === '') && !onBlog;

  function a(page) {
    return filename === page && !onBlog ? ' class="nav-active"' : '';
  }

  /* --- Inject nav HTML --- */
  nav.innerHTML =
    '<div class="nav-inner">' +
      '<a href="' + p + '/index.html" class="nav-logo" style="font-family: \'Dancing Script\', cursive; font-size: 1.65rem;">Madan Kumar PC</a>' +
      '<button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
      '<ul class="nav-links">' +
        '<li><a href="' + p + '/index.html"' + (onIndex ? ' class="nav-active"' : '') + '>About</a></li>' +
        '<li class="nav-dropdown">' +
          '<a href="#" class="nav-dropdown-toggle">Competence <i class="fa-solid fa-chevron-down nav-chevron"></i></a>' +
          '<ul class="nav-dropdown-menu">' +
            '<li><a href="' + p + '/education.html"' + a('education.html') + '>Education</a></li>' +
            '<li><a href="' + p + '/skills.html"' + a('skills.html') + '>Skills</a></li>' +
            '<li><a href="' + p + '/experience.html"' + a('experience.html') + '>Experience</a></li>' +
          '</ul>' +
        '</li>' +
        '<li class="nav-dropdown">' +
          '<a href="#" class="nav-dropdown-toggle">Credentials <i class="fa-solid fa-chevron-down nav-chevron"></i></a>' +
          '<ul class="nav-dropdown-menu">' +
            '<li><a href="' + p + '/achievements.html"' + a('achievements.html') + '>Achievements</a></li>' +
            '<li><a href="' + p + '/testimonials.html"' + a('testimonials.html') + '>Testimonials</a></li>' +
            '<li><a href="' + p + '/certifications.html"' + a('certifications.html') + '>Certifications</a></li>' +
            '<li><a href="' + p + '/work_projects.html"' + a('work_projects.html') + '>Work Projects</a></li>' +
          '</ul>' +
        '</li>' +
        '<li class="nav-dropdown">' +
          '<a href="#" class="nav-dropdown-toggle">Shop <i class="fa-solid fa-chevron-down nav-chevron"></i></a>' +
          '<ul class="nav-dropdown-menu">' +
            '<li><a href="' + p + '/resources.html"' + a('resources.html') + '>Resources</a></li>' +
          '</ul>' +
        '</li>' +
        '<li><a href="' + p + '/blog/index.html"' + (onBlog ? ' class="nav-active"' : '') + '>Blog</a></li>' +
        '<li><a href="' + p + '/contact.html"' + a('contact.html') + '>Contact</a></li>' +
      '</ul>' +
    '</div>';

})();
