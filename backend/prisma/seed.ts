/**
 * Idempotent seed script to create a tenant, store, admin user,
 * and sample customers, products, and orders.
 *
 * Run: npx ts-node prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Hash admin password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // --- 1️⃣ Tenant ---
  const tenant = await prisma.tenant.upsert({
    where: { shopDomain: "dev-shop.myshopify.com" },
    update: {},
    create: {
      name: "Dev Shop",
      shopDomain: "dev-shop.myshopify.com",
    },
  });

  // --- 2️⃣ Store ---
  const store = await prisma.store.upsert({
    where: { id: 1 }, // naive for dev; in prod search by domain
    update: {
      tenantId: tenant.id,
      name: "Dev Store",
      domain: "dev-shop.myshopify.com",
    },
    create: {
      tenantId: tenant.id,
      name: "Dev Store",
      domain: "dev-shop.myshopify.com",
    },
  });

  // --- 3️⃣ Admin user ---
  await prisma.user.upsert({
    where: { email: "admin@devshop.com" },
    update: {
      password: hashedPassword,
      tenantId: tenant.id,
      role: "admin",
    },
    create: {
      email: "admin@devshop.com",
      password: hashedPassword,
      tenantId: tenant.id,
      role: "admin",
    },
  });

  // --- 4️⃣ Customers ---
  const customersData = [
    { externalId: "cust_001", email: "alice@example.com", firstName: "Alice", lastName: "Wonderland", totalSpent: 250 },
    { externalId: "cust_002", email: "bob@example.com", firstName: "Bob", lastName: "Builder", totalSpent: 150 },
  ];

  const customers = [];
  for (const cust of customersData) {
    const c = await prisma.customer.upsert({
      where: { externalId: cust.externalId },
      update: { ...cust, storeId: store.id },
      create: { ...cust, storeId: store.id },
    });
    customers.push(c);
  }

  // --- 5️⃣ Products ---
  const productsData = [
    { externalId: "prod_001", title: "Golden Widget", price: 49.99 },
    { externalId: "prod_002", title: "Shiny Gadget", price: 79.99 },
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { externalId: prod.externalId },
      update: { ...prod, storeId: store.id },
      create: { ...prod, storeId: store.id },
    });
  }

  // --- 6️⃣ Orders ---
  const ordersData = [
    { externalId: "ord_001", customer: customers[0], totalPrice: 100 },
    { externalId: "ord_002", customer: customers[1], totalPrice: 150 },
  ];

  for (const ord of ordersData) {
    const order = await prisma.order.upsert({
      where: { externalId: ord.externalId },
      update: {
        storeId: store.id,
        customerId: ord.customer.id,
        totalPrice: ord.totalPrice,
        createdAt: new Date(),
      },
      create: {
        storeId: store.id,
        customerId: ord.customer.id,
        externalId: ord.externalId,
        totalPrice: ord.totalPrice,
        createdAt: new Date(),
      },
    });

    // Update customer's totalSpent
    await prisma.customer.update({
      where: { id: ord.customer.id },
      data: { totalSpent: ord.customer.totalSpent },
    });
  }

  console.log("✅ Seed completed. Admin user: admin@devshop.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
