import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SNAPSHOT } from './snapshot';
import {
  DEFAULT_ICONO,
  isUsableSnapshot,
  parseActividades,
  parseAjustes,
  parseHorarios,
  PALETTE,
  parseSnapshot,
  resolveColor,
  type Snapshot,
} from './sheet';

function seed(tab: string): string {
  return readFileSync(new URL(`../../seed/${tab}.csv`, import.meta.url), 'utf8');
}

const SEED: Snapshot = parseSnapshot({
  actividades: seed('actividades'),
  horarios: seed('horarios'),
  ajustes: seed('ajustes'),
})!;

function actividades(csv: string) {
  return parseActividades(csv)!;
}

function horarios(csv: string) {
  return parseHorarios(csv)!;
}

describe('rule 1 — read by header name, never column index', () => {
  it('reads reordered columns and ignores columns it does not know', () => {
    const [row] = actividades(
      ['grupo,aforo,nombre,descripcion,icono', 'taller,12,Breathwork,Respirar,pulmones'].join('\n'),
    );

    expect(row).toMatchObject({ nombre: 'Breathwork', grupo: 'taller', icono: 'pulmones' });
  });

  it('reads reordered timetable columns', () => {
    const [row] = horarios(['actividad,hora,dia', 'Yoga Suave,11:00,Lunes'].join('\n'));

    expect(row).toMatchObject({ dia: 'Lunes', hora: '11:00', actividad: 'Yoga Suave' });
  });
});

describe('rule 2 — activo hides a row instead of deleting it', () => {
  const csv = [
    'nombre,grupo,descripcion,activo',
    'Sí mayúsculas,yoga,x,SI',
    'Sí acentuado,yoga,x,Sí',
    'Sí minúsculas,yoga,x,si',
    'En blanco,yoga,x,',
    'Con espacios,yoga,x,  SI  ',
    'No mayúsculas,yoga,x,NO',
    'No minúsculas,yoga,x,no',
  ].join('\n');

  it('keeps SI in any casing or accent, and blank', () => {
    expect(actividades(csv).map((item) => item.nombre)).toEqual([
      'Sí mayúsculas',
      'Sí acentuado',
      'Sí minúsculas',
      'En blanco',
      'Con espacios',
    ]);
  });

  it('drops NO in any casing from the timetable too', () => {
    const rows = horarios(
      ['dia,hora,actividad,activo', 'Lunes,9:30,Visible,SI', 'Lunes,10:00,Oculta,no'].join('\n'),
    );

    expect(rows.map((row) => row.actividad)).toEqual(['Visible']);
  });
});

describe('rule 3 — hora parses leniently and displays cleanly', () => {
  const rows = horarios(
    [
      'dia,hora,actividad',
      'Lunes,a convenir,Sin hora',
      'Lunes,20:00,Tarde',
      'Lunes,9:30:00,Con segundos',
      'Lunes,9:30,Mañana',
    ].join('\n'),
  );

  it('orders chronologically and sends unparseable values last', () => {
    expect(rows.map((row) => row.actividad)).toEqual([
      'Con segundos',
      'Mañana',
      'Tarde',
      'Sin hora',
    ]);
  });

  it('strips the seconds Sheets adds so both spellings share one row', () => {
    expect(rows[0]!.hora).toBe('9:30');
    expect(rows[1]!.hora).toBe('9:30');
  });

  it('displays an unparseable hora verbatim', () => {
    expect(rows[3]!.hora).toBe('a convenir');
  });
});

describe('rule 4 — dia matched case- and accent-insensitively', () => {
  const rows = horarios(
    [
      'dia,hora,actividad',
      'Cualquier día,9:30,Desconocido',
      'MIÉRCOLES,9:30,Mayúsculas',
      'miercoles,9:30,Sin acento',
      'Lunes,9:30,Lunes',
    ].join('\n'),
  );

  it('canonicalises every spelling to one column name', () => {
    expect(rows.slice(1, 3).map((row) => row.dia)).toEqual(['Miércoles', 'Miércoles']);
  });

  it('orders by weekday and sends an unknown day last while still rendering it', () => {
    expect(rows.map((row) => row.actividad)).toEqual([
      'Lunes',
      'Mayúsculas',
      'Sin acento',
      'Desconocido',
    ]);
    expect(rows[3]!.dia).toBe('Cualquier día');
  });
});

describe('rule 5 — a timetable class with no activity card still renders', () => {
  it('keeps the entry and gives it an auto-assigned colour', () => {
    const snapshot = parseSnapshot({
      actividades: 'nombre,grupo,descripcion\nHatha Yoga,yoga,x',
      horarios: 'dia,hora,actividad\nViernes,20:00,Meditación guiada',
      ajustes: 'clave,valor\nmes,Septiembre',
    })!;

    expect(snapshot.horarios[0]!.actividad).toBe('Meditación guiada');
    expect(resolveColor('Meditación guiada', snapshot)).toBe('salvia');
  });
});

