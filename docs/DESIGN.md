# DESIGN.md — дизайн-система сайта ММ Пром

> Источник правды по визуальному языку сайта для правок и переработок
> страниц (фичи `docs/features/<slug>/`). Токены и правила ниже извлечены из
> рабочего кода: inline-стили страниц (`src/pages/<slug>.astro`),
> `src/layouts/BaseLayout.astro`, `public/assets/object-card.css`,
> `public/assets/site-anim.*`. При расхождении документа с кодом — правится
> код и документ вместе, одним PR.

## Принципы

1. Брендбук: тёмно-фиолетовая доминанта (navy), фиолетовый акцент (purple),
   золотой акцент (gold) на светлой поверхности.
2. Фирменный мотив — **геометрический квадрат**: фоновые сетки квадратов
   (`.sq-grid` + `.sq-float--1…3`), ромб (повёрнутый квадрат) в маркерах
   заголовков лент (`.b-rail-group > h3::before`, rotate 45deg).
3. Светлые «бумажные» секции, мягкие тени, скругления 10–14px, без жёстких
   чёрных контуров.
4. Текст — Inter; иконки — Material Symbols (только лигатуры имён, без
   инлайн-SVG в новом коде).
5. Движение — сдержанное: reveal при появлении, hover-подъём карточек;
   обязательное уважение `prefers-reduced-motion: reduce`.

## Токены (`:root` каждой страницы)

| Токен | Значение | Назначение |
|---|---|---|
| `--navy` | `#0E0028` | доминанта, тёмный текст, градиенты CTA |
| `--navy-2` / `--navy-3` | `#1A0F3D` / `#2A1B5E` | ступени тёмного фона |
| `--purple` | `#5A3994` | основной акцент (кнопки, ссылки, иконки) |
| `--purple-dark` | `#4A2E7A` | hover-ступень фиолетового |
| `--purple-soft` | `#F0ECF8` | светло-фиолетовая подложка (CTA, badge--type) |
| `--gold` | `#EBB81E` | золотой акцент (главные CTA, маркеры) |
| `--gold-soft` / `--gold-deep` | `#F6E7B6` / `#C9960F` | ступени золотого |
| `--text` / `--text-muted` | `#0E0028` / `#5C5C66` | текст / вторичный текст |
| `--surface` | `#F7F7F8` | фон чередующихся секций (`section--tint`) |
| `--border` | `#E6E3EE` | границы карточек, разделители |
| `--radius` / `--radius-sm` | `14px` / `10px` | скругления блоков / кнопок |
| `--shadow` | `0 10px 34px rgba(11,27,51,.10)` | базовая тень карточек |
| `--container` | `1280px` | ширина контента (`.container`, паддинги 32px) |
| `--space-section` | `clamp(56px, 9vw, 110px)` | вертикальный ритм секций |
| `--header-h` | `73px` | высота шапки (sticky) |
| `--marquee-h` | `49px` | бегущая строка над шапкой главной |
| `--font` | Inter, Manrope, Averta CY, system | стек |

## Типографика

- Inter 400/500/600/700/800 (Google Fonts), тело — `--fs-body`
  `clamp(1rem … 1.0625rem)`, вторичный текст — `--fs-small` `0.875rem`.
- Заголовки: `--fs-h1` `clamp(1.9rem … 3.4rem)`, `--fs-h2`
  `clamp(1.45rem … 2.25rem)`, `--fs-h3` `clamp(1.15rem … 1.5rem)`; h1 —
  800, h2 — 700.
- `h3` лент (`b-rail-group`) — с ромбом-маркером 12×12px из `--gold`.
- `.sec-index` — рубрикатор секции: uppercase, letter-spacing .14em, muted,
  нумерация `01…07` по порядку секций страницы.
- Иконки: Material Symbols Outlined, размер 16–20px в строках, 34px в
  заглушках фото; употребляемые — `place`, `square_foot`, `bolt`, `payments`,
  `arrow_forward`, `arrow_outward`, `map`, `image`, `info`, `close`, `menu`,
  `call`, `ads_click`, `search_off`, `description`, `restart_alt`.

## Сетка, каркас

- Брейкпоинты: **640 / 768 / 1024 / 1200px** (mobile-first `min-width`).
- `.section` + `.section--tint` чередование; контент — `.container`.
- Шапка: `position:sticky`, фон `rgba(255,255,255,.92)` + blur(10px),
  граница `--border`; мега-меню «Услуги» по 4 ролям (hover-панели
  `.mega__role` / `.mega__services-panel.is-active`); мобильное меню —
  burger + `#mobile-menu`, аккордеон ролей.
- Подвал: тёмный (navy-градиент), колонки услуг/компании/контактов,
  декоративные «частицы» `.site-footer__particles`.
- Hero: светлый градиент `#fff → --surface`, заголовок + CTA-пара
  (основная gold + вторичная ghost/outline). Высота ограничена в
  `public/assets/hero.css` (≥768px): 680px для услуг/ролей, 560px для
  контактов, 780px для главной — на больших мониторах hero не растягивается
  на всю высоту окна; первая секция после него получает верхний отступ
  `clamp(40px, 4vw, 64px)`.

## Кнопки (`.btn`)

База: inline-flex, min-height 48px, паддинги 13×26px, `--radius-sm`,
font-weight 700, переходы transform/shadow/background/color.

