/* ============================================================
   testimonial-modal.js — shared by testimonials.html and
   work-with-me.html (was duplicated inline in both).

   The two inline copies each hard-coded their own modal ids
   ('modal-*' vs 'wm-modal-*'), so Escape only worked on the page
   whose ids happened to be listed. This closes whichever modal is
   actually open, so it works on both pages and needs no editing
   when a testimonial is added.
   ============================================================ */
function openTestimonialModal(id) {
  var modal = document.getElementById(id);
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeTestimonialModal(id) {
  var modal = document.getElementById(id);
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

(function initTestimonialModals() {
  'use strict';

  function openModals() {
    var open = [];
    var all = document.querySelectorAll('[id*="modal-"]');
    for (var i = 0; i < all.length; i++) {
      if (all[i].style.display === 'flex') open.push(all[i]);
    }
    return open;
  }

  function closeAll() {
    var open = openModals();
    for (var i = 0; i < open.length; i++) {
      open[i].style.display = 'none';
    }
    if (open.length) document.body.style.overflow = '';
    return open.length;
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') closeAll();
  });

  /* Clicking the backdrop closes it too */
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id && e.target.id.indexOf('modal-') !== -1
        && e.target.style.display === 'flex') {
      closeAll();
    }
  });
})();
