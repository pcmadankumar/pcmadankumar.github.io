/* ============================================================
   kits.js — free Starter downloads and Razorpay checkout for the
   Cambridge teacher-kit pages.

   <script src="js/kits.js" defer data-api="https://kits-shop.<account>.workers.dev"></script>

   [data-link="free"][data-kit]  -> email, then free Starter download links
   [data-link="buy"][data-kit]   -> email, Razorpay payment, then Starter + Full links
   The shop server sets prices, checks every payment and serves the files;
   no secret is ever in this file.
   ============================================================ */
(function () {
  var me = document.currentScript;
  if (!me) return;
  var API = (me.getAttribute('data-api') || '').replace(/\/$/, '');
  var busy = false;

  var css = document.createElement('style');
  css.textContent =
    '.ck-dialog{width:min(520px,92vw);border:1px solid var(--color-border,#333);border-radius:16px;padding:0;' +
    'background:var(--color-surface,#121212);color:var(--color-white,#f5f5f5);box-shadow:0 24px 70px rgba(0,0,0,.55)}' +
    '.ck-dialog::backdrop{background:rgba(5,5,5,.75)}' +
    '.ck-body{padding:26px 26px 22px;font-size:.95rem;line-height:1.6}' +
    '.ck-body h2{margin:0 0 10px;font-size:1.2rem;color:var(--color-white,#fff)}' +
    '.ck-files{list-style:none;margin:14px 0;padding:0;display:grid;gap:8px}' +
    '.ck-files a{display:flex;justify-content:space-between;gap:10px;padding:10px 14px;border-radius:10px;' +
    'border:1px solid var(--color-gold,#c9a84c);background:rgba(201,168,76,.08);color:inherit;text-decoration:none;font-size:.9rem}' +
    '.ck-files a:hover{background:rgba(201,168,76,.18)}' +
    '.ck-files small{color:var(--color-gold,#c9a84c);white-space:nowrap}' +
    '.ck-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 18px;border-radius:999px;' +
    'border:1px solid var(--color-gold,#c9a84c);background:var(--color-gold,#c9a84c);color:var(--on-gold,#0d0d0d);' +
    'font-weight:600;cursor:pointer;text-decoration:none;font-size:.9rem}' +
    '.ck-btn.ck-ghost{background:transparent;color:var(--color-white,#f5f5f5);border-color:var(--color-border,#444)}' +
    '.ck-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}' +
    '.ck-small{font-size:.82rem;color:var(--color-muted,#aaa)}' +
    '.ck-input{display:block;width:100%;margin:8px 0 4px;padding:11px 12px;border-radius:10px;' +
    'border:1px solid var(--color-border,#444);background:transparent;color:inherit;font:inherit}' +
    '.ck-spin{width:18px;height:18px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;' +
    'display:inline-block;vertical-align:-3px;margin-right:8px;animation:ck-spin .8s linear infinite}' +
    '@keyframes ck-spin{to{transform:rotate(360deg)}}' +
    '@media (prefers-reduced-motion: reduce){.ck-spin{animation:none}}';
  document.head.appendChild(css);

  var dlg = document.createElement('dialog');
  dlg.className = 'ck-dialog';
  dlg.setAttribute('aria-live', 'polite');
  document.body.appendChild(dlg);

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function show(html) {
    dlg.innerHTML = '<div class="ck-body">' + html + '</div>';
    dlg.querySelectorAll('[data-ck-close]').forEach(function (b) { b.addEventListener('click', function () { dlg.close(); }); });
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
  }
  function working(t) { show('<p><span class="ck-spin" aria-hidden="true"></span>' + esc(t) + '</p>'); }
  function failed(title, html) {
    show('<h2>' + esc(title) + '</h2><p>' + html + '</p><div class="ck-actions">' +
      '<button type="button" class="ck-btn ck-ghost" data-ck-close>Close</button></div>');
  }
  function showFiles(d, paymentId) {
    var items = d.files.map(function (f) {
      return '<li><a href="' + esc(f.url) + '" download><span>' + esc(f.name) + '</span><small>' +
        (f.tier === 'full' ? 'Full kit' : 'Starter') + ' · Download</small></a></li>';
    }).join('');
    var mail = d.emailed ? 'The same links are on their way to <strong>' + esc(d.email || '') + '</strong>. '
                         : 'Please download the files now, or bookmark this page while the links are open. ';
    var keep = d.expires_days ? 'These links work for ' + d.expires_days + ' days.' : 'These links keep working.';
    show('<h2>' + (paymentId ? 'Payment received. Thank you!' : 'Your free Starter is ready') + '</h2>' +
      '<p>' + esc(d.title) + '</p><ul class="ck-files">' + items + '</ul>' +
      '<p class="ck-small">' + mail + keep + (paymentId ? ' Payment ID: ' + esc(paymentId) + '.' : '') + '</p>' +
      '<div class="ck-actions"><button type="button" class="ck-btn ck-ghost" data-ck-close>Close</button></div>');
  }

  function post(path, body) {
    return fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok) { var e = new Error(d.error || ('HTTP ' + r.status)); e.code = d.error; throw e; }
          return d;
        });
      });
  }
  var sdk = null;
  function loadRazorpay() {
    if (window.Razorpay) return Promise.resolve();
    if (sdk) return sdk;
    sdk = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = resolve; s.onerror = function () { sdk = null; reject(new Error('sdk')); };
      document.head.appendChild(s);
    });
    return sdk;
  }
  function pageCurrency() {
    var b = document.querySelector('[data-currency][aria-pressed="true"]');
    return b ? b.getAttribute('data-currency') : 'INR';
  }
  var contact = '<a href="contact.html">contact me</a>';
  var TRY = 'Meanwhile, the free Starter is available on this page.';

  // Step 1: the email address (needed for both: links are also emailed).
  function askEmail(kind, kit) {
    var saved = '';
    try { saved = localStorage.getItem('checkout-email') || ''; } catch (e) {}
    show('<h2>' + (kind === 'free' ? 'Get the free Starter' : 'Buy the Full kit') + '</h2>' +
      '<form data-ck-form novalidate><label for="ck-email">' +
      (kind === 'free' ? 'Where should I send the download links?' : 'Where should I send your download links and receipt?') +
      '</label><input id="ck-email" class="ck-input" type="email" autocomplete="email" required placeholder="you@example.com" value="' + esc(saved) + '">' +
      '<p class="ck-small" data-ck-err aria-live="polite"></p><div class="ck-actions">' +
      '<button type="submit" class="ck-btn">' + (kind === 'free' ? 'Get the links' : 'Continue to payment') + '</button>' +
      '<button type="button" class="ck-btn ck-ghost" data-ck-close>Cancel</button></div></form>');
    var form = dlg.querySelector('[data-ck-form]'), input = form.querySelector('input');
    input.focus();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.querySelector('[data-ck-err]').textContent = 'Please enter a valid email address.';
        input.focus(); return;
      }
      try { localStorage.setItem('checkout-email', email); } catch (e2) {}
      if (kind === 'free') getFree(kit, email); else pay(kit, email);
    });
  }

  function getFree(kit, email) {
    if (busy) return; busy = true;
    working('Preparing your download links…');
    post('/v1/free', { kit: kit, email: email }).then(function (d) { d.email = email; showFiles(d); })
      .catch(function () { failed('Something went wrong', 'Please try again in a minute, or ' + contact + '.'); })
      .then(function () { busy = false; });
  }

  function pay(kit, email) {
    if (busy) return; busy = true;
    working('Opening secure checkout…');
    Promise.all([loadRazorpay(), post('/v1/order', { kit: kit, currency: pageCurrency(), email: email })]).then(function (res) {
      var order = res[1], paid = false;
      dlg.close();
      var rzp = new window.Razorpay({
        key: order.key_id, order_id: order.order_id, amount: order.amount, currency: order.currency,
        name: 'Madan Kumar PC', description: order.title, theme: { color: '#c9a84c' }, prefill: { email: email },
        handler: function (resp) {
          paid = true;
          working('Payment received. Preparing your downloads…');
          post('/v1/verify', resp).then(function (d) { showFiles(d, resp.razorpay_payment_id); })
            .catch(function () {
              failed('We could not confirm the payment yet', 'If money left your account, your kit is safe: please ' + contact +
                ' with payment ID <strong>' + esc(resp.razorpay_payment_id) + '</strong> and I will send the files.');
            }).then(function () { busy = false; });
        },
        modal: { ondismiss: function () { if (!paid) { busy = false; failed('Payment cancelled', 'You have not been charged. You can try again any time.'); } } }
      });
      rzp.on('payment.failed', function (r) {
        busy = false;
        try { rzp.close(); } catch (e) {}
        failed('Payment failed', esc((r && r.error && r.error.description) || 'The payment did not go through.') +
          ' You have not been charged. Please try again or use another method.');
      });
      rzp.open();
    }).catch(function (e) {
      busy = false;
      if (e && e.code === 'payments_not_configured') { failed('Payments open soon', 'Online payments open in a few days. ' + (TRY ? TRY + ' ' : '') + 'To buy now, or to hear the moment checkout opens, ' + contact + '.'); return; }
      failed('Checkout is not available right now', e && e.message === 'sdk'
        ? 'The payment window could not load. Check your connection and try again.'
        : 'Please try again in a minute, or ' + contact + '.');
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-link="free"][data-kit], [data-link="buy"][data-kit]');
    if (!a) return;
    e.preventDefault();
    askEmail(a.getAttribute('data-link'), a.getAttribute('data-kit'));
  });
})();
