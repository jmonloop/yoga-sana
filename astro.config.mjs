import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yogasana.es',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
});
