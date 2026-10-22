import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Миграция HTML → Astro (CR-2026-001).
// compressHTML: false обязателен для механического порта — дефолт v7 'jsx'
// режет пробелы/переносы вокруг элементов, выход должен быть близок к исходнику.
// site берётся из env: прод https://mm-prom.ru, staging — ASTRO_SITE.
export default defineConfig({
  site: process.env.ASTRO_SITE || 'https://mm-prom.ru',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  compressHTML: false,
  prefetch: true,
  integrations: [sitemap()],
});
