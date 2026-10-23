# SPEC — services: страницы услуг и ролей (карта, медиа, консалтинг)

| Параметр | Значение |
|----------|----------|
| **Фича** | `services` (секция карты svc-map на 14 страницах, медиа страниц услуг/ролей, страница «Промышленный консалтинг») |
| **CR** | [CR-2026-002-pravki-posle-migracii.md](../../change-requests/CR-2026-002-pravki-posle-migracii.md), пункты **29, 30** |
| **Спринт** | sprint-cr-2026-002; реализация — шаг `imp-services`, зависимость: `imp-pages` (компонент MapSection) + `imp-catalog` (попапы svc-map ведут на `/obekt/<id>/`) |
| **Статус** | baseline (текущее состояние as-is до дельты; целевые правки — блоки B1/B2, состав дельты — `/write-delta`, фиксация исполненного — `/merge-cr`) |
| **Дата** | 2026-10-23 |
| **Страница-эталон для правок** | `src/pages/consalting.astro` — на ней оба блока (удаление карты B1 + добавление фото B2); вторая проверочная — `src/pages/investcomp.astro` (только удаление карты) |

## История

| Версия | Дата | Что изменилось |
|--------|------|----------------|
| v0 (baseline) | 2026-10-23 | Инвентаризация 14 страниц (10 услуг + 4 роли): секция карты, медиа, консалтинг; зафиксированы блоки B1/B2 |

## Область и границы фичи

**Входит:** секция карты объектов (`#map` `.b-map-sec` + данные + скрипты) на 10 страницах
услуг и 4 страницах ролей — её удаление со 5 страниц (B1); медиа-картина страниц
услуг/ролей (ленты объектов, заглушки проектов, фото консалтинга) и перевод
медиа на локальные файлы (B2).

**Не входит** (соседние фичи, см. §3): разметочный шаблон секции карты → компонент
`MapSection.astro` (фича `site-pages`); поведение попапов карты (`svc-map.js`,
фича `catalog`); данные коллекции и локальные пути фото (фича `objects-data`);
рендер и чипы карточек (`ObjectCard.astro` + `object-card.css`, фича
`object-card`); шапка/меню/формы (фича `site-shell`); содержание главной,
брендбуков, контактов.

---

## 1. Текущее состояние (as-is)

### 1.1 Состав и каркас страниц

14 страниц (`src/pages/*.astro`), все на `BaseLayout`. Две группы:

| Группа | Страницы (маршрут) | Каркас секций |
|--------|--------------------|----------------|
| Услуги (10) | `arenda` (`/arenda/`), `prodazha` (`/prodazha/`), `trade-in` (`/trade-in/`), `investcomp` (`/investcomp/`), `brokerage` (`/brokerage/`), `stroitelstvo` (`/stroitelstvo/`), `development` (`/development/`), `redevelopment` (`/redevelopment/`), `upravlenie` (`/upravlenie/`), `consalting` (`/consalting/`) | крошки → hero (`b-hero--service`) → `#roli` (role-card) → [только stroitelstvo/development/redevelopment: `#proekty` (proj-card)] → `#sostav` (scope-card) → `#podhod` (approach-card) → `#etapy` (b-flow2, 5 шагов) → `#map` → `#cta` (grad) → `#uslugi` (b-others, 9 карточек) |
| Роли (4) | `investoram` (`/investoram/`), `proizvodstvam` (`/proizvodstvam/`), `sobstvennikam-uchastkov` (`/sobstvennikam-uchastkov/`), `sobstvennikam-zdaniy` (`/sobstvennikam-zdaniy/`) | крошки → hero (`b-hero--service role-hero`) → `#services` (svc-tile) → `#other-roles` (role-link ×3) → `#map` → `#faq` (4 вопроса, вариант A `.faq`) → `#cta` (grad) |

- Hero услуг: eyebrow «Услуга · <название>», h1 с `accent`-спаном, lead, две
  кнопки (`btn--gold` «Обсудить проект» → `/modalka-zayavki/` + `btn--outline`
  «Смотреть объекты» → `/katalog/`), метрики (4 пункта с Material Symbols).
  Hero ролей: eyebrow «Роль · <название>», золотая кнопка «Обсудить задачу»,
  класс `role-hero` (`grid-template-columns:minmax(0,1fr)` одно-колоночная
  форма).
