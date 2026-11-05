import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Коллекция объектов (CR-2026-001): 33 файла src/content/objects/<id>.json.
// id = имя файла (поле id в JSON не задаётся). Поля каталога покрывают фильтры
// (areaNum/location/dealTypes/busy), поля карточки — канон .obj-card; hero/faq/cta
// подготовлены под будущие страницы объектов (/obekt/[id]/).
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
    specs: z.array(z.tuple([z.string(), z.string(), z.string()])),
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
      })
      .passthrough()
      .optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    details: z
      .object({
        scheme: z
          .object({
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
          })
          .optional(),
        advantages: z
          .object({
            title: z.string(),
            items: z.array(z.object({ icon: z.string(), text: z.string() })),
          })
          .optional(),
        development: z
          .object({
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
          })
          .optional(),
        business: z
          .object({
            title: z.string(),
            items: z.array(z.object({ icon: z.string(), text: z.string() })),
          })
          .optional(),
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
