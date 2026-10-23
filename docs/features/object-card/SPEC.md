# SPEC: object-card — карточка объекта (`ObjectCard.astro`, `object-card.css`)

| Параметр | Значение |
|----------|----------|
| **Фича** | `object-card` (канонический рендер карточки объекта) |
| **CR** | CR-2026-002 «Правки после миграции» (пп. 8, 9, 10, 15; «Зависимости»: `ObjectCard.astro` + `object-card.css` — ссылка на страницу объекта, чипы типов, подпись под фото) |
| **Статус** | baseline: описано ТЕКУЩЕЕ состояние кода; целевые правки — из CR, в код не внесены |
| **Дата** | 2026-10-23 |
| **Источники** | `src/components/ObjectCard.astro`, `public/assets/object-card.css`, `src/pages/index.astro`, `src/pages/arenda.astro`, `src/pages/prodazha.astro`, `src/pages/katalog.astro`, `src/content/objects/*.json` (поля `link`/`external`), `docs/mockups/index.html`, `docs/mockups/katalog_obektov.html`, CR-2026-002 пп. 8, 9, 10, 15 |

## 1. Роль фичи

Компонент `src/components/ObjectCard.astro` — единственный рендер карточки
объекта (канон `.obj-card`): ленты главной, ленты аренды и продажи (ленточная
ветка) и каталог с фильтрами (каталожная ветка). Данные — коллекция `objects`
(см. фичу `objects-data`); общий CSS — `public/assets/object-card.css`
(CR-2026-001 шаг 5), подключается на 4 страницах `index` / `arenda` / `prodazha`
/ `katalog` тегом `<link … href="/assets/object-card.css?v=1">`; правкам
сопутствует bump `?v=` (правило cache-busting из шапки файла).

## 2. Две ветки и места вызова

| Ветка | Условие | Где вызывается | Состав |
|-------|---------|----------------|--------|
| ленточная | `showMap = false` (по умолчанию) | `index.astro` — 3 ленты (`ribbonParks`: atlas-garazhny, avrora-vitebsky, antares; `ribbonProduction`: voyskovitsy-park, volhonskoe, parnas; `ribbonLand`: land-volosovo, land-koltushi, land-tervolovo), `arenda.astro` (6 объектов), `prodazha.astro` (6 объектов), проп `stagger={i}` | плашка «Презентация», медиа/заглушка, чип-бейдж + стрелка-ссылка, заголовок, описание, meta-список |
| каталожная | `showMap` | `katalog.astro`: `{objects.map((o) => <ObjectCard obj={o} showMap />)}` — 27 объектов | data-атрибуты фильтров, медиа с оверлеем чипов, кнопка карты, тело: адрес/факты/foot с «Подробнее» или «На страницу объекта» |

## 3. Ленточная ветка — текущее поведение

DOM: `article.obj-card.reveal[style="--i:<stagger>"]`.

1. **Плашка «Презентация»** (`d.presentation`): atlas-garazhny / avrora-vitebsky
   → `/gejt-broshury/` (известная битая ссылка, CR-2026-002 не трогает).
2. **Медиа**: `d.media` → `figure.b-media` + `img` + `figcaption{d.media.caption}`
   — подпись под фото (поле заполнено у 7 объектов; пример land-koltushi —
   «Земельный участок в Колтушах», дублирует название — п. 10). Иначе
   `d.placeholder` → `.img-placeholder[data-img]` с иконкой. `img.onerror`
   добавляет `is-broken` (скрытие битого фото).
3. **Тело**:
   - строка бейджей `.obj-card__badges`:
     - чип-бейдж из данных: `{d.badgeLabel && <span class={badge ${d.badgeClass ?? 'badge--park'}}>{d.badgeLabel}</span>}`
       — 9 из 27 объектов (antares «Технопарк» + `badge--technopark`; atlas/avrora
       «Индустриальный парк»; 3 land «Земельный участок»; parnas/volhonskoe/
       voyskovitsy-park «Производственные площади» — все с `badge--park`);
     - стрелка-ссылка `a.obj-card__link` с иконкой `arrow_outward`, только если
       `href = d.link || d.external || ''` непуст; `isExternal =
       (d.linkExternal ?? false) || href.startsWith('http')` → `target="_blank"`;
       `aria-label="Открыть страницу объекта: <title>"`. CSS `::after inset:0`
       растягивает клик на всю карточку.
   - `h3{d.title}`, `p.obj-card__desc{d.cardDesc ?? d.desc}`,
     `ul.obj-card__meta` — 9 объектов (иконка + label + value).

