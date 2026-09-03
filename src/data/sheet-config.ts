export const TABS = ['actividades', 'horarios', 'ajustes'] as const;
export type Tab = (typeof TABS)[number];

export const SHEET_ID = '';

export function hasSheet(): boolean {
  return SHEET_ID.trim() !== '';
}

export function csvUrl(tab: Tab): string {
  const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID.trim()}/gviz/tq`;
  const query = new URLSearchParams({
    tqx: 'out:csv',
    headers: '1',
    sheet: tab,
    _: String(Date.now()),
  });
  return `${base}?${query}`;
}
