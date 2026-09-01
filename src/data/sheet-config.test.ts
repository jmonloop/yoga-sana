import { describe, expect, it } from 'vitest';
import { csvUrl, missingSheetEnvKeys, toSheetConfig, type SheetConfig } from './sheet-config';

const FULL = {
  PUBLIC_SHEET_ID: '2PACX-abc',
  PUBLIC_SHEET_GID_ACTIVIDADES: '0',
  PUBLIC_SHEET_GID_HORARIOS: '111',
  PUBLIC_SHEET_GID_AJUSTES: '222',
};

describe('missingSheetEnvKeys', () => {
  it('names every variable that is absent or blank', () => {
    expect(missingSheetEnvKeys({ ...FULL, PUBLIC_SHEET_GID_AJUSTES: '  ' })).toEqual([
      'PUBLIC_SHEET_GID_AJUSTES',
    ]);
    expect(missingSheetEnvKeys({})).toHaveLength(4);
  });

  it('names nothing when the Sheet is fully configured', () => {
    expect(missingSheetEnvKeys(FULL)).toEqual([]);
  });
});

describe('toSheetConfig', () => {
  it('refuses a half-configured Sheet rather than building a broken URL', () => {
    expect(toSheetConfig({ PUBLIC_SHEET_ID: '2PACX-abc' })).toBeNull();
  });

  it('trims the values it reads', () => {
    expect(toSheetConfig({ ...FULL, PUBLIC_SHEET_ID: ' 2PACX-abc ' })?.sheetId).toBe('2PACX-abc');
  });
});

describe('csvUrl', () => {
  it('points at the published CSV endpoint for the requested tab', () => {
    const config: SheetConfig = {
      sheetId: '2PACX-abc',
      gids: { actividades: '0', horarios: '111', ajustes: '222' },
    };

    const url = new URL(csvUrl(config, 'horarios'));

    expect(url.origin + url.pathname).toBe(
      'https://docs.google.com/spreadsheets/d/2PACX-abc/pub',
    );
    expect(url.searchParams.get('output')).toBe('csv');
    expect(url.searchParams.get('gid')).toBe('111');
  });
});
