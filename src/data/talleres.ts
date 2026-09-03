import type { Actividad } from './sheet';
import type { Enlace } from './site';

export interface Pregunta {
  pregunta: string;
  respuesta: string;
}

export interface CopiaTaller {
  titulo: string;
  eyebrow: string;
  descripcion: string;
  queEs: string[];
  paraQuien: string[];
  comoEs: string[];
  online: boolean;
  preguntas: Pregunta[];
}

export interface PaginaTaller {
  actividad: Actividad;
  slug: string;
  ruta: string;
  copia: CopiaTaller;
}

export const RUTA_TALLERES = '/talleres';

const PAGINAS_FIJAS: Record<string, Enlace> = {
  Sanergía: { href: '/sanergia', texto: 'Saber más sobre Sanergía' },
  'Movimiento Somático': { href: '/movimiento-somatico', texto: 'Saber más sobre Espacio Raíz' },
};

export function slugDe(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function paginasDeTalleres(actividades: Actividad[]): PaginaTaller[] {
  return actividades.flatMap((actividad) => {
    const slug = slugDe(actividad.nombre);
    const copia = COPIAS[slug];
    return copia ? [{ actividad, slug, ruta: `${RUTA_TALLERES}/${slug}`, copia }] : [];
  });
}

export function enlacesPara(
  actividades: Actividad[],
  paginas: PaginaTaller[],
): Partial<Record<string, Enlace>> {
  const generados = Object.fromEntries(
    paginas.map(({ actividad, ruta }) => [
      actividad.nombre,
      { href: ruta, texto: `Saber más sobre ${actividad.nombre}` },
    ]),
  );
  const disponibles = { ...PAGINAS_FIJAS, ...generados };
  return Object.fromEntries(
    actividades
      .filter(({ nombre }) => nombre in disponibles)
      .map(({ nombre }) => [nombre, disponibles[nombre]]),
  );
}

export function talleresOnline(paginas: PaginaTaller[]): PaginaTaller[] {
  return paginas.filter(({ copia }) => copia.online);
}

export function tituloDe(copia: CopiaTaller): string {
  return `${copia.titulo} (València) — Yoga Sana`;
}

export const COPIAS: Record<string, CopiaTaller> = {
  breathwork: {
    titulo: 'Breathwork en Catarroja',
    eyebrow: 'Respira hondo',
    descripcion:
      'Talleres de breathwork en Catarroja (València): respiración consciente en grupo para soltar tensión, liberar emociones y volver a ti. Presencial u online.',
    queEs: [
      'El breathwork es una práctica de respiración consciente y guiada. Durante el taller respiras siguiendo un patrón concreto, más profundo y continuo que el habitual, mientras te acompaño con la voz y con música.',
      'Ese ritmo de respiración moviliza el cuerpo y las emociones: aparecen sensaciones, calor, hormigueo, a veces lágrimas o risa. Todo forma parte del proceso. Al terminar, la mayoría de las personas describen ligereza, claridad y calma.',
      'No hace falta experiencia previa ni saber meditar. Solo necesitas ganas de respirar y dejarte acompañar.',
    ],
    paraQuien: [
      'Acumulas estrés o ansiedad y necesitas soltar.',
      'Sientes que llevas tiempo funcionando en piloto automático.',
      'Quieres trabajar emociones que se han quedado atascadas.',
      'Buscas una experiencia distinta al yoga, más intensa y liberadora.',
      'Ya practicas yoga o meditación y quieres ir un paso más allá.',
    ],
    comoEs: [
      'Nos reunimos en grupo en la sala de Yoga Sana, en Catarroja. Empezamos con unos minutos para llegar, explicar la técnica y resolver dudas.',
      'Después viene la práctica de respiración, tumbados sobre la esterilla, guiada de principio a fin. Terminamos con una relajación y un espacio para compartir, si te apetece.',
      'Trae ropa cómoda y, si puedes, no comas mucho en las dos horas anteriores. El resto lo pongo yo.',
    ],
    online: true,
    preguntas: [
      {
        pregunta: '¿Cuándo es el próximo taller de breathwork en Catarroja?',
        respuesta:
          'Escríbeme por WhatsApp y te digo la fecha del próximo y si quedan plazas.',
      },
      {
        pregunta: '¿Puedo hacer breathwork online?',
        respuesta:
          'Sí. Si no puedes venir a Catarroja, hay sesiones online en directo. Solo necesitas un lugar tranquilo donde tumbarte y una buena conexión.',
      },
      {
        pregunta: '¿Tiene contraindicaciones?',
        respuesta:
          'Sí. No es recomendable en el embarazo ni si tienes epilepsia, problemas cardiovasculares graves, glaucoma o un desprendimiento de retina reciente, entre otros. Si tienes dudas, coméntamelo antes y lo vemos.',
      },
      {
        pregunta: '¿Necesito experiencia previa?',
        respuesta: 'No. Te explico la técnica al empezar y te acompaño durante toda la sesión.',
      },
    ],
  },
  'rebirthing-consciente': {
    titulo: 'Rebirthing consciente en Catarroja',
    eyebrow: 'Respiración conectada',
    descripcion:
      'Rebirthing consciente en Catarroja (València): respiración circular conectada en grupo reducido para liberar bloqueos emocionales y transformar tu energía. Presencial u online.',
    queEs: [
      'El rebirthing es una técnica de respiración consciente en la que inhalas y exhalas sin pausa entre una y otra, de forma circular y relajada. Ese ritmo continuo permite acceder a tensiones y emociones que el cuerpo guarda desde hace tiempo.',
      'A diferencia de un taller puntual, el rebirthing consciente en Yoga Sana funciona como grupo estable: las mismas personas, con continuidad, para que el proceso tenga profundidad y cada sesión construya sobre la anterior.',
      'Es un trabajo íntimo y respetuoso. Cada persona va a su ritmo y nadie tiene que compartir nada que no quiera.',
    ],
    paraQuien: [
      'Sientes que hay emociones antiguas que siguen pesando.',
      'Quieres un proceso con continuidad, no una experiencia aislada.',
      'Has probado el breathwork y quieres profundizar.',
      'Buscas un grupo pequeño y de confianza.',
      'Estás en un momento de cambio y necesitas espacio para integrarlo.',
    ],
    comoEs: [
      'Nos encontramos en la sala de Yoga Sana, en Catarroja, en grupo reducido. Empezamos con un breve espacio para llegar y compartir cómo estamos.',
      'Después, tumbados, hacemos la sesión de respiración conectada, guiada y acompañada en todo momento. Cerramos con una relajación y un tiempo de integración.',
      'Trae ropa cómoda, una manta si te apetece y tiempo suficiente para no salir con prisa.',
    ],
    online: true,
    preguntas: [
      {
        pregunta: '¿Qué diferencia hay entre rebirthing y breathwork?',
        respuesta:
          'Ambos trabajan con la respiración consciente. El breathwork es un taller puntual y más intenso; el rebirthing consciente es un grupo estable con continuidad, un proceso más íntimo y progresivo.',
      },
      {
        pregunta: '¿Puedo incorporarme al grupo en cualquier momento?',
        respuesta:
          'Depende de las plazas y del momento del grupo. Escríbeme por WhatsApp y te cuento cuándo es la próxima incorporación.',
      },
      {
        pregunta: '¿Se puede hacer rebirthing online?',
        respuesta:
          'Sí, hay sesiones online en directo para quienes no pueden venir a Catarroja.',
      },
      {
        pregunta: '¿Tiene contraindicaciones?',
        respuesta:
          'Sí: embarazo, epilepsia, problemas cardiovasculares graves o trastornos psiquiátricos no tratados, entre otros. Si tienes dudas, coméntamelo antes de la primera sesión.',
      },
    ],
  },
  'constelaciones-familiares': {
    titulo: 'Constelaciones familiares en Catarroja',
    eyebrow: 'Mirar el sistema',
    descripcion:
      'Talleres de constelaciones familiares en Catarroja (València): comprender y liberar patrones heredados para vivir en armonía con tu sistema familiar. Presencial u online.',
    queEs: [
      'Las constelaciones familiares son un método de trabajo grupal que permite ver, desde fuera, las dinámicas de tu sistema familiar: lealtades invisibles, lugares que no se ocupan, historias que se repiten de generación en generación.',
      'En cada taller, algunas personas constelan su propio tema y el resto participa como representantes o como observadoras. Ver una constelación, aunque no sea la tuya, suele mover algo dentro.',
      'No hace falta contar toda tu historia ni tener nada claro de antemano. Basta con traer una pregunta o una sensación.',
    ],
    paraQuien: [
      'Notas que repites patrones en tus relaciones, en el trabajo o con el dinero.',
      'Hay conflictos familiares que pesan, aunque hayan pasado años.',
      'Quieres entender tu lugar en tu familia y hacer las paces con él.',
      'Estás atravesando un duelo, una separación o un cambio importante.',
      'Sientes curiosidad por el trabajo sistémico.',
    ],
    comoEs: [
      'Los talleres se convocan de forma puntual, en la sala de Yoga Sana en Catarroja. Empezamos con una introducción breve al método y un círculo de presentación.',
      'Después se van constelando los temas de quienes lo han pedido, uno a uno, con el grupo como apoyo. Cerramos con un espacio de integración.',
      'Si quieres constelar tu tema, dímelo al reservar: las plazas para constelar son limitadas.',
    ],
    online: true,
    preguntas: [
      {
        pregunta: '¿Cuándo es el próximo taller de constelaciones familiares en Catarroja?',
        respuesta:
          'Se convocan puntualmente, no tienen fecha fija. Escríbeme por WhatsApp y te aviso del próximo.',
      },
      {
        pregunta: '¿Puedo participar sin constelar mi tema?',
        respuesta:
          'Sí. Puedes venir como representante o como observadora. Muchas personas empiezan así.',
      },
      {
        pregunta: '¿Hay constelaciones familiares online?',
        respuesta:
          'Sí, hay talleres online en directo cuando el grupo lo permite. Pregúntame y te digo cuándo es el siguiente.',
      },
      {
        pregunta: '¿Tengo que contar mi historia delante del grupo?',
        respuesta:
          'No. Solo lo imprescindible para plantear el tema. El trabajo se hace a través de los representantes, no explicando.',
      },
    ],
  },
  'bano-de-cuencos': {
    titulo: 'Baño de cuencos en Catarroja',
    eyebrow: 'Sonido que armoniza',
    descripcion:
      'Baño de cuencos tibetanos en Catarroja (València): relajación profunda con sonido y vibración para calmar la mente, soltar tensión y armonizar cuerpo y emociones.',
    queEs: [
      'Un baño de cuencos es una sesión de relajación en la que te tumbas cómodamente mientras suenan cuencos tibetanos, cuencos de cuarzo y otros instrumentos. El sonido y la vibración envuelven el cuerpo y llevan la mente a un estado de calma profunda.',
      'No tienes que hacer nada. Ni respirar de una forma concreta, ni moverte, ni concentrarte. Solo descansar y escuchar.',
      'Es una de las experiencias más suaves y accesibles de Yoga Sana: sirve tanto para quien nunca ha meditado como para quien practica desde hace años.',
    ],
    paraQuien: [
      'Duermes mal o te cuesta desconectar.',
      'Vives con la mente acelerada y necesitas una pausa de verdad.',
      'Quieres probar la meditación pero te cuesta estar en silencio.',
      'Buscas una experiencia de relajación para regalar o compartir.',
      'Te atrae el trabajo con sonido y vibración.',
    ],
    comoEs: [
      'Nos reunimos en la sala de Yoga Sana, en Catarroja. Te acomodas sobre la esterilla, con manta y cojín, y cerramos los ojos.',
      'Durante la sesión los cuencos suenan alrededor y, a veces, sobre el cuerpo. Al terminar hay unos minutos para volver despacio y compartir, si quieres.',
      'Trae ropa cómoda y abrigada: el cuerpo se enfría al relajarse.',
    ],
    online: false,
    preguntas: [
      {
        pregunta: '¿Cuándo es el próximo baño de cuencos en Catarroja?',
        respuesta: 'Escríbeme por WhatsApp y te digo la fecha del próximo y si quedan plazas.',
      },
      {
        pregunta: '¿Necesito experiencia en meditación?',
        respuesta: 'No. Solo tumbarte y escuchar.',
      },
      {
        pregunta: '¿Se puede hacer un baño de cuencos online?',
        respuesta:
          'No. La vibración de los cuencos se siente en el cuerpo y eso no se transmite por pantalla. Es una experiencia presencial.',
      },
      {
        pregunta: '¿Puedo venir si estoy embarazada?',
        respuesta:
          'Consúltamelo antes. En general es una práctica suave, pero prefiero saberlo para adaptar la sesión.',
      },
    ],
  },
  'gestion-emocional': {
    titulo: 'Gestión emocional en Catarroja',
    eyebrow: 'Comprender lo que sientes',
    descripcion:
      'Talleres y sesiones individuales de gestión emocional en Catarroja (València), y programas de bienestar emocional para empresas y equipos. Presencial u online.',
    queEs: [
      'La gestión emocional es la capacidad de reconocer lo que sientes, entender de dónde viene y responder en lugar de reaccionar. No se trata de controlar ni de reprimir, sino de escuchar y acompañar lo que aparece.',
      'En Yoga Sana lo trabajo desde el cuerpo: respiración, movimiento consciente, relajación y herramientas sencillas que puedes llevarte a tu día a día.',
      'Puede ser en taller de grupo, en sesión individual o como programa de bienestar emocional para equipos y empresas.',
    ],
    paraQuien: [
      'Sientes que las emociones te desbordan o, al contrario, que las tienes bloqueadas.',
      'Vives con estrés o ansiedad y quieres herramientas concretas.',
      'Prefieres un acompañamiento individual y a tu ritmo.',
      'Diriges un equipo y quieres cuidar el bienestar de las personas.',
      'Quieres complementar un proceso terapéutico con trabajo corporal.',
    ],
    comoEs: [
      'En sesión individual, empezamos hablando de qué necesitas y diseñamos el trabajo a medida: respiración, cuerpo, pautas para casa. Presencial en Catarroja u online.',
      'En taller, trabajamos en grupo un tema concreto con dinámicas prácticas. Se convocan puntualmente.',
      'Para empresas, el programa se adapta al equipo: sesiones en vuestro espacio o en la sala de Yoga Sana, con la duración y frecuencia que os encaje.',
    ],
    online: true,
    preguntas: [
      {
        pregunta: '¿Es terapia psicológica?',
        respuesta:
          'No. Es un acompañamiento desde el cuerpo y la respiración. Puede complementar una terapia, pero no la sustituye. Si lo necesitas, te lo diré con claridad.',
      },
      {
        pregunta: '¿Se puede hacer online?',
        respuesta:
          'Sí, tanto las sesiones individuales como los programas para equipos pueden hacerse online en directo.',
      },
      {
        pregunta: '¿Cómo funciona el programa para empresas?',
        respuesta:
          'Escríbeme y me cuentas cómo es el equipo y qué os preocupa. A partir de ahí te propongo un formato: número de sesiones, duración y dónde hacerlas.',
      },
      {
        pregunta: '¿Necesito haber hecho yoga?',
        respuesta: 'No. Las herramientas son sencillas y se adaptan a cada persona.',
      },
    ],
  },
  'gimnasia-pasiva-en-camilla': {
    titulo: 'Gimnasia pasiva en camilla en Catarroja',
    eyebrow: 'Déjate mover',
    descripcion:
      'Gimnasia pasiva en camilla en Catarroja (València): sesión individual de movimiento pasivo y estiramientos asistidos para liberar tensión, ganar movilidad y restaurar tu energía.',
    queEs: [
      'La gimnasia pasiva es un trabajo corporal en el que no haces ningún esfuerzo. Te tumbas en la camilla y soy yo quien moviliza articulaciones, estira músculos y acompaña el cuerpo hacia el descanso.',
      'Es especialmente eficaz para liberar la tensión acumulada en cuello, hombros, espalda y caderas, y para recuperar movilidad sin forzar.',
      'Muchas personas se duermen durante la sesión. Es normal, y es buena señal.',
    ],
    paraQuien: [
      'Llevas tensión acumulada y te cuesta soltarla por tu cuenta.',
      'Tienes rigidez o poca movilidad y el ejercicio activo te cuesta.',
      'Estás en un momento de mucho cansancio físico o mental.',
      'Quieres complementar tus clases de yoga con un trabajo más profundo.',
      'Buscas un regalo de bienestar para alguien.',
    ],
    comoEs: [
      'La sesión es individual, en la sala de tratamientos de Yoga Sana, en Catarroja. Empezamos hablando un momento de cómo estás y de qué zonas necesitan más atención.',
      'Después te tumbas con ropa cómoda y trabajo el cuerpo despacio: movilizaciones, estiramientos asistidos y momentos de quietud. Terminamos con unos minutos de descanso.',
      'No necesitas traer nada. Solo ropa cómoda que permita moverse.',
    ],
    online: false,
    preguntas: [
      {
        pregunta: '¿Es un masaje?',
        respuesta:
          'No exactamente. En el masaje se trabaja el tejido con presión; en la gimnasia pasiva se mueve el cuerpo: articulaciones, estiramientos, balanceos. Se complementan bien.',
      },
      {
        pregunta: '¿Puedo hacerlo si tengo una lesión?',
        respuesta:
          'Depende de la lesión. Cuéntamelo al reservar y lo valoramos. En caso de duda, consulta antes con tu médico o fisioterapeuta.',
      },
      {
        pregunta: '¿Se puede hacer online?',
        respuesta: 'No. Es un trabajo manual, así que solo se hace presencial en Catarroja.',
      },
      {
        pregunta: '¿Cómo reservo?',
        respuesta: 'Por WhatsApp. Me dices qué días te vienen bien y buscamos hueco.',
      },
    ],
  },
};
