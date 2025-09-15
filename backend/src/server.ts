import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import { logger } from "./utils/logger";
import { startScheduler } from "./jobs/scheduler";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
  startScheduler(); // start background scheduler
});
