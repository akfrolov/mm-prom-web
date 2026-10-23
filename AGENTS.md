# AGENTS.md — ММ Пром

## Проект

Сайт компании «ММ Пром» (промышленная недвижимость): услуги, каталог объектов,
роли аудиторий, брендбуки объектов. Стек: **Astro 7 (static)** + ванильные
CSS/JS; данные объектов — content collection; Яндекс.Карты JS API (два ключа);
Google Fonts (Inter, Material Symbols). История миграции с чистого HTML:
`docs/change-requests/CR-2026-001-astro-migration.md`.

Требование «работает по file://» снято решением владельца: разработка через
`astro dev`/`preview`, деплой — статика из `dist/` (staging GitHub Pages,
prod — Beget/mm-prom.ru, замена WordPress — gated, см. DEPLOY-раздел).

## Команды

| Действие | Команда |
|----------|---------|
| Установить зависимости | `npm install` (Node ≥ 24) |
| Дев-сервер | `npm run dev` |
| Сборка | `npm run build` (`ASTRO_SITE=…`, `MMPROM_ENV=staging\|prod`) |
| Локальный просмотр сборки | `npm run preview` (http://localhost:4321) |
| Проверка типов | `npx astro check` |
| Проверка страниц | Playwright по `astro preview` — `skill('webapp-testing')` |

Сборка окружений: прод (дефолт) — canonical/OG + Метрика №109764749 + robots с
Sitemap; staging (`MMPROM_ENV=staging`, `ASTRO_SITE=<staging>`) — noindex, без
Метрики, robots без Sitemap.

## Критические правила

1. Страницы = `src/pages/<slug>.astro` на `BaseLayout` (шапка/подвал/head/SEO
   живут в `src/layouts/BaseLayout.astro` — ЕДИНСТВО изменения: правка шапки
   один раз, grep-контроль не нужен). Стили и скрипты страницы — inline
   (`is:inline`) в самой странице; переиспользуемое — в `public/assets/`.
2. Каноническая таблица URL — источник правды маршрутов
   (`docs/change-requests/CR-2026-001-astro-migration.md`): directory-формат,
   слэш на конце, короткие слаги в духе WP-набора. Новые ссылки — только
   корневые `/slug/`.
3. Карточки объектов — только `src/components/ObjectCard.astro` (канон
   `.obj-card`); данные — только content collection `src/content/objects/`
   (id = имя файла; zod-схема в `src/content.config.ts`).
4. Анимации — через `public/assets/site-anim.*`; уважать
   `prefers-reduced-motion: reduce`.
5. Новые секреты в git не заводить: ключи Яндекс.Карт уже встроены
   (согласованное решение проекта).
6. Фото объектов — прямые ссылки на invest-platforma.com / mm-prom.ru;
   локальные ассеты — в `public/` (подключение с cache-busting `?v=`).
7. Известные битые ссылки (до плана форм заявок): `/modalka-zayavki/`,
   `/kartochka-obekta/`, `/gejt-broshury/`, `/gejt-tz/` — не «чинить».

## Принципы

- Astro static, без клиентских JS-фреймворков и islands: интерактив —
  ванильные скрипты из `public/assets/*.js` (defer, ждут
  `DOMContentLoaded`/`ymaps.ready`), данные — `window.MMPROM_*` через
  `define:vars`.
- Инлайн `<style>`/`<script>` в страницах — всегда `is:inline` (не бандлится,
  не scoped).
- `compressHTML: false` обязателен: выход механически близок к исходнику.
- Дизайн по брендбуку: палитра в `:root` страницы (navy `#0E0028`, purple
  `#5A3994`, gold `#EBB81E`), типографика Inter, фирменный мотив —
  геометрические квадраты (`.sq-*`).
- Контекст развивается итеративно: правила добавляются после наблюдения
  ошибок (`skill('context-engineering')`).

## Headless-запуски

Правила шагов, исполняемых без человека (kilo-шаги раннера, конвейер):

- Вопросы и HOLD в шаге не задавать; расхождение с постановкой — пометка
  «решение агента — на ревью владельца», шаг продолжается.
- Конфликт постановок или механическая блокировка (нет файла/зависимости) —
  красный шаг; ревью пост-фактум на приёмке, вопросы конвейер не блокируют.

## Конвейер правок (облегчённый)

Итерации правок владельца: `/write-cr` → мини-SPEC + `/write-acceptance` →
`/make-sprint-plan` → `/supervise-pipeline` → `/accept-sprint`. НЕ
использовать: `/write-delta`, `/implement-delta`, `/test-cr`, шаги
build/deploy; рабочие шаги — `pipeline-task`. Документы:
`docs/change-requests/CR-YYYY-NNN-*.md`; фича = перерабатываемая страница →
`docs/features/<slug>/` (SPEC.md, ACCEPTANCE.md, ACCEPTANCE-ISSUES.md,
mockup/); сквозной smoke — `docs/REGRESSION.md`.

Отступления глобальных команд (всегда, все команды):

- поиск фич не по `src/**/SPEC.md`, а по `docs/features/**`;
- таблицу «Затронутые спецификации» CR заполнять явными путями;
- шаблонов `docs/templates/CR.template.md` и `ACCEPTANCE.template.md` нет —
  структура документов по тексту самих команд;
- verify-шаг: glob `docs/features/**/ACCEPTANCE.md`, финал = verify;
- верификация воркеров: `npm run build` + `npx astro check` + grep DOM-якорей
  из SPEC + открытие страницы по `astro preview` (Playwright) для UI-правок;
- `/audit-feature` как есть не применяется; его Блок 1.5 (сверка rendered DOM
  с эталоном через Playwright) — метод visual-шага (контекст
  `reducedMotion:'reduce'`, ожидание `document.fonts.ready`).

`pipeline.conf` при первом прогоне: `MODELS` — дефолты владельца; `VERIFY_CMD`
пустой — осознанно (качество через пост-чеки шагов и visual-цепь);
`WORKTREE_BOOTSTRAP` — `npm ci` (нужен node_modules для build/check);
`WORKTREE_LINKS` пустые; `RESOLVE_PROMPT_FILE` — минимальный или пусто.

Коммит-дисциплина: документы фич/CR, `docs/REGRESSION.md`, `docs/SPRINTS.md` —
tracked и закоммичены ДО прогона (kilo-шаги исполняются в worktree от HEAD
main; untracked туда не попадают); `.kilo/` (планы/stейт) — игнорируется
через `.gitignore`.

### Канон plan.tsv

Ровно 6 таб-колонок (id, deps, тип, команда, пост-чек, commit-msg); шаги
правок — `page-*`/`<домен>-*` без префиксов `imp-*` (барьер раннера на imp-*
потребует tests); депсы — только явные id через запятую (wildcard в deps
запрещён); gate = сама команда-проверка; commit-msg обязателен каждому шагу,
пишущему файлы; build/deploy-шаги не добавляются (финал = verify). Пример
строк: см. `docs/change-requests/CR-2026-001-astro-migration.md` (шаги →
строки tsv один-к-одному).

## Слои и ответственность (куда класть)

| Куда | Что |
|------|-----|
| `src/layouts/BaseLayout.astro` | Шапка/подвал, head: meta/canonical/OG/Метрика/env-режимы |
| `src/pages/<slug>.astro` | Разметка и inline-стили/скрипты одной страницы (слоты `head`/`tail`) |
| `src/components/ObjectCard.astro` | Каноническая карточка объекта (ленты + каталог `showMap`) |
| `src/content/objects/<id>.json` | Данные 27 объектов (id = имя файла; поля id в JSON нет) |
| `src/content.config.ts` | zod-схема коллекции objects |
| `src/pages/robots.txt.ts` | robots с env-разводкой (Sitemap — только прод) |
| `public/assets/` | Общий JS/CSS: `site-anim.*`, `catalog.js`, `svc-map.js`, `object-card.css` |
| `public/` | Логотип, локальные фото объектов, CNAME (при вкл. кастомного домена) |
| `docs/` | Проектные документы (см. «Документация»); `.github/workflows/deploy.yml` — staging |

## Именование

| Сущность | Стиль | Пример |
|----------|-------|--------|
| Маршруты (`src/pages/<slug>.astro`) | короткие kebab-слаги в духе WP (канон-таблица URL) | `about.astro` → `/about/` |
| id объектов коллекции | kebab-case, стабильные | `voyskovitsy-park` |
| CSS-классы | kebab-case, модификаторы BEM `--` | `obj-card--cat`, `sq-float--1` |
| JS-переменные/функции | camelCase | `revealOnScroll` |
| Глобальные данные окна | `window.MMPROM_*` | `MMPROM_OBJECTS`, `MMPROM_MAP_OBJECTS` |

## TypeScript

Astro-шаблоны + `astro check`; серверный код — типы из коллекции
(`CollectionEntry<'objects'>`). Клиентские скрипты — ванильный JS
(без транспиляции и внешних библиотек: jQuery, Bootstrap — нет).

## Запрещённые технологии

| Запрет | Альтернатива |
|--------|-------------|
| Клиентские JS-фреймворки (React/Vue/jQuery), islands | Ванильные скрипты `public/assets/*.js` |
| ClientRouter (View Transitions) | Конфликт с reveal site-anim.js — отложено CR-2026-001 |
| Tailwind, препроцессоры | Inline-CSS страницы с переменными `:root` / `object-card.css` |
| Бэкенд, CMS | Статические страницы; данные — content collection |

## Деплой

- **Staging**: GitHub Actions (`push` в `main`) → Pages; `MMPROM_ENV=staging`,
  noindex, без Метрики; домен — переменная `ASTRO_SITE_STAGING` (выбор
  домена — владелец; проектный URL `*.github.io/<repo>/` НЕ подходит: сайт
  без `base`, ссылки корневые). Яндекс-ключи: staging-домен + localhost в
  allowed-domains.
- **Prod (замена WordPress на mm-prom.ru) — GATED**: (1) приёмка staging;
  (2) план форм заявок (82 CTA на `/modalka-zayavki/`; у WP — Bitrix24
  `b24-10u6qz.bitrix24site.ru`); (3) 301-карта дублей WP (`/garage/`, `/ga/`,
  `/vitebski/`, `/avrora-vitebskij-3/`, `/sitemap.html`); (4) текст
  `/privacy/`; (5) проверка canonical/OG/Метрики. Сборка
  `ASTRO_SITE=https://mm-prom.ru npm run build`, заливка `dist/` и
  серверные 301 в `.htaccess` — по `docs/DEPLOY.md` (создаётся в шаге 9 CR,
  вне спринта миграции).

## Исследование и документация

| Инструмент | Назначение |
|------------|------------|
| `context7_query-docs` | Документация API (Astro, Яндекс.Карты, CSS) |
| `deepwiki_ask_wiki_question` | Вопросы по open-source репозиториям |
| `tavily_tavily_search` | Поиск в интернете |

## Навыки (загружай через skill tool)

| Навык | Когда | Тип |
|-------|-------|-----|
| `context-engineering` | AGENTS.md/навыки/команды/структура контекста | Глобальный |
| `webapp-testing` | Проверка страниц по `astro preview` (снимки, скриншоты, консоль) | Глобальный |
| `skill-rfc` | Сбор RFC в конце code/audit/fix/write-integration-tests | Глобальный |

## Документация (читай по необходимости)

| Документ | Когда | Путь |
|----------|-------|------|
| Как устроен сайт | Страницы, файлы, тех-заметки | `README.txt` |
| Карта спринтов | Что в каком спринте, статус | `docs/SPRINTS.md` |
| Регресс-сценарий сайта | Сквозной smoke перед приёмкой спринта | `docs/REGRESSION.md` |
| Фичи страниц | SPEC/ACCEPTANCE переработок страниц | `docs/features/<slug>/` |
| Change-requests | CR владельца на правки (канон URL — в CR-2026-001) | `docs/change-requests/` |
