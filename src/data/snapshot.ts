import raw from './snapshot.json';
import { isUsableSnapshot, type Snapshot } from './sheet';

function assertUsable(candidate: Snapshot): Snapshot {
  if (!isUsableSnapshot(candidate)) {
    throw new Error(
      'src/data/snapshot.json has no actividades or no horarios. Run `pnpm snapshot` before building.',
    );
  }
  return candidate;
}

export const SNAPSHOT = assertUsable(raw as Snapshot);
