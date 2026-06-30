import { init } from "@instantdb/react";
import schema from "../../instant.schema";
import { VITE_PUBLIC_APP_ID } from "../constants/credentials";

const db = init({
  appId: VITE_PUBLIC_APP_ID,
  schema,
  useDateObjects: true,
});

export default db;
