// The hero tooth chart: pick a tooth, add a finding, see it become a treatment,
// mark it completed and watch the chart update. Mirrors how the real app behaves.
(function () {
  var root = document.getElementById('chart');
  if (!root) return;
  var S = JSON.parse(document.getElementById('strings').textContent);

  var KINDS = {
    caries:  { price: 450, name: S.fillingName, doneClass: 'is-filling', openClass: 'is-caries' },
    extract: { price: 400, name: S.extractName, doneClass: 'is-missing', openClass: 'is-extract' },
  };
  var money = new Intl.NumberFormat(S.lang + '-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });

  var teeth = root.querySelectorAll('.tooth');
  var buttons = root.querySelectorAll('[data-add]');
  var hint = root.querySelector('.chart-hint');
  var list = root.querySelector('.plan-list');
  var reset = root.querySelector('[data-reset]');
  var selected = null;
  var plan = {}; // tooth number -> { kind, done }

  function toothLabel(n) { return S.tooth.replace('{n}', n); }

  function paintTeeth() {
    teeth.forEach(function (el) {
      var n = el.getAttribute('data-n');
      var item = plan[n];
      el.classList.remove('is-caries', 'is-extract', 'is-filling', 'is-missing');
      if (item) el.classList.add(item.done ? KINDS[item.kind].doneClass : KINDS[item.kind].openClass);
      var on = String(selected) === n;
      el.classList.toggle('is-selected', on);
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function renderPlan() {
    list.replaceChildren();
    Object.keys(plan).sort(function (a, b) { return a - b; }).forEach(function (n) {
      var item = plan[n];
      var kind = KINDS[item.kind];
      var li = document.createElement('li');
      li.className = 'plan-item';
      var name = document.createElement('span');
      name.className = 'plan-name';
      name.textContent = kind.name;
      var meta = document.createElement('span');
      meta.className = 'plan-meta';
      meta.textContent = toothLabel(n);
      var price = document.createElement('span');
      price.className = 'plan-price';
      price.textContent = money.format(kind.price);
      var ctl = document.createElement('span');
      ctl.className = 'plan-ctl';
      var status = document.createElement('span');
      status.className = 'status ' + (item.done ? 'status-completed' : 'status-proposed');
      status.textContent = item.done ? S.completed : S.proposed;
      ctl.appendChild(status);
      if (!item.done) {
        var done = document.createElement('button');
        done.type = 'button';
        done.className = 'mini';
        done.textContent = S.markDone;
        done.addEventListener('click', function () { item.done = true; refresh(); });
        ctl.appendChild(done);
      }
      li.append(name, meta, price, ctl);
      list.appendChild(li);
    });
    reset.hidden = Object.keys(plan).length === 0;
  }

  function refresh() {
    paintTeeth();
    renderPlan();
    buttons.forEach(function (b) { b.disabled = selected === null; });
    hint.textContent = selected === null ? S.hint : toothLabel(selected);
  }

  function pick(el) {
    var n = el.getAttribute('data-n');
    selected = String(selected) === n ? null : Number(n);
    refresh();
  }

  teeth.forEach(function (el) {
    el.addEventListener('click', function () { pick(el); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(el); }
    });
  });
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      if (selected === null) return;
      plan[selected] = { kind: b.getAttribute('data-add'), done: false };
      refresh();
    });
  });
  reset.addEventListener('click', function () { plan = {}; selected = null; refresh(); });

  refresh();
})();
