import express from "express";
import { initDatabase } from "./config";
import { router } from "./router";
import { logger } from "./utils";

export const app = express();

app.use(express.json());

initDatabase().catch((err) => {
  logger.error("Failed to initialise database", err);
  process.exit(1);
});

app.use(router);
