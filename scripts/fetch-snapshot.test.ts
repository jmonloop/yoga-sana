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

function runScript(...args: string[]): Promise<Run> {
  return new Promise((resolve) => {
    execFile(process.execPath, [SCRIPT, ...args], (error, stdout, stderr) =>
      resolve({ code: exitCode(error), stdout, stderr }),
    );
  });
}

function exitCode(error: ExecException | null): number {
  if (!error) return 0;
  return typeof error.code === 'number' ? error.code : 1;
}

describe('scripts/fetch-snapshot.mjs', () => {
  it('writes a usable snapshot from the seed CSVs when asked for --seed', async () => {
    const committed = readFileSync(SNAPSHOT);

    const { code, stdout } = await runScript('--seed');
    const written = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
    writeFileSync(SNAPSHOT, committed);

    expect(code).toBe(0);
    expect(stdout).toContain('Reading the seed/ CSVs');
    expect(written.actividades).toHaveLength(13);
    expect(written.horarios).toHaveLength(27);
  });

  it('never reaches the network for --seed, so a fresh clone can always build', async () => {
    const committed = readFileSync(SNAPSHOT);

    const { stdout } = await runScript('--seed');
    writeFileSync(SNAPSHOT, committed);

    expect(stdout).not.toContain('Fetching');
  });
});
