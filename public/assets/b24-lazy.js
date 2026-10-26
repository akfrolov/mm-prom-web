/* Ленивая загрузка лоадеров Bitrix24: click-формы — по интенту, inline — у вьюпорта. */
(function () {
  'use strict';

  var injected = {};
  var clickLoaders = [];
  var inlineAnchors = [];
  var pendingClick = null;
  var pendingTimer = null;

  function inject(url) {
    if (!url || injected[url]) return;
    injected[url] = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = url + '?' + (Date.now() / 180000 | 0);
    var h = document.getElementsByTagName('script')[0];
    h.parentNode.insertBefore(s, h);
  }

  function injectClick() {
    for (var i = 0; i < clickLoaders.length; i++) inject(clickLoaders[i]);
  }

  function injectInline() {
    for (var i = 0; i < inlineAnchors.length; i++) {
      inject(inlineAnchors[i].getAttribute('data-b24-loader'));
    }
  }

  var anchors = document.querySelectorAll('[data-b24-loader][data-b24-form]');
  Array.prototype.forEach.call(anchors, function (el) {
    var id = el.getAttribute('data-b24-form') || '';
    var url = el.getAttribute('data-b24-loader');
    if (!url) return;
    if (id.indexOf('inline/') === 0) {
      inlineAnchors.push(el);
    } else if (id.indexOf('click/') === 0) {
      if (clickLoaders.indexOf(url) === -1) clickLoaders.push(url);
    }
  });

  /* click-формы: лоадер нужен до первого клика — грузим по наведению/фокусу/касанию */
  if (clickLoaders.length) {
    var onIntent = function (e) {
      var t = e.target;
      if (!t || !t.closest || !t.closest('[data-b24-form^="click"]')) return;
      injectClick();
      document.removeEventListener('pointerdown', onIntent, true);
      document.removeEventListener('mouseover', onIntent, true);
      document.removeEventListener('focusin', onIntent, true);
    };
    document.addEventListener('pointerdown', onIntent, true);
    document.addEventListener('mouseover', onIntent, true);
    document.addEventListener('focusin', onIntent, true);

    /* Холодный первый клик: лоадер ещё не успел навесить обработчик.
       Придерживаем клик и повторяем его, когда лоадер готов (data-b24-loaded). */
    var isReady = function (formId) {
      var list = document.querySelectorAll('script[data-b24-form="' + formId + '"]');
      if (!list.length) return true;
      for (var i = 0; i < list.length; i++) {
        if (list[i].hasAttribute('data-b24-loaded')) return true;
      }
      return false;
    };

    var replay = function (tries) {
      if (!pendingClick) return;
      var p = pendingClick;
      if (!isReady(p.formId) && tries < 120) {
        pendingTimer = setTimeout(function () { replay(tries + 1); }, 50);
        return;
      }
      pendingTimer = null;
      if (!isReady(p.formId)) { pendingClick = null; return; }
      pendingClick = null;
      p.target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    };

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var btn = t.closest('[data-b24-form^="click"]');
      if (!btn) return;
      var formId = btn.getAttribute('data-b24-form');
      if (isReady(formId)) {
        pendingClick = null;
        if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
      injectClick();
      pendingClick = { target: btn, formId: formId };
      if (pendingTimer) clearTimeout(pendingTimer);
      pendingTimer = setTimeout(function () { replay(0); }, 50);
    }, true);
  }

  /* inline-формы: грузим за 400px до появления в вьюпорте */
  function observeInline() {
    if (!inlineAnchors.length) return;
    if (!('IntersectionObserver' in window)) {
      if (document.readyState === 'complete') injectInline();
      else window.addEventListener('load', injectInline, { once: true });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var anchor = en.target.querySelector('[data-b24-form^="inline"]');
        if (anchor) inject(anchor.getAttribute('data-b24-loader'));
      });
    }, { rootMargin: '400px' });
    inlineAnchors.forEach(function (anchor) {
      io.observe(anchor.parentElement || anchor);
    });
  }
  observeInline();
})();