- Нумерация `sec-index`: без `#proekty` — roli 02, sostav 03, podhod 04,
  etapy 05, **map 06**, cta 07, uslugi 08; с `#proekty` — proekty 03, sostav 04,
  podhod 05, etapy 06, **map 07**, cta 08, uslugi 09. У ролей — services 02,
  other-roles 03, **map 04**, faq 05, cta 06.
- Количество блоков: role-card ×34 (4 у arenda/investcomp/trade-in/redevelopment,
  3 у остальных); scope-card 6 у девяти услуг, 3 у redevelopment; approach-card
  2 (3 у investcomp, 4 у brokerage); proj-card — stroitelstvo ×4,
  development ×5, redevelopment ×2 (заглушки, §1.3); svc-tile — 9 на
  инвесторам/производствам/собственникам участков, 8 на собственникам зданий;
  other-card — по 9 на каждой услуге (все 10 услуг минус своя).
- Содержание ролей не меняется по CR (границы п. 30, «Границы» CR); их
  особенности — см. §1.5.

### 1.2 Секция карты объектов (14 × 1)

- Разметка (одинаковый шаблон на всех 14): `<section id="map" class="b-map-sec
  section">` → `sec-index`, `.b-rowhead` (h2 «Объекты на карте» + `b-more` «Весь
  каталог» → `/katalog/`), лид `b-map-sec__lead` «27 объектов в
  Санкт-Петербурге и Ленинградской области: индустриальные парки,
  производственно-складские комплексы и земельные участки.» → `.b-map-sec__wrap`
  → канвас `<div id="svc-map" class="b-map-sec__canvas" role="application"
  aria-label="Карта объектов ММ Пром">` + `.b-map-sec__bar` (подсказка
  `ads_click` «Нажмите на метку — откроется карточка объекта» +
  `btn--outline` «Смотреть каталог» → `/katalog/`).
- Данные: frontmatter каждой страницы загружает коллекцию и строит полный
  список: `const mapObjects = objects.map(({ id, data }) => ({ id, title:
  data.title, coords: data.coords, address: data.address, area: data.area }));
  ` — **все 27 объектов без фильтрации, одинаковый список на всех 14
  страницах** (у arenda/prodazha дополнительно строятся ленты, §1.3).
- Хвост страницы (сразу после секции `#map`, три тега):
  1. `<script is:inline src="https://api-maps.yandex.ru/2.1/?apikey=2ae53810-…&lang=ru_RU">`
     — Yandex Maps API 2.1; ключ Яндекс.Карт встроен в разметку — согласованное
     решение проекта (AGENTS.md, критическое правило 5);
  2. `<script is:inline define:vars={{ mapObjects }}>window.MMPROM_MAP_OBJECTS
     = mapObjects;</script>`;
  3. `<script is:inline src="/assets/svc-map.js?v=1" defer></script>`.
- Поведение `public/assets/svc-map.js` (37 строк): ленивая инициализация
  (IntersectionObserver rootMargin 250px → `ymaps.ready`), `ymaps.Map`
  center `[59.85, 30.35]` zoom 9, `ObjectManager` clusterize (gridSize 64),
  пины/кластеры — inline data-URI SVG (фиолетовый пин с золотым кругом),
  `setBounds` по границам объектов. **Балун-попап метки: заголовок, адрес,
  площадь и ссылка «Смотреть в каталоге» → `/katalog/`** — переход на страницы
  объектов (`/obekt/<id>/`) делает фича `catalog` (правка svc-map.js, п. 8);
  здесь попап-паттерн не меняется.
- Услуги/роли — все 14 несут секцию; «Весь каталог» и «Смотреть каталог» —
  статические ссылки. Подсказка «откроется карточка объекта» формулировкой
  отстаёт от текущего поведения (сейчас — ссылка на каталог в балуне; после
  imp-catalog — страница объекта).

