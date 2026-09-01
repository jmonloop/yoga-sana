import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'sources/images');
const OUT_DIR = path.join(ROOT, 'public/img');

const NEUTRAL = { warm: 0, saturation: 1, brightness: 1 };
const FLUORESCENT = { warm: 1, saturation: 1.08, brightness: 1.03 };

const IMAGES = [
  {
    source: 'yoga1.jpeg',
    name: 'meditacion-sentada',
    crop: { left: 0, top: 0, width: 501, height: 668 },
    grade: { warm: 0.35, saturation: 1.03, brightness: 1 },
    widths: [320, 400, 501],
  },
  {
    source: 'yoga2.jpeg',
    name: 'clase-de-yoga',
    crop: { left: 0, top: 313, width: 1254, height: 836 },
    grade: NEUTRAL,
    widths: [640, 960, 1254],
  },
  {
    source: 'yoga3.jpeg',
    name: 'yoga-al-aire-libre',
    crop: { left: 0, top: 0, width: 640, height: 608 },
    grade: { warm: -0.3, saturation: 0.88, brightness: 1 },
    widths: [320, 480, 640],
  },
  {
    source: 'consciencia-corporal.jpg',
    name: 'consciencia-corporal',
    crop: { left: 0, top: 95, width: 600, height: 905 },
    grade: NEUTRAL,
    widths: [360, 480, 600],
  },
  {
    source: 'nuestro-centro2.jpg',
    name: 'centro-sala',
    crop: { left: 0, top: 180, width: 1600, height: 1020 },
    grade: FLUORESCENT,
    widths: [640, 960, 1280, 1600],
  },
  {
    source: 'nuestro-centro.jpg',
    name: 'centro-sala-amplia',
    crop: { left: 0, top: 210, width: 1600, height: 640 },
    grade: FLUORESCENT,
    widths: [640, 960, 1280, 1600],
  },
  {
    source: 'nuestro-centro3.txt',
    name: 'centro-materiales',
    crop: { left: 128, top: 250, width: 1472, height: 950 },
    grade: FLUORESCENT,
    widths: [640, 960, 1280, 1472],
  },
  {
    source: 'nuestro-centro4.txt',
    name: 'centro-camilla',
    crop: { left: 460, top: 0, width: 920, height: 760 },
    grade: { warm: 1, saturation: 0.9, brightness: 1.03 },
    widths: [460, 690, 920],
  },
];

function graded({ source, crop, grade }) {
  const { warm, saturation, brightness } = grade;
  return sharp(path.join(SOURCE_DIR, source))
    .extract(crop)
    .linear([1 + 0.055 * warm, 1 + 0.012 * warm, 1 - 0.06 * warm], [0, 0, 0])
    .modulate({ saturation, brightness });
}

function isFallbackWidth(image, width) {
  return width === image.widths[1];
}

async function writeWidth(image, width) {
  const base = path.join(OUT_DIR, `${image.name}-${width}`);
  const resized = graded(image).resize({ width });
  await resized.clone().avif({ quality: 52, effort: 6 }).toFile(`${base}.avif`);
  await resized.clone().webp({ quality: 76, effort: 6 }).toFile(`${base}.webp`);
  if (!isFallbackWidth(image, width)) return;
  await resized.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${base}.jpg`);
}

async function reportSizes() {
  const names = (await readdir(OUT_DIR)).sort();
  const sizes = await Promise.all(names.map((name) => stat(path.join(OUT_DIR, name))));
  const total = sizes.reduce((sum, file) => sum + file.size, 0);
  names.forEach((name, index) => console.log(`${name}\t${sizes[index].size}`));
  console.log(`${names.length} files\t${total} bytes`);
}

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });
for (const image of IMAGES) {
  await Promise.all(image.widths.map((width) => writeWidth(image, width)));
}
await reportSizes();
