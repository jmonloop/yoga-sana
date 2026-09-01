export const WHATSAPP_NUMBER = '34677808098';
export const INSTAGRAM = '@yoga_sanacatarroja';
export const INSTAGRAM_URL = 'https://www.instagram.com/yoga_sanacatarroja/';
export const NIF = '26759918Q';

export function waLink(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

export interface Cta {
  message: string;
  label: string;
  ariaSuffix: string;
}

export const CTAS = {
  empezar: {
    message: '¡Hola Natalia! Me gustaría empezar en Yoga Sana. ¿Me cuentas cómo funciona?',
    label: 'Quiero empezar',
    ariaSuffix: 'escribir por WhatsApp para empezar en Yoga Sana',
  },
  reservarSanergia: {
    message: '¡Hola Natalia! Me gustaría reservar una sesión de Sanergía presencial en Catarroja.',
    label: 'Reservar sesión',
    ariaSuffix: 'escribir por WhatsApp para reservar una sesión de Sanergía presencial en Catarroja',
  },
  reservarSanergiaOnline: {
    message: '¡Hola Natalia! Me gustaría reservar una sesión de Sanergía online.',
    label: 'Reservar sesión online',
    ariaSuffix: 'escribir por WhatsApp para reservar una sesión de Sanergía online',
  },
  espacioRaiz: {
    message:
      '¡Hola Natalia! Me interesa Espacio Raíz, el acompañamiento individual. ¿Me cuentas más?',
    label: 'Saber más sobre Espacio Raíz',
    ariaSuffix: 'escribir por WhatsApp sobre Espacio Raíz, el acompañamiento individual',
  },
  unirmeOnline: {
    message: '¡Hola Natalia! Quiero unirme a Yoga Sana Online (30 €/mes). ¿Cómo lo hacemos?',
    label: 'Quiero unirme',
    ariaSuffix: 'escribir por WhatsApp para unirte a Yoga Sana Online',
  },
  empresas: {
    message: '¡Hola Natalia! Me interesa el programa de bienestar emocional para equipos.',
    label: 'Programa para empresas',
    ariaSuffix: 'escribir por WhatsApp sobre el programa de bienestar emocional para equipos',
  },
  sesionIndividual: {
    message:
      '¡Hola Natalia! Me gustaría reservar una sesión individual. ¿Qué disponibilidad tienes?',
    label: 'Reservar sesión individual',
    ariaSuffix: 'escribir por WhatsApp para reservar una sesión individual',
  },
  contacto: {
    message: '¡Hola Natalia! Tengo una duda sobre Yoga Sana.',
    label: 'Hablar por WhatsApp',
    ariaSuffix: 'escribir por WhatsApp con una duda sobre Yoga Sana',
  },
} as const satisfies Record<string, Cta>;
