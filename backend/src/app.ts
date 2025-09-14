import express from "express";
import cors from "cors";
import morgan from "morgan";
import { json } from "body-parser";
import { logger } from "./utils/logger";
import indexRoutes from "./routes";
import { errorHandler } from "./utils/errorHandler";

export const app = express();

app.use(cors());
app.use(json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => res.json({ ok: true, service: "xeno-fde-backend" }));

app.use("/api", indexRoutes);

// central error handler
app.use(errorHandler);
