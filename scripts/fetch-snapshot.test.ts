import { execFile, type ExecException } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SCRIPT = fileURLToPath(new URL('./fetch-snapshot.mjs', import.meta.url));
const SNAPSHOT = fileURLToPath(new URL('../src/data/snapshot.json', import.meta.url));

interface Run {
  code: number;
  stdout: string;
  stderr: string;
}

function runScript(sheetEnv: Record<string, string>): Promise<Run> {
  const inherited = Object.entries(process.env).filter(([key]) => !key.startsWith('PUBLIC_SHEET'));
  const env = { ...Object.fromEntries(inherited), ...sheetEnv };
  return new Promise((resolve) => {
    execFile(process.execPath, [SCRIPT], { env }, (error, stdout, stderr) =>
      resolve({ code: exitCode(error), stdout, stderr }),
    );
  });
}

function exitCode(error: ExecException | null): number {
  if (!error) return 0;
  return typeof error.code === 'number' ? error.code : 1;
}

describe('scripts/fetch-snapshot.mjs', () => {
  it('refuses a half-configured Sheet instead of quietly shipping seed data', async () => {
    const before = readFileSync(SNAPSHOT);

    const { code, stderr } = await runScript({ PUBLIC_SHEET_ID: '2PACX-abc' });

    expect(code).toBe(1);
    expect(stderr).toContain('only half configured');
    expect(stderr).toContain('PUBLIC_SHEET_GID_ACTIVIDADES');
    expect(readFileSync(SNAPSHOT).equals(before)).toBe(true);
  });

  it('writes a usable snapshot from the seed CSVs when no Sheet is configured', async () => {
    const committed = readFileSync(SNAPSHOT);

    const { code, stdout } = await runScript({});
    const written = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
    writeFileSync(SNAPSHOT, committed);

    expect(code).toBe(0);
    expect(stdout).toContain('falling back to the seed/ CSVs');
    expect(written.actividades).toHaveLength(13);
    expect(written.horarios).toHaveLength(17);
  });
});
