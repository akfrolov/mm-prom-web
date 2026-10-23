# Часть 06 — W2.3: компонент `Breadcrumbs.astro` (CR п. 21)

Источник правки: CR-2026-002 п. 21; SPEC §1.5, §2.2.

## Было → Стало

| Было | Стало |
|------|-------|
| `<section id="breadcrumbs" class="b-breadcrumbs"><div class="container"><ol><li><a href="/">Главная</a></li>…<li><span aria-current="page">Текущая</span></li></ol></div></section>` (19 страниц; эталон development.astro:832–836) | `<Breadcrumbs items={[{href:"/",label:"Главная"},{href:"/uslugi/",label:"Услуги"},{href:"/development/",label:"Девелопмент"}]} />` |
| Цепочки вписаны прямо в разметку каждой страницы | Цепочка передаётся данными; разметка (section, ol, разделитель `li+li::before`, `aria-current` на последнем звене) — внутри компонента |

Пропы: `items` — массив `{href, label}`, последний элемент — текущая страница
(рендерится `<span aria-current="page">`, без ссылки). Разделитель — `::before`
в CSS blocks.css (переносится из страниц без изменения). Внешний вид не
меняется (правка §1.5 идентична по DOM: инвариант 2).

Места: 19 страниц — about, 10 услуг, 4 роли, blog, contact, katalog, uslugi.
На index, 404, atlas-garazhnyj, avrora-vitebskij крошек не было и не
добавляется (§1.5). Цепочки:
- услуги и роли: «Главная → Услуги → <название>» (14 страниц);
- about, contact, katalog, uslugi, blog: «Главная → <текущая>» (5 страниц).

## Якорь эталона

- SPEC §1.5; CR п. 21.
- Код-эталон: development.astro:832–836; about.astro (двухзвенная цепочка).

## Тест-кейсы

| TC | Тип | Сценарий |
|----|-----|----------|
| TC-SP-13 | grep | Rendered DOM: `id="breadcrumbs"` ×19 на тех же страницах (19 = 23 страницы − index − 404 − atlas − avrora; то есть все 22 содержательные, кроме index/atlas/avrora); в исходниках страниц литерала `<section id="breadcrumbs"` нет (grep — пусто) |
| TC-SP-14 | ui | `development`(1366): цепочка «Главная / Услуги / Девелопмент», разделитель `/`, hover ссылки — `--purple`, последний пункт — без ссылки, с `aria-current="page"`; `about` — 2 звена; на `index`, `atlas`, `avrora`, 404 крошек нет |

## Критерии приёмки (механические)

- Rendered: `id="breadcrumbs"` — ровно 19.
- `! grep -rq 'id="breadcrumbs"' src/pages` — пусто.
- `src/components/Breadcrumbs.astro` существует.