import { readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ICONOS } from '../data/sheet';

const ICON_DIR = path.resolve(import.meta.dirname, '../../assets/icons');

describe('Icono', () => {
  it('has an SVG in assets/icons for every icono keyword', () => {
    const files = readdirSync(ICON_DIR);
    const missing = ICONOS.filter((icono) => !files.includes(`${icono}.svg`));
    expect(missing).toEqual([]);
  });
});
