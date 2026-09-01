import { describe, expect, it } from 'vitest';
import { buildGrid } from './horario-grid';
import { renderHorario, renderLista, renderTabla } from './horario-markup';
import { SNAPSHOT } from '../data/snapshot';
import type { Ajustes, Horario } from '../data/sheet';

function markupOf(horarios: Horario[], ajustes: Ajustes = {}): string {
  return renderHorario({ actividades: [], horarios, ajustes });
}

function countChips(markup: string): number {
  return markup.match(/class="horario-chip/g)?.length ?? 0;
}

const SEED = buildGrid(SNAPSHOT);
const TABLA = renderTabla(SEED);
const LISTA = renderLista(SEED);

describe('the table view', () => {
  it('heads every column with a scoped day and every row with a scoped time', () => {
    expect(TABLA).toContain('<th scope="col">Miércoles</th>');
    expect(TABLA).toContain('<th scope="row">17:30</th>');
  });

  it('describes itself to a screen reader', () => {
    expect(TABLA).toContain('<caption class="visually-hidden">Horario semanal de clases</caption>');
  });

  it('marks the banded row and only that one', () => {
    expect(TABLA.match(/horario-banda/g)).toHaveLength(1);
    expect(TABLA).toContain('<tr class="horario-banda"><th scope="row">17:30</th>');
  });

  it('leaves a slot with no class empty', () => {
    expect(TABLA).toContain('<td></td>');
  });
});

describe('the stacked view', () => {
  it('heads each day and lists its times under it', () => {
    expect(LISTA).toContain('<h3>Viernes</h3>');
    expect(LISTA).toContain('<p class="horario-hora">20:00</p>');
  });

  it('shows the same 17 classes as the table, from the same grid', () => {
    expect(countChips(LISTA)).toBe(17);
    expect(countChips(TABLA)).toBe(17);
  });
});

describe('every chip', () => {
  it('opens a prefilled WhatsApp booking in a new tab', () => {
    const mensaje = encodeURIComponent(
      '¡Hola Natalia! Me gustaría reservar plaza en Yoga Infantil del Jueves a las 17:30.' +
        ' ¿Queda sitio?',
    );

    expect(TABLA).toContain(
      `<a class="horario-chip color-melocoton" href="https://wa.me/34677808098?text=${mensaje}"` +
        ' aria-label="Yoga Infantil: reservar plaza el jueves a las 17:30 por WhatsApp"' +
        ' target="_blank" rel="noopener">Yoga Infantil</a>',
    );
  });

  it('renders its nota underneath', () => {
    expect(TABLA).toContain(
      '>Meditación guiada</a><p class="horario-nota">Reserva anticipada</p>',
    );
  });
});

describe('sheet text that looks like markup', () => {
  it('is escaped everywhere it lands', () => {
    const markup = markupOf([
      { dia: 'Lunes', hora: '9:30', actividad: '<b>Yoga</b> & "Paz"', nota: '<i>ojo</i>' },
    ]);

    expect(markup).not.toContain('<b>');
    expect(markup).not.toContain('<i>');
    expect(markup).toContain('&lt;b&gt;Yoga&lt;/b&gt; &amp; &quot;Paz&quot;');
    expect(markup).toContain('&lt;i&gt;ojo&lt;/i&gt;');
  });
});

describe('the whole component markup', () => {
  it('ships both views so CSS alone decides which one shows', () => {
    const markup = renderHorario(SNAPSHOT);

    expect(markup).toContain('<table class="horario-tabla">');
    expect(markup).toContain('<div class="horario-lista">');
    expect(countChips(markup)).toBe(34);
  });
});
