import type { APIRoute } from 'astro';

// Прод-сборка: со строкой Sitemap; staging (MMPROM_ENV=staging): без неё.
export const GET: APIRoute = () => {
  const isProd = process.env.MMPROM_ENV !== 'staging';
  const site = import.meta.env.SITE || 'https://mm-prom.ru';
  const body = isProd
    ? `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap-index.xml\n`
    : 'User-agent: *\nAllow: /\n';
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
