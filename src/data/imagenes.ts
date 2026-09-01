export interface Recorte {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Grade {
  warm: number;
  saturation: number;
  brightness: number;
}

export interface Imagen {
  source: string;
  name: string;
  fallback: number;
  crop: Recorte;
  grade: Grade;
  widths: number[];
}

const NEUTRAL: Grade = { warm: 0, saturation: 1, brightness: 1 };
const FLUORESCENT: Grade = { warm: 1, saturation: 1.08, brightness: 1.03 };

export const IMAGENES: Imagen[] = [
  {
    source: 'yoga1.jpeg',
    name: 'meditacion-sentada',
    fallback: 400,
    crop: { left: 0, top: 0, width: 501, height: 668 },
    grade: { warm: 0.35, saturation: 1.03, brightness: 1 },
    widths: [320, 400, 501],
  },
  {
    source: 'yoga2.jpeg',
    name: 'clase-de-yoga',
    fallback: 960,
    crop: { left: 0, top: 313, width: 1254, height: 836 },
    grade: NEUTRAL,
    widths: [640, 960, 1254],
  },
  {
    source: 'yoga3.jpeg',
    name: 'yoga-al-aire-libre',
    fallback: 480,
    crop: { left: 0, top: 0, width: 640, height: 608 },
    grade: { warm: -0.3, saturation: 0.88, brightness: 1 },
    widths: [320, 480, 640],
  },
  {
    source: 'consciencia-corporal.jpg',
    name: 'consciencia-corporal',
    fallback: 480,
    crop: { left: 0, top: 95, width: 600, height: 905 },
    grade: NEUTRAL,
    widths: [360, 480, 600],
  },
  {
    source: 'nuestro-centro2.jpg',
    name: 'centro-sala',
    fallback: 960,
    crop: { left: 0, top: 180, width: 1600, height: 1020 },
    grade: FLUORESCENT,
    widths: [640, 960, 1280, 1600],
  },
  {
    source: 'nuestro-centro.jpg',
    name: 'centro-sala-amplia',
    fallback: 960,
    crop: { left: 0, top: 210, width: 1600, height: 640 },
    grade: FLUORESCENT,
    widths: [640, 960, 1280, 1600],
  },
  {
    source: 'nuestro-centro3.txt',
    name: 'centro-materiales',
    fallback: 960,
    crop: { left: 128, top: 250, width: 1472, height: 950 },
    grade: FLUORESCENT,
    widths: [640, 960, 1280, 1472],
  },
  {
    source: 'nuestro-centro4.txt',
    name: 'centro-camilla',
    fallback: 690,
    crop: { left: 460, top: 0, width: 920, height: 760 },
    grade: { warm: 1, saturation: 0.9, brightness: 1.03 },
    widths: [460, 690, 920],
  },
];

export function imagen(nombre: string): Imagen {
  const encontrada = IMAGENES.find((candidata) => candidata.name === nombre);
  if (!encontrada) throw new Error(`No hay derivadas de imagen para "${nombre}".`);
  return encontrada;
}

export function altoRenderizado({ fallback, crop }: Imagen): number {
  return Math.round((fallback * crop.height) / crop.width);
}
