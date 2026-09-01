import raw from './snapshot.json';
import { isUsableSnapshot, type Snapshot } from './sheet';

export const TAGLINE_POR_DEFECTO = 'Tu espacio para respirar, conectar y reconectar contigo';
export const NOTA_PIE_POR_DEFECTO =
  'Clases para todos los niveles. Escucha tu cuerpo, honra tu proceso.';

function assertUsable(candidate: Snapshot): Snapshot {
  if (!isUsableSnapshot(candidate)) {
    throw new Error(
      'src/data/snapshot.json has no actividades or no horarios. Run `pnpm snapshot` before building.',
    );
  }
  return candidate;
}

export const SNAPSHOT = assertUsable(raw as Snapshot);

export function ajuste(clave: string, porDefecto = ''): string {
  return (SNAPSHOT.ajustes[clave] ?? '').trim() || porDefecto;
}
