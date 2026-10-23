# Часть 07 — W2.4: компонент `FaqSection.astro` (CR п. 21)

Источник правки: CR-2026-002 п. 21; SPEC §1.6 (две реализации A/B), §2.2
(«единый компонент с двумя вариантами»; унификация только там, где требует дельта).

## Было → Стало

| Было | Стало |
|------|-------|
| Вариант A (простой, 4 роли — по 4 вопроса): `<section id="faq" class="section section--tint">` → заголовок `b-sec-head reveal` (sec-index «05» + h2 «Частые вопросы» + пустой `b-sec-head__lead`) → сетка `.faq{max-width:900px}` → `details class="faq__item reveal" style="--i:N"` → `summary.faq__q` (иконка `add`, rotate 45° при open) + `div.faq__a` (padding слева 58px); анимация faqIn | `<FaqSection variant="simple" id="faq" secIndex="05" title="Частые вопросы" items={…} />` — рендерит ту же разметку (классы `b-sec-head`, `faq`, `faq__item`, `faq__q`, `faq__a`, `reveal`) |
| Вариант B (панельный), index — 4 вопроса: интро-колонка `b-faq__intro` (sec-index «06» + h2 + lead) + список `b-faq__item reveal`: summary (min-height 58px, иконка `expand_more`, rotate 180°), текст `p` внутри details; **панель `b-faq__help` в третьей колонке** («Не нашли свой вопрос?», подсказка, телефонная ссылка `b-faq__help-phone` `tel:88003331010`, gold-кнопка «Обратный звонок» → `/modalka-zayavki/` рендерится через `SiteButton` — W2.2) | `<FaqSection variant="panel" id="faq" intro={…} help={…} items={…} />`; секция сохраняет `id="faq" class="b-faq section section--tint"` (index.astro:895) |
| Вариант B, atlas — 9 вопросов: секция БЕЗ `id` («Важное до решения»): `sec-index` (текст, без `aria-hidden`) + h2, без обёртки `b-faq__intro`; список `b-faq__item` — без `reveal` и без панели `help` | `<FaqSection variant="panel" secIndex="Важное до решения" title="Важное до решения" class="section section--tint" items={…} />` — та же разметка, как сейчас |
| `avrora-vitebskij`: CSS `.b-faq*` объявлен, разметки нет (мёртвый) | Компонент НЕ вызывается; мёртвый CSS умирает в W2.1 (часть 04, чистка копий) |

Пропы: `variant` (`simple`/`panel` — обязателен), `items` (массив
`{q, a}` — вопрос и ответ; на index ответ может быть из нескольких `p`,
передаётся `a` как массив строк), `id` (опционально), `class` (опционально,
классы секции), `secIndex` (опционально — содержимое `sec-index`: номер «05»
на ролях, «06» в интро index, текст «Важное до решения» на atlas; на atlas без
`aria-hidden`, как сейчас), `title` (h2 секции), `intro` (только index —
интро-колонка), `help` (опционально, только index — панель `b-faq__help` с
телефоном и кнопкой через `SiteButton`). Поведение `details/summary` —
нативное, без скриптов; `prefers-reduced-motion` у faqIn — site-anim.css,
не меняется.

Количество вопросов не меняется: index 4, atlas 9, роли 4×4 = 16 (29 всего;
страниц с разметкой — 6: index, atlas, 4 роли; `id="faq"` — на 5, atlas без
id). Классы `reveal`/`style="--i:N"` сохраняются там, где есть сейчас (у atlas
их нет). Интро, панель `b-faq__help` и заголовки секций на месте. Внешний вид
обоих вариантов не меняется — дельта заменяет только дублирование классов CSS
(W2.1) и копипасту разметки.

## Якорь эталона

- SPEC §1.6 (таблица A/B и паттерн), §2.2; CR п. 21.
- Код-эталон: index.astro:895–928 (панельный b-faq целиком: intro :897–901,
  список :902–920, панель help :921–926), investoram.astro:1014–1040
  (простой faq); CSS: index.astro:471–517 (b-faq*, включая b-faq__help),
  роль — investoram.astro:853–862 (блок `.faq`).

## Тест-кейсы

| TC | Тип | Сценарий |
|----|-----|----------|
| TC-SP-15 | grep | Rendered: блоки FAQ на 6 страницах (index, atlas, 4 роли), число `details` — 29 (index 4, atlas 9, по 4 на 4 ролях); разметка содержит `faq__q` на ролях и `b-faq__item` на index/atlas, панель `b-faq__help` — только на index; в исходниках страниц литералов `class="faq__item` и `b-faq__item` нет |
| TC-SP-16 | ui | `index`/`atlas` (панельный): клик раскрывает панель, иконка разворачивается (rotate 180°), повторный клик закрывает; роль (простой): клик по строке с иконкой `+` — иконка поворачивается на 45°, ответ читается; `prefers-reduced-motion` открывается без анимации, текст на месте; у index панель телефон/кнопка «Обратный звонок» на месте |

## Критерии приёмки (механические)

- Rendered: 29 `details` в FAQ-секциях; `id="faq"` — 5 страниц
  (index + 4 роли, §1.6; atlas — секция без id, как сейчас).
- `! grep -rqE 'class="(faq__(item|q|a)|b-faq__item)' src/pages` — пусто.
- `src/components/FaqSection.astro` существует.