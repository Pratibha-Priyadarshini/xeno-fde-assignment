// backend/src/services/shopify.webhook.ts
import axios from "axios";
import prisma from "../db/prismaClient";
import { logger } from "../utils/logger";

const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2023-01";
const APP_URL = process.env.SHOPIFY_APP_URL!;

const WEBHOOK_TOPICS = [
  "customers/create",
  "customers/update",
  "orders/create",
  "orders/updated",
  "products/create",
  "products/update",
];

/**
 * Register all required webhooks for a given store
 * Marks the tenant as webhooksRegistered = true if successful
 */
export async function registerWebhooks(
  shop: string,
  accessToken: string,
  tenantId: number
): Promise<void> {
  try {
    for (const topic of WEBHOOK_TOPICS) {
      const address = `${APP_URL}/webhooks/${topic}`;
      await axios.post(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`,
        {
          webhook: { topic, address, format: "json" },
        },
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );
      logger.info("✅ Registered webhook %s for shop %s", topic, shop);
    }

    // Mark tenant as having registered webhooks
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { webhooksRegistered: true },
    });

    logger.info("Tenant %d marked as webhooksRegistered=true", tenantId);
  } catch (err: any) {
    logger.error({ err }, "❌ Failed to register webhooks for shop %s", shop);
    throw err;
  }
}

/**
 * Checks if all required webhooks are already registered on Shopify
 */
export async function hasWebhooks(shop: string, accessToken: string): Promise<boolean> {
  try {
    const resp = await axios.get(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );

    const existing = resp.data.webhooks || [];
    const existingTopics = existing.map((w: any) => w.topic);

  const allRegistered = WEBHOOK_TOPICS.every((t: string) => existingTopics.includes(t));

    logger.info(
      "Shop %s webhooks check: %d/%d registered",
      shop,
  existingTopics.filter((t: string) => WEBHOOK_TOPICS.includes(t)).length,
      WEBHOOK_TOPICS.length
    );

    return allRegistered;
  } catch (err: any) {
    logger.error({ err }, "❌ Failed to fetch webhooks for shop %s", shop);
    return false;
  }
}
