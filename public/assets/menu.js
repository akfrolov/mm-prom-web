/* ═══════════════════════════════════════════════════════════════════════
   ММ ПРОМ — оверлеи каркаса (CR-2026-002 / дельта W2.1–W2.2)
   Мегаменю «Услуги» (центрированный оверлей, ≥1024) и мобильный drawer.
   Ванильный JS без зависимостей; подключается defer в BaseLayout.
   Анимации и prefers-reduced-motion — в base.css/site-anim.css.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Утилиты ──────────────────────────────────────────────────────── */
  function focusables(root) {
    return Array.prototype.filter.call(
      root.querySelectorAll('a[href],button:not([disabled]),input:not([type="hidden"]),textarea,select,[tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null || el === document.activeElement; }
    );
  }
  function trapTab(root, e) {
    var items = focusables(root);
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  var desktopMQ = window.matchMedia('(min-width:1024px)');

  /* ── Мегаменю «Услуги»: центрированный оверлей (≥1024) ────────────── */
  var megaTrigger = document.getElementById('mega-trigger');
  var megaOverlay = document.getElementById('mega-overlay');
  var megaReturnFocus = null;

  function megaOpen() {
    if (!desktopMQ.matches) return;                 // до 1024 — мобильное меню (W2.2)
    megaReturnFocus = megaTrigger;                  // возврат фокуса — на «Услуги»
    // свежий сеанс: сброс фильтра к «Все услуги»
    var all = document.getElementById('mmf-all');
    if (all) all.checked = true;
    megaOverlay.hidden = false;
    megaTrigger.setAttribute('aria-expanded', 'true');
    var closeBtn = megaOverlay.querySelector('.mega-panel__close');
    if (closeBtn) closeBtn.focus();
  }
  function megaClose(refocus) {
    if (megaOverlay.hidden) return;
    megaOverlay.hidden = true;
    megaTrigger.setAttribute('aria-expanded', 'false');
    if (refocus !== false && megaReturnFocus) megaReturnFocus.focus();
  }

  if (megaTrigger && megaOverlay) {
    megaTrigger.addEventListener('click', megaOpen);
    megaOverlay.addEventListener('click', function (e) {
      // закрытие: крестик/подложка (data-mega-close) и переход по ссылке
      if (e.target.closest('[data-mega-close]') || e.target.closest('a[href]')) {
        megaClose(e.target.closest('a[href]') ? false : true);
      }
    });
    megaOverlay.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') trapTab(megaOverlay.querySelector('.mega-panel') || megaOverlay, e);
    });
  }

  /* ── Мобильное меню: drawer слева (W2.2) ──────────────────────────── */
  var burger = document.querySelector('.site-header__burger');
  var mobileOverlay = document.getElementById('mobile-overlay');
  var mobilePanel = document.getElementById('mobile-menu');
  var mobileReturnFocus = null;

  function mobileOpen() {
    if (!mobileOverlay || !mobilePanel) return;
    if (desktopMQ.matches) return;                  // ≥1024 — мега-оверлей, drawer скрыт
    mobileReturnFocus = burger;                     // возврат фокуса — на бургер
    mobileOverlay.hidden = false;
    if (burger) {
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Закрыть меню');
    }
    var closeBtn = mobilePanel.querySelector('.mobile-menu__close');
    if (closeBtn) closeBtn.focus();
  }
  function mobileClose(refocus) {
    if (!mobileOverlay || mobileOverlay.hidden) return;
    mobileOverlay.hidden = true;
    if (burger) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
    }
    if (refocus !== false && mobileReturnFocus) mobileReturnFocus.focus();
  }

  if (burger && mobileOverlay && mobilePanel) {
    burger.addEventListener('click', function () {
      if (mobileOverlay.hidden) mobileOpen();
      else mobileClose(true);
    });
    mobileOverlay.addEventListener('click', function (e) {
      if (e.target.closest('[data-mobile-close]') || e.target.closest('a[href]')) {
        mobileClose(!e.target.closest('a[href]'));
      }
    });
    mobileOverlay.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') trapTab(mobilePanel, e);
    });

    /* Аккордеон ролей: data-mrole → data-mpanel */
    Array.prototype.forEach.call(mobilePanel.querySelectorAll('.mobile-menu__role'), function (role) {
      role.addEventListener('click', function () {
        var r = role.getAttribute('data-mrole');
        var panel = mobilePanel.querySelector('.mobile-menu__services[data-mpanel="' + r + '"]');
        var open = role.classList.toggle('is-open');
        role.setAttribute('aria-expanded', String(open));
        if (panel) panel.classList.toggle('is-open', open);
      });
    });
  }

  /* ── Общие клавиши и смена брейкпоинта ─────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (mobileOverlay && !mobileOverlay.hidden) mobileClose(true);
    else if (megaOverlay && !megaOverlay.hidden) megaClose(true);
  });
  desktopMQ.addEventListener('change', function (ev) {
    if (ev.matches) {
      // ушли в десктоп: drawer не активируется, мега остаётся доступным
      mobileClose(false);
    } else if (megaOverlay && !megaOverlay.hidden) {
      megaClose(false);
    }
  });

})();
