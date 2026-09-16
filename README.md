# Tripu

Una aplicación móvil para jugar cartas durante un viaje entre amigos. Cada persona entra con Google, reclama su nombre y recibe una mano al azar. Ataques, escudos, boomerangs y un diario compartido de todas las jugadas.

## Cómo se juega

1. El creador prepara un viaje: nombre, cartas disponibles, reparto, tiempo de respuesta y entre 2 y 30 participantes.
2. Comparte el enlace de invitación o el código de 6 caracteres.
3. Cada persona entra con Google y reclama su nombre. El creador también elige el suyo.
4. El creador inicia el viaje: todos los nombres reciben cartas, incluso quienes llegan tarde.
5. Cada vez que uses una carta, grita **«¡Tripu!»** para avisar al grupo, tanto al atacar como al reaccionar. Juega un ataque contra otra persona: puede aceptarlo, bloquearlo con Escudo o devolverlo con Rebote. Las cartas jugadas quedan marcadas como usadas; no hay reacciones encadenadas. Si alguien pregunta por el grito, ¡contadle a qué estáis jugando!
6. Sigue la actividad y el historial. Al finalizar el viaje, los ataques pendientes se aplican, aparece el resumen de quién recibió más cartas y cada jugador puede valorar el viaje y compartir un TikTok.

### Rarezas y reparto

La colección pública está en `/cartas`, accesible sin cuenta desde la navegación, el inicio y el pie. Muestra las cartas activas de la base de datos con búsqueda por texto y filtros de categoría, rareza, tipo y pack. Solo se publican los campos de la carta y sus packs activos; las propuestas pendientes, las manos y los datos de jugadores no forman parte del catálogo. Consultar las cartas no modifica los permisos para jugar o desbloquear packs.

Cada carta tiene una rareza: **común** (marco gris), **rara** (azul) o **legendaria** (dorado). Al configurar el viaje se elige cuántas legendarias recibe cada jugador (por defecto 1; nunca se repiten entre jugadores del mismo viaje) y cuántas raras y comunes completan la mano. Si no hay legendarias para todos, se sortean entre los jugadores y quien se quede sin una recibe 2 raras a cambio (la sustituta y una extra). El botón «Ajustar automáticamente» reparte el resto en un 40 % raras y 60 % comunes. Opcionalmente, el reparto de raras y comunes puede hacerse por categoría. Las raras y comunes no se repiten dentro de una mano mientras el mazo lo permita.

### Notificaciones

Cada jugador puede activar avisos push desde la página del viaje (botón «Activar»). Recibe una notificación cuando le lanzan una carta, cuando responden a la suya, cuando expira una jugada y cuando empieza el viaje. Requiere `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_SUBJECT`; sin ellas el botón no aparece y el juego funciona igual. En iPhone solo funciona con la app añadida a la pantalla de inicio (iOS 16.4+); la interfaz lo indica. El envío es best-effort tras confirmar cada jugada y las suscripciones caducadas se eliminan solas.

### Compartir e invitar

- La invitación (`/join/CÓDIGO`) muestra el viaje, la tripulación y el reparto antes de iniciar sesión; el login solo hace falta para reclamar un nombre. El botón «Invitar amigos» usa el menú de compartir del móvil.
- Al finalizar, «Compartir resumen» genera una imagen (ranking, MVP y carta del viaje) con `next/og`. Cada carta tiene su tarjeta gráfica en `/cards/ID/image`, compartible desde la mano.
- El creador recibe un aviso push cuando alguien reclama su nombre.

### Packs premium

Las cartas se agrupan en packs (`/admin/packs`). **Mientras `PAYMENTS_ENABLED` no sea `"true"`, todos los packs están abiertos para todo el mundo** (fase de pruebas). Con pagos activos, los packs premium se desbloquean con Stripe Checkout **por viaje** o **para siempre**, con precios independientes, y el admin puede regalarlos por correo. El servidor rechaza cualquier carta de un pack no desbloqueado al guardar la configuración, y las manos ya repartidas nunca se tocan. Consulta [DEPLOY.md](DEPLOY.md) para el webhook.

