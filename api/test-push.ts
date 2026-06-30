// Endpoint de prueba de extremo a extremo: envía un push de prueba a todas
// las suscripciones registradas. Útil para verificar que el pipeline
// (suscripción → servidor → push service → service worker) funciona con la
// app cerrada. Llamar con POST a /api/test-push.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { configError, db, sendTo, type SubRow } from "../server/reminders";

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
) {
  const cfg = configError();
  if (cfg) return res.status(500).json({ error: cfg });

  const data = (await db.query({ pushSubscriptions: {} })) as {
    pushSubscriptions?: SubRow[];
  };
  const subs = data.pushSubscriptions ?? [];

  let sent = 0;
  let expired = 0;
  for (const sub of subs) {
    const result = await sendTo(sub, {
      title: "Notificación de prueba 🔔",
      body: "Push de prueba desde el servidor ✅",
      tag: "todo-test",
    });
    if (result === "ok") sent++;
    if (result === "expired") {
      expired++;
      await db.transact(db.tx.pushSubscriptions[sub.id].delete());
    }
  }

  return res.status(200).json({ ok: true, total: subs.length, sent, expired });
}
