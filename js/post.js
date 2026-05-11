/* ============================================================
   post.js — Blog Post Page: Share & Utilities
   Portfolio: Madan Kumar PC
   ============================================================ */
(function initShare() {
  var url   = encodeURIComponent(window.location.href);
  var title = encodeURIComponent(document.title);

  var li = document.getElementById('share-linkedin');
  var tw = document.getElementById('share-twitter');
  var fb = document.getElementById('share-facebook');
  var wa = document.getElementById('share-whatsapp');

  if (li) li.href = 'https://www.linkedin.com/shareArticle?mini=true&url=' + url + '&title=' + title;
  if (tw) tw.href = 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title;
  if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
  if (wa) wa.href = 'https://wa.me/?text=' + title + '%20' + url;
})();

(function initReadingProgress() {
  var bar = document.createElement('div');
  bar.id = 'reading-progress';
  document.body.prepend(bar);

  function update() {
    var content = document.querySelector('.post-content') || document.querySelector('.blog-post');
    if (!content) return;
    var docH   = document.documentElement.scrollHeight - window.innerHeight;
    var pct    = docH > 0 ? Math.min((window.scrollY / docH) * 100, 100) : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

function copyPostLink() {
  var btn = document.getElementById('share-copy');
  navigator.clipboard.writeText(window.location.href).then(function () {
    btn.classList.add('copied');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    setTimeout(function () {
      btn.classList.remove('copied');
      btn.innerHTML = '<i class="fa-solid fa-link"></i> Copy Link';
    }, 2200);
  }).catch(function () {
    btn.textContent = 'Copy failed';
  });
}
