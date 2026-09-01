const MENSAJES = {
  trabajando: 'Preparando la imagen…',
  listo: 'Listo. Busca la imagen en tus descargas.',
  error: 'No se ha podido crear la imagen. Vuelve a intentarlo.',
} as const;

const CLON_EN_ORIGEN: Partial<CSSStyleDeclaration> = { position: 'static', top: '0', left: '0' };

let cssFuentes: string | null = null;

interface Descarga {
  boton: HTMLButtonElement;
  estado: HTMLElement;
  plantilla: HTMLTemplateElement;
  mes: string | undefined;
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

export function iniciarDescargaHorario(): void {
  document.querySelectorAll<HTMLElement>('[data-descarga-horario]').forEach(conectar);
}

function conectar(raiz: HTMLElement): void {
  const boton = raiz.querySelector('button');
  const estado = raiz.querySelector<HTMLElement>('[data-estado]');
  const plantilla = raiz.querySelector('template');
  if (!boton || !estado || !plantilla) return;
  boton.addEventListener('click', () => {
    void descargar({ boton, estado, plantilla, mes: raiz.dataset['mes'] });
  });
}

async function descargar({ boton, estado, plantilla, mes }: Descarga): Promise<void> {
  if (boton.disabled) return;
  const teniaFoco = document.activeElement === boton;
  boton.disabled = true;
  estado.textContent = MENSAJES.trabajando;
  const lamina = montarLamina(plantilla);
  try {
    if (!lamina) throw new Error('no hay horario que exportar');
    await rasterizar(lamina, nombreArchivo(mes));
    estado.textContent = MENSAJES.listo;
  } catch {
    estado.textContent = MENSAJES.error;
  } finally {
    lamina?.remove();
    boton.disabled = false;
    if (teniaFoco) boton.focus();
  }
}

function montarLamina(plantilla: HTMLTemplateElement): HTMLElement | null {
  const lamina = plantilla.content.firstElementChild?.cloneNode(true);
  const horario = document.querySelector('[data-horario]');
  if (!(lamina instanceof HTMLElement) || !horario) return null;
  const destino = lamina.querySelector('[data-destino]');
  if (!destino) return null;
  destino.appendChild(horario.cloneNode(true));
  lamina.setAttribute('aria-hidden', 'true');
  document.body.appendChild(lamina);
  return lamina;
}

async function rasterizar(lamina: HTMLElement, nombre: string): Promise<void> {
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
  guardar(blob, nombre);
}

function guardar(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
