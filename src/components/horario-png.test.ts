// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { conectarDescarga, nombreArchivo } from './horario-png';

const ERROR = 'No se ha podido crear la imagen. Vuelve a intentarlo.';

interface Piezas {
  boton?: boolean;
  estado?: boolean;
  plantilla?: string;
  horario?: boolean;
}

function montaPagina({ boton = true, estado = true, plantilla, horario = true }: Piezas): void {
  document.body.innerHTML = `
    ${horario ? '<div class="horario" data-horario><table></table></div>' : ''}
    <div data-descarga-horario data-mes="Septiembre">
      ${boton ? '<button type="button">Descargar horario</button>' : ''}
      ${estado ? '<p data-estado></p>' : ''}
      ${plantilla === undefined ? '' : `<template>${plantilla}</template>`}
    </div>
  `;
}

async function pulsa(): Promise<void> {
  document.querySelector('button')?.click();
  await vi.waitFor(() => expect(document.querySelector('[data-estado]')?.textContent).not.toBe(''));
}

const LAMINA = '<div class="lamina"><div data-destino></div></div>';

describe('nombreArchivo', () => {
  it('usa el mes de ajustes en minúsculas', () => {
    expect(nombreArchivo('Septiembre')).toBe('horario-septiembre-yoga-sana.png');
  });

  it('quita los acentos y la eñe compuesta', () => {
    expect(nombreArchivo('Otoño')).toBe('horario-otono-yoga-sana.png');
  });

  it('convierte espacios y puntuación en guiones simples', () => {
    expect(nombreArchivo('  Marzo / abril 2026  ')).toBe('horario-marzo-abril-2026-yoga-sana.png');
  });

  it('cae en un nombre genérico sin mes utilizable', () => {
    expect(nombreArchivo(undefined)).toBe('horario-yoga-sana.png');
    expect(nombreArchivo('   ')).toBe('horario-yoga-sana.png');
    expect(nombreArchivo('«»/·')).toBe('horario-yoga-sana.png');
  });
});

describe('conectarDescarga', () => {
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => undefined));
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('no conecta nada si no encuentra la raíz', () => {
    expect(() => conectarDescarga(null)).not.toThrow();
  });

  it('no conecta nada si a la raíz le falta el botón, el estado o la plantilla', () => {
    for (const piezas of [{ boton: false }, { estado: false }, { plantilla: undefined }]) {
      montaPagina({ plantilla: LAMINA, ...piezas });
      conectarDescarga(document.querySelector('[data-descarga-horario]'));
      document.querySelector('button')?.click();
      expect(document.querySelector('[data-estado]')?.textContent ?? '').toBe('');
    }
  });

  it('avisa y no deja lámina si la plantilla está vacía', async () => {
    montaPagina({ plantilla: '' });
    conectarDescarga(document.querySelector('[data-descarga-horario]'));
    await pulsa();
    expect(document.querySelector('[data-estado]')?.textContent).toBe(ERROR);
    expect(document.querySelectorAll('.lamina')).toHaveLength(0);
  });

  it('avisa si la lámina no tiene hueco para el horario', async () => {
    montaPagina({ plantilla: '<div class="lamina"></div>' });
    conectarDescarga(document.querySelector('[data-descarga-horario]'));
    await pulsa();
    expect(document.querySelector('[data-estado]')?.textContent).toBe(ERROR);
    expect(document.querySelectorAll('.lamina')).toHaveLength(0);
  });

  it('avisa si la página no tiene horario que exportar', async () => {
    montaPagina({ plantilla: LAMINA, horario: false });
    conectarDescarga(document.querySelector('[data-descarga-horario]'));
    await pulsa();
    expect(document.querySelector('[data-estado]')?.textContent).toBe(ERROR);
    expect(document.querySelectorAll('.lamina')).toHaveLength(0);
  });

  it('reactiva el botón y registra la causa tras fallar', async () => {
    montaPagina({ plantilla: LAMINA, horario: false });
    conectarDescarga(document.querySelector('[data-descarga-horario]'));
    await pulsa();
    expect(document.querySelector('button')?.disabled).toBe(false);
    expect(console.error).toHaveBeenCalledWith(expect.any(Error));
  });

  it('actualiza mes, tagline y nota del chrome cuando llega un horario fresco', () => {
    montaPagina({
      plantilla: `<div class="lamina"><p data-campo="mes">Septiembre</p>
        <p data-campo="tagline">Vieja</p><div data-destino></div>
        <p data-campo="nota_pie">Vieja</p></div>`,
    });
    conectarDescarga(document.querySelector('[data-descarga-horario]'));
    const ajustes = { mes: '  Octubre  ', tagline: 'Nueva', nota_pie: '   ' };
    document.dispatchEvent(
      new CustomEvent('horario:actualizado', {
        detail: { actividades: [], horarios: [], ajustes },
      }),
    );
    const raiz = document.querySelector<HTMLElement>('[data-descarga-horario]');
    const campos = raiz?.querySelector('template')?.content ?? null;
    expect(raiz?.dataset['mes']).toBe('Octubre');
    expect(campos?.querySelector('[data-campo="mes"]')?.textContent).toBe('Octubre');
    expect(campos?.querySelector('[data-campo="tagline"]')?.textContent).toBe('Nueva');
    expect(campos?.querySelector('[data-campo="nota_pie"]')?.textContent).toBe('');
  });
});
