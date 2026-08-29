/* ============================================================
   page-contact.js — page script for contact.html
   (extracted from inline <script> blocks)
   ============================================================ */
(function () {
      var form = document.getElementById('contactForm');
      if (!form) return;

      form.addEventListener('submit', async function (e) {
        e.preventDefault();

        var nameVal    = document.getElementById('cf_name').value.trim();
        var subjectVal = document.getElementById('cf_subject').value.trim();
        var serviceEl  = document.getElementById('cf_service');
        var serviceVal = serviceEl ? serviceEl.value : '';
        var submitBtn  = document.getElementById('submitBtn');
        var successMsg = document.getElementById('formSuccess');
        var errorMsg   = document.getElementById('formError');

        // Build the email subject line dynamically
        document.getElementById('emailSubject').value =
          'New message from ' + nameVal + (serviceVal ? ' \u2014 ' + serviceVal : '') + ' \u2014 Portfolio Contact Form';

        // UI: loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending\u2026</span>';
        successMsg.style.display = 'none';
        errorMsg.style.display   = 'none';

        // Collect form data and prepend user's subject into the message body
        var formData  = new FormData(form);
        var origMsg   = formData.get('message');
        formData.set('message', 'Subject: ' + subjectVal + '\n\n' + origMsg);

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

        // UI: restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span>Send Message</span>';
      });
    })();
