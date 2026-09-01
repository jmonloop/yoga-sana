import { describe, expect, it } from 'vitest';
import { buildGrid, resumenHorario, type Chip, type Grid } from './horario-grid';
import { SNAPSHOT } from '../data/snapshot';
import type { Actividad, Ajustes, Horario } from '../data/sheet';

function slot(dia: string, hora: string, actividad: string, nota = ''): Horario {
  return { dia, hora, actividad, nota };
}

function gridOf(horarios: Horario[], ajustes: Ajustes = {}, actividades: Actividad[] = []): Grid {
  return buildGrid({ actividades, horarios, ajustes });
}

function chipsAt(grid: Grid, hora: string, dia: string): Chip[] {
  const row = grid.rows.find((candidate) => candidate.hora === hora);
  return row?.cells[grid.dias.indexOf(dia)] ?? [];
}

function allChips(grid: Grid): Chip[] {
  return grid.rows.flatMap((row) => row.cells).flat();
}

const SEPTIEMBRE = [
  slot('Lunes', '9:30', 'Yoga Sana'),
  slot('Viernes', '10:00', 'Yoga Relajante'),
  slot('Lunes', '11:00', 'Yoga Suave'),
  slot('Jueves', '17:30', 'Yoga Infantil'),
  slot('Viernes', '18:00', 'Yoga Relajante'),
  slot('Lunes', '19:00', 'Yoga Sana'),
  slot('Viernes', '20:00', 'Meditación guiada', 'Reserva anticipada'),
];

describe('columns', () => {
  it('orders the days canonically whatever order the sheet rows arrive in', () => {
    const grid = gridOf([
      slot('Viernes', '9:30', 'Yoga Sana'),
      slot('Miércoles', '9:30', 'Yoga Sana'),
      slot('Lunes', '9:30', 'Yoga Sana'),
    ]);

    expect(grid.dias).toEqual(['Lunes', 'Miércoles', 'Viernes']);
  });

  it('grows a Sábado column as soon as the sheet has a Saturday class', () => {
    const grid = gridOf([
      slot('Sábado', '10:00', 'Yoga Suave'),
      slot('Lunes', '9:30', 'Yoga Sana'),
    ]);

    expect(grid.dias).toEqual(['Lunes', 'Sábado']);
  });

  it('still gives an unrecognised day a column, after the seven weekdays', () => {
    const grid = gridOf([slot('Festivos', '10:00', 'Taller'), slot('Domingo', '10:00', 'Taller')]);

    expect(grid.dias).toEqual(['Domingo', 'Festivos']);
  });

  it('gathers two spellings of an unrecognised day into one column', () => {
    const grid = gridOf([
      slot('Festivos', '10:00', 'Taller de respiración'),
      slot('festivos', '12:00', 'Baño de cuencos'),
    ]);

    expect(grid.dias).toEqual(['Festivos']);
    expect(chipsAt(grid, '12:00', 'Festivos').map((chip) => chip.actividad)).toEqual([
      'Baño de cuencos',
    ]);
  });
});

describe('rows', () => {
  it('sorts the times chronologically and sends an unparseable one last', () => {
    const grid = gridOf([
      slot('Lunes', '20:00', 'Yoga Sana'),
      slot('Lunes', 'a convenir', 'Sanergía'),
      slot('Lunes', '9:30', 'Yoga Sana'),
    ]);

    expect(grid.rows.map((row) => row.hora)).toEqual(['9:30', '20:00', 'a convenir']);
  });

  it('invents no row for a time nobody teaches at', () => {
    const grid = gridOf([slot('Lunes', '9:30', 'Yoga Sana'), slot('Lunes', '11:00', 'Yoga Suave')]);

    expect(grid.rows.map((row) => row.hora)).toEqual(['9:30', '11:00']);
  });

  it('stacks two classes that share a day and a time instead of overwriting', () => {
    const grid = gridOf([
      slot('Lunes', '9:30', 'Yoga Sana'),
      slot('Lunes', '9:30', 'Meditación guiada'),
    ]);

    expect(chipsAt(grid, '9:30', 'Lunes').map((chip) => chip.actividad)).toEqual([
      'Yoga Sana',
      'Meditación guiada',
    ]);
  });

  it('leaves a day without a class at that time empty', () => {
    const grid = gridOf([slot('Lunes', '9:30', 'Yoga Sana'), slot('Martes', '11:00', 'Yoga Suave')]);

    expect(chipsAt(grid, '9:30', 'Martes')).toEqual([]);
  });
});

