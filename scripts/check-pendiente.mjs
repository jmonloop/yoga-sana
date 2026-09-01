import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MARCADOR = 'PENDIENTE DE TEXTO';

function htmlsDe(directorio) {
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(directorio, entrada.name);
    if (entrada.isDirectory()) return htmlsDe(ruta);
    return entrada.name.endsWith('.html') ? [ruta] : [];
  });
}

function comprobar(raiz) {
  if (!existsSync(raiz)) {
    console.error(`No existe ${raiz}/. Ejecuta \`pnpm build\` antes de esta comprobación.`);
    return 1;
  }
  const pendientes = htmlsDe(raiz).filter((ruta) =>
    readFileSync(ruta, 'utf8').includes(MARCADOR),
  );
  if (pendientes.length === 0) {
    console.log(`OK: ningún «${MARCADOR}» en ${raiz}/.`);
    return 0;
  }
  console.error(`«${MARCADOR}» sigue en el HTML generado, no se puede publicar:`);
  pendientes.forEach((ruta) => console.error(`  ${ruta}`));
  console.error('Sustituye el texto provisional por el definitivo de Natalia.');
  return 1;
}

process.exit(comprobar(process.argv[2] ?? 'dist'));
