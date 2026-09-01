import { copyFile, mkdir, readdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { IMAGENES } from '../src/data/imagenes.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'sources/images');
const OUT_DIR = path.join(ROOT, 'public/img');
const STAGE_DIR = path.join(ROOT, 'public/img.tmp');

function cropAndGrade({ source, crop, grade }) {
  const { warm, saturation, brightness } = grade;
  return sharp(path.join(SOURCE_DIR, source))
    .extract(crop)
    .linear([1 + 0.055 * warm, 1 + 0.012 * warm, 1 - 0.06 * warm], [0, 0, 0])
    .modulate({ saturation, brightness });
}

function outputNames(image) {
  const jpeg = [`${image.name}-${image.fallback}.jpg`];
  const perWidth = image.widths.flatMap((width) => [
    `${image.name}-${width}.avif`,
    `${image.name}-${width}.webp`,
  ]);
  return [...perWidth, ...jpeg];
}

async function writeWidth(image, width) {
  const base = path.join(STAGE_DIR, `${image.name}-${width}`);
  const resized = cropAndGrade(image).resize({ width, withoutEnlargement: true });
  await resized.clone().avif({ quality: 52, effort: 6 }).toFile(`${base}.avif`);
  await resized.clone().webp({ quality: 76, effort: 6 }).toFile(`${base}.webp`);
  if (width !== image.fallback) return;
  await resized.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${base}.jpg`);
}

async function swapIntoPlace() {
  const present = await readdir(OUT_DIR).catch(() => []);
  const isOurs = (name) => IMAGENES.some((image) => name.startsWith(`${image.name}-`));
  const unmanaged = present.filter((name) => !isOurs(name));
  const carry = (name) => copyFile(path.join(OUT_DIR, name), path.join(STAGE_DIR, name));
  await Promise.all(unmanaged.map(carry));
  await rm(OUT_DIR, { recursive: true, force: true });
  await rename(STAGE_DIR, OUT_DIR);
}

async function reportSizes() {
  const names = IMAGENES.flatMap(outputNames).sort();
  const sizes = await Promise.all(names.map((name) => stat(path.join(OUT_DIR, name))));
  const total = sizes.reduce((sum, file) => sum + file.size, 0);
  names.forEach((name, index) => console.log(`${name}\t${sizes[index].size}`));
  console.log(`${names.length} files\t${total} bytes`);
}

await rm(STAGE_DIR, { recursive: true, force: true });
await mkdir(STAGE_DIR, { recursive: true });
try {
  for (const image of IMAGENES) {
    await Promise.all(image.widths.map((width) => writeWidth(image, width)));
  }
  await swapIntoPlace();
} finally {
  await rm(STAGE_DIR, { recursive: true, force: true });
}
await reportSizes();
