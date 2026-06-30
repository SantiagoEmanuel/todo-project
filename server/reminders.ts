// Helpers compartidos por las funciones serverless (api/*). Configura el
// admin SDK de InstantDB y web-push a partir de variables de entorno del
// servidor (sin prefijo VITE_). Ver docs/PUSH_NOTIFICATIONS_PLAN.md.

import { init } from "@instantdb/admin";
import webpush from "web-push";

export interface TodoRow {
  id: string;
  text: string;
  done: boolean;
  remindAt?: number | string | null;
  remindedAt?: number | string | null;
}

export interface SubRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  intervalMin?: number;
  lastNotifiedAt?: number;
}

export interface PushMessage {
  title: string;
  body: string;
  tag: string;
}

const APP_ID =
  process.env.INSTANT_APP_ID ?? process.env.VITE_PUBLIC_APP_ID ?? "";
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN ?? "";
const VAPID_PUBLIC =
  process.env.VAPID_PUBLIC_KEY ?? process.env.VITE_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:tareas@example.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

export const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

// Devuelve un mensaje si falta configuración, o null si todo está listo.
export function configError(): string | null {
  if (!APP_ID) return "Falta INSTANT_APP_ID";
  if (!ADMIN_TOKEN) return "Falta INSTANT_ADMIN_TOKEN";
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return "Faltan las claves VAPID";
  return null;
}

export function buildBody(texts: string[]): string {
  if (texts.length === 1) return `Pendiente: ${texts[0]}`;
  const preview = texts.slice(0, 3).join(", ");
  return `Tienes ${texts.length} tareas pendientes: ${preview}${
    texts.length > 3 ? "…" : ""
  }`;
}

export async function sendTo(
  sub: SubRow,
  msg: PushMessage,
): Promise<"ok" | "expired" | "error"> {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify({ ...msg, url: "/" }),
    );
    return "ok";
  } catch (err) {
    const code = (err as { statusCode?: number }).statusCode;
    // 404/410 = la suscripción ya no existe → conviene borrarla.
    if (code === 404 || code === 410) return "expired";
    return "error";
  }
}
