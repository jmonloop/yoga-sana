import type { Actividad } from './sheet';
import {
  CALLE,
  CODIGO_POSTAL,
  COORDENADAS,
  GOOGLE_MAPS_URL,
  HORARIO_APERTURA,
  INSTAGRAM_URL,
  LOCALIDAD,
  NOMBRE_GOOGLE,
  PROVINCIA,
  TITULAR,
  WHATSAPP_NUMBER,
} from './site';
import type { Pregunta } from './talleres';

export type Nodo = { [clave: string]: string | number | string[] | Nodo | Nodo[] };

export interface Servicio {
  nombre: string;
  descripcion: string;
  ruta: string;
  online: boolean;
}

export interface Tramo {
  nombre: string;
  ruta: string;
}

const DIAS_SEMANA = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const CATARROJA: Nodo = { '@type': 'City', name: LOCALIDAD };
const ESPANA: Nodo = { '@type': 'Country', name: 'España' };

function idNegocio(origen: string): string {
  return `${origen}#negocio`;
}

function idPersona(origen: string): string {
  return `${origen}#natalia`;
}

function referencia(id: string): Nodo {
  return { '@id': id };
}

export function grafoJsonLd(nodos: Nodo[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodos });
}

export function negocio(origen: string, actividades: Actividad[]): Nodo {
  return {
    '@type': ['LocalBusiness', 'HealthAndBeautyBusiness'],
    '@id': idNegocio(origen),
    name: 'Yoga Sana',
    alternateName: NOMBRE_GOOGLE,
    description:
      'Centro de yoga en Catarroja (València): clases de yoga, talleres de breathwork, rebirthing, constelaciones familiares, baño de cuencos, Sanergía y sesiones individuales, presenciales u online.',
    url: origen,
    telephone: `+${WHATSAPP_NUMBER}`,
    address: direccion(),
    geo: coordenadas(),
    hasMap: GOOGLE_MAPS_URL,
    openingHoursSpecification: horario(),
    areaServed: [CATARROJA, { '@type': 'City', name: PROVINCIA }, ESPANA],
    founder: referencia(idPersona(origen)),
    sameAs: [INSTAGRAM_URL, GOOGLE_MAPS_URL],
    hasOfferCatalog: catalogo(actividades),
  };
}

function direccion(): Nodo {
  return {
    '@type': 'PostalAddress',
    streetAddress: CALLE,
    postalCode: CODIGO_POSTAL,
    addressLocality: LOCALIDAD,
    addressRegion: PROVINCIA,
    addressCountry: 'ES',
  };
}

function coordenadas(): Nodo {
  return {
    '@type': 'GeoCoordinates',
    latitude: COORDENADAS.latitud,
    longitude: COORDENADAS.longitud,
  };
}

function horario(): Nodo {
  return {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: DIAS_SEMANA,
    opens: HORARIO_APERTURA.desde,
    closes: HORARIO_APERTURA.hasta,
  };
}

function catalogo(actividades: Actividad[]): Nodo {
  return {
    '@type': 'OfferCatalog',
    name: 'Clases, talleres y sesiones',
    itemListElement: actividades.map(oferta),
  };
}

function oferta({ nombre, descripcion }: Actividad): Nodo {
  const ofrecido: Nodo = { '@type': 'Service', name: nombre };
  return {
    '@type': 'Offer',
    itemOffered: descripcion ? { ...ofrecido, description: descripcion } : ofrecido,
  };
}

export function persona(origen: string): Nodo {
  return {
    '@type': 'Person',
    '@id': idPersona(origen),
    name: TITULAR,
    givenName: 'Natalia',
    jobTitle: 'Profesora de yoga',
    url: new URL('/sobre-mi', origen).href,
    worksFor: referencia(idNegocio(origen)),
    address: { '@type': 'PostalAddress', addressLocality: 'Catarroja', addressCountry: 'ES' },
  };
}

export function servicio(origen: string, datos: Servicio): Nodo {
  return {
    '@type': 'Service',
    name: datos.nombre,
    description: datos.descripcion,
    url: new URL(datos.ruta, origen).href,
    provider: referencia(idNegocio(origen)),
    areaServed: datos.online ? [CATARROJA, ESPANA] : [CATARROJA],
    availableChannel: canales(origen, datos.online),
  };
}

function canales(origen: string, online: boolean): Nodo[] {
  const presencial: Nodo = { '@type': 'ServiceChannel', name: 'Presencial en Catarroja' };
  const enLinea: Nodo = { '@type': 'ServiceChannel', name: 'Online', serviceUrl: origen };
  return online ? [presencial, enLinea] : [presencial];
}

export function preguntasFrecuentes(preguntas: Pregunta[]): Nodo {
  return {
    '@type': 'FAQPage',
    mainEntity: preguntas.map(({ pregunta, respuesta }) => ({
      '@type': 'Question',
      name: pregunta,
      acceptedAnswer: { '@type': 'Answer', text: respuesta },
    })),
  };
}

export function migas(origen: string, tramos: Tramo[]): Nodo {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: tramos.map(({ nombre, ruta }, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: nombre,
      item: new URL(ruta, origen).href,
    })),
  };
}
