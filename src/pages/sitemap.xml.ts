import type { APIRoute } from 'astro';
import { origenDe, rutasDelSitio, sitemapXml } from '../data/seo';
import { SNAPSHOT } from '../data/snapshot';
import { paginasDeTalleres } from '../data/talleres';

export const GET: APIRoute = ({ site }) =>
  new Response(sitemapXml(origenDe(site), rutasDelSitio(paginasDeTalleres(SNAPSHOT.actividades))), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
