import { execFile } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const SCRIPT = fileURLToPath(new URL('./check-pendiente.mjs', import.meta.url));
const creados: string[] = [];

function dist(paginas: Record<string, string>): string {
  const raiz = mkdtempSync(join(tmpdir(), 'pendiente-'));
  creados.push(raiz);
  mkdirSync(join(raiz, 'anidado'));
  Object.entries(paginas).forEach(([nombre, html]) => writeFileSync(join(raiz, nombre), html));
  return raiz;
}

function runScript(raiz: string): Promise<{ code: number; salida: string }> {
  return new Promise((resolve) => {
    execFile(process.execPath, [SCRIPT, raiz], (error, stdout, stderr) =>
      resolve({ code: error && typeof error.code === 'number' ? error.code : 0, salida: stdout + stderr }),
    );
  });
}

afterEach(() => {
  creados.splice(0).forEach((raiz) => rmSync(raiz, { recursive: true, force: true }));
});

describe('scripts/check-pendiente.mjs', () => {
  it('passes when no built page carries the placeholder', async () => {
    const raiz = dist({ 'index.html': '<p>Yoga Sana</p>', 'nota.txt': 'PENDIENTE DE TEXTO' });

    const { code, salida } = await runScript(raiz);

    expect(code).toBe(0);
    expect(salida).toContain('OK');
  });

  it('fails and names every page that still carries the placeholder', async () => {
    const raiz = dist({
      'index.html': '<p>Yoga Sana</p>',
      'anidado/sanergia.html': '<p>PENDIENTE DE TEXTO — Natalia: …</p>',
    });

    const { code, salida } = await runScript(raiz);

    expect(code).toBe(1);
    expect(salida).toContain('sanergia.html');
    expect(salida).not.toContain('index.html');
  });

  it('fails instead of passing silently when the build output is missing', async () => {
    const { code, salida } = await runScript(join(tmpdir(), 'dist-que-no-existe'));

    expect(code).toBe(1);
    expect(salida).toContain('pnpm build');
  });
});
