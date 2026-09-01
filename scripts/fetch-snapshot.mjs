import { readFile, writeFile } from 'node:fs/promises';
import { parseSnapshot } from '../src/data/sheet.ts';
import { csvUrl, TABS, toSheetConfig } from '../src/data/sheet-config.ts';

const SNAPSHOT = new URL('../src/data/snapshot.json', import.meta.url);

main().catch((error) => {
  console.error(`✖ No snapshot written: ${error.message}`);
  console.error('  The committed src/data/snapshot.json is left untouched.');
  process.exit(1);
});

async function main() {
  const config = toSheetConfig(process.env);
  const csv = config ? await fetchTabs(config) : await readSeedTabs();
  const snapshot = parseSnapshot(csv);
  if (!snapshot) throw new Error('a tab is missing a required column, so the Sheet was rejected');
  await writeFile(SNAPSHOT, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(
    `✔ src/data/snapshot.json: ${snapshot.actividades.length} actividades, ` +
      `${snapshot.horarios.length} horarios, ${Object.keys(snapshot.ajustes).length} ajustes`,
  );
}

async function fetchTabs(config) {
  console.log(`Fetching the published Sheet ${config.sheetId}`);
  return readTabs((tab) => fetchCsv(csvUrl(config, tab)));
}

async function readSeedTabs() {
  console.log('No PUBLIC_SHEET_ID in the environment, falling back to the seed/ CSVs');
  return readTabs((tab) => readFile(new URL(`../seed/${tab}.csv`, import.meta.url), 'utf8'));
}

async function readTabs(readTab) {
  const texts = await Promise.all(TABS.map((tab) => readTab(tab)));
  return Object.fromEntries(TABS.map((tab, index) => [tab, texts[index]]));
}

async function fetchCsv(url) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.text();
}