### 1.3 Медиа страниц (as-is)

| Медиа | Где | Состояние |
|-------|-----|-----------|
| Ленты карточек объектов | `#sostav` arenda («Объекты в аренду», `b-scope__obj-title` + `b-scope__objects`, 6 карт) и prodazha («Объекты в продажу», 6 карт); списки `rentObjects`/`saleObjects` = atlas-garazhny, avrora-vitebsky, antares, voyskovitsy-park, volhonskoe, parnas; рендер `<ObjectCard obj={o} stagger={i} />`; после ленты — `b-scope__cta` `btn--outline` «Смотреть каталог объектов» → `/katalog/` | фото объектов — из коллекции (`data.image`): 25 из 27 записей — внешние URL (`invest-platforma.com/images/obekty/…`, `mm-prom.ru/wp-content/…`), 2 локальные (`/tervolovo.jpg`, `/parnas.png`); рендер и чипы — фича `object-card`, локальные пути — фича `objects-data` |
| Фото проектов (proj-card) | `#proekty` stroitelstvo (4), development (5), redevelopment (2): `<div class="img-placeholder" data-img="Фото: …">` + иконка `image` + текст подписи | **заглушки без реальных фото** — фото не подключаются, CR на них ничего не меняет |
| Hero-медиа | hero всех 14 страниц | нет: текст-центр (`b-hero--service .b-hero__inner` = 1 колонка), glow/particles/sq-float; CSS `.b-hero__media-frame .img-placeholder`, `.b-hero__video` скопирован на все 14 страниц — **мёртвый** (разметки `b-hero__media` нет) |
| Иные медиа-блоки | `b-split`, `b-standards`, `b-contacts` | CSS-копии есть на всех 14, разметки нет (мёртвые) |
| Консалтинг | `consalting.astro` | **фото нет вообще**: секция `#sostav` без объектной ленты (последняя — b-scope__grid), заглушек proj нет; единственная «картинка» — пин карты |
| Видео | на 14 страницах нет | `.b-hero__video` — мёртвый CSS |

Вывод as-is по медиа услуг: реальные изображения — только фото объектов в
лентах arenda/prodazha (через коллекцию), остальное — заглушки и мёртвые
CSS-копии.

### 1.4 Страница «Промышленный консалтинг» (as-is)

- Маршрут `/consalting/`, title «Промышленный консалтинг — ММ Пром»,
  meta description — текущий текст (взвешенное решение о развитии активов,
  потенциал земли, ВРИ, сценарии застройки).
- Каркас как у типовой услуги без `#proekty` (9 секций, map=06); состав:
  role-card ×3 (Производствам, Собственникам зданий, Собственникам участков),
  scope-card ×6 (аудит, ВРИ, финмодель, сценарии, ТЗ, дорожная карта),
  approach-card ×2 («В результате вы получаете», «Рабочие документы проекта»),
  b-flow2 ×5 шагов, карта, CTA-полоса grad, «Другие услуги» ×9.
- Медиа: нет ни фото, ни заглушек (§1.3). П. 29 CR добавляет фотографии с
  действующего сайта `mm-prom.ru/consalting/`.
- Источник фото (WP-версия, блок `block-fswide__media` первого экрана):
  `<picture>` — mobile ≤1023px `https://mm-prom.ru/wp-content/uploads/2026/05/
  consalting-sm.avif`, desktop `https://mm-prom.ru/wp-content/uploads/2026/04/
  inner-optimized.webp`. **Оба файла уже в проекте** (импортированы шагом
  `prep-import` спринта): `public/assets/external/consalting-sm.avif`,
  `public/assets/external/inner-optimized.webp`.

### 1.5 Особенности страниц ролей (вне правок фичи)

- Hero-метрики: в тексте пунктов продублированы имена иконок — «verifiedс 2011
  года», «square_foot200 000+ м²», «apartment25+ проектов», «groups150+
  резидентов» (у страниц услуг тексты чистые) — дефект миграции, **без CR
  не правится** (содержание ролей не меняется); на ревью владельца (§6).
