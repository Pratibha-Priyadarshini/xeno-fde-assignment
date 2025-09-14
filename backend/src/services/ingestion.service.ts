/**
 * Responsible for mapping Shopify webhook payloads to DB models and upserting them.
 * This file intentionally keeps mappings simple so you can expand them easily.
 */

import prisma from "../db/prismaClient";
import { Prisma } from "@prisma/client";

/**
 * Upsert customer: expects Shopify-like payload or a minimal payload:
 * { id: 12345, email: "...", first_name: "...", last_name: "..." }
 */
export async function upsertCustomerFromWebhook(tenantId: number, payload: any) {
  // find store for tenant - naive: pick first store
  const store = await prisma.store.findFirst({ where: { tenantId } });
  if (!store) throw new Error("No store for tenant");

  const externalId = String(payload.id || payload.customer_id || payload.externalId);
  if (!externalId) throw new Error("Missing external id in customer payload");

  const data: Prisma.CustomerCreateInput = {
    storeId: store.id,
    externalId,
    email: payload.email || null,
    firstName: payload.first_name || payload.firstName || null,
    lastName: payload.last_name || payload.lastName || null,
    totalSpent: Number(payload.total_spent || 0) || 0
  };

  // upsert
  await prisma.customer.upsert({
    where: { externalId },
    update: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      totalSpent: data.totalSpent
    },
    create: data
  });
}

/**
 * Upsert product: payload { id, title, variants: [{ price }] }
 */
export async function upsertProductFromWebhook(tenantId: number, payload: any) {
  const store = await prisma.store.findFirst({ where: { tenantId } });
  if (!store) throw new Error("No store for tenant");

  const externalId = String(payload.id || payload.product_id || payload.externalId);
  if (!externalId) throw new Error("Missing external id in product payload");

  const price = Number(payload.price || (payload.variants && payload.variants[0]?.price) || 0);

  await prisma.product.upsert({
    where: { externalId },
    update: {
      title: payload.title || payload.name || "Untitled",
      price
    },
    create: {
      storeId: store.id,
      externalId,
      title: payload.title || payload.name || "Untitled",
      price
    }
  });
}

/**
 * Upsert order: payload { id, total_price, created_at, customer: { id }, line_items: [...] }
 */
export async function upsertOrderFromWebhook(tenantId: number, payload: any) {
  const store = await prisma.store.findFirst({ where: { tenantId } });
  if (!store) throw new Error("No store for tenant");

  const externalId = String(payload.id || payload.order_id || payload.externalId);
  if (!externalId) throw new Error("Missing external id in order payload");

  // Try to link customer
  let customerId: number | undefined;
  const custExternal = String(payload.customer?.id || payload.customer_id);
  if (custExternal) {
    const customer = await prisma.customer.findUnique({ where: { externalId: custExternal } });
    if (customer) customerId = customer.id;
    else {
      // create minimal customer record
      const newCust = await prisma.customer.create({
        data: {
          storeId: store.id,
          externalId: custExternal,
          email: payload.customer?.email || null,
          firstName: payload.customer?.first_name || payload.customer?.firstName || null,
          lastName: payload.customer?.last_name || payload.customer?.lastName || null,
          totalSpent: Number(payload.total_price || 0)
        }
      });
      customerId = newCust.id;
    }
  }

  const createdAt = payload.created_at ? new Date(payload.created_at) : new Date();

  // upsert order
  await prisma.order.upsert({
    where: { externalId },
    update: {
      totalPrice: Number(payload.total_price || payload.totalPrice || 0),
      createdAt,
      customerId: customerId || null
    },
    create: {
      storeId: store.id,
      externalId,
      customerId: customerId || null,
      totalPrice: Number(payload.total_price || payload.totalPrice || 0),
      createdAt
    }
  });

  // update customer's totalSpent if linked
  if (customerId) {
    const orders = await prisma.order.findMany({ where: { customerId } });
    const total = orders.reduce((s, o) => s + Number(o.totalPrice), 0);
    await prisma.customer.update({ where: { id: customerId }, data: { totalSpent: total } });
  }
}
