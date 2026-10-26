# Подмножество Material Symbols

`material-symbols-list.txt` — 93 имени глифов, которые реально встречаются в
разметке и данных объектов. Источник правды — отрендеренный `dist/`: имена
собираются из `<span class="material-symbols-outlined">…</span>` плюс
динамические (`volume_up`/`volume_off`). Новый глиф сначала добавляется в
список, затем пересобирается шрифт.

Оси зафиксированы под текущий CSS: `opsz 24`, `wght 500`, `GRAD 0`,
`FILL 0..1` (страница `/about/` использует заливку). Файл — ~15 КиБ вместо
полного шрифта ~3,9 МБ.

## Пересборка

```bash
cd docs/features/perf
ICONS=$(paste -sd, material-symbols-list.txt)
curl -sS -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,500,0..1,0&icon_names=$ICONS&display=block" \
  -o /tmp/ms.css
URL=$(grep -oP 'url\(\K[^)]+' /tmp/ms.css | head -1)
curl -sSL "$URL" -o ../../../public/assets/fonts/material-symbols-outlined.woff2
```

После замены файла поднять версию `?v=` в `src/styles/base.css` и
`<link rel="preload">` в `src/layouts/BaseLayout.astro` (иначе годовой кеш
из `.htaccess` отдаст старый шрифт).

## Проверка

```bash
python3 - <<'PY'
import re
from pathlib import Path
used=set(); pat=re.compile(r'class="material-symbols-outlined"[^>]*>\s*([a-z0-9_]+)\s*</span>')
for p in Path('dist').rglob('*.html'): used.update(pat.findall(p.read_text(errors='ignore')))
listed=set(open('docs/features/perf/material-symbols-list.txt').read().split())
print('не хватает:', sorted(used-listed))
PY
```
