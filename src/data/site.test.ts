import { describe, expect, it } from 'vitest';
import { MENSAJES_WA, WHATSAPP_NUMBER, waLink } from './site';

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

  it('builds the contacto link from the shared message map', () => {
    expect(waLink(MENSAJES_WA.contacto)).toBe(
      'https://wa.me/34677808098?text=%C2%A1Hola%20Natalia!%20Tengo%20una%20duda%20sobre%20Yoga%20Sana.',
    );
  });
});

describe('MENSAJES_WA', () => {
  it('produces a link with no unencoded whitespace for every fixed message', () => {
    const links = Object.values(MENSAJES_WA).map(waLink);
    expect(links.every((link) => !/\s/.test(link))).toBe(true);
  });
});
