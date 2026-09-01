export const TABS = ['actividades', 'horarios', 'ajustes'] as const;
export type Tab = (typeof TABS)[number];

export interface SheetConfig {
  sheetId: string;
  gids: Record<Tab, string>;
}

const ENV_KEYS = {
  sheetId: 'PUBLIC_SHEET_ID',
  actividades: 'PUBLIC_SHEET_GID_ACTIVIDADES',
  horarios: 'PUBLIC_SHEET_GID_HORARIOS',
  ajustes: 'PUBLIC_SHEET_GID_AJUSTES',
} as const;

type Env = Partial<Record<string, string>>;

export function missingSheetEnvKeys(env: Env): string[] {
  return Object.values(ENV_KEYS).filter((key) => read(env, key) === '');
}

export function toSheetConfig(env: Env): SheetConfig | null {
  if (missingSheetEnvKeys(env).length > 0) return null;
  return {
    sheetId: read(env, ENV_KEYS.sheetId),
    gids: {
      actividades: read(env, ENV_KEYS.actividades),
      horarios: read(env, ENV_KEYS.horarios),
      ajustes: read(env, ENV_KEYS.ajustes),
    },
  };
}

function read(env: Env, key: string): string {
  return env[key]?.trim() ?? '';
}

export function browserSheetConfig(): SheetConfig | null {
  return toSheetConfig(import.meta.env ?? {});
}

export function csvUrl(config: SheetConfig, tab: Tab): string {
  const base = `https://docs.google.com/spreadsheets/d/${config.sheetId}/pub`;
  return `${base}?output=csv&gid=${config.gids[tab]}&_=${Date.now()}`;
}
