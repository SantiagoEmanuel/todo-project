import type { InstaQLEntity } from "@instantdb/react";
import type schema from "../../instant.schema";

export type Todo = InstaQLEntity<
  typeof schema,
  "todos",
  { items: {} },
  undefined,
  true
>;

export type Item = InstaQLEntity<typeof schema, "items", {}, undefined, true>;
