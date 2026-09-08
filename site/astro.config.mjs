import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://vicebery.github.io',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  i18n: {
    locales: [
      { path: 'zh-cn', codes: ['zh', 'zh-CN', 'zh-Hans'] },
      { path: 'en', codes: ['en', 'en-US', 'en-GB'] },
    ],
    defaultLocale: 'zh-cn',
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