| Модификатор | Вид | Применение |
|---|---|---|
| `btn--gold` | фон `--gold`, текст navy, тень золотая | главная CTA секции |
| `btn--purple` | фон `--purple`, текст #fff | CTA на светлых секциях |
| `btn--outline` | рамка `--purple`, фон #fff | вторичные действия, фильтры |
| `btn--ghost-light` | рамка rgba(255,255,255,.5), текст #fff | на тёмных/градиентных фонах |

Hover — подъём `translateY(-2px)` + усиление тени. CTA заявок — кнопки
Bitrix24-попапов (`data-b24-form`, `src/lib/b24.ts`), а не ссылки на
`/modalka-zayavki/`.

## Бейджи (`.badge`)

База: пилюля (радиус 999px), min-height 26px, font-weight 700,
`--fs-small`.

| Модификатор | Цвет | Применение |
|---|---|---|
| `badge--type` | `--purple-soft` / `--purple` | тип объекта (каталог, модалка) |
| `badge--park`, `badge--technopark` | `rgba(235,184,30,.2)` / navy | бейдж карточек лент |
| `badge--deal-rent` | `rgba(90,57,148,.92)` / #fff | сделка «Аренда» |
| `badge--deal-sale` | `rgba(235,184,30,.95)` / navy | сделка «Продажа» |
| `badge--busy` | `rgba(14,0,40,.72)` / #fff | «Нет площадей» |
| `badge--work` | — | статус в контенте страниц |

## Карточка объекта — канон `.obj-card`

Единственный источник — `src/components/ObjectCard.astro` (данные —
content collection `objects`). Не дублировать разметку карточек в страницах.

- **Лента** (index, arenda, prodazha): `.obj-card reveal`; опционально
  ссылка «Презентация» (`.obj-card__presentation`, пилюля поверх фото),
  медиа `figure.b-media` (img 16:10 + figcaption) или заглушка
  `.img-placeholder`; тело: бейдж + ссылка-стрелка (`.obj-card__link`),
  `h3`, `.obj-card__desc`, меты `.obj-card__meta` (иконка + «Метка:
  значение»); stagger-анимация через `style="--i:N"` (prop `stagger`).
- **Каталог**: `.obj-card--cat` (+ `--busy`) — data-атрибуты фильтров
  (`data-id/type/deal/area/loc/title`), медиа-панель с бейджами и кнопкой
  карты (`.obj-card__map`), адрес, факты «Площадь / Локация»
  (`.obj-card__facts`), футер: внешняя ссылка «На страницу объекта» или
  кнопка «Подробнее» (модалка), busy-пометка «Нет вакантных площадей».
- Стили канона — `public/assets/object-card.css` (подключение с `?v=`,
  bump версии при правках). Каштировать карточечные правила в inline-CSS
  страниц нельзя.

## Ленты объектов (`.b-rail`)

Горизонтальный скролл: `overflow-x:auto`, `scroll-snap-type:x mandatory`,
элементы `flex:0 0 84vw; max-width:360px` (mobile) → `340px` от 768px;
группа `.b-rail-group` с заголовком-ромбом. Не превращать в сетку — это
осознанный паттерн «полка».

## Секции страницы

- `.b-rowhead` — шапка секции: `.sec-index` (номер), `h2`, ссылка
  «Все …» (`.b-more` с arrow_forward), подводка.
- `.b-cta` — светлая CTA-плашка (`--purple-soft`); `.b-cta--grad` —
  тёмная (градиент purple→navy, текст #fff, кнопки gold/ghost-light).
- Счётчики/схемы: `.scope-card` (номер + текст), секции «Как мы работаем».

## Каталог (`.seg`, `.chip-f`)

- Переключатель сделки — `.seg` (сегмент-пилюля, фон surface); типы —
  чипы `.chip-f` (min-height 38px, рамка, активные — фиолетовые); select
  площади/локации/сортировки — нативные с теми же токенами; активные
  фильтры — `.cat-active__chip`; пустой результат — `.cat-empty`.
- Поведение: фильтрация/сортировка/поиск по data-атрибутам DOM
  (`public/assets/catalog.js`), модалка — из `window.MMPROM_OBJECTS`;
  перерисовки карточек на клиенте нет.

## Модалка объекта (`.obj-modal`)

`<dialog>`: шапка с бейджами/адресом/кнопкой закрытия, медиа слева
(фото или заглушка `.obj-card__ph`), справа описание, спецификации
(`.obj-modal__specs` — иконка + dt/dd), цена, действия (gold «Запросить
условия» + outline «Позвонить»).

## Анимации

- `site-anim.js` + `.reveal` (opacity 0 → 1, translateY 14px → 0,
  IntersectionObserver threshold .15, класс `.is-visible`); карточки и
  блоки получают `reveal` на билде.
- `site-anim.css` — `.sq-grid`/`.sq-float--1…3` (плавающие рамочные
  квадраты hero), бегущая строка (main), hover-переходы.
- **Обязательно:** при `prefers-reduced-motion: reduce` — без движения
  (reveal получают `is-visible` сразу, `.sq-float` замирают). Новые
  анимации проверять в контексте `reducedMotion:'reduce'`.

## Известные особенности (наследие миграции)

- Стили шапки/подвала лежат в inline-CSS каждой страницы (идентичны);
  носитель разметки — `src/layouts/BaseLayout.astro`. При переработке
  страницы стили шапки/подвала не трогать.
- Страницы самодостаточны: каждый `<slug>.astro` несёт свой inline-CSS с
  собственным `:root` (токены идентичны). Меняя токен — менять во всех
  страницах (или через будущую вынесенную тему).
- Карты брендбуков — мёртвый код с guard (см. REGRESSION.md п.6).
