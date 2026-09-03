import type { Ajustes, Snapshot } from '../data/sheet';

declare global {
  interface DocumentEventMap {
    'horario:actualizado': CustomEvent<Snapshot>;
  }
}

export function pintarCampos(raiz: ParentNode, ajustes: Ajustes): void {
  raiz.querySelectorAll<HTMLElement>('[data-campo]').forEach((campo) => {
    campo.textContent = valorDe(ajustes, campo);
  });
}

export function conectarCampos(raiz: ParentNode): void {
  document.addEventListener('horario:actualizado', (evento) => {
    pintarCampos(raiz, evento.detail.ajustes);
  });
}

function valorDe(ajustes: Ajustes, campo: HTMLElement): string {
  const fresco = (ajustes[campo.dataset['campo'] ?? ''] ?? '').trim();
  return fresco || (campo.dataset['defecto'] ?? '');
}
