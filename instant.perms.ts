// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

// Acceso abierto: la app no usa login/contraseña, cualquier cliente puede
// leer y escribir sus tareas y microobjetivos. Si en el futuro se agrega
// autenticación, restringir estas reglas por `auth.id`.
const rules = {
  todos: {
    allow: {
      view: "true",
      create: "true",
      update: "true",
      delete: "true",
    },
  },
  items: {
    allow: {
      view: "true",
      create: "true",
      update: "true",
      delete: "true",
    },
  },
} satisfies InstantRules;

export default rules;
