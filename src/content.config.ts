import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Коллекция объектов (CR-2026-001): 27 файлов src/content/objects/<id>.json.
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
    external: z.string(),
    coords: z.tuple([z.number(), z.number()]),
    busy: z.boolean(),
    sort: z.number(),
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

export const collections = { objects };
