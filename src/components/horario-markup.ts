import { buildGrid, type Chip, type Grid, type Row } from './horario-grid';
import type { Snapshot } from '../data/sheet';

const CAPTION = '<caption class="visually-hidden">Horario semanal de clases</caption>';
const HORA_TH = '<th scope="col"><span class="visually-hidden">Hora</span></th>';

export function renderHorario(snapshot: Snapshot): string {
  const grid = buildGrid(snapshot);
  return renderTabla(grid) + renderLista(grid);
}

export function renderTabla(grid: Grid): string {
  const dias = grid.dias.map((dia) => `<th scope="col">${esc(dia)}</th>`).join('');
  const cabecera = `<thead><tr>${HORA_TH}${dias}</tr></thead>`;
  const filas = grid.rows.map(renderFila).join('');
  return `<table class="horario-tabla">${CAPTION}${cabecera}<tbody>${filas}</tbody></table>`;
}

function renderFila(row: Row): string {
  const celdas = row.cells.map((cell) => `<td>${renderChips(cell.chips)}</td>`).join('');
  const clase = row.band ? ' class="horario-banda"' : '';
  return `<tr${clase}><th scope="row">${esc(row.hora)}</th>${celdas}</tr>`;
}

export function renderLista(grid: Grid): string {
  const dias = grid.dias.map((dia) => renderDia(dia, grid)).join('');
  return `<div class="horario-lista">${dias}</div>`;
}

function renderDia(dia: string, grid: Grid): string {
  const slots = grid.rows.map((row) => renderSlot(dia, row)).join('');
  if (slots === '') return '';
  return `<section class="horario-dia"><h3>${esc(dia)}</h3><ul>${slots}</ul></section>`;
}

function renderSlot(dia: string, row: Row): string {
  const chips = row.cells.find((cell) => cell.dia === dia)?.chips ?? [];
  if (chips.length === 0) return '';
  return `<li><p class="horario-hora">${esc(row.hora)}</p>${renderChips(chips)}</li>`;
}

function renderChips(chips: Chip[]): string {
  return chips.map(renderChip).join('');
}

function renderChip(chip: Chip): string {
  const attrs = [
    `class="horario-chip color-${chip.color}"`,
    `href="${esc(chip.href)}"`,
    `aria-label="${esc(chip.ariaLabel)}"`,
    'target="_blank"',
    'rel="noopener"',
  ].join(' ');
  return `<a ${attrs}>${esc(chip.actividad)}</a>${renderNota(chip.nota)}`;
}

function renderNota(nota: string): string {
  return nota === '' ? '' : `<p class="horario-nota">${esc(nota)}</p>`;
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
