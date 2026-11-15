/* ============================================================
   checkout.js — Razorpay checkout for the product pages (Drishti, Shruti)

   <script src="js/checkout.js" defer
           data-api="https://drishti-licence.madankumarpc.workers.dev"
           data-product="Drishti" data-logo="images/drishti/drishti-logo.png"
           data-download="https://github.com/.../releases/latest"></script>

   Every [data-link="buy"] button opens checkout in the currency the page
   shows ([data-currency][aria-pressed="true"]). The licence server sets the
   price, creates the order and verifies the payment; only then does it hand
   back the licence key. No secret is ever in this file.
   ============================================================ */
(function () {
  var me = document.currentScript;
  if (!me) return;
  var API = (me.getAttribute('data-api') || '').replace(/\/$/, '');
  var NAME = me.getAttribute('data-product') || 'Licence';
  var LOGO = me.getAttribute('data-logo') ? new URL(me.getAttribute('data-logo'), location.href).href : undefined;
  var DOWNLOAD = me.getAttribute('data-download') || '';
  var STORE = 'checkout-' + NAME.toLowerCase();
  var busy = false;

  // ---------- UI: one dialog, three states (working / key / error)
  var css = document.createElement('style');
  css.textContent =
    '.ck-dialog{width:min(480px,92vw);border:1px solid var(--color-border,#333);border-radius:16px;padding:0;' +
    'background:var(--color-surface,#121212);color:var(--color-white,#f5f5f5);box-shadow:0 24px 70px rgba(0,0,0,.55)}' +
    '.ck-dialog::backdrop{background:rgba(5,5,5,.75)}' +
    '.ck-body{padding:26px 26px 22px;font-size:.95rem;line-height:1.6}' +
    '.ck-body h2{margin:0 0 10px;font-size:1.2rem;color:var(--color-white,#fff)}' +
    '.ck-key{display:flex;gap:8px;align-items:center;margin:14px 0;padding:12px 14px;border-radius:10px;' +
    'border:1px solid var(--color-gold,#c9a84c);background:rgba(201,168,76,.10);font-family:"JetBrains Mono",Consolas,monospace;' +
    'font-size:.98rem;letter-spacing:.5px;word-break:break-all}' +
    '.ck-key span{flex:1}' +
    '.ck-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 18px;border-radius:999px;' +
    'border:1px solid var(--color-gold,#c9a84c);background:var(--color-gold,#c9a84c);color:var(--on-gold,#0d0d0d);' +
    'font-weight:600;cursor:pointer;text-decoration:none;font-size:.9rem}' +
    '.ck-btn.ck-ghost{background:transparent;color:var(--color-white,#f5f5f5);border-color:var(--color-border,#444)}' +
    '.ck-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}' +
    '.ck-small{font-size:.82rem;color:var(--color-muted,#aaa)}' +
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
    var close = dlg.querySelector('[data-ck-close]');
    if (close) close.addEventListener('click', function () { dlg.close(); });
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
  }
  function working(text) {
    show('<p><span class="ck-spin" aria-hidden="true"></span>' + esc(text) + '</p>');
  }
  function failed(title, text) {
    show('<h2>' + esc(title) + '</h2><p>' + text + '</p>' +
      '<div class="ck-actions"><button type="button" class="ck-btn ck-ghost" data-ck-close>Close</button></div>');
  }
  function showKey(d, paymentId) {
    var mail = d.emailed
      ? 'A copy is on its way to <strong>' + esc(d.email) + '</strong>.'
      : 'Please copy it and keep it somewhere safe.';
    show('<h2>Payment received. Thank you!</h2>' +
      '<p>Your ' + esc(NAME) + ' licence key:</p>' +
      '<div class="ck-key"><span>' + esc(d.key) + '</span>' +
      '<button type="button" class="ck-btn" data-ck-copy>Copy</button></div>' +
      '<p>' + mail + ' To activate, open ' + esc(NAME) + ', choose <em>Enter licence key</em> and paste it. ' +
      'It works on up to 2 of your PCs.</p>' +
      '<p class="ck-small">Payment ID: ' + esc(paymentId) + '. Quote it if you ever need help.</p>' +
      '<div class="ck-actions">' +
      (DOWNLOAD ? '<a class="ck-btn" href="' + esc(DOWNLOAD) + '" target="_blank" rel="noopener">Download ' + esc(NAME) + '</a>' : '') +
      '<button type="button" class="ck-btn ck-ghost" data-ck-close>Close</button></div>');
    dlg.querySelector('[data-ck-close]').addEventListener('click', function () {
      try { sessionStorage.removeItem(STORE); } catch (e) {}   // shown once more after a refresh, not forever
    });
    var copy = dlg.querySelector('[data-ck-copy]');
    copy.addEventListener('click', function () {
      var done = function () { copy.textContent = 'Copied'; };
      if (navigator.clipboard) navigator.clipboard.writeText(d.key).then(done, function () {});
      else {
        var r = document.createRange(); r.selectNodeContents(dlg.querySelector('.ck-key span'));
        var s = getSelection(); s.removeAllRanges(); s.addRange(r);
      }
    });
  }

  // ---------- server and Razorpay
  function post(path, body) {
    return fetch(API + path, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    }).then(function (r) {
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
      s.onload = resolve;
      s.onerror = function () { sdk = null; reject(new Error('sdk')); };
      document.head.appendChild(s);
    });
    return sdk;
  }
  function pageCurrency() {
    var b = document.querySelector('[data-currency][aria-pressed="true"]');
    return b ? b.getAttribute('data-currency') : 'INR';
  }
  var contact = '<a href="contact.html">contact me</a>';
  var TRY = 'Meanwhile, the 15-day free trial has every feature.';

  // Step 1: where to send the key (Razorpay's form may ask only for a phone number).
  function start() {
    if (busy) return;
    var saved = '';
    try { saved = localStorage.getItem('checkout-email') || ''; } catch (e) {}
    show('<h2>Buy ' + esc(NAME) + '</h2>' +
      '<form data-ck-form novalidate><label for="ck-email">Where should I send your licence key?</label>' +
      '<input id="ck-email" type="email" autocomplete="email" required placeholder="you@example.com" value="' + esc(saved) + '" ' +
      'style="display:block;width:100%;margin:8px 0 4px;padding:11px 12px;border-radius:10px;border:1px solid var(--color-border,#444);' +
      'background:transparent;color:inherit;font:inherit">' +
      '<label for="ck-email2" style="display:block;margin-top:10px">Type it again to confirm</label>' +
      '<input id="ck-email2" type="email" autocomplete="off" required placeholder="you@example.com" ' +
      'style="display:block;width:100%;margin:8px 0 4px;padding:11px 12px;border-radius:10px;border:1px solid var(--color-border,#444);' +
      'background:transparent;color:inherit;font:inherit">' +
      '<p class="ck-small" data-ck-err aria-live="polite"></p>' +
      '<div class="ck-actions"><button type="submit" class="ck-btn">Continue to payment</button>' +
      '<button type="button" class="ck-btn ck-ghost" data-ck-close>Cancel</button></div></form>');
    var form = dlg.querySelector('[data-ck-form]'), input = form.querySelector('#ck-email'), input2 = form.querySelector('#ck-email2');
    // Retyping (not pasting) is what catches a typo in the address.
    input2.addEventListener('paste', function (e) { e.preventDefault(); });
    input2.addEventListener('drop', function (e) { e.preventDefault(); });
    (input.value ? input2 : input).focus();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = input.value.trim(), err = form.querySelector('[data-ck-err]');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err.textContent = 'Please enter a valid email address.';
        input.focus();
        return;
      }
      if (input2.value.trim().toLowerCase() !== email.toLowerCase()) {
        err.textContent = 'The two email addresses don’t match. Please check them.';
        input2.focus();
        return;
      }
      try { localStorage.setItem('checkout-email', email); } catch (e2) {}
      pay(email);
    });
  }

  // Step 2: order on the licence server, then Razorpay's payment window.
  function pay(email) {
    if (busy) return;
    busy = true;
    working('Opening secure checkout…');
    Promise.all([loadRazorpay(), post('/v1/order', { currency: pageCurrency(), email: email })]).then(function (res) {
      var order = res[1];
      var paid = false;
      dlg.close();
      var rzp = new window.Razorpay({
        key: order.key_id, order_id: order.order_id, amount: order.amount, currency: order.currency,
        name: NAME, description: NAME + ' licence: up to 2 PCs, all 1.x updates', image: LOGO,
        theme: { color: '#c9a84c' },
        prefill: { email: email },
        handler: function (resp) {
          paid = true;
          working('Payment received. Preparing your licence key…');
          post('/v1/verify', resp).then(function (d) {
            try { sessionStorage.setItem(STORE, JSON.stringify({ d: d, p: resp.razorpay_payment_id })); } catch (e) {}
            showKey(d, resp.razorpay_payment_id);
          }).catch(function () {
            failed('We could not confirm the payment yet',
              'If money left your account, your key is safe: please ' + contact + ' with payment ID <strong>' +
              esc(resp.razorpay_payment_id) + '</strong> and I will send it to you.');
          }).then(function () { busy = false; });
        },
        modal: {
          ondismiss: function () {
            if (!paid) { busy = false; failed('Payment cancelled', 'You have not been charged. You can try again any time.'); }
          }
        }
      });
      rzp.on('payment.failed', function (r) {
        var why = (r && r.error && r.error.description) || 'The payment did not go through.';
        busy = false;
        try { rzp.close(); } catch (e) {}
        failed('Payment failed', esc(why) + ' You have not been charged. Please try again or use another method.');
      });
      rzp.open();
    }).catch(function (e) {
      busy = false;
      if (e && e.code === 'payments_not_configured') { failed('Payments open soon', 'Online payments open in a few days. ' + (TRY ? TRY + ' ' : '') + 'To buy now, or to hear the moment checkout opens, ' + contact + '.'); return; }
      failed('Checkout is not available right now',
        (e && e.message === 'sdk' ? 'The payment window could not load. Check your connection and try again.'
          : 'Please try again in a minute, or ' + contact + '.'));
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-link="buy"]');
    if (!a) return;
    e.preventDefault();
    start();
  });

  // A refresh right after paying shows the key again.
  try {
    var last = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    if (last && last.d && last.d.key) document.addEventListener('DOMContentLoaded', function () { showKey(last.d, last.p); });
  } catch (e) {}
})();
