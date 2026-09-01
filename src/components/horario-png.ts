import type { Ajustes, Snapshot } from '../data/sheet';

declare global {
  interface DocumentEventMap {
    'horario:actualizado': CustomEvent<Snapshot>;
  }
}

const MENSAJES = {
  trabajando: 'Preparando la imagen…',
  listo: 'Listo. Busca la imagen en tus descargas. Si no aparece, mantén pulsada la imagen para guardarla.',
  error: 'No se ha podido crear la imagen. Vuelve a intentarlo.',
} as const;

const CLON_EN_ORIGEN: Partial<CSSStyleDeclaration> = { position: 'static', top: '0', left: '0' };
const NAVEGADOR_INCRUSTADO = /Instagram|FBAN|FBAV|FB_IAB/i;
const LIMITE_MS = 20_000;
const VIDA_URL_MS = 60_000;

let cssFuentes: string | null = null;

interface Descarga {
  raiz: HTMLElement;
  boton: HTMLButtonElement;
  estado: HTMLElement;
  plantilla: HTMLTemplateElement;
}

export function nombreArchivo(mes: string | undefined): string {
  const slug = (mes ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug === '' ? 'horario-yoga-sana.png' : `horario-${slug}-yoga-sana.png`;
}

export function conectarDescarga(raiz: Element | null): void {
  const boton = raiz?.querySelector('button');
  const estado = raiz?.querySelector<HTMLElement>('[data-estado]');
  const plantilla = raiz?.querySelector('template');
  if (!(raiz instanceof HTMLElement) || !boton || !estado || !plantilla) return;
  boton.addEventListener('click', () => void descargar({ raiz, boton, estado, plantilla }));
  document.addEventListener('horario:actualizado', (evento) => {
    actualizarChrome(raiz, plantilla, evento.detail.ajustes);
  });
}

function actualizarChrome(
  raiz: HTMLElement,
  plantilla: HTMLTemplateElement,
  ajustes: Ajustes,
): void {
  raiz.dataset['mes'] = limpio(ajustes['mes']);
  plantilla.content.querySelectorAll<HTMLElement>('[data-campo]').forEach((campo) => {
    campo.textContent = limpio(ajustes[campo.dataset['campo'] ?? '']);
  });
}

function limpio(valor: string | undefined): string {
  return (valor ?? '').trim();
}

async function descargar({ raiz, boton, estado, plantilla }: Descarga): Promise<void> {
  const teniaFoco = document.activeElement === boton;
  boton.disabled = true;
  estado.textContent = MENSAJES.trabajando;
  let lamina: HTMLElement | null = null;
  try {
    lamina = montarLamina(plantilla);
    const blob = await Promise.race([rasterizar(lamina), expiraEn(LIMITE_MS)]);
    guardar(blob, nombreArchivo(raiz.dataset['mes']));
    estado.textContent = MENSAJES.listo;
  } catch (error) {
    console.error(error);
    estado.textContent = MENSAJES.error;
  } finally {
    lamina?.remove();
    boton.disabled = false;
    if (teniaFoco) boton.focus();
  }
}

function montarLamina(plantilla: HTMLTemplateElement): HTMLElement {
  const lamina = plantilla.content.firstElementChild?.cloneNode(true);
  if (!(lamina instanceof HTMLElement)) throw new Error('la plantilla de la lámina está vacía');
  const destino = lamina.querySelector('[data-destino]');
  const horario = document.querySelector('[data-horario]');
  if (!destino) throw new Error('la lámina no tiene hueco para el horario');
  if (!horario) throw new Error('no hay horario en la página que exportar');
  destino.appendChild(horario.cloneNode(true));
  destino.firstElementChild?.removeAttribute('data-horario');
  lamina.setAttribute('aria-hidden', 'true');
  lamina.setAttribute('inert', '');
  document.body.appendChild(lamina);
  return lamina;
}

async function rasterizar(lamina: HTMLElement): Promise<Blob> {
  if (lamina.offsetHeight === 0) throw new Error('la lámina no ha maquetado');
  const [{ getFontEmbedCSS, toBlob }] = await Promise.all([
    import('html-to-image'),
    document.fonts.ready,
  ]);
  cssFuentes ??= await getFontEmbedCSS(lamina);
  const blob = await toBlob(lamina, {
    pixelRatio: 2,
    fontEmbedCSS: cssFuentes,
    style: CLON_EN_ORIGEN,
  });
  if (!blob) throw new Error('el navegador no ha devuelto la imagen');
  return blob;
}

function expiraEn(ms: number): Promise<never> {
  return new Promise((_, rechaza) => {
    window.setTimeout(() => rechaza(new Error('la imagen ha tardado demasiado')), ms);
  });
}

function guardar(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  if (NAVEGADOR_INCRUSTADO.test(navigator.userAgent)) window.open(url, '_blank');
  else descargarEnlace(url, nombre);
  window.setTimeout(() => URL.revokeObjectURL(url), VIDA_URL_MS);
}

function descargarEnlace(url: string, nombre: string): void {
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
}
