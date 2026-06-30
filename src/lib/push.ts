// Web Push del lado del cliente: suscribe el dispositivo y guarda la
// PushSubscription en InstantDB para que el backend pueda enviar
// recordatorios con la app cerrada (ver docs/PUSH_NOTIFICATIONS_PLAN.md).

import { lookup } from "@instantdb/react";
import { VITE_VAPID_PUBLIC_KEY } from "../constants/credentials";
import db from "./db";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export function pushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function pushConfigured(): boolean {
  return Boolean(VITE_VAPID_PUBLIC_KEY);
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function subscribeToPush(intervalMin: number): Promise<boolean> {
  if (!pushSupported() || !pushConfigured()) return false;
  if (Notification.permission !== "granted") {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return false;
  }
  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VITE_VAPID_PUBLIC_KEY),
    }));

  const json = sub.toJSON();
  const keys = json.keys ?? {};
  if (!json.endpoint || !keys.p256dh || !keys.auth) return false;

  await db.transact(
    db.tx.pushSubscriptions[lookup("endpoint", json.endpoint)].update({
      endpoint: json.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      intervalMin,
      createdAt: Date.now(),
    }),
  );
  return true;
}

export async function updatePushInterval(intervalMin: number): Promise<void> {
  const sub = await getPushSubscription();
  if (!sub) return;
  await db.transact(
    db.tx.pushSubscriptions[lookup("endpoint", sub.endpoint)].update({
      intervalMin,
    }),
  );
}

export async function unsubscribeFromPush(): Promise<void> {
  const sub = await getPushSubscription();
  if (!sub) return;
  const { endpoint } = sub;
  await sub.unsubscribe();
  await db.transact(
    db.tx.pushSubscriptions[lookup("endpoint", endpoint)].delete(),
  );
}
