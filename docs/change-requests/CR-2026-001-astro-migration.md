# CR-2026-001 — Миграция mm-prom-web: HTML → Astro

Статус: реализация. Спринт: `sprint-astro-001` (шаги 0–8 + 10; шаг 9 — вне спринта, gated).

## Цель и решения владельца

- Портируем на Astro. Требование «работает по `file://`» снято (разработка через LLM, просмотр через `astro dev`/`preview`).
- Цель порта: единые компоненты — `BaseLayout` (шапка/подвал), `ObjectCard` (карточки объектов, включая каталог) + данные объектов в content collection (`glob()`, 27 файлов).
- Каноничная карточка: `.obj-card` с медиа; каталог тоже переводится на этот канон (обязательный шаг).
- **URL за основу — WordPress**: 11 страниц с прямыми соответствиями сохраняют индексированные WP-слаги; страницы без WP-соответствия получают короткие слаги в духе WP-набора; дубли WP-объектов уходят в 301. Directory-формат, без `.html`, слэш на конце.
- Прод-судьба: **новый сайт заменит WordPress на mm-prom.ru**. Замена = gated-шаг: только после приёмки на staging, отдельного плана форм заявок и заполненной 301-карты (только дубли WP).
- CTA «Оставить заявку» (82 ссылки на несуществующую `modalka_zayavki.html`) — **остаются как есть** (кебаб-слаг, битая); замена WordPress блокируется до плана форм.
- Данные объектов: content collection `objects`, `glob()`: 27 файлов `src/content/objects/<id>.json`, zod-схема; страницы объектов — следующий план, схема готовится под них сразу.
- Функционал Astro: sitemap, robots.txt, 404.astro, prefetch (точечный), `astro check`, canonical/OG/Metrika в BaseLayout. Отложено: ClientRouter (конфликт с reveal site-anim.js), astro:assets (фото remote), islands.
- Порт конвейера правок — отдельный следующий план.
- План прошёл аудит субагента (Astro 7.4 docs, GitHub Pages docs, live mm-prom.ru); находки интегрированы.

## Каноническая таблица URL (маппинг «локальная страница → слаг»)

| Локальный файл | Новый маршрут | Источник |
|---|---|---|
| index.html | `/` | WP |
| o_kompanii.html | `/about/` | WP |
| kontakty.html | `/contact/` | WP |
| usluga.html | `/uslugi/` | новый |
| usluga_konsalting.html | `/consalting/` | WP |
| usluga_podbor.html | `/brokerage/` | WP |
| usluga_development.html | `/development/` | WP |
| usluga_upravlenie.html | `/upravlenie/` | WP |
| usluga_treyd_in.html | `/trade-in/` | WP |
| usluga_investicii.html | `/investcomp/` | WP |
| usluga_arenda.html | `/arenda/` | новый |
| usluga_prodazha.html | `/prodazha/` | новый |
| usluga_stroitelstvo.html | `/stroitelstvo/` | новый |
| usluga_redevelopment.html | `/redevelopment/` | новый |
| katalog_obektov.html | `/katalog/` | новый |
| blog.html | `/blog/` | новый (на WP «Блог» → Telegram) |
| rol_investoram.html | `/investoram/` | новый |
| rol_proizvodstva.html | `/proizvodstvam/` | новый |
| rol_uchastki.html | `/sobstvennikam-uchastkov/` | новый |
| rol_zdaniya.html | `/sobstvennikam-zdaniy/` | новый |
| atlas-garazhnyj-brandbook.html | `/atlas-garazhnyj/` | WP (в sitemap) |
| avrora-vitebskij-brandbook.html | `/avrora-vitebskij/` | WP (в sitemap) |
| (нет; создаётся в блоке замены WP) | `/privacy/` | WP |

Битые цели переписываются в кебаб и остаются битыми: `modalka_zayavki.html` → `/modalka-zayavki/` (82), `kartochka_obekta.html` → `/kartochka-obekta/` (12), `gejt_broshury.html` → `/gejt-broshury/` (2), `gejt_tz.html` → `/gejt-tz/` (1).

## Исходное состояние (сверено аудитом)

