/* ============================================================
   page-work-with-me.js — page script for work-with-me.html
   (extracted from inline <script> blocks)
   ============================================================ */
(function () {
      var form = document.getElementById('wmContactForm');
      if (!form) return;

      form.addEventListener('submit', async function (e) {
        e.preventDefault();

        var nameVal    = document.getElementById('wm_name').value.trim();
        var serviceEl  = document.getElementById('wm_service');
        var serviceVal = serviceEl ? serviceEl.value : '';
        var submitBtn  = document.getElementById('wmSubmitBtn');
        var successMsg = document.getElementById('wmFormSuccess');
        var errorMsg   = document.getElementById('wmFormError');

        document.getElementById('wmEmailSubject').value =
          'Work With Me Enquiry from ' + nameVal + (serviceVal ? ' — ' + serviceVal : '');

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending…</span>';
        successMsg.style.display = 'none';
        errorMsg.style.display   = 'none';

        var formData = new FormData(form);

        try {
          var response = await fetch('https://api.web3forms.com/submit', {
            method : 'POST',
            body   : formData
          });
          var data = await response.json();

          if (data.success) {
            successMsg.style.display = 'flex';
            form.reset();
          } else {
            errorMsg.style.display = 'flex';
          }
        } catch (err) {
          errorMsg.style.display = 'flex';
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span>Send Enquiry</span>';
      });
    })();
