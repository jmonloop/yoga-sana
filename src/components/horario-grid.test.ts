import { describe, expect, it } from 'vitest';
import { buildGrid, slotAriaLabel, slotMessage, type Chip, type Grid } from './horario-grid';
import { SNAPSHOT } from '../data/snapshot';
import type { Ajustes, Horario } from '../data/sheet';

function slot(dia: string, hora: string, actividad: string, nota = ''): Horario {
  return { dia, hora, actividad, nota };
}

function gridOf(horarios: Horario[], ajustes: Ajustes = {}): Grid {
  return buildGrid({ actividades: [], horarios, ajustes });
}

function chipsAt(grid: Grid, hora: string, dia: string): Chip[] {
  const row = grid.rows.find((candidate) => candidate.hora === hora);
  return row?.cells.find((cell) => cell.dia === dia)?.chips ?? [];
}

function allChips(grid: Grid): Chip[] {
  return grid.rows.flatMap((row) => row.cells).flatMap((cell) => cell.chips);
}

const SEED = buildGrid(SNAPSHOT);

const MENSAJE_JUEVES =
  '¡Hola Natalia! Me gustaría reservar plaza en Yoga Infantil del Jueves a las 17:30.' +
  ' ¿Queda sitio?';

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

  it('renders only the times that have a class, so no empty rows appear', () => {
    expect(SEED.rows.map((row) => row.hora)).toEqual([
      '9:30',
      '10:00',
      '11:00',
      '17:30',
      '18:00',
      '19:00',
      '20:00',
    ]);
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
});

describe('band separator', () => {
  it('breaks the band exactly once in the seed grid, where the morning ends', () => {
    const banded = SEED.rows.filter((row) => row.band).map((row) => row.hora);

    expect(banded).toEqual(['17:30']);
  });

  it('leaves the one-hour step from 19:00 to 20:00 unbroken', () => {
    expect(SEED.rows.find((row) => row.hora === '20:00')?.band).toBe(false);
  });

  it('breaks the band on a gap of more than two hours and not on exactly two', () => {
    const grid = gridOf([
      slot('Lunes', '9:00', 'Yoga Sana'),
      slot('Lunes', '11:00', 'Yoga Suave'),
      slot('Lunes', '13:01', 'Yoga Suave'),
    ]);

    expect(grid.rows.map((row) => row.band)).toEqual([false, false, true]);
  });
});

describe('chips', () => {
  it('gives every seed class the colour pinned in ajustes', () => {
    const colores = Object.fromEntries(allChips(SEED).map((chip) => [chip.actividad, chip.color]));

    expect(colores).toEqual({
      'Yoga Sana': 'salvia',
      'Yoga Suave': 'lavanda',
      'Yoga Relajante': 'pizarra',
      'Yoga Infantil': 'melocoton',
      'Meditación guiada': 'rosa',
    });
  });

  it('carries the free-text nota of the only slot that has one', () => {
    const withNota = allChips(SEED).filter((chip) => chip.nota !== '');

    expect(withNota).toHaveLength(1);
    expect(withNota[0]).toMatchObject({
      actividad: 'Meditación guiada',
      nota: 'Reserva anticipada',
    });
  });

  it('books the exact slot over WhatsApp', () => {
    expect(slotMessage(slot('Jueves', '17:30', 'Yoga Infantil'))).toBe(MENSAJE_JUEVES);
    expect(chipsAt(SEED, '17:30', 'Jueves')[0]?.href).toBe(
      `https://wa.me/34677808098?text=${encodeURIComponent(MENSAJE_JUEVES)}`,
    );
  });

  it('names the class, day and time in the accessible name', () => {
    expect(slotAriaLabel(slot('Jueves', '17:30', 'Yoga Infantil'))).toBe(
      'Yoga Infantil: reservar plaza el jueves a las 17:30 por WhatsApp',
    );
  });

  it('keeps the visible chip text inside every accessible name', () => {
    const mismatched = allChips(SEED).filter(
      (chip) => !chip.ariaLabel.startsWith(`${chip.actividad}: `),
    );

    expect(mismatched).toEqual([]);
  });
});

describe('the committed snapshot', () => {
  it('lays 17 classes out over 7 times and 5 days', () => {
    expect(allChips(SEED)).toHaveLength(17);
    expect(SEED.rows).toHaveLength(7);
    expect(SEED.dias).toEqual(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
  });
});
