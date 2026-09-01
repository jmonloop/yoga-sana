import { browserSheetConfig, csvUrl, type SheetConfig } from './sheet-config';
import { isUsableSnapshot, parseSnapshot, type Snapshot, type TabCsv } from './sheet';

export async function onFreshSnapshot(
  baked: Snapshot,
  apply: (snapshot: Snapshot) => void,
): Promise<void> {
  const config = browserSheetConfig();
  if (!config) return;
  const fresh = await readLiveSnapshot(config);
  if (fresh && differs(fresh, baked)) apply(fresh);
}

async function readLiveSnapshot(config: SheetConfig): Promise<Snapshot | null> {
  try {
    const live = parseSnapshot(await fetchTabs(config));
    return live && isUsableSnapshot(live) ? live : null;
  } catch {
    return null;
  }
}

async function fetchTabs(config: SheetConfig): Promise<TabCsv> {
  const [actividades, horarios, ajustes] = await Promise.all([
    fetchCsv(csvUrl(config, 'actividades')),
    fetchCsv(csvUrl(config, 'horarios')),
    fetchCsv(csvUrl(config, 'ajustes')),
  ]);
  return { actividades, horarios, ajustes };
}

async function fetchCsv(url: string): Promise<string> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

function differs(fresh: Snapshot, baked: Snapshot): boolean {
  return JSON.stringify(fresh) !== JSON.stringify(baked);
}