describe('rule 6 — header normalisation', () => {
  it('accepts accents, padding and mixed case in the header row', () => {
    const rows = horarios(
      [' DÍA , Hora ,ACTIVIDAD, Nota ', 'Lunes,9:30,Yoga Sana,Reserva'].join('\n'),
    );

    expect(rows[0]).toEqual({
      dia: 'Lunes',
      hora: '9:30',
      actividad: 'Yoga Sana',
      nota: 'Reserva',
    });
  });

  it('survives the byte order mark Sheets puts in front of the first header', () => {
    const rows = horarios('\uFEFFdia,hora,actividad\nLunes,9:30,Yoga Sana');

    expect(rows[0]!.dia).toBe('Lunes');
  });
});

describe('rule 7 — a missing required column rejects the whole tab', () => {
  it('rejects actividades without nombre', () => {
    expect(parseActividades('grupo,descripcion\nyoga,x')).toBeNull();
  });

  it('rejects horarios without hora', () => {
    expect(parseHorarios('dia,actividad\nLunes,Yoga Sana')).toBeNull();
  });

  it('rejects ajustes without valor', () => {
    expect(parseAjustes('clave\nmes')).toBeNull();
  });

  it('rejects the whole snapshot when one tab is rejected', () => {
    expect(
      parseSnapshot({
        actividades: 'nombre,grupo,descripcion\nHatha Yoga,yoga,x',
        horarios: 'dia,actividad\nLunes,Yoga Sana',
        ajustes: 'clave,valor\nmes,Septiembre',
      }),
    ).toBeNull();
  });
});

describe('grupo', () => {
  it('routes an unknown grupo to the Otras actividades bucket instead of dropping it', () => {
    const rows = actividades(
      [
        'nombre,grupo,descripcion,orden',
        'Retiro de fin de semana,retiro,x,1',
        'Hatha Yoga,YOGA,x,1',
      ].join('\n'),
    );

    expect(rows.map((row) => [row.nombre, row.grupo])).toEqual([
      ['Hatha Yoga', 'yoga'],
      ['Retiro de fin de semana', 'otras'],
    ]);
  });

  it('sorts by orden inside each group, yoga then taller then otras', () => {
    const rows = actividades(
      [
        'nombre,grupo,descripcion,orden',
        'Taller 2,taller,x,2',
        'Otra,gimnasia,x,1',
        'Yoga 2,yoga,x,2',
        'Taller 1,taller,x,1',
        'Yoga 1,yoga,x,1',
      ].join('\n'),
    );

    expect(rows.map((row) => row.nombre)).toEqual([
      'Yoga 1',
      'Yoga 2',
      'Taller 1',
      'Taller 2',
      'Otra',
    ]);
  });

  it('sends a non-numeric orden to the end of its group', () => {
    const rows = actividades(
      ['nombre,grupo,descripcion,orden', 'Sin orden,yoga,x,', 'Con orden,yoga,x,9'].join('\n'),
    );

    expect(rows.map((row) => row.nombre)).toEqual(['Con orden', 'Sin orden']);
  });
});

describe('icono', () => {
  it('keeps a shipped keyword and falls back to the lotus for blank or unknown', () => {
    const rows = actividades(
      [
        'nombre,grupo,descripcion,icono',
        'Conocido,yoga,x, Hatha ',
        'Vacío,yoga,x,',
        'Inventado,yoga,x,unicornio',
      ].join('\n'),
    );

    expect(rows.map((row) => row.icono)).toEqual(['hatha', DEFAULT_ICONO, DEFAULT_ICONO]);
  });
});

describe('resolveColor', () => {
  const build = (ajustes: string, actividadesCsv: string, horariosCsv: string): Snapshot =>
    parseSnapshot({ actividades: actividadesCsv, horarios: horariosCsv, ajustes })!;

  it('prefers the color.* key in ajustes over the actividades column', () => {
    const snapshot = build(
      'clave,valor\ncolor.Yoga Suave,melocoton',
      'nombre,grupo,descripcion,color\nYoga Suave,yoga,x,lavanda',
      'dia,hora,actividad\nLunes,11:00,Yoga Suave',
    );

    expect(resolveColor('Yoga Suave', snapshot)).toBe('melocoton');
  });

  it('matches the color.* key ignoring case and accents', () => {
    const snapshot = build(
      'clave,valor\ncolor.meditacion guiada,rosa',
      'nombre,grupo,descripcion',
      'dia,hora,actividad\nViernes,20:00,Meditación guiada',
    );

    expect(resolveColor('Meditación guiada', snapshot)).toBe('rosa');
  });

  it('falls back to the color column of the matching activity card', () => {
    const snapshot = build(
      'clave,valor\nmes,Septiembre',
      'nombre,grupo,descripcion,color\nYoga Suave,yoga,x,lavanda',
      'dia,hora,actividad\nLunes,11:00,yoga suave',
    );

    expect(resolveColor('yoga suave', snapshot)).toBe('lavanda');
  });

  it('ignores a colour that is not a palette token and auto-assigns instead', () => {
    const snapshot = build(
      'clave,valor\ncolor.Yoga Suave,turquesa',
      'nombre,grupo,descripcion,color\nYoga Suave,yoga,x,fucsia',
      'dia,hora,actividad\nLunes,11:00,Yoga Suave',
    );

    expect(resolveColor('Yoga Suave', snapshot)).toBe('salvia');
  });

  it('auto-assigns the palette in stable timetable order to unpinned classes', () => {
    const snapshot = build(
      'clave,valor\ncolor.Segunda,rosa',
      'nombre,grupo,descripcion',
      [
        'dia,hora,actividad',
        'Lunes,9:30,Primera',
        'Lunes,10:00,Segunda',
        'Lunes,11:00,Tercera',
        'Martes,9:30,Primera',
      ].join('\n'),
    );

    expect(resolveColor('Primera', snapshot)).toBe('salvia');
    expect(resolveColor('Segunda', snapshot)).toBe('rosa');
    expect(resolveColor('Tercera', snapshot)).toBe('lavanda');
  });
});

