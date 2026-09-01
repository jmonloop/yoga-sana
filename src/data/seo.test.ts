import { describe, expect, it } from 'vitest';
import { origenDe, robotsTxt, rutasDe, sitemapXml } from './seo';

const ORIGEN = 'https://yogasana.es/';

describe('rutasDe', () => {
  it('turns index into the site root', () => {
    expect(rutasDe(['./index.astro'])).toEqual(['/']);
  });

  it('turns a page file into its path', () => {
    expect(rutasDe(['./sobre-mi.astro'])).toEqual(['/sobre-mi']);
  });

  it('keeps nested pages under their folder', () => {
    expect(rutasDe(['./legal/aviso.astro'])).toEqual(['/legal/aviso']);
  });

  it('sorts the paths so the sitemap is stable', () => {
    expect(rutasDe(['./online.astro', './index.astro', './aviso-legal.astro'])).toEqual([
      '/',
      '/aviso-legal',
      '/online',
    ]);
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
    const xml = sitemapXml(ORIGEN, ['/', '/online', '/privacidad']);
    expect(xml.match(/<url>/g)).toHaveLength(3);
  });
});

describe('robotsTxt', () => {
  it('allows every crawler and points at the sitemap', () => {
    expect(robotsTxt(ORIGEN)).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://yogasana.es/sitemap.xml\n',
    );
  });
});
