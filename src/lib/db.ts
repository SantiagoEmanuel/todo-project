import { init } from "@instantdb/react";
import schema from "../db/instant.schema";

const db = init({
  appId: import.meta.env.VITE_PUBLIC_APP_ID,
  schema,
  useDateObjects: true,
});

export default db;
