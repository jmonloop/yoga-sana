import { csvUrl, hasSheet } from './sheet-config';
import { isUsableSnapshot, parseSnapshot, type Snapshot, type TabCsv } from './sheet';

export async function onFreshSnapshot(
  baked: Snapshot,
  apply: (snapshot: Snapshot) => void,
): Promise<void> {
  if (!hasSheet()) return;
  try {
    const fresh = await readLiveSnapshot();
    if (fresh && differs(fresh, baked)) apply(fresh);
  } catch {
    return;
  }
}

async function readLiveSnapshot(): Promise<Snapshot | null> {
  const live = parseSnapshot(await fetchTabs());
  return live && isUsableSnapshot(live) ? live : null;
}

async function fetchTabs(): Promise<TabCsv> {
  const [actividades, horarios, ajustes] = await Promise.all([
    fetchCsv(csvUrl('actividades')),
    fetchCsv(csvUrl('horarios')),
    fetchCsv(csvUrl('ajustes')),
  ]);
  return { actividades, horarios, ajustes };
}

async function fetchCsv(url: string): Promise<string> {
  const response = await fetch(url, { cache: 'no-store', credentials: 'omit' });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

function differs(fresh: Snapshot, baked: Snapshot): boolean {
  return JSON.stringify(fresh) !== JSON.stringify(baked);
}
