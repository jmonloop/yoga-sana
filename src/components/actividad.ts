import type { Actividad, Grupo } from '../data/sheet';
import { CTAS, type Cta, type Enlace } from '../data/site';

export const ETIQUETA_EMPRESAS = 'PARA EMPRESAS';

const LISTA = new Intl.ListFormat('es', { type: 'conjunction' });

export function actividadesDe(actividades: Actividad[], grupo: Grupo): Actividad[] {
  return actividades.filter((actividad) => actividad.grupo === grupo).sort(porOrden);
}

function porOrden(a: Actividad, b: Actividad): number {
  return a.orden - b.orden;
}

export function enlacesDe(
  actividades: Actividad[],
  enlaces: Record<string, Enlace>,
): Partial<Record<string, Enlace>> {
  const nombres = new Set(actividades.map(({ nombre }) => nombre));
  const huerfano = Object.keys(enlaces).find((nombre) => !nombres.has(nombre));
  if (huerfano) {
    throw new Error(
      `No hay ninguna actividad llamada "${huerfano}" entre las que se van a mostrar, así que su enlace no se renderizaría. Revisa el nombre en la hoja o en la página.`,
    );
  }
  return enlaces;
}

export function actividadCta(actividad: Actividad): Cta {
  const base = esParaEmpresas(actividad) ? ctaEmpresas(actividad) : ctaGenerada(actividad);
  return { ...base, message: actividad.mensajeWa?.trim() || base.message };
}

function esParaEmpresas({ etiqueta }: Actividad): boolean {
  return etiqueta.trim().toLocaleUpperCase('es') === ETIQUETA_EMPRESAS;
}

function ctaEmpresas({ nombre }: Actividad): Cta {
  return {
    message: CTAS.empresas.message,
    label: CTAS.empresas.label,
    ariaSuffix: `escribir por WhatsApp sobre ${nombre}, el programa de bienestar emocional para equipos`,
  };
}

function ctaGenerada(actividad: Actividad): Cta {
  return actividad.grupo === 'taller' ? ctaTaller(actividad) : ctaClase(actividad);
}

function ctaTaller({ nombre }: Actividad): Cta {
  return {
    message: `¡Hola Natalia! Me interesa el taller de ${nombre}. ¿Cuándo es el próximo?`,
    label: 'Me interesa',
    ariaSuffix: `escribir por WhatsApp sobre el taller de ${nombre}`,
  };
}

function ctaClase({ nombre }: Actividad): Cta {
  return {
    message: `¡Hola Natalia! Me interesa ${nombre}. ¿Me cuentas horarios y precios?`,
    label: 'Me interesa',
    ariaSuffix: `escribir por WhatsApp sobre ${nombre}: horarios y precios`,
  };
}

export function nombresEnumerados(actividades: Actividad[]): string {
  const nombres = actividades.map(({ nombre }) => nombre);
  return nombres.length === 0 ? '' : `${LISTA.format(nombres)}.`;
}
