export function rutasDe(archivos: string[]): string[] {
  return archivos
    .map((archivo) => archivo.replace(/^\.\//, '').replace(/\.astro$/, ''))
    .map((slug) => (slug === 'index' ? '/' : `/${slug}`))
    .sort();
}

export function origenDe(site: URL | undefined): string {
  if (!site) {
    throw new Error('Falta `site` en astro.config.mjs: sin él no hay URLs absolutas.');
  }
  return site.href;
}

export function sitemapXml(origen: string, rutas: string[]): string {
  const urls = rutas.map((ruta) => `  <url><loc>${new URL(ruta, origen).href}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

export function robotsTxt(origen: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('/sitemap.xml', origen).href}`,
    '',
  ].join('\n');
}
