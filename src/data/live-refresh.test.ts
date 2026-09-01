import { afterEach, describe, expect, it, vi } from 'vitest';
import { onFreshSnapshot } from './live-refresh';
import { parseSnapshot, type Snapshot, type TabCsv } from './sheet';

const BAKED: TabCsv = {
  actividades: 'nombre,grupo,descripcion\nHatha Yoga,yoga,Equilibrio.',
  horarios: 'dia,hora,actividad\nLunes,9:30,Yoga Sana',
  ajustes: 'clave,valor\nmes,Septiembre',
};

const LIVE: TabCsv = { ...BAKED, ajustes: 'clave,valor\nmes,Octubre' };

const snapshotOf = (csv: TabCsv): Snapshot => parseSnapshot(csv)!;

function configureSheet(): void {
  vi.stubEnv('PUBLIC_SHEET_ID', '2PACX-abc');
  vi.stubEnv('PUBLIC_SHEET_GID_ACTIVIDADES', '0');
  vi.stubEnv('PUBLIC_SHEET_GID_HORARIOS', '1');
  vi.stubEnv('PUBLIC_SHEET_GID_AJUSTES', '2');
}

const TAB_BY_GID: Record<string, keyof TabCsv> = {
  '0': 'actividades',
  '1': 'horarios',
  '2': 'ajustes',
};

function serve(tabs: Partial<TabCsv>) {
  const fetcher = vi.fn((url: string) => {
    const tab = TAB_BY_GID[new URL(url).searchParams.get('gid') ?? ''];
    const body = tab === undefined ? undefined : tabs[tab];
    return Promise.resolve(new Response(body ?? '', { status: body === undefined ? 404 : 200 }));
  });
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('onFreshSnapshot', () => {
  it('does nothing and never touches the network when no Sheet is configured', async () => {
    const fetcher = serve(LIVE);
    const apply = vi.fn();

    await onFreshSnapshot(snapshotOf(BAKED), apply);

    expect(fetcher).not.toHaveBeenCalled();
    expect(apply).not.toHaveBeenCalled();
  });

  it('hands over the live snapshot when it parses and differs', async () => {
    configureSheet();
    serve(LIVE);
    const apply = vi.fn();

    await onFreshSnapshot(snapshotOf(BAKED), apply);

    expect(apply).toHaveBeenCalledWith(snapshotOf(LIVE));
  });

  it('stays quiet when the live Sheet matches the baked snapshot', async () => {
    configureSheet();
    serve(BAKED);
    const apply = vi.fn();

    await onFreshSnapshot(snapshotOf(BAKED), apply);

    expect(apply).not.toHaveBeenCalled();
  });

  it('keeps the baked snapshot when a tab answers with an error status', async () => {
    configureSheet();
    serve({ ...LIVE, horarios: undefined });
    const apply = vi.fn();

    await onFreshSnapshot(snapshotOf(BAKED), apply);

    expect(apply).not.toHaveBeenCalled();
  });

  it('keeps the baked snapshot when the network throws', async () => {
    configureSheet();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Failed to fetch'))),
    );
    const apply = vi.fn();

    await expect(onFreshSnapshot(snapshotOf(BAKED), vi.fn())).resolves.toBeUndefined();
    expect(apply).not.toHaveBeenCalled();
  });

  it('keeps the baked snapshot when the live Sheet has been emptied of rows', async () => {
    configureSheet();
    serve({
      actividades: 'nombre,grupo,descripcion',
      horarios: 'dia,hora,actividad',
      ajustes: 'clave,valor',
    });
    const apply = vi.fn();

    await onFreshSnapshot(snapshotOf(BAKED), apply);

    expect(apply).not.toHaveBeenCalled();
  });

  it('keeps the baked snapshot when the live CSV is missing a required column', async () => {
    configureSheet();
    serve({ ...LIVE, horarios: 'dia,actividad\nLunes,Yoga Sana' });
    const apply = vi.fn();

    await onFreshSnapshot(snapshotOf(BAKED), apply);

    expect(apply).not.toHaveBeenCalled();
  });
});