- 22 страницы `*.html` в корне; инлайн-стили в `<head>`, инлайн-JS в конце `<body>`.
- Шапка/подвал идентичны `tools/partials/*` на всех 22 страницах, но в partials — 97 старых ссылок `*.html` и относительный логотип.
- Данные объектов (27): `var OBJECTS` в katalog (id/title/type/typeLabel/deal/area/address/district/desc/specs/price/image/external/coords/busy), 14 страниц с `var OBJ` (копии для svc-map), 21 захардкоженная `.obj-card` (index ×9, usluga_arenda ×6, usluga_prodazha ×6), 27 `.cat-card` с dataset-фильтрами.
- Ссылки: ~2457 внутренних `X.html` (24 уникальных цели; ~323 вне шапки/подвала).
- Карты: 17 страниц (каталог + 14 услуг/ролей + 2 брендбука); **два** ключа Яндекс.Карт (`2ae53810…` ×15, `5971e07b…` ×2).
- В данных объектов локальные картинки-пути: `tervolovo.jpg`, `parnas.png`.
- **8 страниц с битым инлайн-JS** `<script><script>…</script></script>` (katalog_obektov, blog, kontakty, o_kompanii, 4 × rol_*): сегодня скрипт мёртв (не выполняется), Rust-компилятор Astro 7 упадёт.
- Живой WP на mm-prom.ru: 15 страниц в sitemap + `/`; Метрика №109764749; формы через Bitrix24 (`b24-10u6qz.bitrix24site.ru`); «Блог» → Telegram.
- В репо нет canonical/OG/Метрики/форм. Node v24.15.0; репо чистое.

## Ключевые решения

- `astro@^7` (7.4). Конфиг: static, `build: { format: 'directory' }`, `trailingSlash: 'always'`, **`compressHTML: false`** (дефолт v7 `'jsx'` режет пробелы/переносы вокруг элементов — недопустимо для механического порта; `false` = побайтово близкий выход), `site` **из env** (`ASTRO_SITE`, дефолт `https://mm-prom.ru`), `prefetch: true` (точечные `data-astro-prefetch` в Layout; не `prefetchAll`), `integrations: [sitemap()]`.
- `base` не используем: сайт в корне домена на staging (Pages) и prod (Beget/mm-prom.ru). Все внутренние ссылки и ассеты корневые: `/about/`, `/assets/site-anim.css`, `/mmprom-logo.png`.
- Маршруты — по канонической таблице; имя файла страницы = слаг (`src/pages/about.astro` и т.д.). id объектов в данных (`atlas-garazhny`, `avrora-vitebsky`) не трогаем.
- Инлайн-стили остаются в `<head>` страницы (`is:inline`), инлайн-скрипты — `is:inline`; общие скрипты — классикой из `public/assets/`, данные — `window.MMPROM_*` через `define:vars` (подразумевает `is:inline`).
- Данные объектов: `glob()`, **id = имя файла, поле id в JSON не задаётся** (используется `entry.id`); zod-схема покрывает фильтры каталога: `areaNum` (число, `null` = «по запросу»), `location` enum `spb|lo`, `dealTypes` enum `rent|sale`, `busy` boolean, `price`/`external`/`typeLabel`/`district`, `sort`, опциональные `hero`/`faq`/`cta`; локальные картинки в данных — корневые (`/tervolovo.jpg`, `/parnas.png`).
- ObjectCard рендерится ТОЛЬКО на билде; каталог: 27 карточек серверно, фильтрация/сортировка — по data-атрибутам DOM, модалка — из `window.MMPROM_OBJECTS`.
- Окружения (env-флаг `MMPROM_ENV`: `prod` — дефолт, `staging`): staging-сборка — `ASTRO_SITE=<staging>` + `noindex`, без Метрики, robots без Sitemap-строки; прод-сборка — canonical/OG, Метрика №109764749, robots с `Sitemap: https://mm-prom.ru/sitemap-index.xml`.
- Битые ссылки не чиним — кебаб-правило + остаются битыми до плана форм.

## Шаги

### Шаг 0 — preflight + интерим-блок в AGENTS.md

