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
    type: z.enum(['park', 'warehouse', 'production', 'land']),
    typeLabel: z.string(),
    deal: z.array(z.string()),
    dealTypes: z.array(z.enum(['rent', 'sale'])),
    area: z.string(),
    areaNum: z.number().nullable(),
    location: z.enum(['spb', 'lo']),
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
    group: z.enum(['ours', 'partners']).default('partners'),
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
        image: z.string().optional(),
      })
      .passthrough()
      .optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
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

// Коллекция статей (CR-2026-002, п. 28): 4 md-файла src/content/articles/<slug>.md.
// id = имя файла = слаг маршрута /blog/<slug>/. Время чтения не хранится —
// вычисляется на build по объёму тела (~200 слов/мин). Дата необязательна:
// у материала без даты в интерфейсе не выводится.
const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    lead: z.string(),
    date: z.string().optional(),
    source: z.object({ label: z.string(), url: z.string() }),
    cover: z.string(),
  }),
});

export const collections = { objects, articles };
