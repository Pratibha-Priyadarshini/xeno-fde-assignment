import { Request, Response } from "express";
import { upsertOrderFromWebhook, upsertCustomerFromWebhook, upsertProductFromWebhook } from "../services/ingestion.service";
import prisma from "../db/prismaClient";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * Onboard flow: accepts shopDomain and optional API key/secret.
 * Associates them with the tenant from JWT.
 */
export async function onboardTenant(req: AuthRequest, res: Response) {
  const { shopDomain, apiKey, apiSecret, storeName } = req.body;
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  if (!shopDomain) return res.status(400).json({ message: "Missing shopDomain" });

  // update tenant
  const tenant = await prisma.tenant.update({
    where: { id: user.tenantId },
    data: { shopDomain, apiKey, apiSecret }
  });

  // create a store record if not exists
  const store = await prisma.store.upsert({
    where: { id: 1 }, // naive for dev; in production search by domain
    update: {},
    create: {
      tenantId: tenant.id,
      name: storeName || "Default Store",
      domain: shopDomain
    }
  });

  res.json({ tenant, store });
}

/**
 * Webhook endpoints: expect tenantId in header x-tenant-id or in query param
 */
function getTenantIdFromReq(req: Request) {
  const header = req.headers["x-tenant-id"];
  if (header) return Number(header);
  // fallback to query param
  if (req.query.tenantId) return Number(req.query.tenantId);
  return null;
}

export async function orderWebhook(req: Request, res: Response) {
  const tenantId = getTenantIdFromReq(req);
  if (!tenantId) return res.status(400).json({ message: "Missing tenant id" });

  try {
    const payload = req.body;
    // Call ingestion
    await upsertOrderFromWebhook(tenantId, payload);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
}

export async function customerWebhook(req: Request, res: Response) {
  const tenantId = getTenantIdFromReq(req);
  if (!tenantId) return res.status(400).json({ message: "Missing tenant id" });
  try {
    await upsertCustomerFromWebhook(tenantId, req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
}

export async function productWebhook(req: Request, res: Response) {
  const tenantId = getTenantIdFromReq(req);
  if (!tenantId) return res.status(400).json({ message: "Missing tenant id" });
  try {
    await upsertProductFromWebhook(tenantId, req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
}