Фактические `href` ленточной ветки сейчас (ленты показывают ровно 9 объектов
из §2, и у всех девяти `link` заполнен): atlas/avrora → `/atlas-garazhnyj/`,
`/avrora-vitebskij/` (внутренние брендбук-страницы); antares, parnas,
volhonskoe, voyskovitsy-park → **битая** `/kartochka-obekta/` ×4; land-tervolovo →
**заглушка** `/katalog/`; land-koltushi, land-volosovo → URL invest-platforma.com
(`linkExternal: true`). У остальных 18 объектов коллекции `link`/`external`
пусты, но в ленточную ветку они не попадают — они существуют только в каталоге.

## 4. Каталожная ветка — текущее поведение

DOM: `article.obj-card.obj-card--cat.reveal[data-id/type/deal/area/loc/title]`
+ `.obj-card--busy` при `d.busy`. Data-атрибуты — механика фильтров каталога
(`catalog.js`, фича `catalog`): `data-title` = `searchTitle ?? title.toLowerCase()`.

1. **Медиа** `.obj-card__media` (aspect 16/10, CSS-градиент-оверлей, zoom на
   hover): `img` c `is-broken`-скрытием; заглушка `.obj-card__ph` (иконка +
   название) когда фото нет.
2. **Оверлей чипов** `.obj-card__badges` (absolute, top 12, blur):
   `.obj-card__badges-left` с чипом `badge badge--type{d.typeLabel}` (белый
   полупрозрачный — цвет задан inline в `katalog.astro`) и второй блок слева:
   deal-чипы `badge badge--deal-rent` / `badge--deal-sale` (по `d.deal`) и
   `badge--busy` «Нет площадей».
3. **Кнопка карты** `.obj-card__map` (круглая, right-bottom, `data-map={obj.id}`
   — обработчик `focusOnMap` в `catalog.js`).
4. **Тело**: `h3`, `p.obj-card__addr` (иконка `place` + адрес),
   `.obj-card__facts` (Площадь `d.area`, Локация `d.district`), foot
   `.obj-card__foot`: при непустом `d.external` — ссылка
   `.obj-card__ext` «На страницу объекта» + `arrow_outward`, `target="_blank"`
   (только atlas/avrora — внешние mm-prom.ru), иначе **кнопка**
   `.obj-card__more` `data-open={obj.id}` «Подробнее» — открывает модалку
   `#obj-modal` (`catalog.js`; удаление модалки — фича `catalog`). При
   `d.busy` — примечание «Нет вакантных площадей».

## 5. `object-card.css` — состав; где живут цвета чипов

`public/assets/object-card.css` (60 строк): базовые правила `.obj-card`
(hover-lift, рамка, placeholder), ленточные (`.obj-card__badges/__link/__body
h3/__desc/__meta/__presentation`, `.b-media`), каталожные
(`.obj-card--cat … media/градиент/badges/badges-left/map/body/addr/facts/foot/
__more/__ext/__busy`, grayscale `--busy`).

**Чипов `.badge*` в файле нет. Их цвета сейчас продублированы inline в
`src/pages/*.astro` (22 страницы, идентичные копии):**

| Класс/правило | Где | Значение сейчас |
|---------------|-----|-----------------|
| `.badge{…}` | все 22 страницы inline | базовый pill: min-height 26px, padding 3px 12px, radius 999px, weight 700 |
| `.badge--park,.badge--technopark` | все 22 страницы inline | `background:rgba(235,184,30,.2); color:var(--navy)` — чип-бейдж ленточной ветки |
| `.badge--type` | `katalog.astro` inline | белый оверлей на фото: `rgba(255,255,255,.94); border 1px solid rgba(255,255,255,.6)` — чип типа каталожной ветки |
| `.badge--deal-rent` / `.badge--deal-sale` / `.badge--busy` | только `katalog.astro` inline | фиолетовый / золотой / тёмный оверлеи |
| `.badge--type` | 18 прочих страниц inline (все, кроме `katalog.astro`) | `var(--purple-soft)/purple` — это чипы `proj-card` («Строительство», «Реконструкция») и других не-карточных бейджей; имя класса совпадает с карточным, но контекст другой |

