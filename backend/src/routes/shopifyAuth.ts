// backend/routes/shopifyAuth.ts
import express from "express";
import axios from "axios";
import crypto from "crypto";
import prisma from "../db/prismaClient";
import { logger } from "../utils/logger";
import { registerWebhooks } from "../services/shopify.webhook";
import { markTenantWebhooksRegistered } from "../services/tenant.service";

const router = express.Router();

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const SHOPIFY_SCOPES =
  process.env.SHOPIFY_SCOPES || "read_products,read_orders,read_customers";
const APP_URL = process.env.SHOPIFY_APP_URL!;

/**
 * Step 1: Start OAuth - Redirect to Shopify
 */
router.get("/auth", async (req, res) => {
  try {
    const shop = req.query.shop as string;
    if (!shop) return res.status(400).send("Missing shop parameter");

    const redirectUri = `${APP_URL}/shopify/auth/callback`;
    const state = crypto.randomBytes(16).toString("hex");

    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SHOPIFY_SCOPES}&redirect_uri=${redirectUri}&state=${state}`;

    res.redirect(installUrl);
  } catch (err) {
    logger.error({ err }, "Error in /shopify/auth");
    res.status(500).send("Internal server error");
  }
});

/**
 * Step 2: OAuth Callback - Exchange code for token
 */
router.get("/auth/callback", async (req, res) => {
  try {
    const { shop, code } = req.query;
    if (!shop || !code) return res.status(400).send("Missing required params");

    const tokenUrl = `https://${shop}/admin/oauth/access_token`;

    const response = await axios.post(tokenUrl, {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    });

    const accessToken = response.data.access_token;

    // Save or update tenant
    const tenant = await prisma.tenant.upsert({
      where: { shopDomain: shop as string },
      update: {},
      create: { name: shop as string, shopDomain: shop as string },
    });

    // Save or update store (using id: 1 for dev/demo; in production, use a real unique id)
    await prisma.store.upsert({
      where: { id: 1 },
      update: { tenantId: tenant.id },
      create: { name: shop as string, domain: shop as string, tenantId: tenant.id },
    });

    // Register webhooks
    await registerWebhooks(shop as string, accessToken, tenant.id);

    // Mark tenant as webhook-enabled (idempotent)
    await markTenantWebhooksRegistered(tenant.id);

    logger.info("✅ Store %s onboarded successfully", shop);
    res.send("✅ App successfully installed! You can now close this tab.");
  } catch (err) {
    logger.error({ err }, "Error in /shopify/auth/callback");
    res.status(500).send("OAuth callback failed");
  }
});

export default router;
