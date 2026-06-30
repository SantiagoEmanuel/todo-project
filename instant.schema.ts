// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $streams: i.entity({
      abortReason: i.string().optional(),
      clientId: i.string().unique().indexed(),
      done: i.boolean().optional(),
      size: i.number().optional(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    todos: i.entity({
      text: i.string(),
      done: i.boolean(),
      createdAt: i.date(),
      // Temporizador por tarea: cuándo recordarla con una notificación, y
      // cuándo se envió ese recordatorio (para no repetirlo).
      remindAt: i.date().indexed().optional(),
      remindedAt: i.date().optional(),
    }),
    items: i.entity({
      text: i.string(),
      done: i.boolean(),
      createdAt: i.date(),
    }),
    // Suscripciones Web Push (una por dispositivo/navegador). Las usa el
    // backend para enviar recordatorios con la app cerrada.
    pushSubscriptions: i.entity({
      endpoint: i.string().unique().indexed(),
      p256dh: i.string(),
      auth: i.string(),
      intervalMin: i.number(),
      lastNotifiedAt: i.number().optional(),
      createdAt: i.date(),
    }),
  },
  links: {
    todosItems: {
      forward: {
        on: "todos",
        has: "many",
        label: "items",
      },
      reverse: {
        on: "items",
        has: "one",
        label: "todo",
        onDelete: "cascade",
      },
    },
    $streams$files: {
      forward: {
        on: "$streams",
        has: "many",
        label: "$files",
      },
      reverse: {
        on: "$files",
        has: "one",
        label: "$stream",
        onDelete: "cascade",
      },
    },
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
  },
  rooms: {},
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
