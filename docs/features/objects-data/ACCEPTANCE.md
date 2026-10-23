# ACCEPTANCE: objects-data — схема и данные коллекции объектов

| Параметр | Значение |
|----------|----------|
| **Фича** | `objects-data` |
| **CR** | CR-2026-002 (п. 25, «Влияние на данные/миграции») |
| **Блок** | B1 «Схема и данные объектов» |
| **Спека** | `docs/features/objects-data/SPEC.md` (baseline §2–§5, целевое §6–§7) |

Приёмка блока B1 после его реализации. Проверки механические (команды из
корня проекта) + контентные (открытие каталога по `astro preview`). Полные
прогоны int/e2e в проекте отсутствуют.

## 1. Сборка и типы

- [ ] `npm run build` — зелёный.
- [ ] `npx astro check` — зелёный.

## 2. Схема

- [ ] В `src/content.config.ts` есть поле `images` (галерея; массив строк).
- [ ] `external` в схеме — необязательное (`z.string().optional()`).
- [ ] `image`, `coords`, `busy`, `sort` и прочие обязательные поля остались
      обязательными; сборка не падает на 33 записях.

## 3. Состав коллекции

- [ ] В `src/content/objects/` ровно 33 JSON-файла (27 текущих + 6 новых).
- [ ] Файлы новых объектов существуют: `rabochaya.json`, `nevelskaya.json`,
      `kolpino.json`, `metallostroy.json`, `murino.json`, `ip-razmetelevo.json`.
- [ ] id = имя файла без расширения; в JSON нет числового/своего поля id.
- [ ] `voyskovitsy-park.json` сохранён (его нет в новой версии сайта).
- [ ] 26 существующих записей (все кроме voyskovitsy-park) синхронизированы с
      `.kilo/scripts/sources/mm-prom-site-2026-10-23/catalog-data.js` —
      название, тип, площадь, цена/характеристики совпадают.

## 4. Локальные фото и медиа

- [ ] Grep: в `src/content/objects/*.json` нет `https://invest-platforma.com/`.
- [ ] Grep: в `src/content/objects/*.json` нет `https://mm-prom.ru/wp-content/`.
- [ ] 19 URL из `.kilo/scripts/sources/mm-prom-site-2026-10-23/map-external.tsv`
      заменены на пути к `public/assets/external/inv-*` (файлы существуют).
- [ ] `media.src` Колтушей и Волосово и фото antares/atlas/avrora ведут на
      существующие файлы в `public/` (§4.2 спеки).
- [ ] `image` voyskovitsy / voyskovitsy-park — локальный файл, который
      существует в `public/`.
- [ ] Файлы фото 6 новых объектов существуют
      (`public/assets/objects/<id>/cover.jpg` и т. п.).

## 5. Ссылки (уровень данных)

- [ ] В JSON нет ссылок на `/kartochka-obekta/` (раньше 4 объекта) и
      `/katalog/` как `link` заглушки (land-tervolovo).
- [ ] В JSON нет `link` на invest-platforma.com (раньше 2 land-объекта).
- [ ] Поля `link`/`external` приведены к правилу спеки §6.5: не-брендбуки —
      без внешних ссылок (ссылку `/obekt/<id>/` строит рендер); брендбуки —
      только внутренние маршруты `/atlas-garazhnyj/` и `/avrora-vitebskij/`.

## 6. Рендер (контрольная проверка по `astro preview`)

- [ ] Каталог `/katalog/` открывается, 33 карточки строятся из данных, новые
      6 объектов видны и попадают в фильтры по типу/сделке/локации.
- [ ] Карты на страницах услуг показывают объекты (`MMPROM_MAP_OBJECTS`
      непустой, координаты из коллекции) — проверка на `/arenda/`.
- [ ] Битых фото нет: консоль без `onerror is-broken` на `/katalog/` и лентах
      главной; изображения отдаются с сайта (DevTools: нет запросов к
      invest-platforma.com и mm-prom.ru за изображениями).

## 7. Решения агента (принять/скорректировать на ревью)

- Целевой `image` voyskovitsy/voyskovitsy-park —
  `/assets/objects/voyskovitsy/cover.webp` (превью не в карте, локальной копии
  thumb нет).
- Целевые пути к фото antares/atlas/avrora и media-thumbs — существующие
  файлы `public/assets/external/` под hash-префиксами
  (`9d4c4a14-`, `ade44b54-`, `7da0587c-`, `2e4cd858-`, `097ecd19-`), без
  переименования ассетов.