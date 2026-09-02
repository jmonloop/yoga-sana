import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { origenDe, robotsTxt, RUTAS, sitemapXml } from './seo';

const ORIGEN = 'https://yogasana.es/';

const rutaDe = (archivo: string): string =>
  archivo === 'index.astro' ? '/' : `/${archivo.replace('.astro', '')}`;

describe('RUTAS', () => {
  it('lists exactly the pages that exist in src/pages', () => {
    const paginas = readdirSync('src/pages')
      .filter((archivo) => archivo.endsWith('.astro'))
      .map(rutaDe);
    expect([...RUTAS].sort()).toEqual(paginas.sort());
  });

  it('fails when a page shape appears that a literal list cannot describe', () => {
    const raras = readdirSync('src/pages', { withFileTypes: true })
      .filter((entrada) => entrada.isDirectory() || /^_|\[/.test(entrada.name))
      .map((entrada) => entrada.name);
    expect(raras).toEqual([]);
  });
});

describe('origenDe', () => {
  it('reads the origin from the configured site', () => {
    expect(origenDe(new URL(ORIGEN))).toBe(ORIGEN);
  });

  it('fails loudly when site is not configured', () => {
    expect(() => origenDe(undefined)).toThrow(/astro.config/);
  });
});

describe('sitemapXml', () => {
  it('lists every path as an absolute URL', () => {
    const xml = sitemapXml(ORIGEN, ['/', '/sobre-mi']);
    expect(xml).toContain('<loc>https://yogasana.es/</loc>');
    expect(xml).toContain('<loc>https://yogasana.es/sobre-mi</loc>');
  });

  it('wraps the urls in a valid urlset', () => {
    const xml = sitemapXml(ORIGEN, ['/']);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset ')).toBe(true);
    expect(xml.endsWith('</urlset>\n')).toBe(true);
  });

  it('emits one url element per path', () => {
    const xml = sitemapXml(ORIGEN, [...RUTAS]);
    expect(xml.match(/<url>/g)).toHaveLength(RUTAS.length);
  });
});

describe('robotsTxt', () => {
  it('allows every crawler and points at the sitemap', () => {
    expect(robotsTxt(ORIGEN)).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://yogasana.es/sitemap.xml\n',
    );
  });
});
