# AGENTS.md — ММ Пром

> **ИНТЕРИМ-БЛОК (миграция).** Идёт миграция на Astro (CR:
> `docs/change-requests/CR-2026-001-astro-migration.md`). npm/Astro-команды
> в рамках шагов миграции разрешены; запреты сборщиков и требование file://
> приостановлены решением владельца до полной переработки контекста в
> финальном шаге миграции (шаг 10 CR).

## Проект

Статический сайт компании «ММ Пром» (промышленная недвижимость): услуги, каталог объектов, роли аудиторий, брендбуки объектов. Стек: HTML5 + ванильные CSS/JS, без сборки и зависимостей; Яндекс.Карты JS API; Google Fonts (Inter, Material Symbols).

## Команды

Сборки, тестов и линтеров нет — страница открывается с диска.

| Действие | Описание |
|----------|----------|
| Открыть `<страница>.html` в браузере | Основная проверка |
| Playwright: снимок/консоль/скриншоты | Проверка вёрстки и анимаций — `skill('webapp-testing')` |

## Критические правила

1. Каждая страница самодостаточна: стили страницы встроены в её `<head>`, скрипты — в конце `<body>`. Общий shared-слой один — анимации `assets/site-anim.css` и `assets/site-anim.js` (подключены всеми страницами).
2. Шапка `<header class="site-header">` и подвал `<footer class="site-footer">` продублированы на каждой странице: правка навигации/подвала = правка на ВСЕХ страницах; проверяй грепом, что ни одна страница не осталась со старой версией.
3. Анимации — через `assets/site-anim.*`; уважать системную настройку `prefers-reduced-motion: reduce`.
4. Новые секреты в git не заводить: Яндекс-ключ уже встроен в страницы (согласованное решение проекта).
5. Фото объектов — прямые ссылки на invest-platforma.com / mm-prom.ru; локальные ассеты лежат в корне (`mmprom-logo.png`, `parnas.png`, `tervolovo.jpg`).

## Принципы

- Статичность: без сборки, без npm, без фреймворков; работает по `file://` (сеть нужна только шрифтам и картам).
- Дизайн по брендбуку: палитра в `:root` каждой страницы (navy `#0E0028`, purple `#5A3994`, gold `#EBB81E`), типографика Inter, фирменный мотив — геометрические квадраты (`.sq-*`).
- Стили и скрипты страницы живут в самой странице; в shared-файлы выносится только переиспользуемое между страницами.
- Контекст развивается итеративно: правила добавляются после наблюдения ошибок (`skill('context-engineering')`).

## Headless-запуски

Правила шагов, исполняемых без человека (kilo-шаги раннера, конвейер):

- Вопросы и HOLD в шаге не задавать; расхождение с постановкой — пометка «решение агента — на ревью владельца», шаг продолжается.
- Конфликт постановок или механическая блокировка (нет файла/зависимости) — красный шаг; ревью пост-фактум на приёмке, вопросы конвейер не блокируют.

## Конвейер правок (облегчённый)

Итерации правок владельца: `/write-cr` → мини-SPEC + `/write-acceptance` →
`/make-sprint-plan` → `/supervise-pipeline` → `/accept-sprint`. Всё локально
по `file://`, staging нет. НЕ использовать: `/write-delta`,
`/implement-delta`, `/test-cr`, шаги build/deploy; рабочие шаги —
`pipeline-task`. Документы: `docs/change-requests/CR-YYYY-NNN-*.md`; фича =
перерабатываемая страница → `docs/features/<slug>/` (SPEC.md, ACCEPTANCE.md,
ACCEPTANCE-ISSUES.md, mockup/); сквозной smoke — `docs/REGRESSION.md`.

