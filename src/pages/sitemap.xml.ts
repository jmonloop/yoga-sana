import type { APIRoute } from 'astro';
import { origenDe, RUTAS, sitemapXml } from '../data/seo';

export const GET: APIRoute = ({ site }) =>
  new Response(sitemapXml(origenDe(site), RUTAS), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
