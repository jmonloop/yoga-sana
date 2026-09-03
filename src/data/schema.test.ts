import { describe, expect, it } from 'vitest';
import { grafoJsonLd, migas, negocio, persona, preguntasFrecuentes, servicio } from './schema';
import type { Actividad } from './sheet';

const ORIGEN = 'https://yogasana.es/';

function actividad(overrides: Partial<Actividad> = {}): Actividad {
  return {
    nombre: 'Hatha Yoga',
    grupo: 'yoga',
    descripcion: 'Equilibrio entre fuerza, flexibilidad y respiración.',
    etiqueta: '',
    icono: 'hatha',
    orden: 1,
    color: null,
    mensajeWa: null,
    ...overrides,
  };
}

describe('grafoJsonLd', () => {
  it('wraps the nodes in a schema.org graph', () => {
    const json = JSON.parse(grafoJsonLd([{ '@type': 'Thing' }]));

    expect(json).toEqual({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Thing' }] });
  });
});

describe('negocio', () => {
  it('describes the studio as a local business in Catarroja with the WhatsApp number', () => {
    const nodo = negocio(ORIGEN, []);

    expect(nodo['@type']).toEqual(['LocalBusiness', 'HealthAndBeautyBusiness']);
    expect(nodo['@id']).toBe('https://yogasana.es/#negocio');
    expect(nodo.telephone).toBe('+34677808098');
    expect(nodo.address).toEqual(
      expect.objectContaining({ addressLocality: 'Catarroja', postalCode: '46470' }),
    );
  });

  it('lists every Sheet activity as an offered service', () => {
    const nodo = negocio(ORIGEN, [actividad(), actividad({ nombre: 'Breathwork' })]);

    expect(nodo.hasOfferCatalog).toEqual(
      expect.objectContaining({
        itemListElement: [
          expect.objectContaining({
            itemOffered: expect.objectContaining({ name: 'Hatha Yoga' }),
          }),
          expect.objectContaining({
            itemOffered: expect.objectContaining({ name: 'Breathwork' }),
          }),
        ],
      }),
    );
  });

  it('carries the coordinates, map and opening hours of the Google Business Profile', () => {
    const nodo = negocio(ORIGEN, []);

    expect(nodo.geo).toEqual({
      '@type': 'GeoCoordinates',
      latitude: 39.4043685,
      longitude: -0.4048543,
    });
    expect(nodo.hasMap).toBe('https://maps.google.com/?cid=14038268165342406311');
    expect(nodo.openingHoursSpecification).toEqual(
      expect.objectContaining({ opens: '09:00', closes: '21:30' }),
    );
  });

  it('lists the Google profile and Instagram as the same entity, which is what sameAs is for', () => {
    expect(negocio(ORIGEN, []).sameAs).toEqual([
      'https://www.instagram.com/yoga_sanacatarroja/',
      'https://maps.google.com/?cid=14038268165342406311',
    ]);
  });

  it('answers to the name the Google profile uses as well as the brand name', () => {
    const nodo = negocio(ORIGEN, []);

    expect(nodo.name).toBe('Yoga Sana');
    expect(nodo.alternateName).toBe('YOGA SANA CATARROJA');
  });

  it('spells the street the way the Google profile does, so the listings agree', () => {
    expect(negocio(ORIGEN, []).address).toEqual(
      expect.objectContaining({ streetAddress: 'Carrer Sant Antoni, 40' }),
    );
  });

  it('leaves out the description of an activity the Sheet has not described yet', () => {
    const nodo = negocio(ORIGEN, [actividad({ nombre: 'Movimiento Somático', descripcion: '' })]);

    expect(nodo.hasOfferCatalog).toEqual(
      expect.objectContaining({
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Movimiento Somático' },
          },
        ],
      }),
    );
  });

  it('points the founder at the same id the persona node uses', () => {
    expect(negocio(ORIGEN, []).founder).toEqual({ '@id': persona(ORIGEN)['@id'] });
  });
});

describe('servicio', () => {
  it('serves only Catarroja when the taller is presencial', () => {
    const nodo = servicio(ORIGEN, {
      nombre: 'Baño de Cuencos',
      descripcion: 'Relajación con sonido.',
      ruta: '/talleres/bano-de-cuencos',
      online: false,
    });

    expect(nodo.areaServed).toEqual([{ '@type': 'City', name: 'Catarroja' }]);
    expect(nodo.availableChannel).toHaveLength(1);
    expect(nodo.url).toBe('https://yogasana.es/talleres/bano-de-cuencos');
  });

  it('adds España and an online channel when the taller is available online', () => {
    const nodo = servicio(ORIGEN, {
      nombre: 'Breathwork',
      descripcion: 'Respiración consciente.',
      ruta: '/talleres/breathwork',
      online: true,
    });

    expect(nodo.areaServed).toEqual([
      { '@type': 'City', name: 'Catarroja' },
      { '@type': 'Country', name: 'España' },
    ]);
    expect(nodo.availableChannel).toHaveLength(2);
  });
});

describe('preguntasFrecuentes', () => {
  it('turns each question into a Question with an accepted Answer', () => {
    const nodo = preguntasFrecuentes([{ pregunta: '¿Online?', respuesta: 'Sí.' }]);

    expect(nodo).toEqual({
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Online?',
          acceptedAnswer: { '@type': 'Answer', text: 'Sí.' },
        },
      ],
    });
  });
});

describe('migas', () => {
  it('numbers the trail from one and resolves each route against the origin', () => {
    const nodo = migas(ORIGEN, [
      { nombre: 'Inicio', ruta: '/' },
      { nombre: 'Breathwork', ruta: '/talleres/breathwork' },
    ]);

    expect(nodo.itemListElement).toEqual([
      expect.objectContaining({ position: 1, item: 'https://yogasana.es/' }),
      expect.objectContaining({ position: 2, item: 'https://yogasana.es/talleres/breathwork' }),
    ]);
  });
});
