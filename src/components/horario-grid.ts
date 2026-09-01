import {
  resolveColor,
  toDiaIndex,
  toHoraMinutes,
  type Horario,
  type PaletteColor,
  type Snapshot,
} from '../data/sheet';
import { waLink } from '../data/site';

const LISTA = new Intl.ListFormat('es', { type: 'conjunction' });

const BANDA_MINUTOS = 120;
const SIN_HORA = Number.MAX_SAFE_INTEGER;

export interface Chip {
  actividad: string;
  nota: string;
  color: PaletteColor;
  href: string;
  ariaLabel: string;
}

export interface Row {
  hora: string;
  separada: boolean;
  cells: Chip[][];
}

export interface Grid {
  dias: string[];
  rows: Row[];
}

export interface Resumen {
  dias: string;
  primera: string;
  ultima: string;
}

export function resumenHorario(horarios: Horario[]): Resumen | null {
  const dias = distinctDias(horarios);
  const horas = distinctHoras(horarios);
  if (dias.length === 0 || horas.length === 0) return null;
  return {
    dias: LISTA.format(dias.map((dia) => dia.toLocaleLowerCase('es'))),
    primera: horas[0],
    ultima: horas[horas.length - 1],
  };
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
  const dias: string[] = [];
  for (const { dia } of horarios) {
    if (!dias.some((known) => claveDia(known) === claveDia(dia))) dias.push(dia);
  }
  return dias.sort((a, b) => toDiaIndex(a) - toDiaIndex(b));
}

function claveDia(dia: string): string {
  return dia.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function distinctHoras(horarios: Horario[]): string[] {
  return [...new Set(horarios.map((horario) => horario.hora))].sort(
    (a, b) => toHoraMinutes(a) - toHoraMinutes(b),
  );
}

function toRow(hora: string, prev: string | undefined, dias: string[], snapshot: Snapshot): Row {
  return {
    hora,
    separada: separaBanda(hora, prev),
    cells: dias.map((dia) => toChips(dia, hora, snapshot)),
  };
}

function separaBanda(hora: string, prev: string | undefined): boolean {
  if (prev === undefined || toHoraMinutes(hora) === SIN_HORA) return false;
  return toHoraMinutes(hora) - toHoraMinutes(prev) > BANDA_MINUTOS;
}

function toChips(dia: string, hora: string, snapshot: Snapshot): Chip[] {
  return snapshot.horarios
    .filter((horario) => claveDia(horario.dia) === claveDia(dia) && horario.hora === hora)
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

function slotMessage({ actividad, dia, hora }: Horario): string {
  return `¡Hola Natalia! Me gustaría reservar plaza en ${actividad} del ${dia} a las ${hora}. ¿Queda sitio?`;
}

function slotAriaLabel({ actividad, dia, hora }: Horario): string {
  return `${actividad}: reservar plaza el ${dia.toLocaleLowerCase('es')} a las ${hora} por WhatsApp`;
}
