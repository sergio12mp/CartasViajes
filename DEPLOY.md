# Desplegar CartasViajes

Repositorio: `sergio12mp/CartasViajes`. La publicación y el push los realiza el propietario. La aplicación está preparada para Vercel Hobby, sin cron.

## 1. Neon: base de datos

1. Crea un proyecto en [Neon](https://console.neon.tech/) para CartasViajes, preferiblemente en una región cercana a tus usuarios y a la función de Vercel.
2. Utiliza una rama/base de desarrollo para pruebas y otra para producción.
3. Copia las cadenas de conexión del panel a `.env`:
   - `DATABASE_URL`: conexión con pool, cuyo host incluye `-pooler`.
   - `DIRECT_URL`: conexión directa del mismo proyecto y base.
4. Conserva las opciones TLS de Neon, como `sslmode=require`.

El esquema usa `url` y `directUrl` según el patrón de [Prisma 6 con Neon](https://www.prisma.io/docs/orm/v6/overview/databases/neon). No copies credenciales del predictor a este proyecto.

## 2. Google OAuth

1. En [Google Cloud Console](https://console.cloud.google.com/), crea el proyecto **CartasViajes**.
2. Configura la pantalla de consentimiento/Google Auth Platform: nombre de aplicación, correo de soporte y audiencia externa.
3. Mientras esté en pruebas, añade tus correos y los de los amigos como **test users**. Para abrir el acceso, publica la aplicación OAuth y completa los requisitos que indique Google.
4. Crea un cliente OAuth de tipo **aplicación web**.
5. Añade los orígenes autorizados:
   - `http://localhost:3000`
   - `https://TU-APP.vercel.app`
6. Añade las URI de redirección autorizadas:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://TU-APP.vercel.app/api/auth/callback/google`
7. Guarda el ID como `AUTH_GOOGLE_ID` y el secreto como `AUTH_GOOGLE_SECRET`.

El sufijo de callback y las variables se corresponden con el [proveedor Google de Auth.js](https://authjs.dev/getting-started/providers/google). Una URI distinta, incluso por puerto o dominio, impide completar el flujo de [OAuth de Google](https://developers.google.com/identity/protocols/oauth2/web-server).

Genera un `AUTH_SECRET` local sin imprimirlo: puedes ejecutar este comando en la raíz **una vez**, con `.env` creado. Sustituye una línea vacía; no rota un secreto existente.

```powershell
@'
import fs from "node:fs";
import { randomBytes } from "node:crypto";
const path = ".env";
const text = fs.readFileSync(path, "utf8");
fs.writeFileSync(path, text.replace(/^AUTH_SECRET=""$/m,
  () => "AUTH_SECRET=" + randomBytes(32).toString("base64url")));
'@ | node --input-type=module -
```

Usa un secreto distinto en producción. `AUTH_URL` es opcional; si lo configuras, debe coincidir con el origen real.

## 3. Vercel

1. Publica los commits cuando estén revisados. Importa `sergio12mp/CartasViajes` en [Vercel](https://vercel.com/new).
2. Framework: **Next.js**. **Root Directory: raíz del repositorio (`./`)**. Node.js: **24.x**.
3. Build command: `npm run build`. Install command: `npm ci`.
4. Configura `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` para el entorno correspondiente. Usa una base distinta en Preview si vas a probar cambios.
5. Si has añadido las variables en Vercel después del primer despliegue, crea un nuevo despliegue. El `.env` de tu PC no se copia a Vercel.
6. Despliega y sustituye `TU-APP.vercel.app` por el dominio real en Google OAuth. Para un dominio propio, registra también su origen y callback.
7. Si cambias variables, crea un nuevo despliegue para aplicarlas.

Si `/api/auth/providers` o `/api/auth/signin/google` devuelve **500 / Server error**, abre Vercel → proyecto → **Deployments** → despliegue → **Functions / Runtime Logs**. Las causas más habituales son `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` ausentes, `DATABASE_URL` incorrecta o que todavía no se ejecutó `npm run db:push` contra la base de producción. El navegador solo muestra el mensaje genérico de Auth.js; el log identifica la variable o tabla concreta.

Consulta los [ajustes de proyecto de Vercel](https://vercel.com/docs/project-configuration/general-settings) y su [documentación de variables](https://vercel.com/docs/environment-variables). No se necesitan claves de resultados deportivos ni configuración de cron.

## 4. Aplicar esquema y catálogo

Desde la raíz, con `.env` apuntando a la base elegida:

```bash
npm ci
npm run db:push
npm run db:seed
```

No uses `--accept-data-loss` para resolver avisos automáticamente. El catálogo se actualiza con upsert; retirar un tipo lo desactiva, conservando sus referencias.

Comprueba el checklist de [VERIFY.md](VERIFY.md), inicia sesión con dos cuentas y repite una jugada con reacción y otra con expiración. Las expiraciones se resuelven al cargar páginas o ejecutar acciones; no hay tareas programadas por minuto.

## Antes de publicar

Revisa los avisos de `npm audit` recogidos en `VERIFY.md` y actualiza las dependencias afectadas como un cambio separado del stack fijado en el plan. La compilación correcta no certifica el login con Google ni el despliegue de producción.