- Лид секции `#services` отстаёт от факта: investoram/proizvodstvam/
  sobstvennikam-uchastkov — «Восемь сценариев…» при 9 плитках;
  sobstvennikam-zdaniy — «Семь сценариев…» при 8 плитках. Вне скоупа.
- Состав ссылок svc-tile: investoram — 9 (все услуги, кроме консалтинга);
  sobstvennikam-zdaniy — 8 (нет строительства и девелопмента).

### 1.6 Сводная таблица (as-is)

| Блок | 10 услуг | 4 роли | Итого |
|------|----------|--------|-------|
| Секция карты `#map` (`svc-map` ×2 на страницу: разметка + тег скрипта) | ×10 | ×4 | 14 |
| Лента объектов (`b-scope__objects`) | ×2 (arenda, prodazha) | − | 2 |
| Карточек объектов | 6 + 6 | − | 12 |
| proj-card (заглушки) | 11 (4+5+2) | − | 11 |
| Фото в разметке страниц | 0 | 0 | 0 |
| Роль-card / svc-tile / role-link / other-card | 34 / − / − / 90 | − / 35 / 12 / − | — |
| Хвост карты (Yandex API + define:vars + svc-map.js) | ×10 (3 тега на страницу) | ×4 (3 тега) | 42 тега на 14 страницах |

---

## 2. Целевые правки (to-be) — блоки реализации

### 2.1 B1 «Карта на 9 страницах» (п. 30)

Карта объектов остаётся на **9 страницах** и убирается с **5**; содержание
остающихся страниц (ролей — целиком, 5 услуг из 9 — кроме удаления) не меняется:
«их содержание не меняется» по п. 30.

| Страница | Действие | Пост-чек |
|----------|----------|----------|
| `arenda` | оставить карту | `grep -q 'svc-map' src/pages/arenda.astro` |
| `prodazha` | оставить карту | `grep -q 'svc-map' src/pages/prodazha.astro` |
| `trade-in` | оставить карту | `grep -q 'svc-map' src/pages/trade-in.astro` |
| `investcomp` | оставить карту | `grep -q 'svc-map' src/pages/investcomp.astro` |
| `brokerage` | оставить карту | `grep -q 'svc-map' src/pages/brokerage.astro` |
| `investoram` | оставить карту | `grep -q 'svc-map' src/pages/investoram.astro` |
| `proizvodstvam` | оставить карту | `grep -q 'svc-map' src/pages/proizvodstvam.astro` |
| `sobstvennikam-uchastkov` | оставить карту | `grep -q 'svc-map' src/pages/sobstvennikam-uchastkov.astro` |
| `sobstvennikam-zdaniy` | оставить карту | `grep -q 'svc-map' src/pages/sobstvennikam-zdaniy.astro` |
| `stroitelstvo` | **удалить карту полностью** | `! grep -q 'svc-map' src/pages/stroitelstvo.astro` |
| `development` | **удалить карту полностью** | `! grep -q 'svc-map' src/pages/development.astro` |
| `redevelopment` | **удалить карту полностью** | `! grep -q 'svc-map' src/pages/redevelopment.astro` |
| `upravlenie` | **удалить карту полностью** | `! grep -q 'svc-map' src/pages/upravlenie.astro` |
| `consalting` | **удалить карту полностью** (плюс фото B2) | `! grep -q 'svc-map' src/pages/consalting.astro` |

Состав удаления со 5 страниц — все следы карты целиком (пост-чек грепает
строку `svc-map`, но остатки данных грепом не ловятся):

1. секция `<section id="map" class="b-map-sec section">…` (или вызов
   `MapSection`, если к этому шагу imp-pages уже заменил разметку);
2. инжект данных `<script is:inline define:vars={{ mapObjects }}>
   window.MMPROM_MAP_OBJECTS = mapObjects;</script>`;
3. тег Yandex Maps API `<script is:inline
   src="https://api-maps.yandex.ru/2.1/?apikey=…">`;
