# Verificación de Tripu

## Resultado local (15 de septiembre de 2026)

- Scaffold, esquema/autenticación, reglas, datos, acciones y páginas compilados por fases.
- Prisma: esquema válido.
- ESLint: sin errores ni avisos de reglas. Next 15.5 avisa de que `next lint` está obsoleto; se conserva el script solicitado.
- 68 pruebas unitarias correctas. Prueba de integración contra Neon correcta (24 s): acciones reales, carreras de escritura, aislamiento de manos, reacciones, expiración y finalización. Sesión y caché de Next simuladas en esa prueba.
- Esquema aplicado en una base Neon inicialmente vacía; catálogo de 11 cartas cargado. Segundo seed idempotente. Datos de integración eliminados al finalizar.
- Comprobación HTTP: portada en español, invitación, manifiesto e iconos accesibles. Las rutas protegidas redirigen al inicio sin sesión.
- Revisión visual pendiente: la sesión del agente no dispone de un navegador conectado.
- Login con dos cuentas Google y producción: pendientes de completar las credenciales OAuth y ejecutar el flujo manual.
- No se ha hecho push ni desplegado en Vercel.

La conexión directa se obtuvo del mismo endpoint Neon retirando `-pooler` del host. Se completaron únicamente `DIRECT_URL` y `AUTH_SECRET` vacíos/provisionales en el archivo local, sin imprimir sus valores ni añadirlo a Git. Para `npm start` fuera de Vercel, configura `AUTH_URL` con el origen local; `npm run dev` y Vercel tienen detección de host propia.

## Dependencias: resultado de npm audit

El lockfile respeta Next 15 / Prisma 6 / Vitest 2 y `next-auth@5.0.0-beta.25` del plan. La instalación informa de **12 paquetes afectados: 4 moderados, 5 altos y 3 críticos**. Es un recuento de paquetes, no de vías explotables verificadas en esta app.

Incluye avisos de Auth.js, Vitest/Vite, PostCSS y deepmerge-ts/Prisma. La app usa exclusivamente Google, sesiones en BD y verifica `session.user.id`; no usa email login, `getToken`, múltiples proveedores ni un servidor de Vitest UI. Estas condiciones no sustituyen la actualización de dependencias. Se conserva la versión pedida y se deja constancia de esta limitación antes de publicar.

Ejecuta `npm audit` para obtener el informe actualizado. No se ha usado `npm audit fix --force`, porque cambiaría las versiones principales o la versión exacta de autenticación solicitada.

## Flujo manual con dos cuentas

1. A crea un viaje con 3 nombres y ventana de 2 minutos. Selecciona `copa-tiron`, `a-correr`, `escudo`, `boomerang`; reparto: bebida 2, reto 1, defensa 1.
2. A copia la invitación; B abre el enlace y reclama un nombre. A reclama otro.
3. A inicia. Cada nombre tiene 4 cartas, incluido el que no ha entrado. El reparto es aleatorio: Escudo o Boomerang pueden no salir en esa mano; usa otra partida o más cartas de defensa para probar ambos.
4. A juega un ataque contra B. B lo ve tras el siguiente refresco (~5 s), con cuenta atrás.
5. B devuelve un ataque con Boomerang: `finalTargetId` es A, las dos cartas quedan bloqueadas y no se admite otra reacción.
6. Prueba Escudo: el ataque queda bloqueado y no tiene destinatario final.
7. A lanza otro ataque y B deja pasar el tiempo. Tras el siguiente refresco aparece aplicado por expiración.
8. Intenta responder desde dos pestañas: solo una respuesta y un evento deben ganar. Repite con iniciar/finalizar en dos pestañas.
9. El tercer usuario reclama su nombre con el viaje activo y encuentra su mano original.
10. A finaliza; no quedan pendientes, el resumen cuenta destinatarios finales y el historial conserva cada resultado.
11. Repite el flujo corto en el dominio de producción después del despliegue.
