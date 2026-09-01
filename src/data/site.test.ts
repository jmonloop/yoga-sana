import { describe, expect, it } from 'vitest';
import { CTAS, WHATSAPP_NUMBER, waLink } from './site';

describe('waLink', () => {
  it('prefixes the wa.me endpoint with the studio number', () => {
    expect(waLink('Hola')).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=Hola`);
  });

  it('encodes spaces, accents, eñe and inverted punctuation', () => {
    expect(waLink('¿Añades una señal más?')).toBe(
      'https://wa.me/34677808098?text=%C2%BFA%C3%B1ades%20una%20se%C3%B1al%20m%C3%A1s%3F',
    );
  });

  it('encodes the euro sign and the slash in prices', () => {
    expect(waLink('30 €/mes')).toBe('https://wa.me/34677808098?text=30%20%E2%82%AC%2Fmes');
  });

  it('round-trips every fixed CTA message through the URL unchanged', () => {
    for (const cta of Object.values(CTAS)) {
      expect(new URL(waLink(cta.message)).searchParams.get('text')).toBe(cta.message);
    }
  });
});

describe('CTAS', () => {
  it('keeps the visible label inside the composed accessible name', () => {
    for (const cta of Object.values(CTAS)) {
      expect(`${cta.label}: ${cta.ariaSuffix}`).toContain(cta.label);
    }
  });
});
