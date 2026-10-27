// Общие помощники раздела «Публикации» (/blog/, /blog/<slug>/).
// Формат даты и формула времени чтения едины для списка и страницы статьи
// (SPEC articles, §2.4 п. 4 и §2.5 п. 10).

// Рубрики раздела «Публикации». id совпадает со значением поля category
// в коллекции articles; порядок — как в макете docs/mockups/blog.html.
export const ARTICLE_CATEGORIES = [
  { id: 'all', label: 'Все материалы' },
  { id: 'cases', label: 'Кейсы проектов' },
  { id: 'analytics', label: 'Аналитика рынка' },
  { id: 'guides', label: 'Гайды и инструкции' },
  { id: 'news', label: 'Новости компании' },
] as const;

export type ArticleCategory = Exclude<(typeof ARTICLE_CATEGORIES)[number]['id'], 'all'>;

/** id рубрики → подпись для карточки и страницы статьи. */
export function articleCategoryLabel(id: ArticleCategory): string {
  return ARTICLE_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

/** ISO-дата → «14 июля 2026» (день без ведущего нуля). */
export function formatArticleDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Время чтения по объёму тела: max(1, ceil(слов / 200)). */
export function readingMinutes(body: string | undefined): number {
  const plain = (body ?? '').replace(/[#*_>`~\-]/g, ' ');
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
