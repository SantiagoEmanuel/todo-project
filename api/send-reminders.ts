// Cron de Vercel: recorre las suscripciones push y envía (1) los
// recordatorios de tareas cuyo temporizador venció y (2) el recordatorio
// periódico de pendientes según el intervalo de cada suscripción.
// Programado en vercel.json.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  buildBody,
  configError,
  db,
  sendTo,
  type PushMessage,
  type SubRow,
  type TodoRow,
} from "../server/reminders";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Protección del cron: si hay CRON_SECRET, exigir el header de Vercel.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const cfg = configError();
  if (cfg) return res.status(500).json({ error: cfg });

  const now = Date.now();
  const data = (await db.query({ todos: {}, pushSubscriptions: {} })) as {
    todos?: TodoRow[];
    pushSubscriptions?: SubRow[];
  };
  const todos = data.todos ?? [];
  const subs = data.pushSubscriptions ?? [];
  const pending = todos.filter((t) => !t.done);

  // Tareas con temporizador vencido y sin enviar todavía.
  const dueTasks = pending.filter(
    (t) =>
      t.remindAt != null &&
      new Date(t.remindAt).getTime() <= now &&
      t.remindedAt == null,
  );

  let sent = 0;
  for (const sub of subs) {
    const messages: PushMessage[] = [];

    for (const t of dueTasks) {
      messages.push({
        title: "⏰ Recordatorio de tarea",
        body: t.text,
        tag: `todo-task-${t.id}`,
      });
    }

    const interval = sub.intervalMin ?? 45;
    const last = sub.lastNotifiedAt ?? 0;
    const periodicDue =
      pending.length > 0 && now - last >= interval * 60 * 1000;
    if (periodicDue) {
      messages.push({
        title: "Tareas pendientes ⏰",
        body: buildBody(pending.map((t) => t.text)),
        tag: "todo-reminders",
      });
    }

    let expired = false;
    for (const m of messages) {
      const result = await sendTo(sub, m);
      if (result === "ok") sent++;
      if (result === "expired") expired = true;
    }

    if (expired) {
      await db.transact(db.tx.pushSubscriptions[sub.id].delete());
    } else if (periodicDue) {
      await db.transact(
        db.tx.pushSubscriptions[sub.id].update({ lastNotifiedAt: now }),
      );
    }
  }

  // Marca las tareas con temporizador como notificadas (una vez intentado el
  // envío a todas las suscripciones) para no repetirlas.
  if (dueTasks.length && subs.length) {
    await db.transact(
      dueTasks.map((t) => db.tx.todos[t.id].update({ remindedAt: now })),
    );
  }

  return res
    .status(200)
    .json({ ok: true, sent, dueTasks: dueTasks.length, subs: subs.length });
}
