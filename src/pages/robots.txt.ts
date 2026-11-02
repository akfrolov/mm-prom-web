import type { APIRoute } from 'astro';

// Прод-сборка: со строкой Sitemap; staging (MMPROM_ENV=staging): без неё.
// Хост sitemap берётся из `site` сборки (ASTRO_SITE), без хвостового слэша.
export const GET: APIRoute = ({ site }) => {
  const isProd = process.env.MMPROM_ENV !== 'staging';
  const origin = (site?.origin || 'https://mm-prom.ru').replace(/\/+$/, '');
  const body = isProd
    ? `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap-index.xml\n`
    : 'User-agent: *\nAllow: /\n';
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
