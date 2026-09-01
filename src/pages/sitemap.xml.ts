import type { APIRoute } from 'astro';
import { origenDe, rutasDe, sitemapXml } from '../data/seo';

const PAGINAS = Object.keys(import.meta.glob('./**/*.astro'));

export const GET: APIRoute = ({ site }) =>
  new Response(sitemapXml(origenDe(site), rutasDe(PAGINAS)), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