### Comunidad, sugerencias y administración

- `/comunidad` muestra TikToks aprobados de gente jugando y las cartas creadas por la comunidad; cualquier usuario puede enviar un enlace, opcionalmente asociado a un viaje y un destino.
- `/sugerencias` recoge propuestas de cartas nuevas con el nombre que quiera cada persona para el crédito; el admin puede convertirlas en carta y aparece «Propuesta por X».
- `/admin` (solo para los correos de `ADMIN_EMAILS`) permite crear, editar y retirar cartas y packs, ver compras, aprobar vídeos, leer valoraciones y sugerencias, y seguir las métricas: K-factor (invitados que crean un viaje en 60 días), activación (viajes que se juegan con ≥ 3 a bordo), profundidad (cartas por jugador) y compartición (resúmenes compartidos).

La ventana de respuesta es de 1 a 120 minutos. Al llegar al vencimiento, el ataque se considera aceptado. El servidor materializa las expiraciones al cargar el viaje o el historial, o al ejecutar una acción de juego. Las páginas se actualizan cada 5 segundos mientras están visibles. Sin visitas no se ejecuta ningún temporizador de servidor.

## Ayuda, información y pantallas de carga

El pie de página enlaza páginas públicas, accesibles sin iniciar sesión: `/instalar`, `/faq`, `/sobre-nosotros`, `/contacto`, `/aviso-legal`, `/privacidad`, `/cookies` y `/condiciones`.

