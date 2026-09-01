import { readFile, writeFile } from 'node:fs/promises';
import { isUsableSnapshot, parseSnapshot } from '../src/data/sheet.ts';
import {
  csvUrl,
  missingSheetEnvKeys,
  SHEET_ENV_KEYS,
  TABS,
  toSheetConfig,
} from '../src/data/sheet-config.ts';

const SNAPSHOT = new URL('../src/data/snapshot.json', import.meta.url);

main().catch((error) => {
  console.error(`✖ No snapshot written: ${error.message}`);
  console.error('  The committed src/data/snapshot.json is left untouched.');
  process.exit(1);
});

async function main() {
  const csv = await readSource(process.env);
  const snapshot = parseSnapshot(csv);
  if (!snapshot) throw new Error('a tab is missing a required column, so the Sheet was rejected');
  if (!isUsableSnapshot(snapshot)) throw new Error('the source has no actividades or no horarios');
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

async function readSource(env) {
  const config = toSheetConfig(env);
  if (config) return fetchTabs(config);
  const missing = missingSheetEnvKeys(env);
  if (missing.length < SHEET_ENV_KEYS.length) {
    throw new Error(`the Sheet is only half configured, missing ${missing.join(', ')}`);
  }
  console.log('No published Sheet configured, falling back to the seed/ CSVs');
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
