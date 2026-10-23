# SPEC: objects-data — схема и данные коллекции объектов

| Параметр | Значение |
|----------|----------|
| **Фича** | `objects-data` (поставщик данных: коллекция `objects` + схема) |
| **CR** | CR-2026-002 «Правки после миграции» (п. 25, разделы «Зависимости», «Влияние на данные/миграции», «Страницы объектов») |
| **Статус** | baseline: описано ТЕКУЩЕЕ состояние кода и данных; целевые правки — из CR, в код не внесены |
| **Дата** | 2026-10-23 |
| **Источники** | `src/content/objects/*.json`, `src/content.config.ts`, `src/components/ObjectCard.astro`, `src/pages/katalog.astro` (инжект), страницы услуг (инжект карты), CR-2026-002, карта внешних фото `.kilo/scripts/sources/mm-prom-site-2026-10-23/map-external.tsv`, снапшот новой версии сайта `.kilo/scripts/sources/mm-prom-site-2026-10-23/catalog-data.js` |

## 1. Роль фичи

Коллекция `objects` — единственный источник данных об объектах: карточки на
главной, ленты аренды/продажи и страниц услуг, каталог с фильтрами и модалкой,
карта (`MMPROM_MAP_OBJECTS`). Данные — 27 JSON-файлов в `src/content/objects/`
загружаются glob-лоадером Astro (`astro:content`, `glob({
base: './src/content/objects', pattern: '**/*.json' })`).

Именование: id записи = имя файла без расширения (поле `id` в JSON не задаётся);
id объектов — kebab-case, стабильные (`voyskovitsy-park`).

## 2. Текущее состояние — схема (`src/content.config.ts`)

Zod-схема `objects`. Обязательные поля — у всех 27 файлов; опциональные (в
схеме `.optional()`) — присутствуют не во всех файлах.

| Поле | Тип (zod) | Обязательное | Наличие в данных | Назначение |
|------|-----------|--------------|------------------|------------|
| `title` | string | да | 27/27 | название объекта |
| `type` | enum `park/warehouse/production/land` | да | 27/27 | тип для фильтра каталога |
| `typeLabel` | string | да | 27/27 | подпись-чип типа («Индустриальный парк», «Склад»…) |
| `deal` | string[] | да | 27/27 | ярлыки сделки («Аренда», «Продажа») |
| `dealTypes` | enum `rent/sale`[] | да | 27/27 | машиночитаемые типы сделки |
| `area` | string | да | 27/27 | площадь текстом («12 000 м²», «по запросу») |
| `areaNum` | number \| null | да | 27/27 (7 null) | число для фильтра/сортировки |
| `location` | enum `spb/lo` | да | 27/27 | фильтр локации |
| `address` | string | да | 27/27 | адрес |
| `district` | string | да | 27/27 | район/округ |
| `desc` | string | да | 27/27 | описание |
| `specs` | (string, string, string)[] | да | 27/27 | иконка + подпись + значение (модалка каталога) |
| `price` | string | да | 27/27 (23 пусто) | цена текстом |
| `image` | string | yes | 27/27 | фото карточки (URL или локальный путь; см. §4) |
| `external` | string | да (в схеме НЕ optional!) | 27/27 (25 пусто) | внешняя страница объекта (брендбуки) |
| `coords` | (number, number) | да | 27/27 | точка на карте (Яндекс.Карты, широта/долгота) |
| `busy` | boolean | да | 27/27 | «Нет площадей» |
| `sort` | number | да | 27/27 | порядок вывода, 0…26 без пропусков |
| `searchTitle` | string | нет | 0/27 | строка поиска каталога (заполнено дефолтом `title.toLowerCase()` в ObjectCard) |
| `badgeLabel` / `badgeClass` | string | нет | 9/9 | чип карточки (ленточная ветка) |
| `link` | string | нет | 9/27 | ссылка карточки (ленточная ветка) |
| `linkExternal` | boolean | нет | 2/27 | открывать `link` в новой вкладке |
| `presentation` | string | нет | 2/27 | ссылка «Презентация» (брендбуки → `/gejt-broshury/`) |
| `media` | `{src, alt, caption}` | нет | 7/27 | фото с подписью (фигура с figcaption) |
| `placeholder` | string | нет | 2/27 | текст заглушки вместо фото |
| `cardDesc` | string | нет | 6/27 | текст карточки вместо `desc` |
| `meta` | (string, string, string)[] | нет | 9/27 | иконка + label + value в карточке |
| `hero` | `{title?, text?, image?}.passthrough` | нет | 0/27 | задел под страницы объектов (в данных пусто) |
| `faq` | `{q, a}[]` | нет | 0/27 | задел под страницы объектов (в данных пусто) |
| `cta` | `{title?, text?, href, label}` | нет | 0/27 | задел под страницы объектов (в данных пусто) |

