# Plan: recordatorios con la app cerrada (Web Push)

Hoy los recordatorios se disparan con un `setInterval` en la app + Periodic
Background Sync. Eso solo es fiable **mientras la PWA está abierta** (primer o
segundo plano). Para recordar las tareas pendientes **con la app totalmente
cerrada**, hace falta **Web Push**: un backend que empuja la notificación al
navegador a través del push service del fabricante.

Este documento responde: **cómo se maneja, dónde se despliega y cómo se
comunica**, y cómo probar que la notificación llega.

---

## 1. Cómo se maneja (arquitectura)

```
┌────────────┐  1. subscribe    ┌──────────────┐  guarda sub   ┌────────────┐
│  Navegador │ ───────────────► │  /api/        │ ────────────► │ InstantDB  │
│  + Service │                  │  subscribe    │               │ (subs +    │
│   Worker   │ ◄─────────────── │  (serverless) │               │  todos)    │
└────────────┘  VAPID pubkey    └──────────────┘               └────────────┘
      ▲                                                               ▲
      │ 4. push (cifrado)                                             │ 3. lee
      │                          ┌──────────────┐  cada ~15 min      │ pendientes
      └───────────────────────── │ Cron + sender│ ◄──────────────────┘
         push service del        │ (serverless) │
         navegador (Google/      └──────────────┘
         Mozilla/Apple)
```

Piezas:

1. **Cliente (ya casi listo).** El service worker (`public/sw.js`) ya tiene el
   handler `push`. Falta el flujo de **suscripción**:
   `registration.pushManager.subscribe({ userVisibleOnly: true,
applicationServerKey: VAPID_PUBLIC })` y enviar la `PushSubscription`
   resultante (endpoint + claves `p256dh`/`auth`) a `/api/subscribe`.

2. **Almacén de suscripciones.** Nueva entidad en InstantDB, p. ej.:

   ```ts
   pushSubscriptions: i.entity({
     endpoint: i.string().unique().indexed(),
     p256dh: i.string(),
     auth: i.string(),
     intervalMin: i.number(), // 45 o 60
     lastNotifiedAt: i.number().optional(),
     createdAt: i.date(),
   });
   ```

   Como la app no tiene login, cada dispositivo es una suscripción anónima. Si
   más adelante hay usuarios, se enlaza `pushSubscriptions` con `$users`.

3. **Job programado (cron).** Cada ~15 min recorre las suscripciones, calcula
   las tareas pendientes y, para las que ya cumplieron su intervalo
   (`now - lastNotifiedAt >= intervalMin`), envía un push y actualiza
   `lastNotifiedAt`. Las tareas pendientes se leen desde InstantDB con el
   **admin SDK** (`@instantdb/admin`) usando un admin token — no se confía en
   lo que diga el cliente.

