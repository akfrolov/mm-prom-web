# Часть 08 — W2.5: компонент `CtaBand.astro` (CR п. 21)

Источник правки: CR-2026-002 п. 21; SPEC §1.7, §2.2.

## Было → Стало

| Было | Стало |
|------|-------|
| `<section id="cta" class="b-cta b-cta--grad">` + `sec-index` + `h2` + `p` + `.b-cta__row` (кнопки + телефон) — копипаст на 18 страницах (эталон development.astro:1061+; `section`-класса у CTA нет, padding живёт на `.b-cta` — development.astro:689) | `<CtaBand variant="grad" id="cta" secIndex="08" heading={…} lede={…} buttons={[{variant:"gold", href:"/modalka-zayavki/", label:"Оставить заявку"}, {variant:"ghost-light", href:"/katalog/", label:"Смотреть объекты"}]} />` на 14 услугах/ролях |
| Простой вариант: `b-cta` без модификатора (подложка `--purple-soft`) — about, contact, katalog, uslugi (эталон about.astro:880+); у contact + кнопка Telegram | `<CtaBand variant="plain" …>`; у contact — две кнопки (purple «Оставить заявку» + outline Telegram `t.me/mm_prom1`, `target="_blank" rel="noopener"`) |
| Телефон: `.b-cta__phone` с иконкой `call`, `tel:88003331010` | тот же узел внутри `b-cta__row`; кликабелен |

Пропы: `variant` (`grad`/`plain` — обязателен), `id` (по умолчанию `"cta"`),
`secIndex` (номер `sec-index` — варьируется по страницам: «08» development,
«05» about, «04» contact — передаётся страницей), `heading`, `lede`,
`buttons` (массив `{variant, href, label, target?}` — значения пропов
`SiteButton`; при `target="_blank"` — `rel="noopener"`), `phone` (по умолчанию
`tel:88003331010` с подписью-номером, как сейчас). Кнопки внутри рендерятся
`SiteButton` (W2.2). Ссылки `/modalka-zayavki/`
остаются (инвариант: адрес не меняется в этой фиче). Тексты кнопок
(у ролей золотая кнопка «Обсудить задачу») передаются страницами, компонент
не «зашивает» их.

Не меняется: внешний вид обоих вариантов, `sec-index`+`h2`+`p` внутри,
padding `clamp(40px,6vw,72px) 0` (уходят в blocks.css без правок, W2.1).

## Якорь эталона

- SPEC §1.7, §2.2; CR п. 21.
- Код-эталон: development.astro:1061+ (grad), about.astro:880+ (plain),
  contact.astro:853+ (plain + телеграм).

## Тест-кейсы

| TC | Тип | Сценарий |
|----|-----|----------|
| TC-SP-17 | grep | Rendered: `class="b-cta` ×18 (из них `b-cta--grad` ×14), `id="cta"` ×18, `tel:88003331010` ×18; в исходниках страниц литерала `<section id="cta"` нет |
| TC-SP-18 | ui | `development` (1366): тёмная полоса с сек-индексом, заголовок, две кнопки (gold, ghost-light) и телефон-ссылка; `about` — светлая полоса с purple-кнопкой; `contact` — доп. кнопка outline на Телеграм; роль — золотая кнопка «Обсудить задачу» |

## Критерии приёмки (механические)

- Rendered: `class="b-cta` — 18; `b-cta--grad` — 14.
- `! grep -rq '<section id="cta"' src/pages` — пусто.
- `src/components/CtaBand.astro` существует.