Поля `hero`/`faq`/`cta`/`searchTitle` в схеме есть, в данных не используются —
подготовлены под будущие страницы объектов `/obekt/[id]/`.

## 3. Состав данных (27 файлов)

Порядок `sort` 0…26 без пропусков. Типы: **warehouse ×15** (arsenal,
business-park-113, fedorovskoe, gorigo, lagolovo, luch, novotroitsky,
predportovy, promboks2, pushkin, razbegaevo, salova, volhov, yanino,
zaozernaya), **production ×5** (parnas, varshavskaya, volhonskoe, voyskovitsy,
voyskovitsy-park), **park ×4** (antares, atlas-garazhny, avrora-vitebsky,
light-industrial-razmetelevo), **land ×3** (land-koltushi, land-tervolovo,
land-volosovo).

- `dealTypes`: rent ×17, sale ×9, rent+sale ×1 (antares).
- `busy: true` ×4 — arsenal, pushkin, yanino, zaozernaya.
- `areaNum: null` ×7 — antares, atlas-garazhny, avrora-vitebsky, parnas,
  volhonskoe, voyskovitsy-park, pushkin.
- `price` заполнено ×3: avrora-vitebsky «100 000 000 ₽», atlas-garazhny
  «150 000 000 ₽», varshavskaya «120 000 ₽/м²» (в модалке каталога).
- `badgeLabel` ×9: antares `badge--technopark`; остальные 8 (atlas-garazhny,
  avrora-vitebsky, land-koltushi, land-tervolovo, land-volosovo, parnas,
  volhonskoe, voyskovitsy-park) — `badge--park`.

## 4. Фото и медиа — внешние ссылки

Все фото коллекции — поля `image` и `media.src`. Раскладка по файлам:

| Группа | Файлы | Источник |
|--------|-------|----------|
| invest-platforma.com (22 файла) | arsenal, business-park-113, fedorovskoe, gorigo, lagolovo, land-koltushi (image + media-thumb), land-volosovo (image + media-thumb), light-industrial-razmetelevo, luch, novotroitsky, predportovy, promboks2, pushkin, razbegaevo, salova, varshavskaya, volhonskoe, volhov, voyskovitsy, voyskovitsy-park, yanino, zaozernaya | прямые URL фото/превью |
| mm-prom.ru/wp-content (3 файла) | antares (`…/2026/05/cases03.avif`), atlas-garazhny (`…/2026/09/image-14-09-26-…-scaled-optimized.png`), avrora-vitebsky (`…/2026/05/garage.avif`) | прямые URL |
| локальные пути (2 файла) | land-tervolovo → `/tervolovo.webp`, parnas → `/parnas.webp` | файлы из `public/` |

### 4.1 Карта invest-platforma → локальные файлы (`map-external.tsv`)

19 уникальных URL из JSON уже скачаны шагом импорта в
`public/assets/external/inv-<sha1-8>-<имя>`; соответствие URL → файл — в
`.kilo/scripts/sources/mm-prom-site-2026-10-23/map-external.tsv` (19 строк).
Все 19 URL из карты встречаются в JSON (gorigo `vid-sverhu2.jpeg` — один URL
на два файла: gorigo **и** volhonskoe); для каждого есть локальный файл
`inv-*`.

### 4.2 Вне карты (`map-external.tsv`)