Отступления глобальных команд (всегда, все команды):
- поиск фич не по `src/**/SPEC.md`, а по `docs/features/**` — затрагивает write-cr, verify-acceptance, accept-sprint (в их «Источниках» `src/[module]/features/…` → `docs/features/<slug>/…`);
- таблицу «Затронутые спецификации» CR заполнять явными путями;
- шаблонов `docs/templates/CR.template.md` и `ACCEPTANCE.template.md` нет — структура документов по тексту самих команд;
- verify-шаг: glob `docs/features/**/ACCEPTANCE.md`, финал = verify;
- верификация воркеров вместо `pnpm tsc --noEmit && pnpm lint && pnpm test:unit`: grep DOM-якорей из SPEC; `python3 -m py_compile tools/sync_partials.py`; открытие страницы по `file://` (Playwright) для UI-правок;
- `/audit-feature` как есть не применяется; его Блок 1.5 (сверка rendered DOM с эталоном через Playwright `file://`) — метод visual-шага.

`pipeline.conf` при первом прогоне: `MODELS` — дефолты владельца; `VERIFY_CMD` пустой — осознанно (качество через пост-чеки шагов и visual-цепь); `WORKTREE_LINKS`/`WORKTREE_BOOTSTRAP` пустые; `RESOLVE_PROMPT_FILE` — минимальный или пусто.

Коммит-дисциплина: документы фич/CR, `docs/REGRESSION.md`, `docs/SPRINTS.md` и `tools/` — tracked и закоммичены ДО прогона (kilo-шаги исполняются в worktree от HEAD main; untracked туда не попадают); `.kilo/` (планы/stейт) — игнорируется через `.gitignore`.

### Канон plan.tsv

Ровно 6 таб-колонок (id, deps, тип, команда, пост-чек, commit-msg);
шаблон цикла (slug первого спринта — `sprint-mm-001`):

| id | deps | тип | команда | пост-чек | commit-msg |
|----|------|-----|---------|----------|------------|
| hdr | | kilo | pipeline-task: новые шапка/подвал в `tools/partials/*` + применить к `index.html` (пилот) в worktree + скриншот в `state/<slug>/artifacts/hdr-preview.png` | `test -f tools/partials/header.html` + grep нового якоря в шаблоне и index.html | `feat(partial): новая шапка/подвал (пилот index)` |
| gate-hdr | hdr | gate | `test -f .kilo/scripts/state/<slug>/gate-hdr.done` | — | |
| sync | gate-hdr | bash | `python3 tools/sync_partials.py` | grep нового якоря шапки по всем `*.html` корня | `chore(partial): синхронизация шапки/подвала по страницам` |
| page-1 | sync | kilo | pipeline-task: переработка страницы 1 по `docs/features/<slug-1>/SPEC.md` | grep DOM-якорей из SPEC | `feat(<slug-1>): переработка страницы` |
| page-N | sync | kilo | … (по строке на страницу; параллельно — файлы не пересекаются) | grep DOM-якорей из SPEC | `feat(<slug-N>): …` |
| visual | page-1,…,page-N | kilo | Playwright smoke по `file://`: контекст `reducedMotion:'reduce'`, ожидание `document.fonts.ready`, скриншоты desktop/mobile, консоль; отчёт `state/<slug>/artifacts/visual/visual-report.md`; код НЕ менять | `test -f …/artifacts/visual/visual-report.md` | |
| visual-fix | visual | kilo | исправить ТОЛЬКО механические расхождения против мокапа/SPEC (спорные не трогать) | `test -f` маркер + grep якорей | `fix(visual): механические расхождения` |
| visual-recheck | visual,visual-fix | kilo | повторная свёрка тех же точек; цепь fix+recheck ≤ 2 круга, потом STOP с материалом приёмки | `test -f` маркер | |
| verify | visual-recheck | kilo | дашборд `docs/features/**/ACCEPTANCE.md` + актуализация `docs/REGRESSION.md`; маркер `state/<slug>/artifacts/verify.ok` | `test -f .kilo/scripts/state/<slug>/artifacts/verify.ok` | `docs(sprint): сводка приёмки и регресс` |

Правила канона: депсы — только явные id через запятую (wildcard `page-*` в deps запрещён — валидация раннера откажет; в visual перечислить все page-*); шаги правок — `page-*` без префиксов `imp-`/`implement-*` (барьер раннера на imp-* потребует tests/build — их нет); gate = сама команда-проверка, красный гейт = exit 2 «ручное согласование» → владелец `touch .kilo/scripts/state/<slug>/<id>.done` → перезапуск («ручной .done» в пост-чеке — запрещено); commit-msg обязателен каждому шагу, пишущему файлы; гейт один промежуточный, ручной финальный гейт — антипаттерн; build/test-cr/deploy не добавляются (финал = verify).