Глобальный селектор страниц `a{color:var(--purple)}` (без `text-decoration`),
а `.obj-card__link` в `object-card.css` не задаёт `text-decoration:none` →
иконка-стрелка `arrow_outward` ленточной ветки подчёркивается (п. 9). Для
сравнения: в мокапах `docs/mockups/*.html` у `.obj-card__link` задан
`text-decoration:none`; `.obj-card__ext` и `.obj-card__presentation` в
`object-card.css` уже имеют `text-decoration:none`.

## 6. Целевые изменения (источник — CR-2026-002 пп. 8, 9, 10, 15; в код не внесены)

1. **П. 8 — ссылка на страницу объекта в обеих ветках.** `href` строится из
   id записи: не-брендбуки → `/obekt/<id>/`; «Атлас Гаражный» и «Аврора
   Витебский» → `/atlas-garazhnyj/`, `/avrora-vitebskij/`. Значения полей
   `link`/`external`/`linkExternal` из данных в рендере не используются
   (чистка данных — фича `objects-data`); ссылки внутренние — `target="_blank"`
   не нужен. Каталожная ветка: кнопка `data-open` «Подробнее» заменяется
   ссылкой на страницу объекта (механика модалки убирается фичей `catalog`);
   `.obj-card__ext` брендбуков ведёт на внутренний маршрут. Битые `/kartochka-obekta/`
   (4 объекта), `/katalog/` (1) и внешние invest-platforma URL (2) перестают
   рендериться. В каталоге 25 из 27 карточек перестают быть кнопками модалки
   и становятся ссылками на `/obekt/<id>/`; у 2 брендбуков цель меняется
   с внешнего mm-prom.ru на внутренние маршруты.
2. **П. 9 — стрелка без подчёркивания:** `text-decoration:none` для
   `.obj-card__link` (как в мокапе).
3. **П. 10 — подпись под фото не выводится:** `figcaption` с
   `d.media.caption` удаляется из ленточной ветки (и само поле `caption`
   перестаёт использоваться рендером; чистка данных — `objects-data`).
   Заглушка `.obj-card__ph` (наименование при отсутствии фото) остаётся — это
   не подпись.
4. **П. 15 — чип типа объекта получает цвет своего типа.** Класс строится из
   `d.type` (enum `content.config.ts`), текст — `d.typeLabel`; во всех ветках
   карточки вместо бейджа из `badgeLabel`/`badgeClass` и вместо
   `badge--type`-оверлея:

   | Тип (`d.type`) | Класс | Фон | Текст |
   |----------------|-------|-----|-------|
   | `park` (парк) | `badge--park` | `rgba(235,184,30,.18)` | `#0E0028` |
   | `production` (производство) | `badge--production` | `rgba(90,57,148,.12)` | `#5A3994` |
   | `warehouse` (склад) | `badge--warehouse` | `rgba(14,0,40,.10)` | `#0E0028` |
   | `land` (участок) | `badge--land` | светлый фон `#F7F5FA`, контур `1px solid #EBB81E` | `#0E0028` |

   Только фирменные цвета; контраст текста — не ниже 4.5:1 (решение владельца
   п. 5 раздела «Решения по открытым вопросам»).
5. **Фиксация канона: цвета чипов типов живут в `public/assets/object-card.css`.**
   После блока B1 в файле есть `.badge--park`, `.badge--production`,
   `.badge--warehouse`, `.badge--land` (сейчас их там нет, см. §5 — копии
   inline на страницах). Постраничные inline-значения для чипов карточки
   объекта при этом не переопределяют канон (удаление копий из 22 страниц —
   шаг выноса общих стилей, фича `site-pages`). Правило cache-busting: bump
   `?v=` при правках файла.
