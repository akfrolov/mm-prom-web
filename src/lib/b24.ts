// Формы Bitrix24 (CRM): click-вариант открывает попап по кнопке.
// Источник значений — сниппеты владельца от 2026-10-23.
// Ключ используется в компонентах (SiteButton, TzBanner, FaqSection),
// полный id — в data-b24-form, loader — во вставляемом скрипте.

export type B24FormKey =
  | 'requestTz'
  | 'callback'
  | 'request'
  | 'contact'
  | 'offer'
  | 'roadmap'
  | 'placement'
  | 'plan'
  | 'planGarageInline'
  | 'plot'
  | 'estimateInline';

export interface B24Form {
  id: string;
  sign: string;
  loader: string;
}

export const B24_FORMS: Record<B24FormKey, B24Form> = {
  requestTz: {
    id: 'click/40/hkdfip',
    sign: 'v1:40:site.e44726a59188e8830a39234f800ada4aa4a2aa5785d9de3d8395bf2bbd1a17c9',
    loader: 'https://cdn-ru.bitrix24.ru/b34096010/crm/form/loader_40.js',
  },
  callback: {
    id: 'click/38/b6ub8d',
    sign: 'v1:38:site.2769e3a306cdc7d9e9af1fbec6c6fe379213f3eccaabb25c08a5ba9d3cbf9fce',
    loader: 'https://cdn-ru.bitrix24.ru/b34096010/crm/form/loader_38.js',
  },
  request: {
    id: 'click/36/skk415',
    sign: 'v1:36:site.a467aeed9d7582f9de1e8a4dfb29aea466dae483b5806ff9c02b839525a9d495',
    loader: 'https://cdn-ru.bitrix24.ru/b34096010/crm/form/loader_36.js',
  },
  contact: {
    id: 'click/34/0ph3wy',
    sign: 'v1:34:site.b62d3cf56414758a8a11ec9af534ac54810f3b8241a479ddb796adfd2f3d5e4c',
    loader: 'https://cdn-ru.bitrix24.ru/b34096010/crm/form/loader_34.js',
  },
  offer: {
    id: 'click/32/4f3aqv',
    sign: 'v1:32:site.c577bd14f46dc9347764b334876e31ee1a0f5b85b9a59ee59ba2257acee226d6',
    loader: 'https://cdn-ru.bitrix24.ru/b34096010/crm/form/loader_32.js',
  },
  roadmap: {
    id: 'click/30/vkhnin',
    sign: 'v1:30:site.890147be3447dce8b7bf7cca394c2eaf0614b43858fc0fb55ffda036f202bb22',
    loader: 'https://cdn-ru.bitrix24.ru/b34096010/crm/form/loader_30.js',
  },
  placement: {
    id: 'click/24/n783uf',
    sign: 'v1:24:site.3b4e323fab4e65c363e6c71df8d2d6f8700bc8ae8a6372e7c238a5a4bfa10e8d',
    loader: 'https://cdn-ru.bitrix24.ru/b34096010/crm/form/loader_24.js',
  },
  plan: {
    id: 'click/42/fimzn2',
    sign: 'v1:42:site.5b6cde07e6b6d5d39ec8f8e31d5cf98f0837300e11d3f92596443124f1590157',
    loader: 'https://cdn-ru.bitrix24.ru/b34096010/crm/form/loader_42.js',
  },
  planGarageInline: {
    id: 'inline/26/s0inop',
    sign: 'v1:26:direct_link.f82970317622e209a692cc371fc89979c232196d87a2d6ebc5343ea30bb73592',
    loader: 'https://cdn-ru.bitrix24.ru/b34096010/crm/form/loader_26.js',
  },
  plot: {
    id: 'click/44/ochpio',
    sign: 'v1:44:site.6938e96e2cfec8ba88a2524a838c6197db21304c4cba243ee55a0e9ced2b01c1',
    loader: 'https://cdn-ru.bitrix24.ru/b34096010/crm/form/loader_44.js',
  },
  estimateInline: {
    id: 'inline/50/0xfj5g',
    sign: 'v1:50:site.a18d848e12aec447604a19ea45efef2556b61737090d5309c65429d4323df164',
    loader: 'https://cdn-ru.bitrix24.ru/b34096010/crm/form/loader_50.js',
  },
};

export const B24_BY_ID: Record<string, B24Form> = Object.fromEntries(
  Object.values(B24_FORMS).map((form) => [form.id, form]),
);
