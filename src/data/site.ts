export const WHATSAPP_NUMBER = '34677808098';
export const INSTAGRAM = '@yoga_sanacatarroja';
export const INSTAGRAM_URL = 'https://www.instagram.com/yoga_sanacatarroja/';
export const NIF = '26759918Q';
export const DOMAIN = 'yogasana.es';
export const CANONICAL_ORIGIN = 'https://yogasana.es';

export function waLink(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

export const MENSAJES_WA = {
  empezar: '¡Hola Natalia! Me gustaría empezar en Yoga Sana. ¿Me cuentas cómo funciona?',
  reservarSanergia:
    '¡Hola Natalia! Me gustaría reservar una sesión de Sanergía presencial en Catarroja.',
  reservarSanergiaOnline: '¡Hola Natalia! Me gustaría reservar una sesión de Sanergía online.',
  espacioRaiz:
    '¡Hola Natalia! Me interesa Espacio Raíz, el acompañamiento individual. ¿Me cuentas más?',
  unirmeOnline: '¡Hola Natalia! Quiero unirme a Yoga Sana Online (30 €/mes). ¿Cómo lo hacemos?',
  empresas: '¡Hola Natalia! Me interesa el programa de bienestar emocional para equipos.',
  sesionIndividual:
    '¡Hola Natalia! Me gustaría reservar una sesión individual. ¿Qué disponibilidad tienes?',
  contacto: '¡Hola Natalia! Tengo una duda sobre Yoga Sana.',
} as const satisfies Record<string, string>;