- В 8 страницах (katalog_obektov.html, blog.html, kontakty.html, o_kompanii.html, rol_investoram.html, rol_proizvodstva.html, rol_uchastki.html, rol_zdaniya.html) убрать битую вложенность `<script><script>…</script></script>` → один валидный `<script>…</script>` (механически, содержимое не менять).
- **AGENTS.md — интерим-блок** в начало файла: «Идёт миграция на Astro (CR: docs/change-requests/CR-2026-001-astro-migration.md). npm/Astro-команды в рамках шагов миграции разрешены; запреты сборщиков и требование file:// приостановлены решением владельца до полной переработки контекста в финальном шаге миграции».
- Эти скрипты сегодня мёртвые — после правки заработают: в валидации шага 2 прогнать эти 8 страниц отдельным вниманием (консоль, меню/карты). Спорное — «решение агента — на ревью владельца».
- **Пост-чек:** `grep -c '<script><script' *.html` — 0; интерим-блок в AGENTS.md закоммичен.
- **commit-msg:** `chore(migration): preflight — убрать вложенные <script>, интерим-блок AGENTS.md`

### Шаг 1 — каркас Astro

- `package.json`: точные версии (`astro@^7`, `@astrojs/sitemap`, `@astrojs/check`, `typescript`), `scripts: { dev, build, preview }`, `engines: { node: ">=24" }`; `npm install` → **закоммитить `package-lock.json`**; `tsconfig.json` (extends astro/tsconfigs/base) + `src/env.d.ts`.
- `astro.config.mjs`: static, `format: 'directory'`, `trailingSlash: 'always'`, `compressHTML: false`, `site: process.env.ASTRO_SITE || 'https://mm-prom.ru'`, `prefetch: true`, `integrations: [sitemap()]`.
- `public/robots.txt` (Sitemap-строка — только прод-сборка, разводка в шаге 3); `assets/` и корневые картинки → `public/`; `.gitignore` += `node_modules/`, `dist/`, `.astro/`.
- **Пост-чек:** `npm install` exit 0; `test -f package-lock.json`; `npm run build` exit 0 (пусто); `npx astro check` exit 0.
- **commit-msg:** `chore(astro): каркас проекта — config, tsconfig, public, lock`

### Шаг 2 — механический перенос (ядро миграции)

- 2a. ВСЕ 22 `*.html` → `src/pages/<slug>.astro` **по канонической таблице**. Инлайн-`<script>` → `is:inline` (кроме внешних и Яндекса — им тоже можно `is:inline`), инлайн-`<style>` → `is:inline`, стили остаются в `<head>`.
- 2b. Перезапись ссылок и ассетов одним проходом (включая источник будущей шапки/подвала):
  - `href="X.html"` → `href="/<slug>/` по таблице; `href="index.html"` → `href="/"`;
  - битые — кебаб и остаются битыми: `/modalka-zayavki/`, `/kartochka-obekta/`, `/gejt-broshury/`, `/gejt-tz/`;
  - локальные ассеты в `src`/`href`/CSS `url()`: `assets/…` → `/assets/…`, `mmprom-logo.png` → `/mmprom-logo.png`, `parnas.png` → `/parnas.png`, `tervolovo.jpg` → `/tervolovo.jpg`;
  - внешние (mm-prom.ru, Google Fonts, api-maps.yandex.ru, b24-*.bitrix24site.ru) — не трогать.
- **Пост-чек:** `npm run build` exit 0; каталоги в `dist/` точно соответствуют таблице (21 каталог + корневой `index.html`); `grep -c 'href="[^/"]*\.html"' src/pages/*.astro` — 0; `grep -cE 'href="/[a-z0-9-]*_[a-z0-9-]*/"' src/pages/*.astro` — 0; `grep -cE '(src|href)="(assets|mmprom-logo|parnas|tervolovo)' src/pages/*.astro` — 0; размер страниц сопоставим (±5%).
- **Валидация:** baseline-скриншоты ДО переноса (Playwright, список docs/REGRESSION.md); после — те же точки через `astro preview` (`/about/`, `/arenda/`…), 8 preflight-страниц отдельным вниманием; консоль без новых ошибок; клик по 2–3 ссылкам меню.
- **commit-msg:** `feat(migration): перенос 22 страниц в src/pages, перезапись ссылок и ассетов`

