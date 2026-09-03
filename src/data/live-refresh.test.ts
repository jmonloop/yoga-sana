import { afterEach, describe, expect, it, vi } from 'vitest';
import { onFreshSnapshot } from './live-refresh';
import { parseSnapshot, type Snapshot, type TabCsv } from './sheet';

const sheet = vi.hoisted(() => ({ id: '' }));

vi.mock('./sheet-config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./sheet-config')>()),
  hasSheet: () => sheet.id !== '',
  csvUrl: (tab: string) => `https://sheet.test/${tab}`,
}));

const BAKED: TabCsv = {
  actividades: 'nombre,grupo,descripcion\nHatha Yoga,yoga,Equilibrio.',
  horarios: 'dia,hora,actividad\nLunes,9:30,Yoga Sana',
  ajustes: 'clave,valor\nmes,Septiembre',
};

const LIVE: TabCsv = { ...BAKED, ajustes: 'clave,valor\nmes,Octubre' };

function snapshotOf(csv: TabCsv): Snapshot {
  const snapshot = parseSnapshot(csv);
  if (!snapshot) throw new Error('the fixture CSV no longer parses');
  return snapshot;
}

function configureSheet(): void {
  sheet.id = '1AbCdEf';
}

function serve(tabs: Partial<TabCsv>) {
  const fetcher = vi.fn((url: string) => {
    const tab = new URL(url).pathname.slice(1) as keyof TabCsv;
    const body = tabs[tab];
    return Promise.resolve(new Response(body ?? '', { status: body === undefined ? 404 : 200 }));
  });
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}

afterEach(() => {
  sheet.id = '';
  vi.unstubAllGlobals();
});

describe('onFreshSnapshot', () => {
  it('does nothing and never touches the network when no Sheet id is committed', async () => {
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

    await expect(onFreshSnapshot(snapshotOf(BAKED), apply)).resolves.toBeUndefined();
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

  it('swallows an exception thrown by the re-render it triggers', async () => {
    configureSheet();
    serve(LIVE);
    const apply = vi.fn(() => {
      throw new Error('the grid blew up');
    });

    await expect(onFreshSnapshot(snapshotOf(BAKED), apply)).resolves.toBeUndefined();
    expect(apply).toHaveBeenCalled();
  });

  it('keeps the baked snapshot when the live CSV is missing a required column', async () => {
    configureSheet();
    serve({ ...LIVE, horarios: 'dia,actividad\nLunes,Yoga Sana' });
    const apply = vi.fn();

    await onFreshSnapshot(snapshotOf(BAKED), apply);

    expect(apply).not.toHaveBeenCalled();
  });
});
