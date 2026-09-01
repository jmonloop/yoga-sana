import type { Actividad, Grupo } from '../data/sheet';
import { CTAS, type Cta } from '../data/site';

export const ETIQUETA_EMPRESAS = 'PARA EMPRESAS';

export function actividadesDe(actividades: Actividad[], grupo: Grupo): Actividad[] {
  return actividades.filter((actividad) => actividad.grupo === grupo).sort(porOrden);
}

function porOrden(a: Actividad, b: Actividad): number {
  return a.orden - b.orden;
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
