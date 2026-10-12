/* ============================================================
   page-home.js — page script for index.html
   (extracted from inline <script> blocks)
   ============================================================ */
(function() {
    var grid = document.getElementById('home-blog-grid');
    if (!grid) return;
    fetch('blog/posts.json')
      .then(function(r) { return r.json(); })
      .then(function(posts) {
        posts.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        var top3 = posts.slice(0, 3);
        grid.innerHTML = top3.map(function(p) {
          var thumb = p.image
            ? '<a href="blog/' + p.file + '" tabindex="-1" aria-hidden="true"><picture><source type="image/webp" srcset="' + p.image.replace(/\.(png|jpe?g)(\?.*)?$/i, '.webp') + '"><img class="hb-thumb" src="' + p.image + '" alt="' + p.title.replace(/"/g,'&quot;') + '" loading="lazy"></picture></a>'
            : '';
          var tags = p.tags.slice(0, 2).map(function(t) {
            return '<span class="blog-tag">' + t + '</span>';
          }).join('');
          var date = new Date(p.date).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' });
          return '<article class="hb-card fade-up">' +
            thumb +
            '<div class="hb-body">' +
              '<div class="hb-meta"><i class="fa-solid fa-calendar-days"></i>' + date +
                ' &nbsp;·&nbsp; <i class="fa-solid fa-clock"></i>' + p.readTime + ' min</div>' +
              '<a href="blog/' + p.file + '" class="hb-title">' + p.title + '</a>' +
              '<p class="hb-excerpt">' + p.excerpt + '</p>' +
              '<div class="hb-tags">' + tags + '</div>' +
            '</div>' +
          '</article>';
        }).join('');
        grid.querySelectorAll('.fade-up').forEach(function(el, i) {
          el.style.transitionDelay = (i * 80) + 'ms';
          setTimeout(function() { el.classList.add('visible'); }, 20);
        });
      })
      .catch(function() { grid.innerHTML = ''; });
  })();

(function() {
    var carousel = document.getElementById('home-res-carousel');
    if (!carousel) return;
    var track     = carousel.querySelector('.home-res-track');
    var wrap      = carousel.querySelector('.home-res-track-wrap');
    var dotsWrap  = carousel.querySelector('.hrc-dots');
    var btnPrev   = carousel.querySelector('.hrc-btn-prev');
    var btnNext   = carousel.querySelector('.hrc-btn-next');
    var progWrap  = carousel.querySelector('.hrc-progress-wrap');
    var progress  = carousel.querySelector('.hrc-progress');
    var current   = 0;
    var items     = [];
    var timer;
    var AUTO_MS   = 5000;

    /* A7: autoplay progress bar — restarts on every slide change */
    function setProgress(run) {
      if (!progress) return;
      progress.style.transition = 'none';
      progress.style.width = '0%';
      if (run) {
        void progress.offsetWidth; /* reflow so the new transition starts from 0 */
        progress.style.transition = 'width ' + AUTO_MS + 'ms linear';
        progress.style.width = '100%';
      }
    }

    function buildSlide(r) {
      var imgHtml = r.icon
        ? '<picture><source type="image/webp" srcset="' + r.icon.replace(/\.(png|jpe?g)(\?.*)?$/i, '.webp') + '"><img class="hrc-thumb" src="' + r.icon + '" alt="' + r.title + '" loading="lazy"></picture>'
        : '<div class="hrc-thumb-placeholder"><i class="fa-solid fa-book-open"></i></div>';
      var badges = (r.formats || []).map(function(f) {
        return '<span class="res-format-badge">' + f + '</span>';
      }).join('');
      var tags = (r.tags || []).map(function(t) {
        return '<span class="res-tag">' + t + '</span>';
      }).join('');
      return '<div class="home-res-slide">' +
        '<a class="hrc-card" href="' + r.url + '" target="_blank" rel="noopener">' +
          imgHtml +
          '<div class="hrc-body">' +
            '<div class="hrc-formats">' + badges + '</div>' +
            '<div class="hrc-title">' + r.title + '</div>' +
            (r.bestFor ? '<div class="res-bestfor"><span>Best for:</span> ' + r.bestFor + '</div>' : '') +
            '<div class="hrc-desc">' + r.description + '</div>' +
            '<div class="hrc-tags">' + tags + '</div>' +
            '<div class="hrc-cta-line"><i class="fa-solid fa-arrow-right"></i> Get it now</div>' +
          '</div>' +
        '</a>' +
      '</div>';
    }

    function goTo(idx) {
      current = (idx + items.length) % items.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dotsWrap.querySelectorAll('.hrc-dot').forEach(function(d, i) {
        d.classList.toggle('active', i === current);
      });
    }

    function startAuto() {
      /* no autoplay for reduced-motion users or hidden tabs (A7) */
      if ((typeof REDUCED_MOTION !== 'undefined' && REDUCED_MOTION) || document.hidden || items.length < 2) return;
      stopAuto();
      setProgress(true);
      timer = setInterval(function() { goTo(current + 1); setProgress(true); }, AUTO_MS);
    }

    function stopAuto() { clearInterval(timer); timer = null; setProgress(false); }

    /* A7: touch/pointer swipe with link-click suppression after a drag */
    function enableDrag() {
      var dragging = false, startX = 0, dx = 0, dragMoved = false;
      wrap.style.touchAction = 'pan-y';
      wrap.addEventListener('pointerdown', function(e) {
        dragging = true; dragMoved = false; startX = e.clientX; dx = 0;
        stopAuto();
        track.style.transition = 'none';
        if (wrap.setPointerCapture) wrap.setPointerCapture(e.pointerId);
      });
      wrap.addEventListener('pointermove', function(e) {
        if (!dragging) return;
        dx = e.clientX - startX;
        if (Math.abs(dx) > 8) dragMoved = true;
        track.style.transform = 'translateX(calc(-' + (current * 100) + '% + ' + dx + 'px))';
      });
      function release() {
        if (!dragging) return;
        dragging = false;
        track.style.transition = '';
        if (Math.abs(dx) > 60) { goTo(dx < 0 ? current + 1 : current - 1); }
        else { goTo(current); }
        startAuto();
      }
      wrap.addEventListener('pointerup', release);
      wrap.addEventListener('pointercancel', release);
      wrap.addEventListener('click', function(e) {
        if (dragMoved) { e.preventDefault(); e.stopPropagation(); dragMoved = false; }
      }, true);
    }

    fetch('resources.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        // Homepage carousel shows my own products only — recommended ("Worth Your Time") items live on the resources page.
        items = data.filter(function(r) { return (r.type || 'mine') === 'mine'; });
        if (!items.length) { carousel.closest('.home-res').style.display = 'none'; return; }
        track.innerHTML = items.map(buildSlide).join('');
        if (items.length < 2) {
          btnPrev.style.display = 'none';
          btnNext.style.display = 'none';
          if (progWrap) progWrap.style.display = 'none';
        } else {
          items.forEach(function(_, i) {
            var dot = document.createElement('button');
            dot.className = 'hrc-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
            dot.addEventListener('click', function() { stopAuto(); goTo(i); startAuto(); });
            dotsWrap.appendChild(dot);
          });
          btnPrev.addEventListener('click', function() { stopAuto(); goTo(current - 1); startAuto(); });
          btnNext.addEventListener('click', function() { stopAuto(); goTo(current + 1); startAuto(); });
          carousel.addEventListener('mouseenter', stopAuto);
          carousel.addEventListener('mouseleave', startAuto);
          enableDrag();
          document.addEventListener('visibilitychange', function() {
            if (document.hidden) { stopAuto(); } else { startAuto(); }
          });
          startAuto();
        }
      })
      .catch(function() { carousel.closest('.home-res').style.display = 'none'; });
  })();
