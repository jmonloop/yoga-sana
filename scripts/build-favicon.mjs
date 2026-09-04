import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'assets/logo/logo-figura.svg');
const OUT_DIR = path.join(ROOT, 'public');

const FONDO = '#f7f3e9';
const TINTA = '#4a5139';
const LIENZO = 512;
const MARGEN = 36;
const RADIO = 96;
const GROSOR = 90;

const PNGS = [
  { name: 'favicon-96.png', size: 96 },
  { name: 'apple-touch-icon.png', size: 180 },
];
const ICO = { name: 'favicon.ico', size: 32 };

function figura(svg) {
  const medidas = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!medidas) throw new Error(`${SOURCE} has no viewBox`);
  const apertura = svg.indexOf('>', svg.indexOf('<svg'));
  const cuerpo = svg.slice(apertura + 1, svg.lastIndexOf('</svg>'));
  return {
    ancho: Number(medidas[1]),
    alto: Number(medidas[2]),
    cuerpo: cuerpo.replaceAll('currentColor', TINTA).replace(' stroke="none"', '').trim(),
  };
}

function componer({ ancho, alto, cuerpo }) {
  const escala = (LIENZO - MARGEN * 2) / Math.max(ancho, alto);
  const x = (LIENZO - ancho * escala) / 2;
  const y = (LIENZO - alto * escala) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LIENZO} ${LIENZO}" width="${LIENZO}" height="${LIENZO}" role="img" aria-label="Yoga Sana">
<rect width="${LIENZO}" height="${LIENZO}" rx="${RADIO}" fill="${FONDO}"/>
<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${escala.toFixed(5)})" stroke="${TINTA}" stroke-width="${GROSOR}" stroke-linejoin="round" stroke-linecap="round">
${cuerpo}
</g>
</svg>
`;
}

const rasterizar = (svg, size) =>
  sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

function empaquetarIco(png, size) {
  const cabecera = Buffer.alloc(22);
  cabecera.writeUInt16LE(1, 2);
  cabecera.writeUInt16LE(1, 4);
  cabecera.writeUInt8(size, 6);
  cabecera.writeUInt8(size, 7);
  cabecera.writeUInt16LE(1, 10);
  cabecera.writeUInt16LE(32, 12);
  cabecera.writeUInt32LE(png.length, 14);
  cabecera.writeUInt32LE(cabecera.length, 18);
  return Buffer.concat([cabecera, png]);
}

async function escribir(name, contenido) {
  const target = path.join(OUT_DIR, name);
  await writeFile(target, contenido);
  console.log(`${name}\t${(await stat(target)).size}`);
}

async function escribirTodo(svg) {
  await escribir('favicon.svg', svg);
  for (const { name, size } of PNGS) await escribir(name, await rasterizar(svg, size));
  await escribir(ICO.name, empaquetarIco(await rasterizar(svg, ICO.size), ICO.size));
}

await escribirTodo(componer(figura(await readFile(SOURCE, 'utf8'))));
