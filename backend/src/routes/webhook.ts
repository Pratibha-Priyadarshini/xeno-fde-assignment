// backend/routes/webhook.ts
import express from "express";
import { logger } from "../utils/logger";
import { verifyShopifyHmac } from "../utils/verifyShopifyHmac";
import prisma from "../db/prismaClient";
import {
  upsertCustomerFromWebhook,
  upsertOrderFromWebhook,
  upsertProductFromWebhook,
} from "../services/ingestion.service";

const router = express.Router();

/**
 * Shopify webhook endpoint
 */
router.post("/:topic", async (req, res) => {
  try {
    const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
    const shop = req.get("X-Shopify-Shop-Domain")!;
    const rawBody = (req as any).rawBody;

    if (!hmacHeader || !verifyShopifyHmac(rawBody, hmacHeader)) {
      logger.warn("❌ Invalid HMAC signature for webhook");
      return res.status(401).send("Unauthorized");
    }

    const topic = req.params.topic;
    const payload = req.body;

    // Find tenant by shop domain
    const store = await prisma.store.findFirst({
      where: { domain: shop },
      include: { tenant: true },
    });

    if (!store) {
      logger.error("No store found for shop domain %s", shop);
      return res.status(404).send("Store not found");
    }

    // Route webhook by topic
    if (topic === "customers/create" || topic === "customers/update") {
      await upsertCustomerFromWebhook(store.tenantId, payload);
    } else if (topic === "products/create" || topic === "products/update") {
      await upsertProductFromWebhook(store.tenantId, payload);
    } else if (topic === "orders/create" || topic === "orders/updated") {
      await upsertOrderFromWebhook(store.tenantId, payload);
    }

    logger.info("✅ Webhook %s processed for shop %s", topic, shop);
    res.status(200).send("OK");
  } catch (err) {
    logger.error({ err }, "Webhook error");
    res.status(500).send("Webhook failed");
  }
});

export default router;