### Шаг 3 — BaseLayout (шапка/подвал/head/SEO)

- `src/layouts/BaseLayout.astro`: `<head>`-каркас (meta, favicon, Google Fonts, canonical — `Astro.site` + путь, OG-теги, meta robots по env, Метрика №109764749 — только прод-сборка), шапка и подвал из `tools/partials/*` **после той же перезаписки ссылок** (таблица + корневые ассеты), контент через `<slot />`. Активного пункта меню в шапке нет — новую фичу не вводим.
- Из каждой страницы вырезать `<header class="site-header">…</header>`, `<footer class="site-footer">…</footer>`, общую часть `<head>`; обернуть в Layout.
- `src/pages/404.astro` на BaseLayout; `data-astro-prefetch` — точечно на пункты меню.
- robots.txt — через env-разводку (эндпоинт `src/pages/robots.txt.ts`: прод — `Sitemap: <site>/sitemap-index.xml`; staging — без Sitemap); статический `public/robots.txt` удалить.
- Удалить `tools/sync_partials.py` и `tools/partials/`.
- **Пост-чек:** `grep -c '<header class="site-header"' src/pages/*.astro` — 0; `grep -c 'href="[^/"]*\.html"' src/layouts/*.astro` — 0; `grep -c 'src="mmprom-logo.png"' src/layouts/*.astro` — 0; build + `astro check` exit 0; `/404.html` в dist; canonical/OG в dist-страницах; staging-сборка даёт `noindex`; скриншот-сверка (index, arenda, contact) с baseline.
- **commit-msg:** `feat(layout): BaseLayout (шапка/подвал/SEO), 404, robots env; tools/ удалён`

### Шаг 4 — данные объектов + ObjectCard + карты

- `src/content/objects/<id>.json` — 27 файлов (id = имя файла; поля id в JSON нет), из `OBJECTS` каталога + поля карточки (badgeLabel/badgeClass, presentation, media, meta) + поля фильтров (`areaNum`, `location`, `dealTypes`, `busy`) + `sort` + опциональные `hero`/`faq`/`cta`; локальные картинки — `/tervolovo.jpg`, `/parnas.png`.
- `src/content.config.ts`: `glob({ base: './src/content/objects', pattern: '**/*.json' })` + zod-схема (title/type/typeLabel/dealTypes/area/areaNum/location/address/district/desc/sort обязательны; enum `type`: park|warehouse|production|land; enum `dealTypes`: rent|sale; coords — пара чисел; busy boolean; price/external/image строки; specs/meta массивы; hero/cta опциональны).
- **Явная таблица «карточка → id»** для 21 заменяемой карточки («Войсковицы» на главной = `voyskovitsy-park`, не `voyskovitsy`; карточки с `kartochka-obekta` мапятся по заголовку). Фиксируется в первом коммите шага.
- `src/components/ObjectCard.astro`: канон `.obj-card` с медиа; optional-props: `busy` (бейдж), `externalHref`, `showMap` (для каталога), `presentation`; data-атрибуты каталога — из объекта.
- Замена 21 захардкоженной карточки: index (3 ленты), arenda, prodazha — циклом по спискам id.
- 14 страниц с `svc-map`: `var OBJ` ← из коллекции через `define:vars`.
- **Пост-чек:** сборка ловит ошибки схемы (сломать поле сознательно — падает); `astro check` exit 0; `[УТОЧНИТЬ]` только в `src/content/objects/`; `grep -c 'var OBJ ' src/pages/*.astro` — 0; все `image` в коллекции — `/…` или `https://…`; карточки одного объекта на index и arenda — один источник; порядок лент прежний (по `sort`); скриншоты с baseline.
- **commit-msg:** `feat(objects): content collection 27 объектов, ObjectCard, замена 21 карточки, svc-map из коллекции`

### Шаг 5 — каталог: унификация карточек (обязательный)

