/* ============================================================
   blog.js — Blog Listing Page Logic
   Portfolio: Madan Kumar PC
   ============================================================ */
(function () {
  var POSTS_PER_PAGE = 6;
  var allPosts = [];
  var filtered = [];
  var currentPage = 1;
  var activeTag = null;

  var grid       = document.getElementById('blog-grid');
  var pagination = document.getElementById('blog-pagination');
  var searchEl   = document.getElementById('blog-search');
  var tagFilters = document.getElementById('tag-filters');
  var countEl    = document.getElementById('blog-result-count');

  if (!grid) return;

  fetch('posts.json')
    .then(function (r) { return r.json(); })
    .then(function (posts) {
      allPosts = posts.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      buildTagFilters();
      applyFilters();
    })
    .catch(function () {
      grid.innerHTML = '<div class="blog-empty"><i class="fa-solid fa-circle-exclamation"></i><p>Could not load posts.</p></div>';
    });

  function buildTagFilters() {
    var tags = [];
    allPosts.forEach(function (p) {
      p.tags.forEach(function (t) {
        if (tags.indexOf(t) === -1) tags.push(t);
      });
    });
    tags.sort();

    tagFilters.innerHTML = '<span class="tag-filter-label">Filter:</span>';

    var allBtn = makeTagBtn('All', true);
    allBtn.addEventListener('click', function () { setTag(null, allBtn); });
    tagFilters.appendChild(allBtn);

    tags.forEach(function (tag) {
      var btn = makeTagBtn(tag, false);
      btn.addEventListener('click', function () { setTag(tag, btn); });
      tagFilters.appendChild(btn);
    });
  }

  function makeTagBtn(label, isActive) {
    var btn = document.createElement('button');
    btn.className = 'tag-filter-btn' + (isActive ? ' active' : '');
    btn.textContent = label;
    return btn;
  }

  function setTag(tag, btn) {
    activeTag = tag;
    tagFilters.querySelectorAll('.tag-filter-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    currentPage = 1;
    applyFilters();
  }

  function applyFilters() {
    var q = searchEl ? searchEl.value.toLowerCase().trim() : '';
    filtered = allPosts.filter(function (post) {
      var matchTag = !activeTag || post.tags.indexOf(activeTag) !== -1;
      var matchSearch = !q ||
        post.title.toLowerCase().indexOf(q) !== -1 ||
        post.excerpt.toLowerCase().indexOf(q) !== -1 ||
        post.tags.some(function (t) { return t.toLowerCase().indexOf(q) !== -1; });
      return matchTag && matchSearch;
    });
    currentPage = 1;
    renderPage();
  }

  function renderPage() {
    var start = (currentPage - 1) * POSTS_PER_PAGE;
    var page  = filtered.slice(start, start + POSTS_PER_PAGE);

    if (countEl) {
      countEl.textContent = filtered.length === 0
        ? 'No posts found'
        : filtered.length + ' post' + (filtered.length !== 1 ? 's' : '');
    }

    if (page.length === 0) {
      grid.innerHTML = '<div class="blog-empty"><i class="fa-solid fa-magnifying-glass"></i><p>No posts match your search.</p></div>';
      if (pagination) pagination.innerHTML = '';
      return;
    }

    grid.innerHTML = page.map(function (post) {
      var tagsHtml = post.tags.map(function (t) {
        return '<span class="blog-tag" data-tag="' + escHtml(t) + '">' + escHtml(t) + '</span>';
      }).join('');

      var thumbHtml = post.image
        ? '<a href="' + post.file + '" tabindex="-1" aria-hidden="true"><img class="blog-card-thumb" src="../' + escHtml(post.image) + '" alt="' + escHtml(post.title) + '" loading="lazy"></a>'
        : '';

      return '<article class="blog-card fade-up">' +
        thumbHtml +
        '<div class="blog-card-body">' +
        '<div class="blog-card-meta">' +
          '<span><i class="fa-solid fa-calendar-days"></i>' + fmtDate(post.date) + '</span>' +
          '<span><i class="fa-solid fa-clock"></i>' + post.readTime + ' min read</span>' +
        '</div>' +
        '<a href="' + post.file + '" class="blog-card-title">' + escHtml(post.title) + '</a>' +
        '<p class="blog-card-excerpt">' + escHtml(post.excerpt) + '</p>' +
        '<div class="blog-card-tags">' + tagsHtml + '</div>' +
        '<a href="' + post.file + '" class="blog-card-read-more">Read More <i class="fa-solid fa-arrow-right"></i></a>' +
        '</div>' +
        '</article>';
    }).join('');

    grid.querySelectorAll('.blog-tag[data-tag]').forEach(function (el) {
      el.addEventListener('click', function () {
        var tag = el.dataset.tag;
        var btn = null;
        tagFilters.querySelectorAll('.tag-filter-btn').forEach(function (b) {
          if (b.textContent === tag) btn = b;
        });
        if (btn) {
          setTag(tag, btn);
        } else {
          activeTag = tag;
          currentPage = 1;
          applyFilters();
        }
      });
    });

    grid.querySelectorAll('.fade-up').forEach(function (el, i) {
      el.style.transitionDelay = (i * 60) + 'ms';
      setTimeout(function () { el.classList.add('visible'); }, 10);
    });

    renderPagination();
  }

  function renderPagination() {
    if (!pagination) return;
    var total = Math.ceil(filtered.length / POSTS_PER_PAGE);
    if (total <= 1) { pagination.innerHTML = ''; return; }

    var html = '<button class="page-btn" onclick="blogChangePage(' + (currentPage - 1) + ')"' +
      (currentPage === 1 ? ' disabled' : '') + '><i class="fa-solid fa-chevron-left"></i></button>';

    for (var i = 1; i <= total; i++) {
      html += '<button class="page-btn' + (i === currentPage ? ' active' : '') +
        '" onclick="blogChangePage(' + i + ')">' + i + '</button>';
    }

    html += '<button class="page-btn" onclick="blogChangePage(' + (currentPage + 1) + ')"' +
      (currentPage === total ? ' disabled' : '') + '><i class="fa-solid fa-chevron-right"></i></button>';

    pagination.innerHTML = html;
  }

  window.blogChangePage = function (page) {
    var total = Math.ceil(filtered.length / POSTS_PER_PAGE);
    if (page < 1 || page > total) return;
    currentPage = page;
    renderPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (searchEl) {
    searchEl.addEventListener('input', applyFilters);
  }

  function fmtDate(str) {
    return new Date(str).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
