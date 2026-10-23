Сайт ММ Пром — Astro (статическая сборка)
==========================================

Как открыть
-----------
Node.js >= 24. Установка: `npm install`. Дев-сервер: `npm run dev`
(http://localhost:4321). Просмотр сборки: `npm run build` → `npm run preview`.
Интернет нужен шрифтам, картам Яндекс и внешним фотографиям объектов.

Страницы (маршруты)
-------------------
/                       — главная
/uslugi/                — хаб «Все услуги»
/arenda/                — Аренда недвижимости
/prodazha/              — Продажа недвижимости
/brokerage/             — Подбор недвижимости
/stroitelstvo/          — Строительство
/development/           — Девелопмент под ключ
/redevelopment/         — Редевелопмент
/upravlenie/            — Управление
/consalting/            — Промышленный консалтинг
/trade-in/              — Трейд-ин / Срочный выкуп
/investcomp/            — Инвестиции и финансирование
/katalog/               — Каталог объектов: фильтры, карта, карточки
/proizvodstvam/         — Роль: Производствам
/sobstvennikam-zdaniy/  — Роль: Собственникам зданий
/sobstvennikam-uchastkov/ — Роль: Собственникам участков
/investoram/            — Роль: Инвесторам
/about/                 — О компании
/contact/               — Контакты
/blog/                  — Публикации (раздел в разработке)
/atlas-garazhnyj/       — Атлас Гаражный
/avrora-vitebskij/      — Аврора Витебский

Полная таблица «старый HTML-файл → маршрут»:
docs/change-requests/CR-2026-001-astro-migration.md

Структура
---------
src/layouts/BaseLayout.astro  — шапка/подвал/head (SEO, canonical, OG, Метрика)
src/pages/<slug>.astro        — страницы (inline-стили/скрипты is:inline)
src/components/ObjectCard.astro — карточка объекта (ленты + каталог)
src/content/objects/<id>.json — данные 27 объектов (content collection)
src/content.config.ts         — zod-схема коллекции
src/pages/robots.txt.ts       — robots (env-разводка staging/prod)
public/assets/                — общие JS/CSS (site-anim, catalog, svc-map,
                                object-card.css)
public/                       — логотип, локальные фото объектов

Сборка окружений
----------------
prod (дефолт):    npm run build
staging (noindex): MMPROM_ENV=staging ASTRO_SITE=<staging-домен> npm run build

Технические заметки
-------------------
- Astro static, directory-формат, слэш на конце; compressHTML: false.
- Интерактив — ванильные JS из public/assets (defer); данные на страницу —
  window.MMPROM_* через define:vars.
- Карты: Яндекс.Карты JS API, два ключа (страницы услуг/каталог — один,
  брендбуки — второй); на брендбуках код карты с guard-проверкой и без
  контейнера (мёртвый код, паритет с исходником).
- Фотографии объектов — прямые ссылки invest-platforma.com / mm-prom.ru;
  локальные — /parnas.webp, /tervolovo.webp (у каждого .webp/.avif есть
  .jpg-двойник; BaseLayout подменяет src на .jpg при ошибке загрузки,
  og:image всегда отдаётся в .jpg/PNG).
- Анимации отключаются при системной настройке «уменьшить движение».
- Битых ссылок нет: CTA заявок и бейдж «Презентация» открывают
  Bitrix24-попапы (src/lib/b24.ts); /modalka-zayavki/, /kartochka-obekta/,
  /gejt-broshury/, /gejt-tz/ в выводе не используются.

Деплой
------
Staging — GitHub Actions (push в main) → GitHub Pages (.github/workflows/
deploy.yml). Prod — замена WordPress на mm-prom.ru, gated: см. DEPLOY-раздел
AGENTS.md и CR-2026-001 (шаг 9).