- `.cat-card` → серверный рендер 27 `ObjectCard`; фильтры/сортировка/поиск — в `catalog.js` по data-атрибутам отрендеренных карточек (DOM-паттерн сохраняется, датасет — из коллекции); режимы список/карта и модалка — из `window.MMPROM_OBJECTS`. Клиентской перерисовки компонента нет — только show/hide/reorder.
- Стили: `.cat-card`-правила убрать; `.obj-card`-стили вынести в `public/assets/object-card.css` (страницы с карточками подключают; cache-busting `?v=<version>`).
- **Пост-чек:** на `/katalog/`: фильтры (сделка/тип/площадь/локация/поиск/сортировка по `areaNum`) работают, счётчик и «пусто», карта, модалка, `busy`-бейдж; карточки каноничны `.obj-card`; консоль без ошибок.
- **commit-msg:** `feat(katalog): унификация карточек каталога на ObjectCard`

### Шаг 6 — вынос больших скриптов

- `public/assets/catalog.js` — логика каталога; данные: `<script is:inline define:vars={{ objects }}>window.MMPROM_OBJECTS = objects;</script>` до него.
- `public/assets/svc-map.js` — общий скрипт карты 14 страниц (сегодня продублирован 14×); читает `window.MMPROM_MAP_OBJECTS`.
- Карты двух брендбуков (`atlas-garazhnyj`, `avrora-vitebskij`) — остаются инлайн (уникальные, 2 шт.).
- Подключение классикой (`defer`), логика ждёт `DOMContentLoaded`/`ymaps.ready`; cache-busting `?v=` на все `/assets/*.js|css` (вкл. site-anim).
- **Пост-чек:** `grep -c 'ymaps.Map\|ObjectManager' src/pages/*.astro` — 0 во всех, кроме `atlas-garazhnyj.astro` и `avrora-vitebskij.astro` (осознанное исключение); build exit 0; карта каталога и одна svc-map работают; скриншоты с baseline.
- **commit-msg:** `refactor(assets): вынос catalog.js и svc-map.js из страниц`

### Шаг 7 — регресс

- Playwright по `astro preview`: все 22 маршрута из таблицы + 404; консоль без ошибок; Яндекс-карта на `/katalog/`, одной услуге и брендбуках (обоими ключами); модалка каталога; reveal-анимации (`prefers-reduced-motion`); переходы по меню/CTA; 8 preflight-страниц — меню и скрипты живые.
- Артефакты: `astro check` exit 0; `dist/sitemap-index.xml`, `dist/404.html`; **crawl-тест по dist**: все внутренние `href`/`src`/`url()` резолвятся; локальные картинки из JSON существуют.
- Обновить `docs/REGRESSION.md`: URL из таблицы, smoke по `http://localhost:4321/…/`; п.3 «битых ссылок нет» заменить списком известных битых (`/modalka-zayavki/` ×82, `/kartochka-obekta/` ×12, `/gejt-*`).
- **commit-msg:** `docs(regression): прогон миграции, обновление REGRESSION.md`

### Шаг 8 — staging: GitHub Pages

- `.github/workflows/deploy.yml` (push в main): `actions/checkout@v6` → `setup-node` (node 24, cache npm) → `npm ci` → `npm run build` с `ASTRO_SITE=<staging-URL>` и `MMPROM_ENV=staging` (noindex, без Метрики) → `actions/configure-pages@v5` → `actions/upload-pages-artifact@v4` → `actions/deploy-pages@v4`; `permissions: { pages: write, id-token: write, contents: read }`; deploy-джоба в `environment: github-pages`.
- Кастомный домен → `public/CNAME` + DNS; или пользовательская страница. Settings → Pages → Source: GitHub Actions. Выбор домена — владелец (открытый вопрос); до выбора workflow шлёт артефакт как есть.
- Яндекс-карты: staging-домен + `localhost` в allowed-domains **обоих** ключей; ограничения применяются ~15 минут.
- **Пост-чек:** Actions зелёный; 3–4 страницы + карта каталога по staging-URL; `noindex` в исходнике staging-страниц; canonical → staging-домен.
- **commit-msg:** `ci(pages): workflow деплоя staging на GitHub Pages`

### Шаг 9 — prod на Beget: подготовка замены WordPress (gated, ВНЕ спринта)

