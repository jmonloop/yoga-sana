import { describe, expect, it } from 'vitest';
import { csvUrl, hasSheet, SHEET_ID, TABS } from './sheet-config';

describe('hasSheet', () => {
  it('agrees with whether a Sheet id is committed', () => {
    expect(hasSheet()).toBe(SHEET_ID.trim() !== '');
  });
});

describe('csvUrl', () => {
  it('asks the gviz endpoint for the tab by name, not by gid', () => {
    const url = new URL(csvUrl('horarios'));

    expect(url.pathname.endsWith('/gviz/tq')).toBe(true);
    expect(url.searchParams.get('tqx')).toBe('out:csv');
    expect(url.searchParams.get('headers')).toBe('1');
    expect(url.searchParams.get('sheet')).toBe('horarios');
    expect(url.searchParams.has('gid')).toBe(false);
  });

  it('busts the cache so an edit shows up on the next page load', () => {
    expect(new URL(csvUrl('ajustes')).searchParams.get('_')).toMatch(/^\d+$/);
  });

  it('names every tab the snapshot needs', () => {
    expect(TABS.map((tab) => new URL(csvUrl(tab)).searchParams.get('sheet'))).toEqual([
      'actividades',
      'horarios',
      'ajustes',
    ]);
  });
});