describe('the real seed CSVs', () => {
  it('keeps 13 activities, 6 yoga and 7 taller', () => {
    expect(SEED.actividades).toHaveLength(13);
    expect(SEED.actividades.filter((row) => row.grupo === 'yoga')).toHaveLength(6);
    expect(SEED.actividades.filter((row) => row.grupo === 'taller')).toHaveLength(7);
  });

  it('keeps the descriptions and badges verbatim, commas included', () => {
    expect(SEED.actividades[0]).toEqual({
      nombre: 'Hatha Yoga',
      grupo: 'yoga',
      descripcion: 'Equilibrio entre fuerza, flexibilidad y respiración.',
      etiqueta: '',
      icono: 'hatha',
      orden: 1,
      color: null,
      mensajeWa: null,
    });
    expect(SEED.actividades.find((row) => row.nombre === 'Rebirthing Consciente')?.etiqueta).toBe(
      'GRUPO FIJO UN JUEVES CADA 15 DÍAS',
    );
  });

  it('keeps 17 timetable entries over 7 times and 5 days', () => {
    expect(SEED.horarios).toHaveLength(17);
    expect(new Set(SEED.horarios.map((row) => row.hora)).size).toBe(7);
    expect(new Set(SEED.horarios.map((row) => row.dia)).size).toBe(5);
  });

  it('opens on Monday at 9:30 and closes on Friday at 20:00 with its note', () => {
    expect(SEED.horarios[0]).toEqual({
      dia: 'Lunes',
      hora: '9:30',
      actividad: 'Yoga Sana',
      nota: '',
    });
    expect(SEED.horarios.at(-1)).toEqual({
      dia: 'Viernes',
      hora: '20:00',
      actividad: 'Meditación guiada',
      nota: 'Reserva anticipada',
    });
  });

  it('reads the settings, quoted commas included', () => {
    expect(SEED.ajustes['mes']).toBe('Septiembre');
    expect(SEED.ajustes['tagline']).toBe(
      'Tu espacio para respirar, conectar y reconectar contigo',
    );
  });

  it('reproduces the owner Canva colour for every timetable class', () => {
    const colours = new Map(
      SEED.horarios.map((row) => [row.actividad, resolveColor(row.actividad, SEED)]),
    );

    expect(Object.fromEntries(colours)).toEqual({
      'Yoga Sana': 'salvia',
      'Yoga Suave': 'lavanda',
      'Yoga Relajante': 'pizarra',
      'Yoga Infantil': 'melocoton',
      'Meditación guiada': 'rosa',
    });
  });
});

describe('isUsableSnapshot', () => {
  const headerOnly = parseSnapshot({
    actividades: 'nombre,grupo,descripcion',
    horarios: 'dia,hora,actividad',
    ajustes: 'clave,valor',
  })!;

  it('rejects tabs that parse but carry no rows', () => {
    expect(headerOnly).not.toBeNull();
    expect(isUsableSnapshot(headerOnly)).toBe(false);
  });

  it('rejects a Sheet whose every row was switched off with activo NO', () => {
    const allHidden = parseSnapshot({
      actividades: 'nombre,grupo,descripcion,activo\nHatha Yoga,yoga,x,NO',
      horarios: 'dia,hora,actividad,activo\nLunes,9:30,Yoga Sana,NO',
      ajustes: 'clave,valor\nmes,Septiembre',
    })!;

    expect(isUsableSnapshot(allHidden)).toBe(false);
  });

  it('accepts the seed data', () => {
    expect(isUsableSnapshot(SEED)).toBe(true);
  });
});

describe('the committed snapshot', () => {
  it('is never empty, so no visitor can meet an empty Horarios or Actividades', () => {
    expect(isUsableSnapshot(SNAPSHOT)).toBe(true);
  });

  it('gives every timetable class a palette colour', () => {
    for (const horario of SNAPSHOT.horarios) {
      expect(PALETTE).toContain(resolveColor(horario.actividad, SNAPSHOT));
    }
  });
});