- **Гейт (не заливать в public_html mm-prom.ru):** (1) приёмка на staging; (2) отдельный план форм заявок (82 CTA; у WP формы на Bitrix24 — `b24-10u6qz.bitrix24site.ru`); (3) заполненная 301-карта дублей; (4) текст `/privacy/` от владельца; (5) canonical/OG/Метрика проверены на прод-режиме staging-сборки.
- 301-карта (только дубли WP — прямые соответствия URL сохранены по таблице): `/garage/` → `/atlas-garazhnyj/`, `/ga/` → `/atlas-garazhnyj/`, `/vitebski/` → `/avrora-vitebskij/`, `/avrora-vitebskij-3/` → `/avrora-vitebskij/`, `/sitemap.html` → `/`; `/privacy/` → `/privacy/` (страницу создать). Astro `redirects` не подходят (meta-refresh) — серверные 301 в `.htaccess`.
- `docs/DEPLOY.md`: `ASTRO_SITE=https://mm-prom.ru npm run build` → залить `dist/` в корень сайта (SFTP/SSH; способ — владелец); `.htaccess` в `public/`: `DirectoryIndex index.html`, `ErrorDocument 404 /404.html`, RewriteRule 301-карты.
- Первый ручной деплой (после гейта) + smoke по prod-домену: 404 отдаёт 404.html, `/about` без слэша → 301, дубли WP → 301, Метрика принимает события.
- **commit-msg:** `docs(deploy): подготовка замены WordPress (gated)`

### Шаг 10 — контекст проекта (до финального коммита)

- AGENTS.md: стек Astro (node 24/nvm); команды `npm install`, `npm run dev/build/preview`; «самодостаточные страницы» → «Layout + компоненты + данные»; правило дублирования шапки и `sync_partials.py`-workflow — удалить; «Именование»: маршруты = короткие слаги в стиле WP (каноническая таблица URL — источник правды, держать в docs); «Запрещённые технологии»: убрать запрет сборщиков, оставить запрет клиентских JS-фреймворков; пост-чеки: `npm run build` + `npx astro check` + grep якорей + Playwright по preview/staging; деплой-секции (staging Actions, prod DEPLOY.md, гейт замены WP).
- README.txt, docs/SPRINTS.md, docs/REGRESSION.md — актуализировать.
- **commit-msg:** `docs(context): переработка AGENTS.md/README/SPRINTS под Astro`

## Затронутые спецификации

Явные пути (спецификаций `docs/features/*` нет — миграция оформлена облегчённым CR):