6. Изменяемые значения сейчас → целевые: чип парка `rgba(235,184,30,.2)` →
   `.18`; каталожный белый `badge--type` → фирменный цвет типа;
   `badge--technopark` исчезает (цвет чипа определяется типом, а не данными).

## 7. План блоков реализации

**Блок B1 — «Ссылки, чипы типов, подпись, стрелка»**

| Работа | Детали |
|--------|--------|
| Ссылки (п. 8) | в обеих ветках `href` = `/obekt/<id>/` (не-брендбуки) / внутренние маршруты брендбуков; убрать `target="_blank"`; каталожная foot: вместо `button[data-open]` — ссылка на страницу объекта; значения `link`/`external`/`linkExternal` из данных не рендерить |
| Чипы (п. 15) | класс чипа из `d.type` (`badge--park`/`--production`/`--warehouse`/`--land`), текст `d.typeLabel`, в обеих ветках; цвета четырёх типов — в `public/assets/object-card.css` (§6.4–6.5) |
| Подпись (п. 10) | убрать `figure/figcaption` подпись под фото в ленточной ветке (медиа остаётся изображением без подписи) |
| Стрелка (п. 9) | `.obj-card__link` — `text-decoration:none` (+ hover: затемнение иконки как в мокапе) |
| Проверка | `npm run build`, `npx astro check`; grep-якоря (якоря пост-чека шага `imp-object-card` плана): `/obekt/` и отсутствие `data-open`/`figcaption` в `ObjectCard.astro`, классы `badge--park`/`badge--production`/`badge--warehouse`/`badge--land` в `object-card.css`; открытие `astro preview` — Playwright: ленты главной `/`, `/arenda/`, `/prodazha/`, каталог `/katalog/` |

Блоков B2 и далее у фичи нет: модалка каталога/кнопка карты/попапы — фича
`catalog`, чистка данных — `objects-data`, страницы `/obekt/<id>/` —
`object-pages`.

## 8. Границы

- **Не в этой фиче:** удаление модалки `#obj-modal`, механика `data-open`,
  `focusOnMap`, попапы карты (`catalog.js`, `svc-map.js`) — фича `catalog`;
  ObjectCard меняет только собственную разметку. Чистка полей данных
  (`link`/`external`/`linkExternal`, `badgeLabel`/`badgeClass`,
  `media.caption`, поле `images`) — фича `objects-data`.
- Плашка «Презентация» → `/gejt-broshury/` остаётся: известная битая ссылка,
  план форм заявок отдельно (AGENTS.md).
- Цвета deal-чипов («Аренда»/«Продажа», «Нет площадей») и их вынос из
  `katalog.astro` в общий CSS — вне п. 15; по границам `site-pages`/`catalog`.
- Чипы `.badge--type`/`.badge--work` карточек проектов (`proj-card`,
  страницы строительства и ролей) — не карточки объектов, не входят.
- Вынос базового `.badge` и прочих общих стилей страниц в `base.css` — фича
  `site-shell`/`site-pages`; здесь только чипы типов в `object-card.css`.

## 9. Решения агента — на ревью владельца

1. **Имена классов чипов** — по значениям enum `park/production/warehouse/land`
   (`badge--park`, `badge--production`, `badge--warehouse`, `badge--land`);
   соответствуют grep-якорям пост-чека шага `imp-object-card` плана спринта.
2. **Текст чипа везде `typeLabel`**: бейджи из `badgeLabel`/`badgeClass`
   перестают рендериться — у antares чип станет «Индустриальный парк» вместо
   «Технопарк», у parnas/volhonskoe/voyskovitsy-park «Производственный
   комплекс» вместо «Производственные площади». Данные не теряются; если
   прежние тексты важны — владелец решает.
3. **Каталожный оверлей-чип**: предложено применять те же фирменные цвета
   п. 15 (чип по `d.type`) вместо текущего белого `badge--type`; эффект
   `backdrop-filter: blur` сохраняется.
4. **Текст ссылки каталожного foot**: как сейчас «Подробнее» для не-брендбуков
   (ссылка вместо кнопки) и «На страницу объекта» для брендбуков — точные
   формулировки на ревью владельца.