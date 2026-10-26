/* Ленивая загрузка API Яндекс.Карт (PageSpeed: full.js ~692 КиБ).
   Карта инициализируется только когда её контейнер приблизился к вьюпорту
   или пользователь переключил вид «карта» — до этого внешний скрипт не
   запрашивается вовсе.

   Использование:
     window.mmEnsureYmaps(function () { ... });
   Колбэк вызывается после загрузки API и ymaps.ready. Повторные вызовы
   ставятся в очередь и не дублируют <script>. */
(function () {
  var API = 'https://api-maps.yandex.ru/2.1/?apikey=2ae53810-6967-43df-9165-4003eeb71cbf&lang=ru_RU&ver=2.1.0';
  var waiting = [];
  var loading = false;

  function flush() {
    if (!window.ymaps) return;
    window.ymaps.ready(function () {
      var queue = waiting;
      waiting = [];
      queue.forEach(function (cb) {
        try {
          cb();
        } catch (err) {
          setTimeout(function () { throw err; }, 0);
        }
      });
    });
  }

  window.mmEnsureYmaps = function (cb) {
    if (typeof cb !== 'function') return;
    if (window.ymaps) {
      window.ymaps.ready(cb);
      return;
    }
    waiting.push(cb);
    if (loading) return;
    loading = true;
    var script = document.createElement('script');
    script.src = API;
    script.async = true;
    script.onload = flush;
    script.onerror = function () {
      loading = false;
      waiting = [];
    };
    document.head.appendChild(script);
  };
})();
