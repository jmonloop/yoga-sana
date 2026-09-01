import { describe, expect, it } from 'vitest';
import { renderHorario } from './horario-markup';
import type { Ajustes, Horario } from '../data/sheet';

function slot(dia: string, hora: string, actividad: string, nota = ''): Horario {
  return { dia, hora, actividad, nota };
}

function markupOf(horarios: Horario[], ajustes: Ajustes = {}): string {
  return renderHorario({ actividades: [], horarios, ajustes });
}

function views(): { tabla: string; lista: string } {
  const [tabla, lista] = markupOf(SEPTIEMBRE, PINS).split('<div class="horario-lista">');
  return { tabla: tabla ?? '', lista: lista ?? '' };
}

function countChips(markup: string): number {
  return markup.match(/class="horario-chip/g)?.length ?? 0;
}

const SEPTIEMBRE = [
  slot('Lunes', '9:30', 'Yoga Sana'),
  slot('Miércoles', '11:00', 'Yoga Suave'),
  slot('Jueves', '17:30', 'Yoga Infantil'),
  slot('Viernes', '19:00', 'Meditación guiada', 'Reserva anticipada'),
];

const PINS: Ajustes = { 'color.Yoga Infantil': 'melocoton' };

describe('the table view', () => {
  it('heads every column with a scoped day and every row with a scoped time', () => {
    const { tabla } = views();

    expect(tabla).toContain('<th scope="col">Miércoles</th>');
    expect(tabla).toContain('<th scope="row">17:30</th>');
  });

  it('describes itself to a screen reader', () => {
    const { tabla } = views();

    expect(tabla).toContain('<caption class="visually-hidden">Horario semanal de clases</caption>');
  });

  it('marks the row under the band break and only that one', () => {
    const { tabla } = views();

    expect(tabla.match(/horario-banda/g)).toHaveLength(1);
    expect(tabla).toContain('<tr class="horario-banda"><th scope="row">17:30</th>');
  });

  it('leaves a day with no class at that time as an empty cell', () => {
    const { tabla } = views();

    expect(tabla).toContain('<td></td>');
  });
});

describe('the stacked view', () => {
  it('heads each day and lists its times under it', () => {
    const { lista } = views();

    expect(lista).toContain('<h3>Viernes</h3>');
    expect(lista).toContain('<p class="horario-hora">19:00</p>');
  });

  it('shows the same classes as the table, from the same grid', () => {
    const { tabla, lista } = views();

    expect(countChips(tabla)).toBe(SEPTIEMBRE.length);
    expect(countChips(lista)).toBe(SEPTIEMBRE.length);
  });
});

describe('every chip', () => {
  it('opens a prefilled WhatsApp booking in a new tab', () => {
    const mensaje = encodeURIComponent(
      '¡Hola Natalia! Me gustaría reservar plaza en Yoga Infantil del Jueves a las 17:30.' +
        ' ¿Queda sitio?',
    );

    expect(views().tabla).toContain(
      `<a class="horario-chip color-melocoton" href="https://wa.me/34677808098?text=${mensaje}"` +
        ' aria-label="Yoga Infantil: reservar plaza el jueves a las 17:30 por WhatsApp"' +
        ' target="_blank" rel="noopener">Yoga Infantil</a>',
    );
  });

  it('keeps its nota inside its own box, so stacked chips stay apart', () => {
    const markup = markupOf([
      slot('Lunes', '9:30', 'Meditación guiada', 'Reserva anticipada'),
      slot('Lunes', '9:30', 'Yoga Sana'),
    ]);

    expect(markup).toContain(
      '>Meditación guiada</a><p class="horario-nota">Reserva anticipada</p></div>' +
        '<div class="horario-clase">',
    );
  });
});

describe('sheet text that looks like markup', () => {
  it('is escaped everywhere it lands', () => {
    const markup = markupOf([
      { dia: 'Lunes', hora: '9:30', actividad: '<b>Yoga</b> & "Paz"', nota: "<i>d'ojo</i>" },
    ]);

    expect(markup).not.toContain('<b>');
    expect(markup).not.toContain('<i>');
    expect(markup).toContain('&lt;b&gt;Yoga&lt;/b&gt; &amp; &quot;Paz&quot;');
    expect(markup).toContain('&lt;i&gt;d&#39;ojo&lt;/i&gt;');
  });
});
