// backend/services/tenant.service.ts
import prisma from "../db/prismaClient";

/**
 * Fetch tenant by ID
 */
export async function getTenantById(id: number) {
  return prisma.tenant.findUnique({ where: { id } });
}

/**
 * Fetch default store for tenant
 */
export async function getDefaultStoreForTenant(id: number) {
  return prisma.store.findFirst({ where: { tenantId: id } });
}

/**
 * Mark a tenant as having webhooks registered
 */
export async function markTenantWebhooksRegistered(tenantId: number) {
  return prisma.tenant.update({
    where: { id: tenantId },
    data: { webhooksRegistered: true },
  });
}