describe('band separator', () => {
  it('breaks the band where the morning ends and not on the hourly evening steps', () => {
    const grid = gridOf(SEPTIEMBRE);

    expect(grid.rows.filter((row) => row.separada).map((row) => row.hora)).toEqual(['17:30']);
  });

  it('breaks the band on a gap of more than two hours and not on exactly two', () => {
    const grid = gridOf([
      slot('Lunes', '9:00', 'Yoga Sana'),
      slot('Lunes', '11:00', 'Yoga Suave'),
      slot('Lunes', '13:01', 'Yoga Suave'),
    ]);

    expect(grid.rows.map((row) => row.separada)).toEqual([false, false, true]);
  });

  it('draws no band above an unparseable time, having no gap to express', () => {
    const grid = gridOf([
      slot('Lunes', '9:30', 'Yoga Sana'),
      slot('Lunes', 'a convenir', 'Sanergía'),
    ]);

    expect(grid.rows.map((row) => row.separada)).toEqual([false, false]);
  });
});

describe('chips', () => {
  it('takes the colour pinned in ajustes over the one on the activity card', () => {
    const card: Actividad = {
      nombre: 'Yoga Suave',
      grupo: 'yoga',
      descripcion: '',
      etiqueta: '',
      icono: 'suave',
      orden: 1,
      color: 'melocoton',
      mensajeWa: null,
    };
    const grid = gridOf(
      [slot('Lunes', '11:00', 'Yoga Suave'), slot('Lunes', '9:30', 'Yoga Sana')],
      { 'color.Yoga Suave': 'lavanda' },
      [card],
    );

    expect(chipsAt(grid, '11:00', 'Lunes')[0]?.color).toBe('lavanda');
  });

  it('falls back to the colour on the activity card, then to the palette in order', () => {
    const card: Actividad = {
      nombre: 'Yoga Relajante',
      grupo: 'yoga',
      descripcion: '',
      etiqueta: '',
      icono: 'relajante',
      orden: 1,
      color: 'pizarra',
      mensajeWa: null,
    };
    const grid = gridOf(
      [slot('Lunes', '9:30', 'Yoga Relajante'), slot('Lunes', '11:00', 'Yoga Sana')],
      {},
      [card],
    );

    expect(chipsAt(grid, '9:30', 'Lunes')[0]?.color).toBe('pizarra');
    expect(chipsAt(grid, '11:00', 'Lunes')[0]?.color).toBe('salvia');
  });

  it('carries the free-text nota of the slot that has one', () => {
    const grid = gridOf(SEPTIEMBRE);

    expect(chipsAt(grid, '20:00', 'Viernes')[0]?.nota).toBe('Reserva anticipada');
    expect(chipsAt(grid, '9:30', 'Lunes')[0]?.nota).toBe('');
  });

  it('books the exact slot over WhatsApp, naming it to a screen reader', () => {
    const mensaje =
      '¡Hola Natalia! Me gustaría reservar plaza en Yoga Infantil del Jueves a las 17:30.' +
      ' ¿Queda sitio?';
    const chip = chipsAt(gridOf(SEPTIEMBRE), '17:30', 'Jueves')[0];

    expect(chip?.href).toBe(`https://wa.me/34677808098?text=${encodeURIComponent(mensaje)}`);
    expect(chip?.ariaLabel).toBe(
      'Yoga Infantil: reservar plaza el jueves a las 17:30 por WhatsApp',
    );
  });
});

describe('the committed snapshot', () => {
  it('puts every timetable row on the grid, once, under its own day and time', () => {
    const grid = buildGrid(SNAPSHOT);
    const placed = SNAPSHOT.horarios.filter(
      (horario) =>
        chipsAt(grid, horario.hora, horario.dia).filter(
          (chip) => chip.actividad === horario.actividad,
        ).length > 0,
    );

    expect(allChips(grid)).toHaveLength(SNAPSHOT.horarios.length);
    expect(placed).toHaveLength(SNAPSHOT.horarios.length);
  });
});

describe('resumenHorario', () => {
  it('has nothing to summarise when there are no rows', () => {
    expect(resumenHorario([])).toBeNull();
  });

  it('names the days in weekday order, in lower case', () => {
    const resumen = resumenHorario([
      slot('Viernes', '10:00', 'Yoga Relajante'),
      slot('Lunes', '9:30', 'Yoga Sana'),
      slot('Miércoles', '19:00', 'Yoga Sana'),
    ]);

    expect(resumen?.dias).toBe('lunes, miércoles y viernes');
  });

  it('reports the first and the last hour of the week, not the Sheet order', () => {
    const resumen = resumenHorario([
      slot('Lunes', '19:00', 'Yoga Sana'),
      slot('Lunes', '9:30', 'Yoga Sana'),
      slot('Martes', '11:00', 'Yoga Suave'),
    ]);

    expect(resumen?.primera).toBe('9:30');
    expect(resumen?.ultima).toBe('19:00');
  });

  it('counts a day once however many classes it has', () => {
    const resumen = resumenHorario([
      slot('Lunes', '9:30', 'Yoga Sana'),
      slot('lunes', '11:00', 'Yoga Suave'),
    ]);

    expect(resumen?.dias).toBe('lunes');
  });
});
