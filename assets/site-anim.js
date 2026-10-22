/* Слой анимаций сайта ММ Пром */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ── Шапка при скролле ─────────────────────────────────────────── */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Автопоявление блоков ниже первого экрана ──────────────────── */
  var SELECTOR = [
    '.section h2', '.b-sec-head', '.cat-card', '.svc-tile', '.role-card', '.scope-card',
    '.approach-card', '.other-card', '.obj-card', '.value-card', '.contact-card', '.partner',
    '.faq__item', '.b-flow2__step', '.proj-card', '.svc-card', '.role-link', '.about-stat',
    '.b-cta h2', '.b-cta p', '.b-cta__row', '.b-scope__obj-title', '.b-scope__cta'
  ].join(',');

  var fresh = [];
  var vh = window.innerHeight || 800;
  Array.prototype.forEach.call(document.querySelectorAll(SELECTOR), function (el) {
    if (el.classList.contains('reveal')) return;
    var r = el.getBoundingClientRect();
    if (r.top < vh * 0.92) return;           // выше сгиба — не трогаем
    el.classList.add('reveal');
    var parent = el.parentElement;
    if (parent) {
      var sibs = Array.prototype.filter.call(parent.children, function (c) {
        return c.classList && c.classList.contains('reveal');
      });
      el.style.setProperty('--i', Math.min(sibs.indexOf(el), 8));
    }
    fresh.push(el);
  });

  if (fresh.length) {
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      fresh.forEach(function (el) { io.observe(el); });
    } else {
      fresh.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ── Страховка: ничего не остаётся скрытым ─────────────────────── */
  function revealInView() {
    var vh = window.innerHeight || 800;
    Array.prototype.forEach.call(document.querySelectorAll('.reveal:not(.is-visible)'), function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.95 && r.bottom > 0) el.classList.add('is-visible');
    });
  }
  var revealTick = false;
  window.addEventListener('scroll', function () {
    if (revealTick) return;
    revealTick = true;
    requestAnimationFrame(function () { revealInView(); revealTick = false; });
  }, { passive: true });
  window.addEventListener('load', function () { setTimeout(revealInView, 250); });
  setTimeout(revealInView, 900);

  /* ── Счётчики в метриках ───────────────────────────────────────── */
  var COUNTERS = '.b-hero__metrics strong, .b-hero__metrics li > span:last-child, .cat-head__stats strong, .about-stat strong';
  var counters = [];
  Array.prototype.forEach.call(document.querySelectorAll(COUNTERS), function (el) {
    var text = (el.textContent || '').trim();
    var m = text.match(/^(\d[\d\s\u00a0]*)(.*)$/);
    if (!m) return;
    var target = parseInt(m[1].replace(/[\s\u00a0]/g, ''), 10);
    if (!target || target < 3) return;
    counters.push({ el: el, target: target, suffix: m[2], raw: m[1] });
  });

  function runCounter(item) {
    var start = null, dur = 1100;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(item.target * eased);
      item.el.textContent = val.toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + item.suffix;
      if (p < 1) requestAnimationFrame(step);
      else item.el.textContent = item.raw + item.suffix;
    }
    requestAnimationFrame(step);
  }

  if (counters.length && !reduce) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var item = counters.filter(function (c) { return c.el === en.target; })[0];
          if (item) runCounter(item);
          cio.unobserve(en.target);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { cio.observe(c.el); });
    } else {
      counters.forEach(runCounter);
    }
  }

  /* ── Лёгкий параллакс декоративных пятен ───────────────────────── */
  var glows = Array.prototype.slice.call(document.querySelectorAll('.b-hero__glow'));
  if (glows.length && !reduce && window.innerWidth > 768) {
    var ticking = false;
    var move = function () {
      var y = window.scrollY;
      glows.forEach(function (g, i) {
        g.style.transform = 'translate3d(0,' + (y * (i ? 0.06 : 0.04)).toFixed(1) + 'px,0)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(move);
    }, { passive: true });
  }

  /* ── Плавное появление карт ────────────────────────────────────── */
  var maps = document.querySelectorAll('.b-map-sec__canvas, #cat-map-canvas, .office__map, .b-map');
  if (maps.length) {
    Array.prototype.forEach.call(maps, function (m) { m.classList.add('map-fade'); });
    if ('IntersectionObserver' in window) {
      var mio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          setTimeout(function () { en.target.classList.add('is-ready'); }, 250);
          mio.unobserve(en.target);
        });
      }, { threshold: 0.05, rootMargin: '120px' });
      Array.prototype.forEach.call(maps, function (m) { mio.observe(m); });
    } else {
      Array.prototype.forEach.call(maps, function (m) { m.classList.add('is-ready'); });
    }
  }
})();