- Все 22 страницы корня: `index.html`, `o_kompanii.html`, `kontakty.html`, `usluga.html`, `usluga_konsalting.html`, `usluga_podbor.html`, `usluga_development.html`, `usluga_upravlenie.html`, `usluga_treyd_in.html`, `usluga_investicii.html`, `usluga_arenda.html`, `usluga_prodazha.html`, `usluga_stroitelstvo.html`, `usluga_redevelopment.html`, `katalog_obektov.html`, `blog.html`, `rol_investoram.html`, `rol_proizvodstva.html`, `rol_uchastki.html`, `rol_zdaniya.html`, `atlas-garazhnyj-brandbook.html`, `avrora-vitebskij-brandbook.html` → `src/pages/<slug>.astro`.
- `AGENTS.md` (интерим-блок шага 0, полная переработка шага 10).
- `README.txt`, `docs/REGRESSION.md`, `docs/SPRINTS.md`.
- `tools/partials/header.html`, `tools/partials/footer.html`, `tools/sync_partials.py` (удаляются в шаге 3 — источник переезжает в `src/layouts/BaseLayout.astro`).
- `assets/site-anim.css`, `assets/site-anim.js` → `public/assets/` (контент не меняется).
- Новые: `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `src/layouts/`, `src/components/`, `src/content/objects/`, `src/content.config.ts`, `src/pages/robots.txt.ts`, `.github/workflows/deploy.yml`.

## Критерии приёмки (компактный чек-лист)

- [ ] `npm run build` и `npx astro check` — зелёные.
- [ ] Все 22 маршрута таблицы + 404 отвечают по `astro preview`; консоль без ошибок (кроме ожидаемых внешних).
- [ ] Crawl-тест по `dist/` чист: внутренние `href`/`src`/`url()` резолвятся; локальные картинки из JSON существуют.
- [ ] Скриншот-сверка с baseline (index, каталог, услуга, брендбук, контакты; desktop+mobile) — раскладка не развалилась.
- [ ] Каталог: фильтры/поиск/сортировка/карта/модалка работают; карточки каноничны `.obj-card`.
- [ ] Staging задеплоен (после выбора домена владельцем и пуша в main), `noindex` в исходнике, canonical → staging.
- [ ] Известные битые ссылки (`/modalka-zayavki/` и др.) зафиксированы в docs/REGRESSION.md.
- [ ] Интерим-AGENTS.md снят полной переработкой в шаге 10.
- [ ] Шаг 9 (замена WordPress) НЕ выполнен — гейт (формы, 301-карта, `/privacy/`, приёмка staging) не пройден.

## Ловушки (для реализующего агента)

1. Инлайн `<script>` в .astro бандлится Vite по умолчанию — всех переносимых `is:inline`; общие — классикой из `public/assets/`.
2. Инлайн `<style>` по умолчанию scoped — обязательно `is:inline`.
3. `{`/`}` в тексте .astro — выражения; литеральные экранировать. В `is:inline` проблемы нет.
4. `define:vars` на `<script>` подразумевает `is:inline`.
5. Ссылки только корневые `/slug/` по таблице; после шага 2b grep'ы по `.html`-href, snake-паттерну и локальным относительным `src=` пусты.
6. Rust-компилятор v7 строг к невалидному HTML — preflight шага 0 обязателен; ошибки сборки на «работавших» страницах = искать невалидную вложенность.
7. `/x` без слэша — 301 (в dev warning); канон — со слэшем.
8. Классические `defer`-скрипты выполняются после inline `is:inline` — логика в `/assets/*.js` ждёт `DOMContentLoaded`/`ymaps.ready`.
9. `compressHTML: false` обязателен: дефолт `'jsx'` режет пробелы вокруг элементов при переносах строк; `false` = диф с исходником.
10. `glob()`: id = имя файла, поля id в JSON нет; `getCollection()` сортировка нестабильна — явный `sort`.
11. `ObjectCard` — только билд-рендер; фильтрация каталога по data-атрибутам DOM.
12. `public/` копируется as-is без хэшей — cache-busting `?v=` вручную, bump при правках.
13. Astro `redirects` = meta-refresh без статуса — 301 только сервером.
14. Два ключа Яндекс.Карт; ограничения доменов ~15 минут; на staging не забыть `localhost`.
15. WP-дубли (`/garage/`, `/ga/`, `/vitebski/`, `/avrora-vitebskij-3/`) при замене обязаны получить 301 — иначе потеря индексации объектов.

## Открытые вопросы (не блокируют миграцию)

- Staging-домен для Pages: кастомный (`staging.mm-prom.ru`?) или пользовательская страница — владелец.
- Способ заливки на Beget (SFTP/SSH/rsync) — фиксируется в DEPLOY.md (шаг 9).
- Текст политики `/privacy/` — от владельца (копия со страницы WP).
- Формы заявок: на WP — Bitrix24-формы (`b24-10u6qz.bitrix24site.ru`); в плане форм решить — переиспользовать те же или свои.

## Следующие шаги (отдельные планы, не эта миграция)

- **Формы/CTA заявок** (82 битые `modalka-zayavki`): модалка/форма на BaseLayout (кандидат — Bitrix24-формы как на WP); разблокирует замену WordPress.
- **Страницы объектов**: маршрут `/obekt/[id]/` + `getStaticPaths`; контент 2 эталонов → данные; 25 заглушек; замена `/kartochka-obekta/` и external-ссылок; эталоны остаются на `/atlas-garazhnyj/`, `/avrora-vitebskij/` — конфликт слагов решить в том плане.
- **Замена WordPress** (после форм и приёмки staging): заливка по DEPLOY.md, 301-дубли, `/privacy/`, Метрика, мониторинг индексации.
- **Порт конвейера правок под Astro**: постчеки `npm run build` + `astro check` + grep; visual-цепь по preview/staging; worktree-bootstrap `npm ci`; canon plan.tsv.
- Автоматизация prod-деплоя на Beget.
