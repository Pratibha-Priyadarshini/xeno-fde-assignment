import { Router } from "express";
import prisma from "../db/prismaClient";
import { logger } from "../utils/logger";

const router = Router();

/**
 * POST /api/shopify/onboard
 * Body: { shopDomain: string, storeName?: string, apiKey?: string, apiSecret?: string }
 * Creates or updates tenant + store
 */
router.post("/", async (req, res) => {
  try {
    const { shopDomain, storeName, apiKey, apiSecret } = req.body;

    if (!shopDomain) {
      return res.status(400).json({ message: "Missing shopDomain" });
    }

    // Upsert tenant
    const tenant = await prisma.tenant.upsert({
      where: { shopDomain },
      update: { apiKey, apiSecret, webhooksRegistered: false },
      create: {
        name: storeName || shopDomain,
        shopDomain,
        apiKey,
        apiSecret,
      },
    });

    // Upsert store (using id: 1 for dev/demo; in production, use a real unique id)
    await prisma.store.upsert({
      where: { id: 1 },
      update: { tenantId: tenant.id },
      create: {
        name: storeName || shopDomain,
        domain: shopDomain,
        tenantId: tenant.id,
      },
    });

    logger.info("Tenant %s onboarded successfully", shopDomain);

    return res.json({ ok: true, tenantId: tenant.id });
  } catch (err) {
    logger.error({ err }, "Failed to onboard tenant %s", req.body.shopDomain);
    return res.status(500).json({ message: "Tenant onboarding failed" });
  }
});

export default router;
