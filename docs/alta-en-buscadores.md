# Cómo dar de alta yogasana.es en Google y en Bing

Guía paso a paso. No hace falta saber nada de programación.

Calcula unos 20 minutos la primera vez. La parte de Google es la más
entretenida; la de Bing se hace en dos minutos si haces primero la de Google.

---

## Qué vas a hacer y para qué sirve

La web ya está publicada y funcionando. Google puede encontrarla por su
cuenta, pero puede tardar semanas y no te cuenta nada de lo que hace.

Lo que vas a hacer aquí es dos cosas:

1. **Decirle a Google y a Bing que la web es tuya.** Se llama "verificar la
   propiedad". Es como enseñar el DNI: hasta que no lo haces, no te dejan ver
   ni tocar nada.
2. **Entregarles el índice de la web.** Ese índice es un archivo que ya
   existe y que se actualiza solo. Se llama *sitemap* y es, literalmente, la
   lista de todas las páginas de yogasana.es.

A cambio consigues algo que ahora mismo no tienes: un panel donde ves **qué
busca la gente para llegar a tu web**, cuántas personas la ven en Google y
si alguna página tiene algún problema.

La dirección del índice, que vas a necesitar copiar dos veces, es esta:

```
https://yogasana.es/sitemap.xml
```

Puedes abrirla en el navegador para comprobar que existe. Verás una lista de
direcciones con aspecto de código. Es normal, está escrita para máquinas.

---

## Antes de empezar: qué necesitas a mano

- **Una cuenta de Google.** Usa la misma con la que gestionas la ficha de
  Google del centro, la que sale en Maps con las reseñas. Así lo tienes todo
  junto.
- **Saber quién controla el dominio yogasana.es.** Es la empresa donde se
  compró la dirección web. Si no lo sabes, pregúntale a Javier antes de
  empezar. Lo vas a necesitar en el paso 4, y hay una alternativa por si no
  tienes acceso.

No necesitas instalar nada.

---

## Parte 1: Google Search Console

### Paso 1. Entra en la herramienta

