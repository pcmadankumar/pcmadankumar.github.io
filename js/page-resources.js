/* ============================================================
   page-resources.js — page script for resources.html
   (extracted from inline <script> blocks)
   ============================================================ */
(function() {
    var root = document.getElementById('res-root');
    if (!root) return;

    function esc(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;'); }
    function tagsHtml(r) {
      return (r.tags || []).map(function(t) { return '<span class="res-tag">' + t + '</span>'; }).join('');
    }

    // "My Resources" card — solid gold "Get it now" → Gumroad
    function mineCard(r) {
      var formats = (r.formats || []).map(function(f) {
        return '<span class="res-format-badge">' + f + '</span>';
      }).join('');
      var thumb = r.cover
        ? '<img class="res-thumb" src="' + r.cover + '" alt="' + esc(r.title) + '" loading="lazy">'
        : '<div class="res-thumb-placeholder"><i class="fa-solid fa-book-open"></i></div>';
      var bestFor = r.bestFor
        ? '<p class="res-bestfor"><span>Best for:</span> ' + r.bestFor + '</p>'
        : '';
      return '<article class="res-card fade-up">' +
        thumb +
        '<div class="res-body">' +
          '<div class="res-formats">' + formats + '</div>' +
          '<h3 class="res-title">' + r.title + '</h3>' +
          bestFor +
          '<p class="res-desc">' + r.description + '</p>' +
          '<div class="res-tags">' + tagsHtml(r) + '</div>' +
        '</div>' +
        '<div class="res-footer">' +
          '<a href="' + r.url + '" target="_blank" rel="noopener noreferrer" class="res-btn">' +
            '<i class="fa-solid fa-bag-shopping"></i> Get it now' +
          '</a>' +
        '</div>' +
      '</article>';
    }

    // "Worth Your Time" card — others' work, attribution + thanks, outline "Visit resource"
    function recCard(r) {
      var thumb = r.cover
        ? '<img class="res-thumb" src="' + r.cover + '" alt="' + esc(r.title) + '" loading="lazy">'
        : '<div class="res-thumb-placeholder"><i class="fa-solid fa-bookmark"></i></div>';
      var attr = r.author
        ? '<p class="res-attribution"><i class="fa-solid fa-user-pen"></i> by ' + r.author +
            (r.source ? ' &middot; <span>' + r.source + '</span>' : '') + '</p>'
        : '';
      var thanks = r.thanks ? '<p class="res-thanks">' + r.thanks + '</p>' : '';
      return '<article class="res-card res-card--rec fade-up">' +
        '<span class="res-rec-label"><i class="fa-solid fa-heart"></i> Recommended</span>' +
        thumb +
        '<div class="res-body">' +
          attr +
          '<h3 class="res-title">' + r.title + '</h3>' +
          '<p class="res-desc">' + r.description + '</p>' +
          thanks +
          '<div class="res-tags">' + tagsHtml(r) + '</div>' +
        '</div>' +
        '<div class="res-footer">' +
          '<a href="' + r.url + '" target="_blank" rel="noopener noreferrer" class="res-btn res-btn--visit">' +
            '<i class="fa-solid fa-arrow-up-right-from-square"></i> Visit resource' +
          '</a>' +
        '</div>' +
      '</article>';
    }

    function sectionBlock(title, intro, cardsHtml) {
      return '<section class="res-section">' +
        '<h2 class="res-section-title">' + title + '</h2>' +
        '<p class="res-section-intro">' + intro + '</p>' +
        '<div class="res-grid">' + cardsHtml + '</div>' +
      '</section>';
    }

    fetch('resources.json')
      .then(function(r) { return r.json(); })
      .then(function(resources) {
        var mine = resources.filter(function(r) { return (r.type || 'mine') === 'mine'; });
        var rec  = resources.filter(function(r) { return r.type === 'recommended'; });

        if (!mine.length && !rec.length) {
          root.innerHTML = '<p class="res-empty">No resources available yet — check back soon!</p>';
          return;
        }

        var html = '';
        if (mine.length) {
          html += sectionBlock(
            'My <span>Resources</span>',
            'Teaching aids I’ve built for Cambridge subjects — ready to use in class, available on Gumroad.',
            mine.map(mineCard).join('')
          );
        }
        if (rec.length) {
          html += sectionBlock(
            'Worth Your <span>Time</span>',
            'Resources created by others that I genuinely rate — full credit to their authors. Every link goes to the original source.',
            rec.map(recCard).join('')
          );
        }
        root.innerHTML = html;

        root.querySelectorAll('.fade-up').forEach(function(el, i) {
          el.style.transitionDelay = (i * 80) + 'ms';
          setTimeout(function() { el.classList.add('visible'); }, 20);
        });
      })
      .catch(function() {
        root.innerHTML = '<p class="res-empty">Unable to load resources. Please try again later.</p>';
      });
  })();
