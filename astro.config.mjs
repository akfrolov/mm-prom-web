import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Миграция HTML → Astro (CR-2026-001).
// compressHTML: false обязателен для механического порта — дефолт v7 'jsx'
// режет пробелы/переносы вокруг элементов, выход должен быть близок к исходнику.
// site берётся из env: прод https://mm-prom.ru, staging — ASTRO_SITE.
// Шрифты self-host через Astro Fonts API: файлы скачиваются на билде и
// отдаются с домена сайта (никаких запросов к fonts.googleapis/gstatic).
export default defineConfig({
  site: process.env.ASTRO_SITE || 'https://mm-prom.ru',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  compressHTML: false,
  prefetch: true,
  integrations: [sitemap()],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Manrope',
      cssVariable: '--font-manrope',
      weights: [400, 500, 600, 700, 800],
      styles: ['normal'],
      subsets: ['cyrillic', 'latin'],
    },
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [400, 500, 600, 700, 800],
      styles: ['normal'],
      subsets: ['cyrillic', 'latin'],
    },
  ],
});