**Instalar en el móvil:** `/instalar` contiene los pasos para iPhone con Safari y Android con Chrome, siguiendo las guías de [Apple](https://support.apple.com/es-es/guide/iphone/iphea86e5236/ios) y [Google](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=es). Se enlaza desde el inicio, las FAQ, el pie y el aviso de notificaciones en iPhone. `InstallProvider` conserva el evento `beforeinstallprompt` durante la navegación y `InstallApp` ofrece el botón únicamente cuando el navegador lo permite; el diálogo se abre al pulsarlo. La cancelación y los errores mantienen disponible la guía manual. La promoción del inicio se oculta al abrir en modo independiente o recibir `appinstalled`. La instalación no habilita notificaciones ni funcionamiento sin conexión.

Los avisos y botones de instalación solo aparecen en móviles y tabletas Android/iOS, incluido iPadOS con identificación de escritorio. Una ventana de ordenador estrecha no activa el aviso. La guía y su enlace del pie siguen disponibles en escritorio.

Los datos públicos del titular se mantienen en `src/lib/site-info.ts`: nombre, correo y país confirmados para un proyecto personal abierto a cualquiera con la URL. Los campos fiscales, domicilio y registro solo se muestran si se han proporcionado; su necesidad debe revisarse según la actividad del servicio. `legalContentReviewed` mantiene las páginas legales en revisión y con `noindex` hasta confirmar conservación de datos, bases del tratamiento de métricas, proveedores y las condiciones de contratación que correspondan. Publicar los datos de contacto no completa esa revisión. No se deducen datos personales de las credenciales ni de los administradores.

Los vídeos de TikTok requieren activación individual: no se carga su reproductor hasta pulsar «Permitir y cargar vídeo». «Ocultar vídeo» lo desmonta; no se guarda consentimiento permanente. Las cookies técnicas de Auth.js se describen por separado. La implementación sigue el [reproductor oficial de TikTok](https://developers.tiktok.com/docs/en/embed-player); los textos toman como referencia la [guía de cookies de la AEPD](https://www.aepd.es/guias/guia-cookies.pdf) y la [información exigida al titular](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758#a10).

`LoadingScreen` ofrece variantes para listados, manos, formularios e historial. Cada ruta usa su mensaje y estructura; las animaciones CSS respetan `prefers-reduced-motion`. Los elementos decorativos se ocultan a lectores de pantalla y el mensaje de carga se anuncia una sola vez. La cabecera utiliza `Suspense` para que la consulta de sesión no retrase la aparición del contenido de carga.

## Stack

Next.js 15 App Router · React 19 · TypeScript strict · Prisma 6 · Neon Postgres · Auth.js v5 con Google y sesiones en BD · Tailwind CSS v4 · Zod · ESLint · Vitest. Node **24**, npm **11**. La aplicación vive en la raíz del repositorio.

## Arranque local

```bash
cp .env.example .env
npm install
# Completa .env con Neon, un secreto de sesión y el cliente OAuth de Google.
npm run db:push
npm run db:seed
npm run dev
```

En PowerShell, puedes usar `Copy-Item .env.example .env`. Abre http://localhost:3000. Consulta [DEPLOY.md](DEPLOY.md) para las conexiones y las URL de Google. Nunca subas `.env` a Git.

`db:seed` carga `.env` con Node 24 y ejecuta `prisma/seed.ts` mediante tsx. También acepta variables del entorno si no existe ese archivo. No usa migraciones: el esquema se aplica con `prisma db push`.

## Añadir o retirar una carta

Desde `/admin/cards` (recomendado) o editando [prisma/card-catalog.ts](prisma/card-catalog.ts) y ejecutando `npm run db:seed`.

- Usa un `id` estable y único, nombre, descripción, categoría, `kind`, `rarity` y `sortOrder`.
- En una reacción añade `reactionEffect: "BLOCK"` o `"REFLECT"`.
- El seed actualiza por `id` y reactiva las cartas del catálogo base; no toca las cartas creadas desde el panel ni borra manos históricas. Si editas una carta base en el panel, refleja el cambio en el catálogo o el siguiente seed lo sobrescribirá.
- Retirar una carta la oculta en viajes nuevos; las manos ya repartidas la conservan.
- Los textos de los tipos se consultan desde el catálogo; editar su nombre o descripción también cambia cómo se muestran en manos e historial. Los mensajes del diario conservan el texto original.

## Verificación

```bash
npx prisma validate
npm run lint
npm test
npm run build
```

Las pruebas unitarias cubren el reparto, las reglas, permisos de gestión y validación. No requieren conexión a la BD. La validación de Prisma necesita las variables de conexión definidas, aunque no abre una conexión.

Para probar las acciones y la concurrencia en una **base de desarrollo** ya preparada:

```bash
npm run test:integration
```

La prueba crea usuarios, cartas y un viaje con identificadores aleatorios, ejercita las acciones reales con sesión y caché de Next simuladas y elimina exclusivamente sus propios datos al terminar. Verifica reclamaciones simultáneas, doble inicio, doble ataque, doble reacción, aceptación, expiración, aislamiento de manos, llegada tardía y doble finalización. El login real con Google y la interfaz se verifican por separado; consulta [VERIFY.md](VERIFY.md).

## Decisiones de implementación

- Reglas puras en `src/lib/game/`; las acciones autentican, validan y escriben en transacciones.
- Todas las escrituras bloquean primero la fila del viaje en PostgreSQL. Las actualizaciones de cartas y jugadas siguen siendo condicionales y comprueban `count === 1`.
- Las expiraciones se actualizan por jugada, para asignar su propio `finalTargetId` y emitir un evento solo si esa actualización gana.
- El límite de expiración es inclusivo: `now >= expiresAt`, coherente con la consulta SQL.
- La primera reclamación valida también el código de invitación. Conocer un identificador de jugador no basta para reclamarlo.
- Al editar nombres se conservan los IDs existentes y nunca se eliminan ni renombran los nombres reclamados.
- Límite de 100 cartas por categoría y 200 por jugador para acotar el trabajo de una petición.
- Iconos planos y cartas de texto provisionales. El manifiesto permite acceso desde la pantalla de inicio; no hay soporte sin conexión.

## Dependencias heredadas

Se conservan los rangos y la versión exacta de Auth.js solicitados en el plan. `npm audit` informa de vulnerabilidades en estas dependencias; el detalle y la limitación para publicar están en [VERIFY.md](VERIFY.md). No se han aplicado actualizaciones mayores automáticas.

## Próximos pasos

- Diseño visual de las cartas con imágenes o ilustraciones.
- Reacciones encadenadas.
- Eliminación de viajes.
- Transferencia de cartas entre jugadores.
