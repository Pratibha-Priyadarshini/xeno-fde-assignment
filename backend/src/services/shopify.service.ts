/**
 * Lightweight Shopify service wrapper skeleton.
 * Replace with real OAuth flow and Shopify REST/Graph calls in production.
 */
import axios from "axios";
import prisma from "../db/prismaClient";
import { logger } from "../utils/logger";

export async function fetchStoreData(tenantId: number) {
  // In production, you'll exchange tenant.apiKey/secret and call Shopify's REST endpoints.
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Tenant not found");

  // For demo, return empty arrays or log that this is a stub
  logger.info("fetchStoreData stub called for tenant %d", tenantId);
  return { customers: [], orders: [], products: [] };
}

export async function registerWebhooks(tenantId: number, webhookCallbackBaseUrl: string) {
  // In production call Shopify Admin API to create webhooks for orders/create etc.
  logger.info("registerWebhooks stub: tenant=%d url=%s", tenantId, webhookCallbackBaseUrl);
  return true;
}
