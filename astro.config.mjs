import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
export default defineConfig({
  site: process.env.SITE_URL || 'https://wenbu.genedai.me',
  output: 'static',
  trailingSlash: 'always',
  integrations: [react()],
  build: { inlineStylesheets: 'never' },
  vite: { build: { sourcemap: false } },
});
