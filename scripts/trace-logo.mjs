import { execFileSync } from 'node:child_process';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'sources/images/logo.jpeg');
const OUT_DIR = path.join(ROOT, 'assets/logo');

const THRESHOLD = 150;
const POTRACE = ['-b', 'svg', '--flat', '-a', '1.2', '-O', '0.25', '-t', '6', '-o', '-', '-'];

const BANDS = [
  { name: 'figura', output: 'logo-figura' },
  { name: 'texto', output: 'logo-texto' },
  { name: 'lema', output: null },
];

async function readMask() {
  const { data, info } = await sharp(SOURCE).greyscale().raw().toBuffer({ resolveWithObject: true });
  const ink = (x, y) => data[y * info.width + x] < THRESHOLD;
  return { ink, width: info.width, height: info.height };
}

function inkBands({ ink, width, height }) {
  const rowHasInk = (y) => {
    for (let x = 0; x < width; x++) if (ink(x, y)) return true;
    return false;
  };
  const bands = [];
  for (let y = 0; y < height; y++) {
    if (!rowHasInk(y)) continue;
    const last = bands.at(-1);
    if (last && last.bottom === y - 1) last.bottom = y;
    else bands.push({ top: y, bottom: y });
  }
  return bands;
}

function inkColumns(mask, band) {
  const columnHasInk = (x) => {
    for (let y = band.top; y <= band.bottom; y++) if (mask.ink(x, y)) return true;
    return false;
  };
  let left = 0;
  let right = mask.width - 1;
  while (!columnHasInk(left)) left++;
  while (!columnHasInk(right)) right--;
  return { left, width: right - left + 1 };
}

function rowBits(mask, y, left, width) {
  const bits = Buffer.alloc(Math.ceil(width / 8));
  for (let x = 0; x < width; x++) {
    if (mask.ink(left + x, y)) bits[x >> 3] |= 0x80 >> (x & 7);
  }
  return bits;
}

function toPbm(mask, band) {
  const { left, width } = inkColumns(mask, band);
  const height = band.bottom - band.top + 1;
  const rows = Array.from({ length: height }, (_, row) => rowBits(mask, band.top + row, left, width));
  return Buffer.concat([Buffer.from(`P4\n${width} ${height}\n`), ...rows]);
}

function normalise(svg) {
  return svg
    .replace(/<\?xml[^>]*\?>\s*/, '')
    .replace(/<!DOCTYPE[\s\S]*?>\s*/, '')
    .replace(/<metadata>[\s\S]*?<\/metadata>\s*/, '')
    .replace(/\s(width|height)="[^"]*"/g, '')
    .replaceAll('#000000', 'currentColor')
    .trim()
    .concat('\n');
}

function trace(mask, band) {
  try {
    return normalise(execFileSync('potrace', POTRACE, { input: toPbm(mask, band) }).toString());
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    throw new Error('potrace is not installed; install it first (macOS: brew install potrace)');
  }
}

function bandsToTrace(bands) {
  const expected = BANDS.map((part) => part.name).join(', ');
  if (bands.length !== BANDS.length) {
    throw new Error(`expected ink bands ${expected}; found ${bands.length} bands`);
  }
  return BANDS.map((part, index) => ({ ...part, band: bands[index] })).filter((part) => part.output);
}

async function writeAll(traced) {
  await mkdir(OUT_DIR, { recursive: true });
  for (const { output, svg } of traced) {
    const target = path.join(OUT_DIR, `${output}.svg`);
    await writeFile(target, svg);
    console.log(`${output}.svg\t${(await stat(target)).size}`);
  }
}

const mask = await readMask();
const parts = bandsToTrace(inkBands(mask));
await writeAll(parts.map((part) => ({ output: part.output, svg: trace(mask, part.band) })));
