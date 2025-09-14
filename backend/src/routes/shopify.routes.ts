import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { tenantMiddleware } from "../middlewares/tenant.middleware";
import * as ShopifyController from "../controllers/shopify.controllers";

const router = Router();

/**
 * Onboard (simple tenant config)
 * In production this should be OAuth redirect to Shopify per their docs.
 */
router.post("/onboard", authenticateJWT, ShopifyController.onboardTenant);

/**
 * Webhooks from Shopify - no auth expected (but verify HMAC in prod)
 * We'll accept tenantId as header or query param
 */
router.post("/webhooks/orders", tenantMiddleware, ShopifyController.orderWebhook);
router.post("/webhooks/customers", tenantMiddleware, ShopifyController.customerWebhook);
router.post("/webhooks/products", tenantMiddleware, ShopifyController.productWebhook);

export default router;
