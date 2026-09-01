export const TABS = ['actividades', 'horarios', 'ajustes'] as const;
export type Tab = (typeof TABS)[number];

export interface SheetConfig {
  sheetId: string;
  gids: Record<Tab, string>;
}

export const ENV_KEYS = {
  sheetId: 'PUBLIC_SHEET_ID',
  actividades: 'PUBLIC_SHEET_GID_ACTIVIDADES',
  horarios: 'PUBLIC_SHEET_GID_HORARIOS',
  ajustes: 'PUBLIC_SHEET_GID_AJUSTES',
} as const;

export function toSheetConfig(env: Partial<Record<string, string>>): SheetConfig | null {
  const sheetId = env[ENV_KEYS.sheetId]?.trim() ?? '';
  const gids = {
    actividades: env[ENV_KEYS.actividades]?.trim() ?? '',
    horarios: env[ENV_KEYS.horarios]?.trim() ?? '',
    ajustes: env[ENV_KEYS.ajustes]?.trim() ?? '',
  };
  if (sheetId === '' || TABS.some((tab) => gids[tab] === '')) return null;
  return { sheetId, gids };
}

export function browserSheetConfig(): SheetConfig | null {
  return toSheetConfig(import.meta.env ?? {});
}

export function csvUrl(config: SheetConfig, tab: Tab): string {
  const base = `https://docs.google.com/spreadsheets/d/${config.sheetId}/pub`;
  return `${base}?output=csv&gid=${config.gids[tab]}&_=${Date.now()}`;
}
