#!/usr/bin/env python3
"""Синхронизация общих блоков шапки/подвала по всем *.html корня.

Шаблоны: tools/partials/header.html, tools/partials/footer.html.
Замена по точным строковым якорям (str.find, без regex):
  <header class="site-header">…</header>
  <footer class="site-footer">…</footer>
Режимы: замена (по умолчанию) и --check (только отчёт).
Страница без блока или с дубликатом блока — ошибка.
Кодировка utf-8, переводы строк LF; BOM — отказ. Script-блоки и ключ
Яндекса не затрагиваются: правится ровно диапазон блока.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARTIALS = {
    "<header class=\"site-header\">": ("</header>", ROOT / "tools/partials/header.html"),
    "<footer class=\"site-footer\">": ("</footer>", ROOT / "tools/partials/footer.html"),
}

def load_partial(path, open_tag, close_tag):
    text = path.read_text(encoding="utf-8")
    if text.startswith("\ufeff"):
        raise ValueError(f"{path}: BOM не допускается")
    if "\r" in text:
        raise ValueError(f"{path}: ожидается LF, найден CR")
    if text.endswith("\n"):
        text = text[:-1]
    if not (text.startswith(open_tag) and text.endswith(close_tag)):
        raise ValueError(f"{path}: шаблон должен начинаться с {open_tag!r} и заканчиваться {close_tag!r}")
    return text

def find_block(text, open_tag, close_tag):
    count = text.count(open_tag) + text.count(close_tag)
    if count != 2:
        return None, count
    start = text.index(open_tag)
    end = text.index(close_tag, start) + len(close_tag)
    return (start, end), 2

def main():
    check = "--check" in sys.argv[1:]
    pages = sorted(p for p in ROOT.glob("*.html") if p.is_file())
    if not pages:
        print("ОШИБКА: в корне нет *.html"); return 1
    templates = {}
    for open_tag, (close_tag, path) in PARTIALS.items():
        try:
            templates[open_tag] = (close_tag, load_partial(path, open_tag, close_tag))
        except ValueError as e:
            print(f"ОШИБКА: {e}"); return 1
    errors, changed, unchanged = [], 0, 0
    for page in pages:
        try:
            text = page.read_text(encoding="utf-8")
            if text.startswith("\ufeff"):
                raise ValueError("BOM не допускается")
            if "\r" in text:
                raise ValueError("ожидается LF, найден CR")
            new_text = text
            for open_tag, (close_tag, body) in templates.items():
                span, found = find_block(new_text, open_tag, close_tag)
                if found != 2:
                    raise ValueError(f"блок {open_tag}: найдено {found // 2} (нужно 1)")
                new_text = new_text[:span[0]] + body + new_text[span[1]:]
            if new_text != text:
                if check:
                    raise ValueError("требуется синхронизация")
                page.write_text(new_text, encoding="utf-8", newline="")
                changed += 1
                print(f"обновлён: {page.name}")
            else:
                unchanged += 1
        except ValueError as e:
            errors.append(f"{page.name}: {e}")
    for e in errors:
        print(f"ОШИБКА: {e}")
    mode = "check" if check else "write"
    print(f"[{mode}] страниц: {len(pages)}, обновлено: {changed}, без изменений: {unchanged}, ошибок: {len(errors)}")
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main())