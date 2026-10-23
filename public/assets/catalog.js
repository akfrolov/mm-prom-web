/* Логика каталога объектов (CR-2026-001 шаг 6; CR-2026-002 — переходы на
   страницы объектов; правка владельца 2026-10-23: две группы — «Наши объекты»
   (флайеры + PDF) и «Все объекты», единая кликабельная карточка, сброс виден
   только с активными фильтрами, поиск без чувствительности к «ё»; правка
   2026-10-23: площадь — диапазон с двумя ползунками и полями ввода).
   Карточки отрендерены на билде (ObjectCard); этот скрипт
   работает по data-атрибутам DOM: фильтры, сортировка, поиск, виды
   список/карта, карта.
   Данные карты: window.MMPROM_OBJECTS (инжектится на странице до этого скрипта). */
document.addEventListener('DOMContentLoaded', function () {
    (function(){
      'use strict';
      var OBJECTS = window.MMPROM_OBJECTS || [];
      var byId = {};
      OBJECTS.forEach(function(o){ byId[o.id] = o; });

      var BRAND_URLS = { 'atlas-garazhny': '/atlas-garazhnyj/', 'avrora-vitebsky': '/avrora-vitebskij/' };
      function objectUrl(o){
        return o.url || BRAND_URLS[o.id] || '/obekt/' + o.id + '/';
      }

      var grids = [document.getElementById('grid-ours'), document.getElementById('grid-external')].filter(Boolean);
      var cards = [];
      grids.forEach(function(g){ cards = cards.concat(Array.prototype.slice.call(g.querySelectorAll('.obj-card'))); });
      var countEl = document.getElementById('res-count');
      var countWordEl = document.getElementById('res-count-word');
      var emptyEl = document.getElementById('cat-empty');
      var mapWrap = document.getElementById('cat-map');
      var activeBox = document.getElementById('active-filters');
      var AREA_MAX = 20000;
      var AREA_STEP = 100;
      var state = { deal:'all', type:'all', areaMin:0, areaMax:AREA_MAX, loc:'all', q:'', sort:'default', view:'list' };

      var areaMinInput = document.getElementById('f-area-min');
      var areaMaxInput = document.getElementById('f-area-max');
      var areaMinRange = document.getElementById('f-area-min-range');
      var areaMaxRange = document.getElementById('f-area-max-range');
      var areaFill = document.getElementById('f-area-fill');

      var LOC_LABEL = { spb:'Санкт-Петербург', lo:'Ленинградская область' };
      var TYPE_LABEL = { park:'Индустриальные парки', warehouse:'Производственно-складские', production:'Производственные', land:'Земельные участки' };
      var DEAL_LABEL = { rent:'Аренда', sale:'Продажа' };

      /* «ё» в поиске не должна ломать совпадение («заозерная» ↔ «Заозёрная») */
      function normQ(s){
        return String(s).toLowerCase().replace(/ё/g, 'е');
      }

      function areaFull(){
        return state.areaMin <= 0 && state.areaMax >= AREA_MAX;
      }

      function areaMatch(v){
        if (areaFull()) return true;
        if (!v) return false;
        return v >= state.areaMin && v <= state.areaMax;
      }

      function fmtNum(n){
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      }

      function areaLabel(){
        if (areaFull()) return '';
        if (state.areaMax >= AREA_MAX) return 'от ' + fmtNum(state.areaMin) + ' м²';
        if (state.areaMin <= 0) return 'до ' + fmtNum(state.areaMax) + ' м²';
        return fmtNum(state.areaMin) + ' – ' + fmtNum(state.areaMax) + ' м²';
      }

      function syncAreaUI(){
        areaMinRange.value = state.areaMin;
        areaMaxRange.value = state.areaMax;
        areaMinInput.value = state.areaMin;
        areaMaxInput.value = state.areaMax;
        areaFill.style.left = (state.areaMin / AREA_MAX * 100) + '%';
        areaFill.style.right = (100 - state.areaMax / AREA_MAX * 100) + '%';
      }

      function setAreaRange(min, max, source){
        min = Math.max(0, Math.min(AREA_MAX, Math.round(min / AREA_STEP) * AREA_STEP));
        max = Math.max(0, Math.min(AREA_MAX, Math.round(max / AREA_STEP) * AREA_STEP));
        if (min > max) {
          if (source === 'min') max = min;
          else min = max;
        }
        state.areaMin = min;
        state.areaMax = max;
        syncAreaUI();
        apply();
      }

      function visible(){
        return cards.filter(function(c){
          var deals = (c.dataset.deal || '').split(' ');
          var okDeal = state.deal === 'all' || deals.indexOf(state.deal) !== -1;
          var okType = state.type === 'all' || c.dataset.type === state.type;
          var okArea = areaMatch(parseInt(c.dataset.area, 10) || 0);
          var okLoc = state.loc === 'all' || c.dataset.loc === state.loc;
          var okQ = !state.q || normQ(c.dataset.title + ' ' + c.querySelector('.obj-card__addr').textContent).indexOf(state.q) !== -1;
          return okDeal && okType && okArea && okLoc && okQ;
        });
      }

      function sortCards(list){
        var area = function(c){ return parseInt(c.dataset.area, 10) || 0; };
        if (state.sort === 'area-desc') list.sort(function(a,b){
          var x = area(a), y = area(b);
          if (!x && !y) return 0;
          if (!x) return 1;
          if (!y) return -1;
          return y - x;
        });
        else if (state.sort === 'area-asc') list.sort(function(a,b){
          var x = area(a), y = area(b);
          if (!x && !y) return 0;
          if (!x) return 1;
          if (!y) return -1;
          return x - y;
        });
        else if (state.sort === 'name') list.sort(function(a,b){ return a.dataset.title.localeCompare(b.dataset.title, 'ru'); });
        else list.sort(function(a,b){ return cards.indexOf(a) - cards.indexOf(b); });
        return list;
      }

      function renderActive(){
        var chips = [];
        if (state.deal !== 'all') chips.push(['deal', DEAL_LABEL[state.deal]]);
        if (state.type !== 'all') chips.push(['type', TYPE_LABEL[state.type]]);
        if (!areaFull()) chips.push(['area', areaLabel()]);
        if (state.loc !== 'all') chips.push(['loc', LOC_LABEL[state.loc]]);
        if (state.q) chips.push(['q', '«' + state.q + '»']);
        if (!chips.length) { activeBox.hidden = true; activeBox.innerHTML = ''; return; }
        activeBox.hidden = false;
        activeBox.innerHTML = '<span class="cat-active__label">Выбрано:</span>' + chips.map(function(c){
          return '<button class="cat-active__chip" type="button" data-clear="' + c[0] + '">' + c[1] + '<span class="material-symbols-outlined" aria-hidden="true">close</span></button>';
        }).join('') + '<button class="cat-active__chip" type="button" data-clear="all">Сбросить всё<span class="material-symbols-outlined" aria-hidden="true">restart_alt</span></button>';
      }

      function apply(){
        var list = sortCards(visible());
        cards.forEach(function(c){ c.hidden = true; });
        list.forEach(function(c){ c.hidden = false; });
        var mapMode = state.view === 'map';
        grids.forEach(function(g){
          var own = list.filter(function(c){ return c.parentNode === g; });
          own.forEach(function(c){ g.appendChild(c); });
          g.hidden = mapMode;
          var group = g.closest('.cat-group');
          if (group) group.hidden = mapMode || own.length === 0;
        });
        countEl.textContent = list.length;
        if (countWordEl) {
          var n = list.length, m10 = n % 10, m100 = n % 100;
          countWordEl.textContent = (m10 === 1 && m100 !== 11) ? 'объект'
            : (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) ? 'объекта'
            : 'объектов';
        }
        emptyEl.hidden = list.length !== 0;
        renderActive();
        if (state.view === 'map') updateMap(list);
      }

      // ── Фильтры ───────────────────────────────────────────────────────
      document.querySelectorAll('.seg [data-deal]').forEach(function(b){
        b.addEventListener('click', function(){
          state.deal = b.dataset.deal;
          document.querySelectorAll('.seg [data-deal]').forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); });
          apply();
        });
      });
      document.querySelectorAll('.chip-f[data-type]').forEach(function(b){
        b.addEventListener('click', function(){
          state.type = b.dataset.type;
          document.querySelectorAll('.chip-f[data-type]').forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); });
          apply();
        });
      });
      areaMinRange.addEventListener('input', function(){ setAreaRange(+areaMinRange.value, state.areaMax, 'min'); });
      areaMaxRange.addEventListener('input', function(){ setAreaRange(state.areaMin, +areaMaxRange.value, 'max'); });
      areaMinInput.addEventListener('change', function(){ setAreaRange(parseInt(areaMinInput.value, 10) || 0, state.areaMax, 'min'); });
      areaMaxInput.addEventListener('change', function(){ setAreaRange(state.areaMin, parseInt(areaMaxInput.value, 10) || 0, 'max'); });
      document.getElementById('f-loc').addEventListener('change', function(e){ state.loc = e.target.value; apply(); });
      document.getElementById('f-sort').addEventListener('change', function(e){ state.sort = e.target.value; apply(); });
      var search = document.getElementById('f-search');
      var t;
      search.addEventListener('input', function(){
        clearTimeout(t);
        t = setTimeout(function(){ state.q = normQ(search.value.trim()); apply(); }, 160);
      });

      function reset(){
        state.deal='all'; state.type='all'; state.areaMin=0; state.areaMax=AREA_MAX; state.loc='all'; state.q=''; state.sort='default';
        search.value=''; document.getElementById('f-loc').value='all'; document.getElementById('f-sort').value='default';
        syncAreaUI();
        document.querySelectorAll('.seg [data-deal]').forEach(function(x){ x.setAttribute('aria-pressed', String(x.dataset.deal==='all')); });
        document.querySelectorAll('.chip-f[data-type]').forEach(function(x){ x.setAttribute('aria-pressed', String(x.dataset.type==='all')); });
        apply();
      }
      document.getElementById('empty-reset').addEventListener('click', reset);

      function clearFilter(e){
        var b = e.target.closest('[data-clear]');
        if (!b) return;
        var k = b.getAttribute('data-clear');
        if (k === 'all') { reset(); return; }
        if (k === 'deal') { state.deal='all'; document.querySelectorAll('.seg [data-deal]').forEach(function(x){ x.setAttribute('aria-pressed', String(x.dataset.deal==='all')); }); }
        if (k === 'type') { state.type='all'; document.querySelectorAll('.chip-f[data-type]').forEach(function(x){ x.setAttribute('aria-pressed', String(x.dataset.type==='all')); }); }
        if (k === 'area') { state.areaMin=0; state.areaMax=AREA_MAX; syncAreaUI(); }
        if (k === 'loc') { state.loc='all'; document.getElementById('f-loc').value='all'; }
        if (k === 'q') { state.q=''; search.value=''; }
        apply();
      }
      /* pointerdown — до blur поля ввода: иначе change перерисовывает чипы
         и клик по «Сбросить всё» теряется; click оставлен для клавиатуры */
      activeBox.addEventListener('pointerdown', function(e){
        if (e.button !== 0) return;
        if (e.pointerType === 'mouse' || e.pointerType === 'pen' || e.pointerType === 'touch') clearFilter(e);
      });
      activeBox.addEventListener('click', function(e){
        if (e.detail === 0) clearFilter(e);
      });

      // ── Вид ───────────────────────────────────────────────────────────
      var btnList = document.getElementById('view-list');
      var btnMap = document.getElementById('view-map');
      function setView(v){
        state.view = v;
        btnList.setAttribute('aria-pressed', String(v === 'list'));
        btnMap.setAttribute('aria-pressed', String(v === 'map'));
        mapWrap.hidden = v !== 'map';
        if (v === 'map') { initMap(); apply(); } else { apply(); }
      }
      btnList.addEventListener('click', function(){ setView('list'); });
      btnMap.addEventListener('click', function(){ setView('map'); });

      // ── Карта ─────────────────────────────────────────────────────────
      var map = null, om = null, mapReady = false, pending = null;
      var PIN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44"><path d="M18 1C9.2 1 2 8.1 2 16.9 2 28 18 43 18 43s16-15 16-26.1C34 8.1 26.8 1 18 1z" fill="#5A3994" stroke="#ffffff" stroke-width="2"/><circle cx="18" cy="17" r="6" fill="#EBB81E"/></svg>';
      var CLUSTER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="#5A3994" stroke="#ffffff" stroke-width="3"/></svg>';
      var PIN_ICON = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(PIN_SVG);
      var CLUSTER_ICON = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(CLUSTER_SVG);

      function initMap(){
        if (map || !window.ymaps) return;
        ymaps.ready(function(){
          if (map) return;
          map = new ymaps.Map('cat-map-canvas', {
            center: [59.85, 30.35], zoom: 9, controls: ['zoomControl','fullscreenControl','geolocationControl']
          }, { suppressMapOpenBlock: true });
          om = new ymaps.ObjectManager({
            clusterize: true,
            gridSize: 64,
            clusterDisableClickZoom: false,
            clusterIcons: [
              { href: CLUSTER_ICON, size: [46, 46], offset: [-23, -23] },
              { href: CLUSTER_ICON, size: [56, 56], offset: [-28, -28] }
            ],
            clusterNumbers: [10, 100]
          });
          om.objects.options.set({
            iconLayout: 'default#image',
            iconImageHref: PIN_ICON,
            iconImageSize: [36, 44],
            iconImageOffset: [-18, -44],
            hideIconOnBalloonOpen: false
          });
          om.objects.events.add('click', function(e){
            var o = byId[e.get('objectId')];
            if (o) window.location.assign(objectUrl(o));
          });
          map.geoObjects.add(om);
          mapReady = true;
          if (pending) { var p = pending; pending = null; updateMap(p); }
        });
      }

      function updateMap(list){
        if (!mapReady) { pending = list; initMap(); return; }
        var features = list.map(function(c){
          var o = byId[c.dataset.id];
          if (!o || !o.coords) return null;
          return {
            type: 'Feature',
            id: o.id,
            geometry: { type: 'Point', coordinates: o.coords },
            properties: { hintContent: o.title, balloonContentHeader: o.title, balloonContentBody: o.address + '<br>' + o.area + '<br><a href="' + objectUrl(o) + '">Страница объекта</a>' }
          };
        }).filter(Boolean);
        om.removeAll();
        om.add({ type: 'FeatureCollection', features: features });
        if (features.length) map.setBounds(om.getBounds(), { checkZoomRange: true, zoomMargin: 40 });
      }

      syncAreaUI();
      apply();
    })();
});
