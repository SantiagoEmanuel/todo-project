import type { InstaQLEntity } from "@instantdb/react";
import type schema from "../db/instant.schema";

export type Todo = InstaQLEntity<typeof schema, "todos", {}, undefined, true>;
