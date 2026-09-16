# CartasViajes

Una aplicación móvil para jugar cartas durante un viaje entre amigos. Cada persona entra con Google, reclama su nombre y recibe una mano al azar. Ataques, escudos, boomerangs y un diario compartido de todas las jugadas.

## Cómo se juega

1. El creador prepara un viaje: nombre, cartas disponibles, reparto, tiempo de respuesta y entre 2 y 30 participantes.
2. Comparte el enlace de invitación o el código de 6 caracteres.
3. Cada persona entra con Google y reclama su nombre. El creador también elige el suyo.
4. El creador inicia el viaje: todos los nombres reciben cartas, incluso quienes llegan tarde.
5. Juega un ataque contra otra persona. Puede aceptarlo, bloquearlo con Escudo o devolverlo con Rebote. Las cartas jugadas quedan marcadas como usadas; no hay reacciones encadenadas.
6. Sigue la actividad y el historial. Al finalizar el viaje, los ataques pendientes se aplican, aparece el resumen de quién recibió más cartas y cada jugador puede valorar el viaje y compartir un TikTok.

### Rarezas y reparto

Cada carta tiene una rareza: **común** (marco gris), **rara** (azul) o **legendaria** (dorado). Al configurar el viaje se elige cuántas legendarias recibe cada jugador (por defecto 1; nunca se repiten entre jugadores del mismo viaje) y cuántas raras y comunes completan la mano. El botón «Ajustar automáticamente» reparte el resto en un 40 % raras y 60 % comunes. Opcionalmente, el reparto de raras y comunes puede hacerse por categoría. Las raras y comunes no se repiten dentro de una mano mientras el mazo lo permita.

### Comunidad, sugerencias y administración

- `/comunidad` muestra TikToks aprobados de gente jugando; cualquier usuario puede enviar un enlace, opcionalmente asociado a un viaje y un destino.
- `/sugerencias` recoge propuestas de cartas nuevas.
- `/admin` (solo para los correos de `ADMIN_EMAILS`) permite crear, editar y retirar cartas, aprobar vídeos, leer valoraciones y sugerencias, y ver qué cartas se juegan más y con qué respuesta.

La ventana de respuesta es de 1 a 120 minutos. Al llegar al vencimiento, el ataque se considera aceptado. El servidor materializa las expiraciones al cargar el viaje o el historial, o al ejecutar una acción de juego. Las páginas se actualizan cada 5 segundos mientras están visibles. Sin visitas no se ejecuta ningún temporizador de servidor.

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
- Notificaciones push.
- Eliminación de viajes.
- Transferencia de cartas entre jugadores.
