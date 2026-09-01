import {
  resolveColor,
  toDiaIndex,
  toHoraMinutes,
  type Horario,
  type PaletteColor,
  type Snapshot,
} from '../data/sheet';
import { waLink } from '../data/site';

const BANDA_MINUTOS = 120;

export interface Chip {
  actividad: string;
  nota: string;
  color: PaletteColor;
  href: string;
  ariaLabel: string;
}

export interface Cell {
  dia: string;
  chips: Chip[];
}

export interface Row {
  hora: string;
  band: boolean;
  cells: Cell[];
}

export interface Grid {
  dias: string[];
  rows: Row[];
}

export function buildGrid(snapshot: Snapshot): Grid {
  const dias = distinctDias(snapshot.horarios);
  const horas = distinctHoras(snapshot.horarios);
  return {
    dias,
    rows: horas.map((hora, index) => toRow(hora, horas[index - 1], dias, snapshot)),
  };
}

function distinctDias(horarios: Horario[]): string[] {
  return [...new Set(horarios.map((horario) => horario.dia))].sort(
    (a, b) => toDiaIndex(a) - toDiaIndex(b),
  );
}

function distinctHoras(horarios: Horario[]): string[] {
  return [...new Set(horarios.map((horario) => horario.hora))].sort(
    (a, b) => toHoraMinutes(a) - toHoraMinutes(b),
  );
}

function toRow(hora: string, prev: string | undefined, dias: string[], snapshot: Snapshot): Row {
  return {
    hora,
    band: prev !== undefined && toHoraMinutes(hora) - toHoraMinutes(prev) > BANDA_MINUTOS,
    cells: dias.map((dia) => ({ dia, chips: toChips(dia, hora, snapshot) })),
  };
}

function toChips(dia: string, hora: string, snapshot: Snapshot): Chip[] {
  return snapshot.horarios
    .filter((horario) => horario.dia === dia && horario.hora === hora)
    .map((horario) => toChip(horario, snapshot));
}

function toChip(horario: Horario, snapshot: Snapshot): Chip {
  return {
    actividad: horario.actividad,
    nota: horario.nota,
    color: resolveColor(horario.actividad, snapshot),
    href: waLink(slotMessage(horario)),
    ariaLabel: slotAriaLabel(horario),
  };
}

export function slotMessage({ actividad, dia, hora }: Horario): string {
  return `¡Hola Natalia! Me gustaría reservar plaza en ${actividad} del ${dia} a las ${hora}. ¿Queda sitio?`;
}

export function slotAriaLabel({ actividad, dia, hora }: Horario): string {
  return `${actividad}: reservar plaza el ${dia.toLocaleLowerCase('es')} a las ${hora} por WhatsApp`;
}
