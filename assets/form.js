// Contact form. With a Formspree form id in config.js it posts there and shows
// the result in place; without one it opens the visitor's email app with the
// message ready, so the form always does something real.
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

    if (cfg.formspreeId) {
      send.disabled = true;
      say(S.sending);
      fetch('https://formspree.io/f/' + encodeURIComponent(cfg.formspreeId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      }).then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        form.reset();
        say(S.thanks);
      }).catch(function () {
        say(S.error, true);
      }).then(function () { send.disabled = false; });
      return;
    }

    var to = (cfg.mail || []).join('@');
    var body = [data.name, data.clinic, data.contact, '', data.message].join('\n');
    window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('ClinicLine: ' + (data.clinic || data.name)) + '&body=' + encodeURIComponent(body);
    say(S.mailNote);
  });
})();
