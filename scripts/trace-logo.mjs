import { execFileSync } from 'node:child_process';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'sources/images/logo.jpeg');
const OUT_DIR = path.join(ROOT, 'assets/logo');
const TMP = path.join(os.tmpdir(), 'yoga-sana-logo.pbm');

const THRESHOLD = 150;
const SOURCE_BANDS = ['figura', 'wordmark', 'lema'];
const TRACED_PARTS = ['logo-figura', 'logo-texto'];

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

function boundingBox(mask, band) {
  const columnHasInk = (x) => {
    for (let y = band.top; y <= band.bottom; y++) if (mask.ink(x, y)) return true;
    return false;
  };
  const inked = Array.from({ length: mask.width }, (_, x) => x).filter(columnHasInk);
  const left = inked[0];
  return { left, top: band.top, width: inked.at(-1) - left + 1, height: band.bottom - band.top + 1 };
}

function toPbm(mask, box) {
  const stride = Math.ceil(box.width / 8);
  const bits = Buffer.alloc(stride * box.height);
  for (let y = 0; y < box.height; y++) {
    for (let x = 0; x < box.width; x++) {
      if (mask.ink(box.left + x, box.top + y)) bits[y * stride + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return Buffer.concat([Buffer.from(`P4\n${box.width} ${box.height}\n`), bits]);
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

async function tracePart(mask, band, name) {
  const target = path.join(OUT_DIR, `${name}.svg`);
  await writeFile(TMP, toPbm(mask, boundingBox(mask, band)));
  const svg = execFileSync('potrace', ['-b', 'svg', '--flat', '-a', '1.2', '-O', '0.25', '-t', '6', '-o', '-', TMP]);
  await writeFile(target, normalise(svg.toString()));
  console.log(`${name}.svg\t${(await stat(target)).size}`);
}

const mask = await readMask();
const bands = inkBands(mask);
if (bands.length !== SOURCE_BANDS.length) {
  throw new Error(`expected ink bands ${SOURCE_BANDS.join(', ')}; found ${bands.length} bands`);
}
await mkdir(OUT_DIR, { recursive: true });
for (const [index, name] of TRACED_PARTS.entries()) await tracePart(mask, bands[index], name);
