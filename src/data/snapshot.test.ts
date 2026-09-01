import { describe, expect, it } from 'vitest';
import { sinPuntoFinal } from './snapshot';

describe('sinPuntoFinal', () => {
  it('leaves a value that does not end in a full stop alone', () => {
    expect(sinPuntoFinal('Tu espacio para respirar')).toBe('Tu espacio para respirar');
  });

  it('drops the full stop the owner may have typed in the Sheet', () => {
    expect(sinPuntoFinal('Tu espacio para respirar.')).toBe('Tu espacio para respirar');
  });

  it('drops a repeated full stop, so the page never shows «..»', () => {
    expect(sinPuntoFinal('Tu espacio para respirar...')).toBe('Tu espacio para respirar');
  });

  it('keeps full stops that are not at the end', () => {
    expect(sinPuntoFinal('Escucha tu cuerpo. Honra tu proceso.')).toBe(
      'Escucha tu cuerpo. Honra tu proceso',
    );
  });
});