4. тег `/assets/svc-map.js?v=1`;
5. frontmatter-конструкции, ставшие мёртвыми: `mapObjects` (у trade-in,
   investcomp, brokerage, upravlenie, consalting — `getCollection('objects')` и
   `objects` используются только для карты → импорт и переменные удаляются тоже);
6. мёртвые CSS-копии `.b-map-sec*` в инлайн-стилях этих страниц — заодно
   (решение дельты, пост-чеком не грепается).

Дополнительные проверки полного удаления (к плановым пост-чекам): на каждой из
5 страниц нет `MMPROM_MAP_OBJECTS`, `api-maps.yandex.ru`, `id="map"`,
`.b-map-sec` — карта не остаётся «наполовину» (см. A-чеки ACCEPTANCE).

Эффект: внешние запросы к `api-maps.yandex.ru` и исполнение `svc-map.js`
исчезают на 5 страницах; на 9 страницах секция карты и её скрипты остаются
как есть (кроме попап-механики из фичи `catalog`).

Сопутствующие правки-следствия B1 (без изменения остального содержимого):
у 5 страниц пропадают строка подсказки и кнопка «Смотреть каталог» из бара
карты (уходят с секцией); CTA-полоса и «Другие услуги» остаются. Нумерация
`sec-index` смежных секций (cta/uslugi на 5 страницах; у консалтинга FAQ
нет) перестраивается или нет — решение дельты (§6 п. 5).

### 2.2 B2 «Локальные медиа услуг и фото консалтинга» (п. 29)

**Фото консалтинга (п. 29)** — на `/consalting/` появляются фотографии с
действующего сайта, файлы сохраняются в проекте:

| Состав | Значение |
|--------|----------|
| Файлы | `public/assets/external/consalting-sm.avif` (mobile ≤1023px), `public/assets/external/inner-optimized.webp` (desktop) — уже импортированы шагом `prep-import`; новых загрузок не требуется |
| Точка вставки | hero страницы консалтинга — медиа-зона первого экрана (как WP-блок `block-fswide__media`); разметка `<picture>` с `source media="(max-width: 1023px)"` → consalting-sm.avif и `img src` → inner-optimized.webp — механика `picture` как в WP-версии, разметка точки вставки — решение дельты |
| Якорь пост-чека | `grep -q 'assets/external/consalting-sm.avif' src/pages/consalting.astro` (плановый пост-чек `imp-services`); доп.: `inner-optimized.webp` в том же файле |
| Запрет | фото отдаётся только локальными путями — внешние URL (`mm-prom.ru/wp-content/…`) не используются; alt-текст «Консалтинг по промышленной недвижимости»; внешних запросов за изображением не появляется (критерий приёмки CR по локальным медиа) |
| Мёртвый CSS | `.b-hero__media-frame`/`.img-placeholder` на consalting может быть переиспользован либо заменён CSS-ом медиа-зоны — решение дельты |

**Локальные медиа услуг (межфичевое разграничение):** фото карточек объектов в
лентах arenda/prodazha меняют внешние URL на локальные пути
(`/assets/external/…`) — правка данных коллекции, фича `objects-data`
(карта `map-external.tsv`, 19 записей; пост-чек imp-objects-data: в
`src/content/objects/*.json` нет `invest-platforma.com` и
`mm-prom.ru/wp-content`). Фича `services` для этого **правки страниц не
вносит** — `ObjectCard` берёт `data.image` из коллекции автоматически.
Аналогично hero-медиа и заглушки proj-card:

| Медиа | Действие фичи services |
|-------|------------------------|
| Лента arenda/prodazha (12 карт, фото из коллекции) | не правится; локальность приходит из `objects-data` (проверка межфичевая) |
| proj-card заглушки stroitelstvo/development/redevelopment (11 шт.) | остаются заглушками — CR не предусматривает реальные фото проектов |
| Hero остальных 13 страниц | без медиа (текстовые); `b-hero__media-frame` CSS остаётся мёртвым — чистка вне фичи |
| consalting | фото добавляются (таблица выше) |

### 2.3 Разграничение с соседними фичами