Ve a [search.google.com/search-console](https://search.google.com/search-console)
e inicia sesión con tu cuenta de Google.

Si es la primera vez, te llevará directamente a la pantalla de añadir una
web. Si no, sigue al paso 2.

### Paso 2. Añade la web

Arriba a la izquierda hay un desplegable para elegir la web. Ábrelo y pulsa
**Añadir propiedad**.

"Propiedad" es como Google llama a cada web que gestionas. No tiene nada que
ver con ser propietaria de un local.

### Paso 3. Elige el tipo

Te va a ofrecer dos opciones, una a cada lado de la pantalla. Esta es la
única decisión de toda la guía, y condiciona el paso siguiente.

**Opción A: Dominio.** Es la más completa. Cubre la web entera, escriba la
gente la dirección como la escriba. Para usarla necesitas acceso a donde se
compró el dominio.

**Opción B: Prefijo de URL.** Cubre solo las direcciones que empiezan por lo
que escribas. Es un poco menos completa, pero se puede verificar sin tocar el
dominio.

Si tienes acceso al dominio, o Javier puede echarte una mano cinco minutos,
elige **Dominio**. Si no, elige **Prefijo de URL**.

Escribe la dirección en la casilla:

- Si elegiste Dominio: `yogasana.es`
- Si elegiste Prefijo de URL: `https://yogasana.es/`

Pulsa **Continuar**.

### Paso 4. Demuestra que la web es tuya

Aquí cambia lo que ves según lo que elegiste antes.

**Si elegiste Dominio.**

Google te enseña un texto largo y raro que empieza por `google-site-verification=`.
Ese texto hay que pegarlo en la configuración del dominio.

1. Copia el texto con el botón de copiar que te ofrece Google. No lo escribas
   a mano, es largo y un solo carácter mal lo estropea.
2. Entra en la web de la empresa donde se compró yogasana.es.
3. Busca una sección llamada **DNS**, "Zona DNS" o "Configuración DNS".
4. Añade un registro nuevo de tipo **TXT**. En el campo de nombre o host
   normalmente se pone una arroba (`@`) o se deja vacío. En el campo de valor
   pega el texto de Google.
5. Guarda.
6. Vuelve a Google y pulsa **Verificar**.

Si te dice que no lo encuentra, no has hecho nada mal. Estos cambios tardan
un rato en extenderse por internet. Espera diez minutos, tómate un café y
vuelve a pulsar **Verificar**.

**Si elegiste Prefijo de URL.**

Google te ofrece varios métodos. El más sencillo para esta web es el primero,
**Archivo HTML**.

1. Descarga el archivo que te ofrece. Tendrá un nombre parecido a
   `google1a2b3c4d5e.html`.
2. Pásale ese archivo a Javier y dile que lo suba a la carpeta `public` de la
   web. Es un minuto de trabajo y se publica solo.
3. Cuando te confirme que está subido, vuelve a Google y pulsa **Verificar**.

En los dos casos, cuando salga el mensaje de que la propiedad se ha
verificado, ya está lo difícil.

### Paso 5. Entrega el índice de la web

1. En la columna de la izquierda, busca y pulsa **Sitemaps**.
2. Verás una casilla que pone **Añadir un sitemap nuevo**. Delante ya aparece
   `https://yogasana.es/` escrito en gris.
3. Escribe en la casilla únicamente esto:

   ```
   sitemap.xml
   ```

4. Pulsa **Enviar**.

Debería aparecer una línea nueva abajo con el estado **Correcto**.

Si pone "No se ha podido obtener", espera unos minutos y actualiza la página.
Casi siempre significa que Google todavía no lo ha intentado, no que haya un
error.

### Paso 6. Comprueba que ha entendido la web

Esto es opcional, pero está bien hacerlo una vez.

Cuando el estado sea Correcto, la misma pantalla te dirá cuántas páginas ha
descubierto. Deberían ser **15**.

Son las páginas de siempre más las seis fichas nuevas de talleres:
breathwork, rebirthing consciente, constelaciones familiares, baño de
cuencos, gestión emocional y gimnasia pasiva.

---

## Parte 2: Bing Webmaster Tools

Bing es el buscador de Microsoft. Tiene mucha menos gente que Google, así que
puede parecer que no merece la pena.

Sí la merece, y por un motivo concreto: **ChatGPT usa el buscador de Bing
cuando busca en internet.** Si quieres que ChatGPT sepa que existes y
recomiende el centro cuando alguien pregunte por yoga en Catarroja, este paso
es el que más ayuda.

Haz esto **después** de terminar la parte de Google, y esta vez es importante
de verdad. El atajo de Bing no sale a mirar tu web: lo único que hace es
copiar lo que ya haya en tu cuenta de Google. Si en Google todavía no has
enviado el sitemap, Bing no tendrá nada que copiar.

### Paso 1. Entra

Ve a [bing.com/webmasters](https://www.bing.com/webmasters) e inicia sesión.
Te deja entrar con cuenta de Microsoft, de Google o de Facebook. Entra con la
de Google, la misma de antes.

### Paso 2. Importa la web desde Google

1. Pulsa **Importar** en el bloque de Google Search Console.
2. Inicia sesión con la misma cuenta de Google.
3. Pulsa **Permitir** cuando te pida ver tu lista de webs.
4. Selecciona yogasana.es y confirma.

Con esto la web queda añadida y verificada, que es lo que costaba.

Si en algún momento la pantalla se queda en negro durante el proceso, no te
asustes y no lo repitas. Es un fallo visual del propio Bing. Cierra esa
ventana, vuelve a entrar y mira si la web ya aparece en tu lista. Si aparece,
la verificación salió bien.

### Paso 3. Envía el sitemap a mano

La importación **muchas veces no trae el sitemap**, aunque la web sí quede
verificada. Es lo normal, no es un error tuyo. Compruébalo y envíalo tú, que
es medio minuto.

1. Con yogasana.es seleccionada arriba, pulsa **Sitemaps** en el menú de la
   izquierda.
2. Si ya aparece uno en la lista, no toques nada. Has terminado.
3. Si la lista está vacía, pulsa **Enviar sitemap**.
4. Pega la dirección **completa**, no solo el final como en Google:

   ```
   https://yogasana.es/sitemap.xml
   ```

5. Pulsa **Enviar**.

Debería aceptarlo al momento. A veces tarda unas horas en decirte cuántas
direcciones ha procesado, así que no te preocupes si al principio no da
cifras.

### Si prefieres no conectar las dos cuentas

No estás obligada a usar el atajo. Puedes añadir la web a mano y verificarla
con uno de los métodos que te ofrezca Bing, que son parecidos a los de
Google. Después haz el paso 3 igual.

## Qué pasa después

**No esperes nada el primer día.** Los datos tardan unos días en aparecer, y
las páginas nuevas tardan semanas en asentarse. Es normal y no significa que
algo esté mal.

Vuelve a entrar dentro de una semana y mira dos sitios:

- **Rendimiento.** Te dice qué escribe la gente en Google antes de entrar en
  tu web. Es la información más útil de todas: te enseña con qué palabras te
  busca la gente de verdad, que casi nunca son las que uno imagina.
- **Páginas.** Te dice cuántas páginas están dentro de Google y si alguna se
  ha quedado fuera, con el motivo.

Si en el apartado de Páginas ves las fichas de talleres como "Detectada pero
no indexada", tranquila. Es lo habitual en páginas recién publicadas y suele
resolverse solo.

---

## Si algo se tuerce

- **"No se ha podido verificar la propiedad."** Casi siempre es cuestión de
  tiempo. Espera diez minutos y vuelve a intentarlo antes de tocar nada.
- **"No se ha podido obtener el sitemap."** Comprueba primero que
  `https://yogasana.es/sitemap.xml` se abre en tu navegador. Si se abre, el
  problema es de Google y se arregla solo.
- **Te has equivocado al escribir el sitemap.** No pasa nada. Se puede
  borrar de la lista y volver a enviarlo.
- **En Bing la pantalla se queda en negro al importar.** Es un fallo visual
  suyo, no has roto nada. Cierra la ventana y vuelve a entrar: si la web
  aparece en tu lista, la verificación funcionó.
- **En Bing aparece la web pero ningún sitemap.** Es lo habitual, la
  importación no siempre lo trae. Envíalo a mano con el paso 3 de la
  segunda parte.
- **Cualquier otra cosa.** Haz una captura de pantalla del error y
  mándasela a Javier. Ninguno de estos pasos puede romper la web.

---

## Pequeño glosario

- **Sitemap.** El índice de la web. Un archivo con la lista de todas las
  páginas, para que los buscadores no se dejen ninguna. Se actualiza solo.
- **Indexar.** Que un buscador guarde una página en su archivo. Si una página
  no está indexada, no puede salir en los resultados.
- **Propiedad.** El nombre que le da Google a cada web que gestionas.
- **Verificar.** Demostrar que la web es tuya, para que te dejen ver sus
  datos.
- **DNS.** La configuración interna del dominio. Es donde se apunta que
  yogasana.es tiene que llevar a tu web.
- **Dominio.** La dirección de la web, yogasana.es, y por extensión el
  contrato con la empresa donde se compró.
