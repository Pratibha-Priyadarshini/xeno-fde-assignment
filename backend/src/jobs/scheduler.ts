/**
 * Scheduler that periodically calls fetchStoreData for each tenant to reconcile data.
 * Uses node-cron; schedule via env SYNC_CRON
 */
import cron from "node-cron";
import prisma from "../db/prismaClient";
import { fetchStoreData } from "../services/shopify.service";
import { upsertCustomerFromWebhook, upsertOrderFromWebhook, upsertProductFromWebhook } from "../services/ingestion.service";
import { logger } from "../utils/logger";

export function startScheduler() {
  const cronExpr = process.env.SYNC_CRON || "*/5 * * * *"; // default every 5 min
  cron.schedule(cronExpr, async () => {
    logger.info("Scheduler tick - syncing tenants");
    try {
      const tenants = await prisma.tenant.findMany();
      for (const t of tenants) {
        try {
          const data = await fetchStoreData(t.id);
          // loop over arrays and upsert
          for (const c of data.customers || []) {
            await upsertCustomerFromWebhook(t.id, c);
          }
          for (const p of data.products || []) {
            await upsertProductFromWebhook(t.id, p);
          }
          for (const o of data.orders || []) {
            await upsertOrderFromWebhook(t.id, o);
          }
        } catch (err) {
          logger.error({ err }, "Error syncing tenant %d", t.id);
        }
      }
    } catch (err) {
      logger.error({ err }, "Scheduler top-level error");
    }
  });

  logger.info("Scheduler started with cron: %s", cronExpr);
}