## Слои и ответственность (куда класть)

| Куда | Что |
|------|-----|
| `<страница>.html` (корень) | Разметка, встроенные стили и скрипты одной страницы |
| `assets/site-anim.css`, `assets/site-anim.js` | Общий слой анимаций (единственный shared-файл) |
| `tools/partials/header.html`, `footer.html` | Эталонные шаблоны шапки/подвала — источник правок общих блоков |
| `tools/sync_partials.py` | Синхронизация шаблонов по всем `*.html` корня (dev-инструмент, сайт не собирает) |
| Корень проекта | Логотип и локальные фото объектов |
| `docs/` | Проектные документы (см. «Документация») |
| `.kilo/skills/` | Проектные навыки; `.kilo/skill-rfcs/` — RFC по навыкам |

Workflow правки общих блоков (правило #2 сохраняется):
`tools/partials/*` → `python3 tools/sync_partials.py` → grep-контроль
нового якоря по всем `*.html` корня (все страницы обновлены).

## Именование

| Сущность | Стиль | Пример |
|----------|-------|--------|
| HTML-файлы (сложившийся стиль) | snake_case | `usluga_arenda.html`, `o_kompanii.html` |
| Папки | kebab-case | `docs/`, `.kilo/skill-rfcs/` |
| CSS-классы | kebab-case, модификаторы BEM `--` | `section--tint`, `sq-float--1` |
| JS-переменные/функции | camelCase | `revealOnScroll` |

## TypeScript

Не применимо (ванильный JS). Правила JS:

- Без модулей, транспиляции и внешних библиотек (jQuery, Bootstrap — нет).
- Скрипты страницы — inline в конце `<body>`; скрипты общего слоя — `assets/site-anim.js` с `defer`.

## Запрещённые технологии

| Запрет | Альтернатива |
|--------|-------------|
| Сборщики (npm/webpack/vite), фреймворки (React, Vue, Next) | Статический HTML |
| Tailwind, препроцессоры | Встроенный CSS с переменными `:root` |
| Внешние CSS/JS-библиотеки | Ванильные CSS/JS |
| Бэкенд, CMS, генераторы статики | Статические страницы |

Исключение: dev-инструменты синхронизации разметки (`tools/`) — разрешены:
это не сборка сайта, страницы остаются самодостаточными.

## Исследование и документация

| Инструмент | Назначение |
|------------|-----------|
| `context7_query-docs` | Документация API (Яндекс.Карты, CSS) |
| `deepwiki_ask_wiki_question` | Вопросы по open-source репозиториям |
| `tavily_tavily_search` | Поиск в интернете |

## Навыки (загружай через skill tool)

> Каталог для стек-нейтральных global-команд. Глобальные — `~/.kilo/skills/`,
> `~/.kilocode/skills/`; проектные — `.kilo/skills/`.

| Навык | Когда | Тип |
|-------|-------|-----|
| `context-engineering` | AGENTS.md/навыки/команды/структура контекста | Глобальный |
| `webapp-testing` | Проверка страниц и visual-шаги конвейера в браузере Playwright (страницы по `file://`): снимки, скриншоты, консоль | Глобальный |
| `skill-rfc` | Сбор RFC в конце code/audit/fix/write-integration-tests | Глобальный |

## Документация (читай по необходимости)

| Документ | Когда | Путь |
|----------|-------|------|
| Как устроен сайт | Страницы, файлы, тех-заметки | `README.txt` |
| Карта спринтов | Что в каком спринте, статус | `docs/SPRINTS.md` |
| Регресс-сценарий сайта | Сквозной smoke перед приёмкой спринта | `docs/REGRESSION.md` |
| Фичи страниц | SPEC/ACCEPTANCE переработок страниц | `docs/features/<slug>/` |
| Change-requests | CR владельца на правки | `docs/change-requests/` |