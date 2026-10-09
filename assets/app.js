// Page behaviour: header state, scroll reveals, hero parallax and the
// auto-playing product tour.
// Everything here is decoration; the page reads fine without it.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var top = document.getElementById('top');
  function onScroll() { top.classList.toggle('scrolled', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var targets = document.querySelectorAll('[data-reveal], #steps');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); reveal.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { reveal.observe(el); });
  }

  var stage = document.getElementById('stage');
  if (stage && !reduce) {
    var queued = false;
    var drift = function () {
      var r = stage.getBoundingClientRect();
      var p = Math.max(-1, Math.min(1, (r.top - window.innerHeight * 0.2) / window.innerHeight));
      stage.style.setProperty('--py', (p * -26).toFixed(1) + 'px');
      queued = false;
    };
    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; window.requestAnimationFrame(drift); }
    }, { passive: true });
    drift();
  }

  var tour = document.getElementById('tour-ui');
  if (tour) {
    var tabs = [].slice.call(tour.querySelectorAll('.tour-tab'));
    var shots = [].slice.call(tour.querySelectorAll('.tour-shot'));
    var current = 0;
    var manual = false;

    var show = function (i, byUser) {
      current = i;
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        shots[k].classList.toggle('is-on', on);
      });
      if (byUser) { manual = true; tour.classList.add('manual'); }
    };

    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { show(k, true); });
      t.addEventListener('keydown', function (e) {
        var step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!step) return;
        e.preventDefault();
        var next = (current + step + tabs.length) % tabs.length;
        show(next, true);
        tabs[next].focus();
      });
    });

    // The progress bar's animation drives the autoplay, so pausing it pauses the tour.
    tour.addEventListener('animationend', function (e) {
      if (e.animationName === 'fill' && !manual) show((current + 1) % tabs.length, false);
    });
    ['mouseenter', 'focusin'].forEach(function (n) { tour.addEventListener(n, function () { tour.classList.add('paused'); }); });
    ['mouseleave', 'focusout'].forEach(function (n) { tour.addEventListener(n, function () { tour.classList.remove('paused'); }); });

    if (!reduce && 'IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { tour.classList.add('live'); seen.disconnect(); }
      }, { threshold: 0.35 });
      seen.observe(tour);
    }
  }
})();
