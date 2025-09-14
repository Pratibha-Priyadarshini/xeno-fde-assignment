import prisma from "../db/prismaClient";

export async function getTenantById(id: number) {
  return prisma.tenant.findUnique({ where: { id } });
}

export async function getDefaultStoreForTenant(id: number) {
  return prisma.store.findFirst({ where: { tenantId: id } });
}
