import type { APIRoute } from 'astro';
import { origenDe, robotsTxt } from '../data/seo';

export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt(origenDe(site)), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
