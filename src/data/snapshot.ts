import raw from './snapshot.json';
import type { Snapshot } from './sheet';

function assertUsable(candidate: Snapshot): Snapshot {
  if (candidate.actividades.length === 0 || candidate.horarios.length === 0) {
    throw new Error(
      'src/data/snapshot.json has no actividades or no horarios. Run `pnpm snapshot` before building.',
    );
  }
  return candidate;
}

export const SNAPSHOT = assertUsable(raw as Snapshot);
