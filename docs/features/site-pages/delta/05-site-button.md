# Часть 05 — W2.2: компонент `SiteButton.astro` (CR п. 21, 27)

Источник правки: CR-2026-002 п. 21; SPEC §1.3, §2.2 (имя и пропы компонента).

## Было → Стало

| Было | Стало |
|------|-------|
| `<a class="btn btn--gold" href="/modalka-zayavki/">Оставить заявку</a>` (эталон development.astro:1067) | `<SiteButton variant="gold" href="/modalka-zayavki/">Оставить заявку</SiteButton>` |
| 98 кнопок страниц в вариантах gold ×38, outline ×41, ghost-light ×14, purple ×5 (§1.3) | те же 98 — все через `<SiteButton>`; разметки `<a class="btn …` в страницах нет |
| Целевые классы — вторые в списке классов (`b-tz-banner__cta` у кнопки ТЗ) | передаются пропом; рендерятся после базовых классов (DOM-якорь сохранён) |

Пропы компонента (только разметка; стили кнопок — в `base.css` фичи
`site-shell`, после imp-shell копий в страницах нет — инвариант 4):

- `variant`: `gold` / `purple` / `outline` / `ghost-light` — обязателен;
- `href` — обязателен;
- `class` — дополнительный целевой класс (`b-tz-banner__cta`); строка, дописывается к базовым;
- `target` — опционально; при `target="_blank"` рендерится с `rel="noopener"`
  (в contact 3 кнопки с target="_blank": Telegram в hero — contact.astro:785,
  «Построить маршрут» — :838, Telegram в CTA-полосе — :860);
- слот — текст кнопки.

Рендеринг строго: `<a class="btn btn--<variant>[ <class>]" href="<href>">`. Тексты,
href-и, число и места кнопок не меняются (инварианты 4 и 2, ACCEPTANCE C1).
Кнопки BaseLayout (3 шт.: `mega__all` gold, `site-header__cta` purple, кнопка
мобильного меню purple) не мигрируют — у них отдельная зона (site-shell,
§6.4 спеки); их внешний вид не меняется этой фичей, кроме снятия тени W1.2
(которая живёт в base.css).

## Якорь эталона

- SPEC §1.3 (база `.btn`, варианты), §2.2 строка SiteButton; CR п. 21, 27.
- Код-эталон: development.astro:854–855 (hero gold+outline), :1067–1068 (CTA
  grad gold+ghost-light); index.astro:888 (`b-tz-banner__cta`).

## Тест-кейсы

| TC | Тип | Сценарий |
|----|-----|----------|
| TC-SP-11 | grep | В `src/pages/*.astro` нет литеральной разметки `<a class="btn ` (grep — пусто); в rendered DOM (`astro preview`) `class="btn ` встречается 101 раз: 98 через компонент + 3 в BaseLayout; бьётся на варианты как в §1.3: gold 39 (38+1 mega), purple 7 (5+2), outline 41, ghost-light 14 |
| TC-SP-12 | ui | Варианты 4-х страниц: `development` — outline и gold; `about` — purple; услуга CTA — gold + ghost-light. Вид, hover-подъём, блик золотой — как до замены (снапсот до/после, кроме снятой тени W1.2) |

## Критерии приёмки (механические)

- `! grep -rq '<a class="btn' src/pages` — пусто.
- Rendered: `class="btn ` — 101 вхождение; `btn--ghost-light` — 14.
- `src/components/SiteButton.astro` существует.