| Вопрос | Где решается |
|--------|--------------|
| Шаблон секции карты → `MapSection.astro` (п. 21) | фича `site-pages` (B2, imp-pages — до imp-services) |
| Попапы карты → `/obekt/<id>/`, поведение svc-map.js, каталог.js | фича `catalog` (п. 8, imp-catalog — до imp-services) |
| Локальные пути фото объектов в коллекции | фича `objects-data` (imp-objects-data — до imp-object-card/imp-home) |
| Рендер/чипы карточек лент | фича `object-card` |
| Шапка, кнопка формы, «Обсудить…» целевые формы | фича `site-shell` |
| Содержание, типографика и декор общих блоков | фича `site-pages` (B1/B2), `home` |
| Удаление карты с 5 страниц, фото консалтинга | **эта фича (imp-services)** |

---

## 3. Границы (что НЕ входит в фичу)

- Компонент разметки секции карты и его стиль — `MapSection.astro` (site-pages).
- Попап-механика `svc-map.js`/`catalog.js` (ссылки на `/obekt/<id>/`) —
  `catalog` (svc-map.js в этой фиче не правится).
- Данные коллекции (id 27 объектов, поле `images`, локальные пути фото,
  map-external.tsv) — `objects-data`.
- Карточки объектов (чипы, подписи, стрелка) — `object-card`.
- Содержание 9 страниц с картой: тексты, ленты, CTA, FAQ, «Другие услуги» —
  не меняются (п. 30); общие стили и компоненты B2 приходят из site-pages.
- Дефекты ролей (дубль имён иконок в метриках, лиды «Восемь/Семь сценариев») —
  без пункта CR; на ревью владельца (§6).
- Фото proj-card (заглушки 11 шт. на 3 страницах) — реальными фото не
  становятся (нет пункта CR).
- Формы заявок (ссылки `/modalka-zayavki/` на кнопках услуг, п. 19/18) —
  site-shell/home.
- Брендбуки, контакты, объект- и статьи-страницы — соседние фичи.

## 4. Внешние каноны

| Канон | Путь | Что фиксирует |
|-------|------|---------------|
| Требования владельца | `docs/change-requests/CR-2026-002-pravki-posle-migracii.md` (пп. 29, 30; «Границы»; «Критерии приёмки»; «Влияние на данные/миграции») | B1/B2 |
| Постановка (31 пункт) | `docs/change-requests/briefs/2026-10-23-pravki-posle-migracii.md` | исходник нумерации |
| Действующий сайт | `mm-prom.ru/consalting/` | источник фото консалтинга (consalting-sm.avif, inner-optimized.webp) |
| Импорт медиа | `.kilo/scripts/sources/mm-prom-site-2026-10-23/map-external.tsv`, шаг `prep-import` плана | 19 внешних фото → `public/assets/external/inv-*`; consalting-файлы |
| Маршруты | канон-таблица URL в CR-2026-001 | корневые слаги 14 страниц |
| Дизайн-система | `docs/DESIGN.md`, `docs/mockups/*` | палитра, компоненты |

## 5. Верификация фичи

При реализации (`imp-services`) и на ревью:

1. `npm run build` и `npx astro check` — зелёные.
2. Плановые пост-чеки (§2.1, §2.2): `svc-map` — отсутствует на 5 страницах,
   присутствует на 9; `assets/external/consalting-sm.avif` присутствует в
   consalting.astro.
3. Чеки полного удаления: на каждой из 5 страниц нет `MMPROM_MAP_OBJECTS`,
   `api-maps.yandex.ru`, `id="map"`, `.b-map-sec` (инлайн-стили чистые);
   на 9 страницах — по-прежнему 14 → 9 секций `id="map"` по всему сайту
   (проверка итогов после build/preview).
4. Открытие страниц по `astro preview` (Playwright, `webapp-testing`,
   контекст `reducedMotion:'reduce'`, ожидание `document.fonts.ready`):
   - 5 страниц: консоль без ошибок, нет запросов `api-maps.yandex.ru` и
     `/assets/svc-map.js`, DOM без `#svc-map`;
   - 9 страниц: карта инициализируется, маркеры кликабельны (попап — после
     imp-catalog ведёт на `/obekt/<id>/`), консоль без ошибок;
   - consalting фото: мобильный (360) — consalting-sm.avif, десктоп
     (1366) — inner-optimized.webp; запрос картинок — только локальные
     (`/assets/external/…`); ленты arenda/prodazha — фото объектов
     отдаются с сайта (после imp-objects-data).
