import { describe, expect, it } from 'vitest';
import { actividadCta, actividadesDe, enlacesDe, ETIQUETA_EMPRESAS } from './actividad';
import { SNAPSHOT } from '../data/snapshot';
import { CTAS } from '../data/site';
import type { Actividad } from '../data/sheet';

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

const LISTA: Actividad[] = [
  actividad({ nombre: 'Yoga Relajante', grupo: 'yoga', orden: 5 }),
  actividad({ nombre: 'Breathwork', grupo: 'taller', orden: 2 }),
  actividad({ nombre: 'Hatha Yoga', grupo: 'yoga', orden: 1 }),
  actividad({ nombre: 'Retiro de fin de semana', grupo: 'otras', orden: 1 }),
  actividad({ nombre: 'Yoga Suave', grupo: 'yoga', orden: 3 }),
];

describe('actividadesDe', () => {
  it('keeps only the wanted group and orders it by orden', () => {
    const nombres = actividadesDe(LISTA, 'yoga').map((item) => item.nombre);

    expect(nombres).toEqual(['Hatha Yoga', 'Yoga Suave', 'Yoga Relajante']);
  });

  it('keeps the Sheet order when two rows share the same orden', () => {
    const empatadas = [
      actividad({ nombre: 'Yoga B', orden: 2 }),
      actividad({ nombre: 'Yoga A', orden: 2 }),
      actividad({ nombre: 'Yoga C', orden: 1 }),
    ];

    expect(actividadesDe(empatadas, 'yoga').map((item) => item.nombre)).toEqual([
      'Yoga C',
      'Yoga B',
      'Yoga A',
    ]);
  });

  it('surfaces the rows routed to the otras fallback bucket', () => {
    expect(actividadesDe(LISTA, 'otras').map((item) => item.nombre)).toEqual([
      'Retiro de fin de semana',
    ]);
  });

  it('returns an empty list rather than throwing when the group has no rows', () => {
    expect(actividadesDe([], 'taller')).toEqual([]);
  });

  it('leaves the list it was given untouched', () => {
    const original = [...LISTA];

    actividadesDe(LISTA, 'yoga');

    expect(LISTA).toEqual(original);
  });
});

describe('enlacesDe', () => {
  const sanergia = { href: '/sanergia', texto: 'Saber más sobre Sanergía' };

  it('resolves the link for the activity it names and nothing else', () => {
    const lista = [actividad({ nombre: 'Sanergía' }), actividad({ nombre: 'Breathwork' })];

    const enlaces = enlacesDe(lista, { Sanergía: sanergia });

    expect(enlaces['Sanergía']).toEqual(sanergia);
    expect(enlaces['Breathwork']).toBeUndefined();
  });

  it('accepts an empty map without touching the activities', () => {
    expect(enlacesDe(LISTA, {})).toEqual({});
  });

  it('throws when a key matches no activity, so a rename cannot silently drop the link', () => {
    const lista = [actividad({ nombre: 'Sanergia' })];

    expect(() => enlacesDe(lista, { Sanergía: sanergia })).toThrow(/Sanergía/);
  });

  it('throws when the activity exists but is not in the list being rendered', () => {
    expect(() => enlacesDe([], { Sanergía: sanergia })).toThrow(/ninguna actividad/);
  });
});

describe('actividadCta', () => {
  it('asks a yoga class for horarios y precios', () => {
    expect(actividadCta(actividad({ nombre: 'Yoga Suave' })).message).toBe(
      '¡Hola Natalia! Me interesa Yoga Suave. ¿Me cuentas horarios y precios?',
    );
  });

  it('asks a taller when the next one happens', () => {
    const taller = actividad({ nombre: 'Breathwork', grupo: 'taller' });

    expect(actividadCta(taller).message).toBe(
      '¡Hola Natalia! Me interesa el taller de Breathwork. ¿Cuándo es el próximo?',
    );
  });

  it('falls back to the class message for a row in the otras bucket', () => {
    const otra = actividad({ nombre: 'Retiro de fin de semana', grupo: 'otras' });

    expect(actividadCta(otra).message).toBe(
      '¡Hola Natalia! Me interesa Retiro de fin de semana. ¿Me cuentas horarios y precios?',
    );
  });

  it('lets the mensaje_wa column override the generated message', () => {
    const override = actividad({ mensajeWa: '¡Hola Natalia! Escribo por lo de siempre.' });

    expect(actividadCta(override).message).toBe('¡Hola Natalia! Escribo por lo de siempre.');
  });

  it('keeps the label and the accessible name when mensaje_wa overrides the message', () => {
    const override = actividad({ nombre: 'Yoga Suave', mensajeWa: 'Otro mensaje' });

    expect(actividadCta(override)).toMatchObject({
      label: 'Me interesa',
      ariaSuffix: 'escribir por WhatsApp sobre Yoga Suave: horarios y precios',
    });
  });

  it('sends the PARA EMPRESAS badge to the bienestar para equipos CTA', () => {
    const empresas = actividad({
      nombre: 'Gestión Emocional',
      grupo: 'taller',
      etiqueta: ETIQUETA_EMPRESAS,
    });

    expect(actividadCta(empresas)).toEqual({
      message: CTAS.empresas.message,
      label: CTAS.empresas.label,
      ariaSuffix:
        'escribir por WhatsApp sobre Gestión Emocional, el programa de bienestar emocional para equipos',
    });
  });

  it('reads the PARA EMPRESAS badge tolerantly of case and padding', () => {
    const empresas = actividad({ grupo: 'taller', etiqueta: '  para Empresas ' });

    expect(actividadCta(empresas).message).toBe(CTAS.empresas.message);
  });

  it('still lets mensaje_wa override the PARA EMPRESAS message', () => {
    const empresas = actividad({ etiqueta: ETIQUETA_EMPRESAS, mensajeWa: 'Mensaje de la Sheet' });

    expect(actividadCta(empresas)).toMatchObject({
      message: 'Mensaje de la Sheet',
      label: CTAS.empresas.label,
    });
  });

  it('ignores a whitespace-only mensaje_wa rather than sending a blank message', () => {
    const enBlanco = actividad({ nombre: 'Yoga Suave', mensajeWa: '   ' });

    expect(actividadCta(enBlanco).message).toBe(
      '¡Hola Natalia! Me interesa Yoga Suave. ¿Me cuentas horarios y precios?',
    );
  });

  it('treats every other badge as free text with no effect on the message', () => {
    const mensual = actividad({
      nombre: 'Baño de Cuencos',
      grupo: 'taller',
      etiqueta: 'TALLERES 1 VEZ AL MES',
    });

    expect(actividadCta(mensual).message).toBe(
      '¡Hola Natalia! Me interesa el taller de Baño de Cuencos. ¿Cuándo es el próximo?',
    );
  });

  it('names the activity in the aria suffix of every branch', () => {
    const nombre = 'Yoga para Niños';

    expect(actividadCta(actividad({ nombre })).ariaSuffix).toContain(nombre);
    expect(actividadCta(actividad({ nombre, grupo: 'taller' })).ariaSuffix).toContain(nombre);
    expect(
      actividadCta(actividad({ nombre, etiqueta: ETIQUETA_EMPRESAS })).ariaSuffix,
    ).toContain(nombre);
  });
});

describe('the committed snapshot', () => {
  it('has yoga classes to render and a usable CTA for every activity', () => {
    expect(actividadesDe(SNAPSHOT.actividades, 'yoga').length).toBeGreaterThan(0);
    for (const item of SNAPSHOT.actividades) {
      expect(actividadCta(item).message.trim()).not.toBe('');
    }
  });
});
