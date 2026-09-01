import { buildGrid, type Chip, type Grid, type Row } from './horario-grid';
import type { Snapshot } from '../data/sheet';

export function renderHorario(snapshot: Snapshot): string {
  const grid = buildGrid(snapshot);
  return renderTabla(grid) + renderLista(grid);
}

function renderTabla(grid: Grid): string {
  const caption = '<caption class="visually-hidden">Horario semanal de clases</caption>';
  const horaTh = '<th scope="col"><span class="visually-hidden">Hora</span></th>';
  const dias = grid.dias.map((dia) => `<th scope="col">${esc(dia)}</th>`).join('');
  const filas = grid.rows.map(renderFila).join('');
  const cabecera = `<thead><tr>${horaTh}${dias}</tr></thead>`;
  return `<table class="horario-tabla">${caption}${cabecera}<tbody>${filas}</tbody></table>`;
}

function renderFila(row: Row): string {
  const celdas = row.cells.map((chips) => `<td>${renderClases(chips)}</td>`).join('');
  const clase = row.separada ? ' class="horario-banda"' : '';
  return `<tr${clase}><th scope="row">${esc(row.hora)}</th>${celdas}</tr>`;
}

function renderLista(grid: Grid): string {
  const dias = grid.dias.map((dia, index) => renderDia(dia, index, grid.rows)).join('');
  return `<div class="horario-lista">${dias}</div>`;
}

function renderDia(dia: string, index: number, rows: Row[]): string {
  const items = rows.map((row) => renderItem(row, index)).join('');
  return `<section class="horario-dia"><h3>${esc(dia)}</h3><ul>${items}</ul></section>`;
}

function renderItem(row: Row, index: number): string {
  const chips = row.cells[index] ?? [];
  if (chips.length === 0) return '';
  return `<li><p class="horario-hora">${esc(row.hora)}</p>${renderClases(chips)}</li>`;
}

function renderClases(chips: Chip[]): string {
  return chips.map(renderClase).join('');
}

function renderClase(chip: Chip): string {
  const attrs = [
    `class="horario-chip color-${chip.color}"`,
    `href="${esc(chip.href)}"`,
    `aria-label="${esc(chip.ariaLabel)}"`,
    'target="_blank"',
    'rel="noopener"',
  ].join(' ');
  const nota = chip.nota === '' ? '' : `<p class="horario-nota">${esc(chip.nota)}</p>`;
  return `<div class="horario-clase"><a ${attrs}>${esc(chip.actividad)}</a>${nota}</div>`;
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