5. Регресс: содержание 9 страниц не изменилось (п. 30).

## 6. Решения агента — на ревью владельца

1. **Полный состав удаления карты** — пост-чек плана грепает только строку
   `svc-map` (не ловит инжект данных и тег Yandex API). В фиче зафиксирован
   полный чек-лист удалений (§2.1 п. 1–6); на 5 страницах карта считается
   удалённой только вместе со скриптами/данными/CSS. Дельта может сузить/расширить.
2. **Мёртвый CSS `.b-map-sec*` на 5 страницах** удаляйте заодно с секцией;
   в пост-чеке не проверяется (grep только скриптовых следов) — риск остатка
   покрыт A-чеками приёмки.
3. **Разметка фото консалтинга** — механика `<picture>` с брейкпоинтом
   1023px перенесена из WP-версии (мобильный avif / десктоп webp);
   точка вставки — hero. Если владелец хочет другое место (например,
   отдельная секция «Как мы работаем на практике») — правка дельты.
4. **`inner-optimized.webp` на десктопе** обязательным пост-чеком не является
   (в плане только consalting-sm.avif); по WP-версии оба файла нужны —
   зафиксировано как ожидание приёмки, не как жёсткий пост-чек.
5. **Нумерация `sec-index` после удаления карты** (cta 07→06, uslugi 08→07
   и т. п.) не предписана CR; по умолчанию — пересчитывать в каждой
   затронутой странице, чтобы номера оставались последовательными
   (сопутствующие правки-следствия §2.1); если владелец против — оставить
   как есть.
6. **Дефекты ролей** (дубль имён иконок в метриках, расхождение лидов
   «Восемь/Семь сценариев» с числом плиток 9/8) найдены и зафиксированы
   (§1.5), но не правятся: содержание ролей не меняется по CR. Если владелец
   захочет — отдельным микро-CR.
7. **Фото proj-card** (11 заглушек) остались заглушками — CR молчит о них;
   если владелец ждёт реальные фото (источник — скачанная версия сайта),
   потребуется доп. решение/импорт.
8. Численные точки вставки (§1.6) могут сместиться ±1 после правок соседних
   фич того же спринта (MapSection, ленты, каталог) — фактологическая
   база для приёмки.

## Источники инвентаризации

- `src/pages/arenda.astro`, `prodazha.astro`, `trade-in.astro`,
  `investcomp.astro`, `brokerage.astro`, `stroitelstvo.astro`,
  `development.astro`, `redevelopment.astro`, `upravlenie.astro`,
  `consalting.astro`, `investoram.astro`, `proizvodstvam.astro`,
  `sobstvennikam-uchastkov.astro`, `sobstvennikam-zdaniy.astro` — разметка,
  frontmatter (`mapObjects`, `rentObjects`/`saleObjects`), хвостовые скрипты;
  считано grep/подсчётами (2026-10-23).
- `public/assets/svc-map.js` (37 строк) — поведение карты и балуна.
- `src/content/objects/*.json` (27 записей; 25 внешних `image`, 2 локальные),
  `src/components/ObjectCard.astro` — ленты arenda/prodazha.
- `public/assets/external/` — импортированные локальные медиа
  (consalting-sm.avif, inner-optimized.webp, inv-*).
- `https://mm-prom.ru/consalting/` (снято 2026-10-23) — источник фото
  (block-fswide__media: consalting-sm.avif ≤1023px, inner-optimized.webp).
- `.kilo/scripts/plans/sprint-cr-2026-002.tsv` — шаг `spec-services`,
  пост-чек `imp-services`.
- CR-2026-002: пп. 29, 30, разделы «Границы», «Влияние на данные/миграции»,
  «Критерии приёмки».