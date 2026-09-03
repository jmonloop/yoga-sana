import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { origenDe, robotsTxt, RUTAS, rutasDelSitio, sitemapXml } from './seo';
import { paginasDeTalleres } from './talleres';
import { SNAPSHOT } from './snapshot';

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

  it('leaves the dynamic taller pages to rutasDelSitio, so only that folder may exist', () => {
    const carpetas = readdirSync('src/pages', { withFileTypes: true })
      .filter((entrada) => entrada.isDirectory())
      .map((entrada) => entrada.name);
    expect(carpetas).toEqual(['talleres']);
  });
});

describe('rutasDelSitio', () => {
  it('appends one route per taller page after the static ones', () => {
    const paginas = paginasDeTalleres(SNAPSHOT.actividades);
    const rutas = rutasDelSitio(paginas);
    expect(rutas.slice(0, RUTAS.length)).toEqual(RUTAS);
    expect(rutas.slice(RUTAS.length)).toEqual(paginas.map(({ ruta }) => ruta));
  });

  it('returns only the static routes when the Sheet has no taller with copy', () => {
    expect(rutasDelSitio([])).toEqual(RUTAS);
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