4. **Envío del push.** El sender usa la librería [`web-push`](https://github.com/web-push-libs/web-push)
   con las claves VAPID. `web-push` cifra el payload y hace el POST al endpoint
   del push service; este despierta el service worker con el evento `push`.

---

## 2. Dónde se despliega

La app ya está en **Vercel**, así que la opción de menor fricción es quedarse
ahí:

| Componente            | Vercel (recomendado)                        |
| --------------------- | ------------------------------------------- |
| `/api/subscribe`      | Vercel Function (`api/subscribe.ts`)        |
| `/api/unsubscribe`    | Vercel Function                             |
| Job de recordatorios  | **Vercel Cron** → `api/send-reminders.ts`   |
| Suscripciones + todos | **InstantDB** (ya en uso)                   |
| Claves VAPID / tokens | Variables de entorno del proyecto en Vercel |

`vercel.json`:

```json
{
  "crons": [{ "path": "/api/send-reminders", "schedule": "*/15 * * * *" }]
}
```

> Vercel Cron tiene granularidad de minutos. Como el intervalo real (45/60 min)
> se controla por suscripción con `lastNotifiedAt`, basta con correr el cron
> cada 15 min y enviar solo a las que tocan.

**Alternativas equivalentes** (si se quiere salir de Vercel):

- **Cloudflare Workers** + Cron Triggers + KV/D1 (muy barato, global).
- **Supabase** Edge Functions + `pg_cron` (si se migra el almacén a Postgres).
- **Servidor Node** (Render/Railway/Fly.io) con `node-cron` — más control, hay
  que mantener el proceso.

Para este proyecto: **Vercel Functions + Vercel Cron + InstantDB**.

---

## 3. Cómo se comunica (protocolo)

- **Web Push Protocol** (RFC 8030) + **VAPID** (RFC 8292):
  - Se generan **una vez** un par de claves VAPID (`web-push generate-vapid-keys`).
    La **pública** va al cliente (`VITE_VAPID_PUBLIC_KEY`), la **privada** queda
    como secreto en el backend (`VAPID_PRIVATE_KEY`).
  - El navegador entrega un **endpoint** propio del fabricante (FCM para
    Chrome, Mozilla autopush para Firefox, Apple para Safari). El backend no
    habla con Google/Apple directamente: hace un `POST` firmado con VAPID a ese
    endpoint y el push service entrega el mensaje.
  - El **payload** (título, cuerpo, url) viaja **cifrado** (AES-GCM con las
    claves `p256dh`/`auth` de la suscripción); `web-push` se encarga de todo.

- **Errores y limpieza:** si el envío responde `404`/`410 Gone`, la suscripción
  caducó → borrarla de InstantDB.

- **Compatibilidad:** Chrome/Edge/Firefox en escritorio y Android funcionan
  directo. En **iOS/iPadOS (16.4+)** el Web Push solo funciona si la PWA está
  **instalada** en la pantalla de inicio (no en la pestaña de Safari).

---

## 4. Probar que la notificación llega

Dos niveles, de menor a mayor cobertura:

1. **Test local (ya implementado).** Botón **"Probar"** en la barra de
   recordatorios → `showTestNotification()` dispara una notificación inmediata
   vía el service worker. Verifica permiso + SW + render de la notificación en
   este dispositivo. _No_ prueba el backend.

2. **Test de extremo a extremo (cuando exista el backend).**
   - Endpoint `POST /api/test-push` que recibe un `endpoint` (o lo toma de la
     última suscripción) y envía un push de prueba con `web-push`.
   - Botón "Probar push real" en la UI que llama a ese endpoint; si en unos
     segundos llega la notificación con la app **cerrada**, el pipeline completo
     (suscripción → cron/sender → push service → SW `push`) funciona.
   - En CI: test de integración que monta un push service falso (o usa el
     endpoint de pruebas de `web-push`) y verifica que el handler `push` del SW
     llama a `showNotification` con el payload correcto.

---

## 5. Pasos de implementación (resumen)

1. `pnpm add web-push @instantdb/admin` (+ `@types/web-push`).
2. Generar claves VAPID y cargarlas como env vars en Vercel
   (`VITE_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`,
   `INSTANT_ADMIN_TOKEN`).
3. Añadir la entidad `pushSubscriptions` a `instant.schema.ts` y
   `instant-cli push`.
4. Cliente: función `subscribeToPush()` (pedir permiso → `pushManager.subscribe`
   → `POST /api/subscribe`) y botón en `ReminderControls`.
5. `api/subscribe.ts` y `api/send-reminders.ts` (lee pendientes con el admin
   SDK, envía con `web-push`, actualiza `lastNotifiedAt`, limpia caducadas).
6. `vercel.json` con el cron.
7. `api/test-push.ts` + botón "Probar push real".

---

## 6. Estado: implementado ✅

Ya está en el código (el cliente se suscribe directamente a InstantDB con
`lookup`, sin necesidad de `/api/subscribe`):

- **Schema:** entidad `pushSubscriptions` + campos `remindAt`/`remindedAt` en
  `todos` (temporizador por tarea). Permisos abiertos en `instant.perms.ts`.
- **Cliente:** `src/lib/push.ts` (suscribir/desuscribir, guardar en InstantDB),
  controles en `ReminderControls` ("Activar" / "Desactivar" / "Probar push") y
  recordatorio por tarea en `TaskReminder` (presets + `datetime-local`).
- **Service worker:** handler `push` que muestra la notificación.
- **Backend:** `server/reminders.ts` (admin SDK + `web-push`),
  `api/send-reminders.ts` (cron) y `api/test-push.ts` (prueba e2e).
- **Cron:** `vercel.json` cada 15 min.

### Puesta en marcha

1. **Generar claves VAPID:** `npx web-push generate-vapid-keys`.
2. **Variables de entorno** (ver `.env.example`). En local en `.env`; en Vercel
   en _Project Settings → Environment Variables_:
   - Cliente: `VITE_PUBLIC_APP_ID`, `VITE_VAPID_PUBLIC_KEY`.
   - Servidor: `INSTANT_APP_ID`, `INSTANT_ADMIN_TOKEN` (del dashboard de
     InstantDB), `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`,
     `CRON_SECRET`.
   - `VITE_VAPID_PUBLIC_KEY` y `VAPID_PUBLIC_KEY` deben ser **la misma** clave.
3. **Aplicar el schema:** `INSTANT_APP_ID=... npx instant-cli push`.
4. **Desplegar** en Vercel. El cron queda activo automáticamente por
   `vercel.json`.
5. **Probar:** instalar la PWA → "Activar" recordatorios → "Activar" push →
   "Probar push" (debería llegar la notificación aunque cierres la app).

### Nota sobre la frecuencia del cron

En el plan **Hobby** de Vercel los cron jobs se ejecutan, como máximo, **una vez
al día**. Para recordatorios cada 15–60 min hace falta el plan **Pro**, o bien
disparar `GET/POST https://<tu-dominio>/api/send-reminders` desde un cron
externo (p. ej. cron-job.org) enviando el header
`Authorization: Bearer <CRON_SECRET>`.
