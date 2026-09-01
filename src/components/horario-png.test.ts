import { describe, expect, it } from 'vitest';
import { nombreArchivo } from './horario-png';

describe('nombreArchivo', () => {
  it('usa el mes de ajustes en minúsculas', () => {
    expect(nombreArchivo('Septiembre')).toBe('horario-septiembre-yoga-sana.png');
  });

  it('quita los acentos y la eñe compuesta', () => {
    expect(nombreArchivo('Otoño')).toBe('horario-otono-yoga-sana.png');
  });

  it('convierte espacios y puntuación en guiones simples', () => {
    expect(nombreArchivo('  Marzo / abril 2026  ')).toBe(
      'horario-marzo-abril-2026-yoga-sana.png',
    );
  });

  it('cae en un nombre genérico cuando falta la clave mes', () => {
    expect(nombreArchivo(undefined)).toBe('horario-yoga-sana.png');
  });

  it('cae en un nombre genérico cuando el mes está en blanco', () => {
    expect(nombreArchivo('   ')).toBe('horario-yoga-sana.png');
  });

  it('cae en un nombre genérico cuando el mes no deja caracteres útiles', () => {
    expect(nombreArchivo('«»/·')).toBe('horario-yoga-sana.png');
  });
});
