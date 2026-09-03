// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { conectarCampos, pintarCampos } from './campos-ajustes';
import { parseSnapshot, type Snapshot } from '../data/sheet';

const DEFECTO = 'Escucha tu cuerpo.';

function monta(): void {
  document.body.innerHTML = `
    <p class="eyebrow" data-campo="mes">Septiembre</p>
    <p data-campo="nota_pie" data-defecto="${DEFECTO}">Nota horneada</p>
    <p class="lead">Lema horneado, en Catarroja.</p>
    <template><p data-campo="mes">Septiembre</p></template>
  `;
}

function texto(selector: string): string | null {
  return document.querySelector(selector)?.textContent ?? null;
}

function snapshotCon(mes: string, notaPie: string): Snapshot {
  const snapshot = parseSnapshot({
    actividades: 'nombre,grupo,descripcion\nHatha Yoga,yoga,Equilibrio.',
    horarios: 'dia,hora,actividad\nLunes,9:30,Yoga Sana',
    ajustes: `clave,valor\nmes,${mes}\nnota_pie,${notaPie}`,
  });
  if (!snapshot) throw new Error('the fixture CSV no longer parses');
  return snapshot;
}

beforeEach(monta);

describe('pintarCampos', () => {
  it('repinta cada campo con el valor fresco de ajustes', () => {
    pintarCampos(document, { mes: 'Octubre', nota_pie: 'Nota nueva' });

    expect(texto('.eyebrow')).toBe('Octubre');
    expect(texto('[data-campo="nota_pie"]')).toBe('Nota nueva');
  });

  it('cae en data-defecto cuando la hoja trae la clave vacía', () => {
    pintarCampos(document, { mes: 'Octubre', nota_pie: '   ' });

    expect(texto('[data-campo="nota_pie"]')).toBe(DEFECTO);
  });

  it('deja el campo vacío cuando no hay valor ni defecto', () => {
    pintarCampos(document, {});

    expect(texto('.eyebrow')).toBe('');
  });

  it('no toca el texto que no lleva data-campo', () => {
    pintarCampos(document, { mes: 'Octubre' });

    expect(texto('.lead')).toBe('Lema horneado, en Catarroja.');
  });

  it('no alcanza los campos de dentro de un template, que pinta el PNG', () => {
    pintarCampos(document, { mes: 'Octubre' });

    const plantilla = document.querySelector('template');
    expect(plantilla?.content.querySelector('[data-campo]')?.textContent).toBe('Septiembre');
  });
});

describe('conectarCampos', () => {
  it('repinta al llegar el horario fresco', () => {
    conectarCampos(document);

    document.dispatchEvent(
      new CustomEvent('horario:actualizado', { detail: snapshotCon('Octubre', 'Nota nueva') }),
    );

    expect(texto('.eyebrow')).toBe('Octubre');
    expect(texto('[data-campo="nota_pie"]')).toBe('Nota nueva');
  });
});
