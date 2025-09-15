// backend/jobs/scheduler.ts
import cron from "node-cron";
import prisma from "../db/prismaClient";
import { fetchStoreData } from "../services/shopify.service";
import {
  upsertCustomerFromWebhook,
  upsertOrderFromWebhook,
  upsertProductFromWebhook,
} from "../services/ingestion.service";
import { logger } from "../utils/logger";
import { fetchMockStoreData } from "../services/shopify.mockStore";
import { hasWebhooks } from "../services/shopify.webhook";

export function startScheduler() {
  const cronExpr = process.env.SYNC_CRON || "*/5 * * * *"; // every 5 min

  cron.schedule(cronExpr, async () => {
    logger.info("Scheduler tick - syncing tenants (fallback mode)");

    try {
      // Fetch tenants flagged as missing webhooks
      const tenants = await prisma.tenant.findMany({
        where: { webhooksRegistered: false },
      });

      if (tenants.length === 0) {
        logger.info("No tenants require fallback sync (all on webhooks)");
        return;
      }

      for (const tenant of tenants) {
        try {
          // Fetch default store for tenant
          const store = await prisma.store.findFirst({ where: { tenantId: tenant.id } });
          if (!store) {
            logger.warn("Tenant %d has no store", tenant.id);
            continue;
          }

          // Optionally check Shopify directly if webhooks exist
          const useMock = process.env.USE_MOCK_SHOPIFY === "true";
          let skipSync = false;
          if (!useMock) {
            const webhooksExist = await hasWebhooks(store.domain, store.tenantId.toString());
            if (webhooksExist) {
              // Mark tenant as webhook-enabled to avoid future fallback sync
              await prisma.tenant.update({
                where: { id: tenant.id },
                data: { webhooksRegistered: true },
              });
              skipSync = true;
              logger.info("Tenant %d already has webhooks; skipping fallback sync", tenant.id);
            }
          }

          if (skipSync) continue;

          // Fetch data
          const data = useMock
            ? await fetchMockStoreData(tenant.id)
            : await fetchStoreData(tenant.id);

          let syncedCustomers = 0;
          let syncedProducts = 0;
          let syncedOrders = 0;

          for (const customer of data.customers || []) {
            await upsertCustomerFromWebhook(tenant.id, customer);
            syncedCustomers++;
          }

          for (const product of data.products || []) {
            await upsertProductFromWebhook(tenant.id, product);
            syncedProducts++;
          }

          for (const order of data.orders || []) {
            await upsertOrderFromWebhook(tenant.id, order);
            syncedOrders++;
          }

          logger.info(
            "Tenant %d synced successfully (fallback): %d customers, %d products, %d orders",
            tenant.id,
            syncedCustomers,
            syncedProducts,
            syncedOrders
          );
        } catch (err) {
          logger.error({ err }, "Error syncing tenant %d", tenant.id);
        }
      }
    } catch (err) {
      logger.error({ err }, "Scheduler top-level error");
    }
  });

  logger.info("Scheduler started with cron expression: %s", cronExpr);
}
