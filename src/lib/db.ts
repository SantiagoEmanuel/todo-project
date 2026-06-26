import { init } from "@instantdb/react";
import { VITE_PUBLIC_APP_ID } from "../constants/credentials";
import schema from "../db/instant.schema";

const db = init({
  appId: VITE_PUBLIC_APP_ID,
  schema,
  useDateObjects: true,
});

export default db;
