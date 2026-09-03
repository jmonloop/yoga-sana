import { readFile, writeFile } from 'node:fs/promises';
import { isUsableSnapshot, parseSnapshot } from '../src/data/sheet.ts';
import { csvUrl, hasSheet, SHEET_ID, TABS } from '../src/data/sheet-config.ts';

const SNAPSHOT = new URL('../src/data/snapshot.json', import.meta.url);

main().catch((error) => {
  console.error(`✖ No snapshot written: ${error.message}`);
  console.error('  The committed src/data/snapshot.json is left untouched.');
  process.exit(1);
});

async function main() {
  const csv = await readSource(process.argv.slice(2));
  const snapshot = parseSnapshot(csv);
  if (!snapshot) throw new Error('a tab is missing a required column, so the Sheet was rejected');
  if (!isUsableSnapshot(snapshot)) throw new Error('the source has no actividades or no horarios');
  await writeFile(SNAPSHOT, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(
    `✔ src/data/snapshot.json: ${snapshot.actividades.length} actividades, ` +
      `${snapshot.horarios.length} horarios, ${Object.keys(snapshot.ajustes).length} ajustes`,
  );
}

async function fetchTabs() {
  console.log(`Fetching the shared Sheet ${SHEET_ID}`);
  return readTabs((tab) => fetchCsv(csvUrl(tab)));
}

async function readSource(argv) {
  if (argv.includes('--seed') || !hasSheet()) return readSeed();
  return fetchTabs();
}

async function readSeed() {
  console.log('Reading the seed/ CSVs');
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
