import { describe, expect, it } from 'vitest';
import type { Actividad } from './sheet';
import { SNAPSHOT } from './snapshot';
import {
  COPIAS,
  enlacesPara,
  paginasDeTalleres,
  slugDe,
  talleresOnline,
  tituloDe,
} from './talleres';

function actividad(overrides: Partial<Actividad> = {}): Actividad {
  return {
    nombre: 'Breathwork',
    grupo: 'taller',
    descripcion: 'Talleres de respiración consciente.',
    etiqueta: '',
    icono: 'pulmones',
    orden: 1,
    color: null,
    mensajeWa: null,
    ...overrides,
  };
}

describe('slugDe', () => {
  it('lowercases, strips accents and joins words with hyphens', () => {
    expect(slugDe('Baño de Cuencos')).toBe('bano-de-cuencos');
    expect(slugDe('Gestión Emocional')).toBe('gestion-emocional');
  });

  it('drops punctuation and never leaves a leading or trailing hyphen', () => {
    expect(slugDe('  ¡Rebirthing, consciente!  ')).toBe('rebirthing-consciente');
  });
});

describe('paginasDeTalleres', () => {
  it('builds a page under /talleres for every activity that has copy', () => {
    const lista = [actividad({ nombre: 'Breathwork' }), actividad({ nombre: 'Baño de Cuencos' })];

    const rutas = paginasDeTalleres(lista).map(({ ruta }) => ruta);

    expect(rutas).toEqual(['/talleres/breathwork', '/talleres/bano-de-cuencos']);
  });

  it('skips activities the Sheet adds that have no copy yet, so the build never breaks', () => {
    const lista = [actividad({ nombre: 'Retiro de otoño' })];

    expect(paginasDeTalleres(lista)).toEqual([]);
  });

  it('keeps the Sheet row on the page so name, description and label stay owner-editable', () => {
    const fila = actividad({ nombre: 'Breathwork', etiqueta: 'TALLERES 1 VEZ AL MES' });

    const [pagina] = paginasDeTalleres([fila]);

    expect(pagina?.actividad).toBe(fila);
    expect(pagina?.copia).toBe(COPIAS['breathwork']);
  });

  it('finds copy for every taller and otras row in the current snapshot except the ones with their own page', () => {
    const sinPagina = SNAPSHOT.actividades
      .filter(({ grupo }) => grupo !== 'yoga')
      .filter(({ nombre }) => !(slugDe(nombre) in COPIAS))
      .map(({ nombre }) => nombre);

    expect(sinPagina.toSorted()).toEqual(['Movimiento Somático', 'Sanergía']);
  });
});

describe('enlacesPara', () => {
  const sanergia = actividad({ nombre: 'Sanergía', grupo: 'otras' });

  it('links a taller to its generated page', () => {
    const lista = [actividad({ nombre: 'Breathwork' })];

    const enlaces = enlacesPara(lista, paginasDeTalleres(lista));

    expect(enlaces['Breathwork']).toEqual({
      href: '/talleres/breathwork',
      texto: 'Saber más sobre Breathwork',
    });
  });

  it('links Sanergía to its hand-written page whichever group the Sheet puts it in', () => {
    const enlaces = enlacesPara([sanergia], []);

    expect(enlaces['Sanergía']?.href).toBe('/sanergia');
  });

  it('returns no link for an activity that has no page', () => {
    const lista = [actividad({ nombre: 'Retiro de otoño' })];

    expect(enlacesPara(lista, [])).toEqual({});
  });

  it('only links activities that are actually going to be shown', () => {
    const enlaces = enlacesPara([sanergia], paginasDeTalleres([actividad()]));

    expect(Object.keys(enlaces)).toEqual(['Sanergía']);
  });
});

describe('talleresOnline', () => {
  it('keeps only the pages whose copy says the taller is available online', () => {
    const lista = [actividad({ nombre: 'Breathwork' }), actividad({ nombre: 'Baño de Cuencos' })];

    const nombres = talleresOnline(paginasDeTalleres(lista)).map(({ actividad }) => actividad.nombre);

    expect(nombres).toEqual(['Breathwork']);
  });
});

describe('tituloDe', () => {
  it('appends the province and the brand to the page heading', () => {
    expect(tituloDe(COPIAS['breathwork'])).toBe('Breathwork en Catarroja (València) — Yoga Sana');
  });
});

describe('COPIAS', () => {
  it('keys every entry by its own slug', () => {
    const claves = Object.keys(COPIAS);

    expect(claves.map(slugDe)).toEqual(claves);
  });

  it('names Catarroja in every heading and description, which is what the pages exist for', () => {
    const sinCatarroja = Object.values(COPIAS).filter(
      ({ titulo, descripcion }) => !titulo.includes('Catarroja') || !descripcion.includes('Catarroja'),
    );

    expect(sinCatarroja).toEqual([]);
  });

  it('gives every page at least three questions for the FAQ block', () => {
    const cortas = Object.entries(COPIAS)
      .filter(([, copia]) => copia.preguntas.length < 3)
      .map(([slug]) => slug);

    expect(cortas).toEqual([]);
  });
});
