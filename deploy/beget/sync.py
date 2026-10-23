#!/usr/bin/env python3
"""Зеркалирование dist/ на Beget по FTP.

Читает реквизиты из deploy/beget/secrets.env (в git не попадает).
Текстовые файлы сравниваются по содержимому, бинарные — по размеру.
Удаляет на сервере файлы, которых нет в dist/, кроме PROTECTED.
"""
import os
import sys
from ftplib import FTP
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"
ENV_FILE = Path(__file__).with_name("secrets.env")
PROTECTED = {"cgi-bin", ".well-known", "CNAME"}
TEXT_EXT = {".html", ".css", ".js", ".json", ".xml", ".txt", ".svg", ".htaccess", ""}
SKIP_LOCAL = {"CNAME"}


def load_env(path):
    data = {}
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        data[k.strip()] = v.strip()
    return data


def is_text(name):
    return Path(name).suffix.lower() in TEXT_EXT


def local_files():
    files = {}
    for p in DIST.rglob("*"):
        if p.is_file():
            rel = p.relative_to(DIST).as_posix()
            if rel in SKIP_LOCAL:
                continue
            files[rel] = p
    return files


def remote_list(ftp, base):
    """Возвращает (dirs, files) относительно base."""
    base = "/" + base.strip("/")
    dirs, files = set(), {}
    stack = [""]
    while stack:
        rel = stack.pop()
        path = base.rstrip("/") + ("/" + rel if rel else "")
        ftp.cwd(path)
        for full in ftp.nlst():
            name = full.rsplit("/", 1)[-1]
            if name in (".", ".."):
                continue
            child_rel = f"{rel}/{name}" if rel else name
            child_path = path.rstrip("/") + "/" + name
            try:
                ftp.cwd(child_path)
                is_dir = True
            except Exception:
                is_dir = False
            if is_dir:
                dirs.add(child_rel)
                stack.append(child_rel)
            else:
                try:
                    size = ftp.size(child_path)
                except Exception:
                    size = None
                files[child_rel] = size
    return dirs, files


def main():
    cfg = load_env(ENV_FILE)
    host = cfg["BEGET_FTP_HOST"]
    user = cfg["BEGET_FTP_USER"]
    password = cfg["BEGET_FTP_PASS"]
    base = cfg.get("BEGET_REMOTE_PATH", "/")

    local = local_files()
    ftp = FTP(host, timeout=60)
    ftp.login(user, password)
    ftp.set_pasv(True)

    dirs, remote = remote_list(ftp, base)
    print(f"локально: {len(local)} файлов, на сервере: {len(remote)}")

    for rel_dir in sorted({str(Path(r).parent.as_posix()) for r in local if "/" in r} - {""} - dirs):
        path = base.rstrip("/") + "/" + rel_dir
        try:
            ftp.mkd(path)
        except Exception:
            pass

    uploaded = skipped = deleted = 0
    for rel, path in sorted(local.items()):
        remote_path = base.rstrip("/") + "/" + rel
        need = rel not in remote
        if not need:
            if is_text(rel):
                chunks = []
                try:
                    ftp.retrbinary(f"RETR {remote_path}", chunks.append)
                    need = b"".join(chunks) != path.read_bytes()
                except Exception:
                    need = True
            else:
                need = int(remote[rel]) != path.stat().st_size if remote[rel] is not None else True
        if not need:
            skipped += 1
            continue
        with path.open("rb") as fh:
            ftp.storbinary(f"STOR {remote_path}", fh)
        uploaded += 1
        print("up", rel)

    for rel in sorted(remote):
        if rel in local:
            continue
        top = rel.split("/", 1)[0]
        if top in PROTECTED:
            continue
        try:
            ftp.delete(base.rstrip("/") + "/" + rel)
            deleted += 1
            print("del", rel)
        except Exception as exc:
            print("del fail", rel, exc)

    ftp.quit()
    print(f"готово: загружено {uploaded}, без изменений {skipped}, удалено {deleted}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("ОШИБКА:", exc, file=sys.stderr)
        sys.exit(1)
