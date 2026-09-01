import Papa from 'papaparse';

export const DIAS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export const GRUPOS = ['yoga', 'taller', 'otras'] as const;
export type Grupo = (typeof GRUPOS)[number];

export const PALETTE = ['salvia', 'lavanda', 'pizarra', 'melocoton', 'rosa'] as const;
export type PaletteColor = (typeof PALETTE)[number];

export const DEFAULT_ICONO = 'loto';
export const ICONOS = [
  'hatha',
  'dinamico',
  'suave',
  'adaptado',
  'relajante',
  'ninos',
  'mente',
  'pulmones',
  'espiral',
  'familia',
  'camilla',
  'cuencos',
  'loto-manos',
  DEFAULT_ICONO,
] as const;
export type Icono = (typeof ICONOS)[number];

export interface Actividad {
  nombre: string;
  grupo: Grupo;
  descripcion: string;
  etiqueta: string;
  icono: Icono;
  orden: number;
  color: PaletteColor | null;
  mensajeWa: string | null;
}

export interface Horario {
  dia: string;
  hora: string;
  actividad: string;
  nota: string;
}

export type Ajustes = Record<string, string | undefined>;

export interface TabCsv {
  actividades: string;
  horarios: string;
  ajustes: string;
}

export interface Snapshot {
  actividades: Actividad[];
  horarios: Horario[];
  ajustes: Ajustes;
}

type Row = Record<string, string>;

const LAST = Number.MAX_SAFE_INTEGER;
const HORA = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function readRows(csv: string, required: readonly string[]): Row[] | null {
  const { data, meta } = Papa.parse<Row>(csv, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: normalize,
  });
  const headers = meta.fields ?? [];
  if (required.some((column) => !headers.includes(column))) return null;
  return data;
}

function cell(row: Row, column: string): string {
  return (row[column] ?? '').trim();
}

function isActive(row: Row): boolean {
  return normalize(cell(row, 'activo')) !== 'no';
}

function toPaletteColor(value: string): PaletteColor | null {
  return PALETTE.find((color) => color === normalize(value)) ?? null;
}

export function parseActividades(csv: string): Actividad[] | null {
  const rows = readRows(csv, ['nombre', 'grupo', 'descripcion']);
  if (!rows) return null;
  const actividades = rows
    .filter(isActive)
    .map(toActividad)
    .filter((actividad) => actividad.nombre !== '');
  return actividades.sort(byGrupoThenOrden);
}

function toActividad(row: Row): Actividad {
  const grupo = normalize(cell(row, 'grupo'));
  const icono = normalize(cell(row, 'icono'));
  return {
    nombre: cell(row, 'nombre'),
    grupo: GRUPOS.find((known) => known === grupo) ?? 'otras',
    descripcion: cell(row, 'descripcion'),
    etiqueta: cell(row, 'etiqueta'),
    icono: ICONOS.find((known) => known === icono) ?? DEFAULT_ICONO,
    orden: toOrden(cell(row, 'orden')),
    color: toPaletteColor(cell(row, 'color')),
    mensajeWa: cell(row, 'mensaje_wa') || null,
  };
}

function toOrden(value: string): number {
  const orden = Number.parseInt(value, 10);
  return Number.isNaN(orden) ? LAST : orden;
}

function byGrupoThenOrden(a: Actividad, b: Actividad): number {
  return GRUPOS.indexOf(a.grupo) - GRUPOS.indexOf(b.grupo) || a.orden - b.orden;
}

export function parseHorarios(csv: string): Horario[] | null {
  const rows = readRows(csv, ['dia', 'hora', 'actividad']);
  if (!rows) return null;
  const horarios = rows
    .filter(isActive)
    .map(toHorario)
    .filter((horario) => horario.dia !== '' && horario.hora !== '' && horario.actividad !== '');
  return horarios.sort(byHoraThenDia);
}

function toHorario(row: Row): Horario {
  const dia = cell(row, 'dia');
  return {
    dia: DIAS.find((known) => normalize(known) === normalize(dia)) ?? dia,
    hora: toHoraDisplay(cell(row, 'hora')),
    actividad: cell(row, 'actividad'),
    nota: cell(row, 'nota'),
  };
}

function toHoraDisplay(value: string): string {
  const match = HORA.exec(value);
  return match ? `${Number(match[1])}:${match[2]}` : value;
}

export function toHoraMinutes(hora: string): number {
  const match = HORA.exec(hora);
  return match ? Number(match[1]) * 60 + Number(match[2]) : LAST;
}

export function toDiaIndex(dia: string): number {
  const index = DIAS.findIndex((known) => normalize(known) === normalize(dia));
  return index === -1 ? DIAS.length : index;
}

function byHoraThenDia(a: Horario, b: Horario): number {
  return toHoraMinutes(a.hora) - toHoraMinutes(b.hora) || toDiaIndex(a.dia) - toDiaIndex(b.dia);
}

export function parseAjustes(csv: string): Ajustes | null {
  const rows = readRows(csv, ['clave', 'valor']);
  if (!rows) return null;
  const ajustes: Ajustes = {};
  for (const row of rows) {
    const clave = cell(row, 'clave');
    if (clave !== '') ajustes[clave] = cell(row, 'valor');
  }
  return ajustes;
}

export function parseSnapshot(csv: TabCsv): Snapshot | null {
  const actividades = parseActividades(csv.actividades);
  const horarios = parseHorarios(csv.horarios);
  const ajustes = parseAjustes(csv.ajustes);
  if (!actividades || !horarios || !ajustes) return null;
  return { actividades, horarios, ajustes };
}

export function isUsableSnapshot(snapshot: Snapshot): boolean {
  return hasRows(snapshot.actividades) && hasRows(snapshot.horarios);
}

function hasRows(rows: unknown[]): boolean {
  return Array.isArray(rows) && rows.length > 0;
}

export function resolveColor(actividad: string, snapshot: Snapshot): PaletteColor {
  return explicitColor(actividad, snapshot) ?? autoColor(actividad, snapshot);
}

function explicitColor(actividad: string, snapshot: Snapshot): PaletteColor | null {
  return pinnedColor(actividad, snapshot.ajustes) ?? cardColor(actividad, snapshot.actividades);
}

function pinnedColor(actividad: string, ajustes: Ajustes): PaletteColor | null {
  const wanted = `color.${normalize(actividad)}`;
  const pinned = Object.entries(ajustes).find(([clave]) => normalize(clave) === wanted);
  return toPaletteColor(pinned?.[1] ?? '');
}

function cardColor(actividad: string, actividades: Actividad[]): PaletteColor | null {
  const card = actividades.find((item) => normalize(item.nombre) === normalize(actividad));
  return card?.color ?? null;
}

function autoColor(actividad: string, snapshot: Snapshot): PaletteColor {
  const timetableNames = [...new Set(snapshot.horarios.map((horario) => horario.actividad))];
  const unpinned = timetableNames
    .filter((nombre) => explicitColor(nombre, snapshot) === null)
    .map(normalize);
  const index = unpinned.indexOf(normalize(actividad));
  return PALETTE[(index === -1 ? unpinned.length : index) % PALETTE.length];
}

