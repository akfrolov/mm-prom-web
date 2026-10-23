/* Карта объектов на страницах услуг/ролей (CR-2026-001 шаг 6).
   Данные: window.MMPROM_MAP_OBJECTS (инжектится на странице до этого скрипта).
   Инициализация ленивая: по IntersectionObserver, затем ymaps.ready. */
document.addEventListener('DOMContentLoaded', function () {
  var OBJ = window.MMPROM_MAP_OBJECTS || [];
  (function(){
    var el = document.getElementById('svc-map');
    if (!el) return;
    var started = false;
    var PIN = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44"><path d="M18 1C9.2 1 2 8.1 2 16.9 2 28 18 43 18 43s16-15 16-26.1C34 8.1 26.8 1 18 1z" fill="#5A3994" stroke="#ffffff" stroke-width="2"/><circle cx="18" cy="17" r="6" fill="#EBB81E"/></svg>');
    var CL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="#5A3994" stroke="#ffffff" stroke-width="3"/></svg>');
    function start(){
      if (started || !window.ymaps) return;
      started = true;
      ymaps.ready(function(){
        var map = new ymaps.Map('svc-map', { center: [59.85, 30.35], zoom: 9, controls: ['zoomControl','fullscreenControl'] }, { suppressMapOpenBlock: true });
        var om = new ymaps.ObjectManager({
          clusterize: true, gridSize: 64, clusterDisableClickZoom: false,
          clusterIcons: [{ href: CL, size: [46,46], offset: [-23,-23] }, { href: CL, size: [56,56], offset: [-28,-28] }],
          clusterNumbers: [10, 100]
        });
        om.objects.options.set({ iconLayout: 'default#image', iconImageHref: PIN, iconImageSize: [36,44], iconImageOffset: [-18,-44] });
        om.add({ type: 'FeatureCollection', features: OBJ.map(function(o){
          return { type: 'Feature', id: o.id, geometry: { type: 'Point', coordinates: o.coords },
            properties: { hintContent: o.title, balloonContentHeader: o.title,
              balloonContentBody: o.address + '<br>' + o.area + '<br><a href="/katalog/">Смотреть в каталоге</a>' } };
        }) });
        map.geoObjects.add(om);
        if (om.getBounds()) map.setBounds(om.getBounds(), { checkZoomRange: true, zoomMargin: 40 });
      });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { start(); io.disconnect(); } }); }, { rootMargin: '250px' });
      io.observe(el);
    } else { start(); }
  })();
});
