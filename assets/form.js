// Contact form. Posts to FormSubmit, which emails the address in config.js,
// and shows the result in place.
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var S = JSON.parse(document.getElementById('strings').textContent).contact;
  var cfg = window.CLINICLINE || {};
  var status = form.querySelector('.form-status');
  var send = form.querySelector('button[type=submit]');

  function say(text, isError) {
    status.textContent = text;
    status.classList.toggle('is-error', !!isError);
  }
  function value(name) { return form.elements[name].value.trim(); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (value('_gotcha')) return;
    if (!value('name') || !value('reach')) {
      say(S.required, true);
      (value('name') ? form.elements.reach : form.elements.name).focus();
      return;
    }
    var data = { name: value('name'), clinic: value('clinic'), contact: value('reach'), message: value('message') };

    send.disabled = true;
    say(S.sending);
    fetch('https://formsubmit.co/ajax/' + encodeURIComponent((cfg.mail || []).join('@')), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: data.name,
        clinic: data.clinic,
        contact: data.contact,
        message: data.message,
        _subject: 'ClinicLine: ' + (data.clinic || data.name),
        _template: 'table',
        _captcha: 'false',
      }),
    }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      form.reset();
      say(S.thanks);
    }).catch(function () {
      say(S.error, true);
    }).then(function () { send.disabled = false; });
  });
})();