| URL в JSON | Где | Локальная копия на данный момент |
|------------|-----|----------------------------------|
| `invest-platforma.com/images/cms/thumbs/ae2e0043…/osnovnaya_585_403_png_5_80.png` | `image` voyskovitsy и voyskovitsy-park | файла нет; в `public/assets/objects/voyskovitsy/cover.webp` есть фото объекта |
| `invest-platforma.com/images/cms/thumbs/9da23208…/zu_koltushi_277_191_png_5_80.png` | `media.src` land-koltushi | `public/assets/external/2e4cd858-zu_koltushi_277_191_png_5_80.webp` |
| `invest-platforma.com/images/cms/thumbs/81456c67…/vid_sverhu_277_191_jpg_5_80.jpg` | `media.src` land-volosovo | `public/assets/external/097ecd19-vid_sverhu_277_191_jpg_5_80.jpg` |
| `mm-prom.ru/wp-content/uploads/2026/05/cases03.avif` | `image` + `media.src` antares | `public/assets/external/9d4c4a14-cases03.avif` |
| `mm-prom.ru/wp-content/uploads/2026/09/image-14-09-26-10-33-1-scaled-optimized.png` | `image` + `media.src` atlas-garazhny | `public/assets/external/ade44b54-image-14-09-26-10-33-1-scaled-optimized.webp` |
| `mm-prom.ru/wp-content/uploads/2026/05/garage.avif` | `image` + `media.src` avrora-vitebsky | `public/assets/external/7da0587c-garage.avif` |
| `mm-prom.ru/atlas-garazhnyj/`, `mm-prom.ru/avrora-vitebskij/` | `external` брендбуков (не фото — ссылки на страницы) | копия не нужна — целевое поведение: внутренние маршруты (§6) |

Вывод: локальные ассеты для всех фото из JSON уже лежат в `public/` (импорт
шага `prep-import`); замена URL на локальные пути — правка данных без
загрузок.

## 5. Поля ссылок: текущее поведение

| Поле | Значения | Где рендерится |
|------|----------|----------------|
| `external` | пусто ×25; `https://mm-prom.ru/atlas-garazhnyj/`, `https://mm-prom.ru/avrora-vitebskij/` (брендбуки) | каталожная ветка ObjectCard: ссылка «На страницу объекта» `target="_blank"`; ленточная ветка: `href = link || external` |
| `link` | брендбуки `/atlas-garazhnyj/`, `/avrora-vitebskij/`; land-koltushi, land-volosovo — URL invest-platforma (`linkExternal: true`); **битые заглушки** `/kartochka-obekta/` ×4 (antares, parnas, volhonskoe, voyskovitsy-park) и `/katalog/` ×1 (land-tervolovo) | ленточная ветка ObjectCard: стрелка-иконка; внешний URL — `target="_blank"` |
| `presentation` | `/gejt-broshury/` ×2 (брендбуки) | ленточная ветка: плашка «Презентация» (битая ссылка известная — CR-2026-002 не трогает) |

Логика ObjectCard: `href = d.link || d.external || ''`;
`isExternal = (d.linkExternal ?? false) || href.startsWith('http')`.

Страница объекта (всплывающая) существует только в каталоге: модалка `#obj-modal`,
`window.MMPROM_OBJECTS` = { id, title, typeLabel, deal, area, address,
district, desc, specs, price, image, external, coords, busy } (инжект в
`katalog.astro`, логика `public/assets/catalog.js`); кнопка «Подробнее»
(`data-open`) открывает модалку. Попап карты (`svc-map.js`) получает
`window.MMPROM_MAP_OBJECTS` = { id, title, coords, address, area } на 14
страницах (9 услуг/ролей + каталог + …). Карточка в каталоге не ведёт на
страницу объекта — страниц `/obekt/<id>/` пока нет.

## 6. Целевые изменения (источник — CR-2026-002, в код не внесены)

По п. 25 и «Влиянию на данные/миграции»:

1. **+6 файлов**: `rabochaya`, `nevelskaya`, `kolpino`, `metallostroy`,
   `murino`, `ip-razmetelevo` → коллекция 33 файла. Источник данных —
   `.kilo/scripts/sources/mm-prom-site-2026-10-23/catalog-data.js` (32 записи
   новой версии сайта; voyskovitsy-park в ней отсутствует и сохраняется
   отдельно — это разные предложения, решение владельца п. 2).
2. **Синхронизация 26 существующих** (все, кроме `voyskovitsy-park`) с новой
   версией; фото/поля — из неё же.
3. **Поле `images`** (галерея) — добавить в схему и в данные: у новых объектов
   фото есть, у остальных — одно изображение.
4. **`external` в схеме становится необязательным** (`z.string().optional()`).
5. **Правило ссылок**: для не-брендбуков `link`/`external` не рендерятся,
   ссылка строится как `/obekt/<id>/` в обеих ветках ObjectCard; для
   atlas-garazhny и avrora-vitebsky — их внутренние маршруты
   `/atlas-garazhnyj/`, `/avrora-vitebskij/`. Битая `/kartochka-obekta/` (4
   объекта) и land-заглушки/`/katalog/` уходят; внешние URL invest-platforma
   в `link` заменяются внутренними страницами.
6. **Локальные фото**: все URL из JSON заменяются путями внутри `public/`:
   - 19 URL по карте `map-external.tsv` → `public/assets/external/inv-*`;
   - media-thumbs Колтушей и Волосово → локальные копии `2e4cd858-…` /
     `097ecd19-…` (или соответствующие локальные ассеты);
   - `mm-prom.ru/wp-content` ×3 → локальные копии `9d4c4a14-`, `ade44b54-`,
     `7da0587c-`;
   - voyskovitsy / voyskovitsy-park → `public/assets/objects/voyskovitsy/cover.webp`.
   Критерий итогового состояния: в `src/content/objects/*.json` нет ссылок на
   `invest-platforma.com` и `mm-prom.ru/wp-content`.

## 7. План блоков реализации

**Блок B1 — «Схема и данные объектов»**

| Работа | Детали |
|--------|--------|
| Схема | `images` (галерея, массив) в `src/content.config.ts`; `external` — `.optional()` |
| Новые объекты | 6 файлов `src/content/objects/`: rabochaya, nevelskaya, kolpino, metallostroy, murino, ip-razmetelevo — из снапшота `catalog-data.js` (+ фото: `public/assets/objects/<id>/cover.jpg`) |
| Синхронизация | 26 файлов — поля/значения новой версии (без voyskovitsy-park) |
| Локальные фото | замена внешних URL (§4.1, §4.2, §6.6) |
| Ссылки | поля `link`/`external`/`linkExternal` приведены к правилу §6.5 (данные); рендер — в фиче `object-card` |
| Проверка | `npm run build`, `npx astro check`, 33 файла в коллекции, grep-нет invest-platforma/mm-prom.ru/wp-content в JSON |

Блоков B2 и далее у фичи нет: рендер карточек — фича `object-card`, страницы
`/obekt/[id]/` — фича `object-pages`, каталог/модалка — `catalog`.

## 8. Границы

- Код (страницы, ObjectCard, catalog.js, svc-map.js) не меняется в этой фиче —
  только `src/content.config.ts` и `src/content/objects/`.
- `hero`/`faq`/`cta` заполняются при реализации страниц объектов (фича
  `object-pages`), не в блоке B1.
- Ссылка `/gejt-broshury/` (presentation брендбуков) не «чинится» — известная
  битая ссылка, план форм заявок отдельно.

## 9. Решения агента — на ревью владельца

1. **voyskovitsy / voyskovitsy-park**: URL-превью не в карте и без локальной
   копии; в качестве целевого `image` предложен
   `/assets/objects/voyskovitsy/cover.webp` (уже скачан импортом).
2. **media-thumbs Колтушей/Волосово и фото antares/atlas/avrora**: локальные
   копии существуют под hash-префиксами схемы `inv-*`/`<sha1-8>-*` в
   `public/assets/external/`; целевые пути в JSON — эти файлы, без переименования.