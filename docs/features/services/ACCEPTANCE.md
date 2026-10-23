# ACCEPTANCE — services: карта на 9 страницах, локальные медиа, фото консалтинга

| Параметр | Значение |
|----------|----------|
| **Фича** | `services` |
| **CR** | [CR-2026-002-pravki-posle-migracii.md](../../change-requests/CR-2026-002-pravki-posle-migracii.md), пункты **29, 30** |
| **Спека** | [SPEC.md](./SPEC.md) (baseline as-is + план блоков B1/B2) |
| **База сверки** | текущее состояние §1 спеки; фото консалтинга — источник `mm-prom.ru/consalting/` (block-fswide__media) |
| **Исполнитель** | шаг `imp-services` (`/implement-delta` по DELTA-CR-2026-002; после `imp-pages` и `imp-catalog`) |

Найденные при приёмке отклонения — в `docs/features/services/ACCEPTANCE-ISSUES.md`.

## A. Автоматизируемые проверки (обязательные)

| # | Проверка | Ожидание |
|---|----------|----------|
| A1 | `npm run build` | зелёный |
| A2 | `npx astro check` | зелёный (в т. ч. на trade-in, investcomp, brokerage, upravlenie, consalting после удаления карты не остаются мёртвые импорты `getCollection` и переменные `objects`) |
| A3 | `grep -q 'svc-map' src/pages/{arenda,prodazha,trade-in,investcomp,brokerage}.astro` | найдено на каждой из пяти услуг (карта остаётся) |
| A4 | `grep -q 'svc-map' src/pages/{investoram,proizvodstvam,sobstvennikam-uchastkov,sobstvennikam-zdaniy}.astro` | найдено на каждой из четырёх ролей (карта остаётся) |
| A5 | `grep -q 'svc-map' src/pages/{stroitelstvo,development,redevelopment,upravlenie,consalting}.astro` | **не найдено** ни на одной из пяти страниц |
| A6 | полное удаление карты на 5 страницах | в каждом из пяти файлов нет также `MMPROM_MAP_OBJECTS`, `api-maps.yandex.ru`, `id="map"`, `.b-map-sec`, `mapObjects` (данные и скрипты удалены вместе с разметкой) |
| A7 | фото консалтинга | `grep -q 'assets/external/consalting-sm.avif' src/pages/consalting.astro`; доп.: `inner-optimized.webp` в том же файле; в разметке консалтинга только локальные пути (`! grep -q 'mm-prom.ru/wp-content' src/pages/consalting.astro`) |
| A8 | итоговый счёт по rendered DOM (`astro preview`) | `id="svc-map"` ×9; `#map`-секции ×9; тегов `api-maps.yandex.ru` ×9; `window.MMPROM_MAP_OBJECTS` ×9 — по сайту в целом (14 → 9) |

## B. Блок B1 — «Карта на 9 страницах» (п. 30)

| # | Пункт CR | Сценарий приёмки |
|---|----------|------------------|
| B1.1 | п. 30, карта остаётся | На arenda, prodazha, trade-in, investcomp, brokerage и 4 ролях секция «Объекты на карте» на месте: канвас `#svc-map` (`role="application"`), лид «27 объектов…», кнопки «Весь каталог»/«Смотреть каталог» → `/katalog/`; Яндекс-карта инициализируется, все 27 меток видны (кластеры/пины как сейчас), консоль без ошибок. Содержание этих 9 страниц не изменилось (п. 30) |
| B1.2 | п. 30, карта убрана | На stroitelstvo, development, redevelopment, upravlenie, consalting секции нет: в DOM нет `#map`/`#svc-map`; сетевых запросов к `api-maps.yandex.ru` и `/assets/svc-map.js` нет; последующие секции (CTA-полоса, «Другие услуги») на месте. Видимых следов карты нет; порядок контента сохранён |
| B1.3 | п. 30, «содержание не меняется» | Тексты, ссылки, порядок секций на 9 страницах с картой — без изменений (кроме приходящих волн site-pages/objects-data/catalog); на 5 страницах изменения — только удаление карты (+ фото консалтинга B2 и, при решении дельты, пересчёт `sec-index`) |
| B1.4 | пост-чек | Пост-чек `imp-services` зелёный (A3–A7); финальное состояние карты — 9 секций (A8) |

## C. Блок B2 — «Локальные медиа услуг и фото консалтинга» (п. 29)

| # | Пункт CR | Сценарий приёмки |
|---|----------|------------------|
| C1 | п. 29, фото на consalting | На `/consalting/` появляется медиа-зона (первый экран) с фото консалтинга: на ≤1023px — `assets/external/consalting-sm.avif`, на десктопе — `assets/external/inner-optimized.webp` (механика `<picture>` как в WP-версии; место/разметка — решение дельты, зафиксировано в SPEC §6 п. 3). Фото на месте, не обрезано/не растянуто, alt подписан |
| C2 | п. 29, «файлы сохраняются в проекте» | В network-трафике страницы нет внешних запросов за изображениями (только локальные `/assets/external/…`); оба файла существуют в `public/assets/external/` (импортированы шагом `prep-import`) |
| C3 | межфичевое: ленты объектов | arenda/prodazha: 12 карточек объектов рендерятся и работают (фото — из коллекции; локальность путей приходит из волны imp-objects-data, тут не проверяется жёстко) |
| C4 | заглушки proj-card (границы) | stroitelstvo/development/redevelopment: заглушки проектов остались как есть (4/5/2); случайной замены заглушек реальными фото нет — это не входит в CR |
| C5 | hero-медиа прочих страниц | На остальных 13 страницах медиа не появились (hero текстовый) |

## D. Регресс (что не должно измениться)

| # | Проверка | Ожидание |
|---|----------|----------|
| D1 | Содержание страниц | Тексты, ссылки, порядок секций не изменились, кроме B1 (на 5 страницах) и B2 (консалтинг) |
| D2 | Карта как работала | На 9 страницах ленивый запуск по IntersectionObserver, кластеры, балуны; после imp-catalog попап ведёт на `/obekt/<id>/` (проверяется в волне `catalog`, тут — не ломать) |
| D3 | Ленты и FAQ ролей | Ленты «Другие услуги» (10 × 9), role-card ×34, svc-tile ×35, FAQ 4×4 — на месте |
| D4 | `prefers-reduced-motion` | Анимации (reveal, flow2-прогресс) отключаются, страница читаема и без карты на 5 страницах |
| D5 | SEO/head | title/description, canonical и OG 14 страниц не изменились; скрипты карты не попадают в head (остаются в хвосте страницы) |
| D6 | Внешние каналы/формы | Кнопки `/modalka-zayavki/`, телефон `tel:88003331010` — без изменений (формы — site-shell, вне фичи) |

## E. Порядок приёмки

1. `imp-services` зелёный (пост-чеки плана A3–A7) → 2. проверки A1, A2, A6
   → 3. сценарии B и C по `astro preview` (Playwright, `webapp-testing`,
   контекст `reducedMotion: 'reduce'`, ожидание `document.fonts.ready`);
   ширины 360 / 768 / 1024 / 1366 (фото консалтинга — брейкпоинт 1023/1024,
   карта — «открыть/скролл до» на 9 страницах) → 4. регресс D → 5. визуальная
   сверка владельцем (метод — Блок 1.5 `AUDIT` по rendered DOM) → 6. замечания
   в `ACCEPTANCE-ISSUES.md` и закрытие.