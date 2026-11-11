import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Коллекция объектов (CR-2026-001): 33 файла src/content/objects/<id>.json.
// id = имя файла (поле id в JSON не задаётся). Поля каталога покрывают фильтры
// (areaNum/location/dealTypes/busy), поля карточки — канон .obj-card; hero/faq/cta
// подготовлены под будущие страницы объектов (/obekt/[id]/).
// Блоки детальной части карточки объекта: используются и в плоской раскладке
// (scheme/advantages/development/business), и в разбивке details.parts на
// самостоятельные разделы страницы.
const objectSpec = z.tuple([z.string(), z.string(), z.string()]);

const objectScheme = z.object({
  title: z.string(),
  text: z.string().optional(),
  image: z.string(),
  alt: z.string(),
  rows: z.array(
    z.object({
      name: z.string(),
      area: z.string(),
      land: z.string(),
      height: z.string(),
      load: z.string(),
      equipment: z.string(),
    }),
  ),
});

const objectAdvantages = z.object({
  title: z.string(),
  items: z.array(z.object({ icon: z.string(), text: z.string() })),
});

// Схема расположения объекта + таблица параметров: заменяет универсальный
// раздел «Характеристики» (#specs) на странице объекта.
const objectLayout = z.object({
  title: z.string(),
  text: z.string().optional(),
  image: z.string(),
  alt: z.string(),
  rows: z.array(
    z.object({
      floor: z.string(),
      area: z.string(),
      height: z.string(),
      load: z.string(),
    }),
  ),
});

const objectDevelopment = z.object({
  title: z.string(),
  text: z.string().optional(),
  image: z.string(),
  alt: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      area: z.string(),
      land: z.string().optional(),
      floors: z.string().optional(),
      image: z.string().optional(),
      alt: z.string().optional(),
    }),
  ),
});

const objectBusiness = z.object({
  title: z.string(),
  items: z.array(z.object({ icon: z.string(), text: z.string() })),
});

const objectPart = z.object({
  id: z.string(),
  title: z.string(),
  lead: z.string().optional(),
  text: z.string().optional(),
  specsTitle: z.string().optional(),
  specs: z.array(objectSpec).optional(),
  scheme: objectScheme.optional(),
  advantages: objectAdvantages.optional(),
  development: objectDevelopment.optional(),
  business: objectBusiness.optional(),
});

const objects = defineCollection({
  loader: glob({ base: './src/content/objects', pattern: '**/*.json' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['park', 'warehouse', 'storage', 'production', 'land']),
    typeLabel: z.string(),
    deal: z.array(z.string()),
    dealTypes: z.array(z.enum(['rent', 'sale'])),
    area: z.string(),
    areaNum: z.number().nullable(),
    location: z.enum(['spb', 'lo', 'mo']),
    address: z.string(),
    district: z.string(),
    desc: z.string(),
    specs: z.array(objectSpec),
    // Скрыть универсальный раздел «Характеристики» (#specs) на странице объекта,
    // когда его содержание уже раскрыто в других разделах (схема, преимущества).
    hideSpecs: z.boolean().optional(),
    // Скрыть раздел «Об объекте» (#about), даже если заполнен hero.text.
    hideAbout: z.boolean().optional(),
    // Скрыть верхний раздел «Ключевые параметры» (#key-params): нужен, когда
    // параметры уже раскрыты в разделах details.parts.
    hideKeyParams: z.boolean().optional(),
    // Переопределение плиток «Ключевые параметры» (иначе — первые 3 записи
    // specs). Например, расширенный набор характеристик из брендбука объекта.
    keySpecs: z.array(objectSpec).optional(),
    price: z.string(),
    image: z.string(),
    images: z.array(z.string()).optional(),
    external: z.string().optional(),
    coords: z.tuple([z.number(), z.number()]),
    busy: z.boolean(),
    sort: z.number(),
    group: z.enum(['ours', 'prom', 'external']).default('external'),
    searchTitle: z.string().optional(),
    badgeLabel: z.string().optional(),
    badgeClass: z.string().optional(),
    link: z.string().optional(),
    linkExternal: z.boolean().optional(),
    presentation: z.string().optional(),
    media: z.object({ src: z.string(), alt: z.string(), caption: z.string() }).optional(),
    placeholder: z.string().optional(),
    cardDesc: z.string().optional(),
    meta: z.array(z.tuple([z.string(), z.string(), z.string()])).optional(),
    hero: z
      .object({
        title: z.string().optional(),
        text: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        // Как показывать главное фото первого экрана: 'cover' (по умолчанию) —
        // кадр заполняет блок фиксированной высоты с обрезкой; 'natural' —
        // высота блока по пропорциям фото, кадр виден целиком (нужно для фото
        // участков с нанесёнными границами, которые нельзя обрезать).
        fit: z.enum(['cover', 'natural']).optional(),
      })
      .passthrough()
      .optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    details: z
      .object({
        // Разбивка страницы на самостоятельные разделы (например, «построенные
        // объекты» и «участки под застройку»). При заполнении плоские блоки
        // scheme/advantages/development/business не выводятся.
        parts: z.array(objectPart).optional(),
        layout: objectLayout.optional(),
        scheme: objectScheme.optional(),
        floors: z
          .object({
            title: z.string(),
            rows: z.array(
              z.object({
                floor: z.string(),
                area: z.string(),
                height: z.string(),
                load: z.string(),
              }),
            ),
          })
          .optional(),
        advantages: objectAdvantages.optional(),
        development: objectDevelopment.optional(),
        business: objectBusiness.optional(),
      })
      .optional(),
    cta: z
      .object({
        title: z.string(),
        text: z.string().optional(),
        href: z.string(),
        label: z.string(),
      })
      .optional(),
  }),
});

// Коллекция статей (CR-2026-002, п. 28): MDX-файлы src/content/articles/<slug>.mdx.
// id = имя файла = слаг маршрута /blog/<slug>/. Иллюстрации в теле — через <Image>
// из astro:assets с явными widths/sizes (без site-wide image.layout).
// Время чтения не хранится —
// вычисляется на build по объёму тела (~200 слов/мин). Дата необязательна:
// у материала без даты в интерфейсе не выводится. Рубрика используется
// фильтром на /blog/; source необязателен — у новостей компании нет
// внешнего первоисточника.
const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.mdx' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      lead: z.string(),
      date: z.string().optional(),
      category: z.enum(['media', 'cases', 'analytics', 'guides', 'news']),
      source: z.object({ label: z.string(), url: z.string() }).optional(),
      cover: image(),
      // Кадрирование обложки: «top» для фото с людьми, чтобы кроп 21:9
      // не срезал лица сверху; по умолчанию — по центру.
      coverPosition: z.enum(['top', 'center', 'bottom']).optional(),
    }),
});

export const collections = { objects, articles };
