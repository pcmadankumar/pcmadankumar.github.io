/* Project screenshot galleries (Work Projects page).
   A card's .proj-shot button opens a lightbox with that project's screens.
   Data: <script type="application/json" id="proj-galleries">{"key":[{"src","alt","caption"}]}</script> */
(function () {
  var dataEl = document.getElementById('proj-galleries');
  if (!dataEl) return;
  var galleries;
  try { galleries = JSON.parse(dataEl.textContent); } catch (e) { return; }

  var dlg = document.createElement('dialog');
  dlg.className = 'shot-dialog';
  dlg.setAttribute('aria-label', 'Project screenshots');
  dlg.innerHTML =
    '<div class="shot-frame">' +
      '<button type="button" class="shot-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>' +
      '<figure class="shot-figure"><img class="shot-img" alt=""><figcaption class="shot-caption"></figcaption></figure>' +
      '<div class="shot-nav">' +
        '<button type="button" class="shot-prev" aria-label="Previous screenshot"><i class="fa-solid fa-chevron-left"></i></button>' +
        '<span class="shot-count" aria-live="polite"></span>' +
        '<button type="button" class="shot-next" aria-label="Next screenshot"><i class="fa-solid fa-chevron-right"></i></button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector('.shot-img');
  var cap = dlg.querySelector('.shot-caption');
  var count = dlg.querySelector('.shot-count');
  var nav = dlg.querySelector('.shot-nav');
  var list = [], idx = 0, opener = null;

  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pending = null, travel = 0;
  function show(i, dir) {
    idx = (i + list.length) % list.length;          // update at once so quick repeat clicks never skip
    if (dir && !reduced && img.getAttribute('src')) {
      // the old screen slides a little out in the direction of travel, the new one arrives from the other side
      travel = dir;
      img.style.setProperty('--shot-dx', (dir > 0 ? -18 : 18) + 'px');
      img.classList.add('is-leaving');
      clearTimeout(pending);
      pending = setTimeout(render, 140);
    } else {
      render();
    }
  }
  function enter() {
    if (!img.classList.contains('is-leaving')) return;
    img.style.transition = 'none';
    img.style.setProperty('--shot-dx', (travel > 0 ? 18 : -18) + 'px');
    void img.offsetWidth;                            // commit the start position
    img.style.transition = '';
    img.classList.remove('is-leaving');
  }
  function render() {
    var s = list[idx];
    img.onload = enter;
    img.src = s.src;
    if (img.complete) enter();
    img.alt = s.alt || s.caption || '';
    cap.textContent = s.caption || '';
    count.textContent = (idx + 1) + ' / ' + list.length;
    // preload the next one
    if (list.length > 1) { var n = new Image(); n.src = list[(idx + 1) % list.length].src; }
  }

  function open(key, btn) {
    list = galleries[key] || [];
    if (!list.length) return;
    opener = btn;
    nav.hidden = list.length < 2;
    show(0);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.documentElement.classList.add('shot-open');
  }

  function close() {
    if (dlg.open && typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
  }

  dlg.addEventListener('close', function () {
    document.documentElement.classList.remove('shot-open');
    img.removeAttribute('src');
    if (opener) opener.focus();
  });
  dlg.querySelector('.shot-close').addEventListener('click', close);
  dlg.querySelector('.shot-prev').addEventListener('click', function () { show(idx - 1, -1); });
  dlg.querySelector('.shot-next').addEventListener('click', function () { show(idx + 1, 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });   // backdrop
  dlg.addEventListener('keydown', function (e) {
    if (list.length < 2) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1, -1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1, 1); }
  });

  // swipe on touch screens
  var x0 = null;
  img.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  img.addEventListener('touchend', function (e) {
    if (x0 === null || list.length < 2) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });

  document.querySelectorAll('.proj-shot[data-gallery]').forEach(function (btn) {
    btn.addEventListener('click', function () { open(btn.getAttribute('data-gallery'), btn); });
  });
})();
