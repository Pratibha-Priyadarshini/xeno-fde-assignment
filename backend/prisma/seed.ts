/**
 * Seed script to create a tenant, store, user, and sample data.
 * Run with: npx ts-node prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create or update tenant
  const tenant = await prisma.tenant.upsert({
    where: { shopDomain: "dev-shop.myshopify.com" },
    update: {},
    create: {
      name: "Dev Shop",
      shopDomain: "dev-shop.myshopify.com",
    },
  });

  // Create or update store
  const store = await prisma.store.upsert({
    where: { id: 1 },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Dev Store",
      domain: "dev-shop.myshopify.com",
    },
  });

  // Create or update user
  await prisma.user.upsert({
    where: { email: "admin@devshop.com" },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "admin@devshop.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  // Seed some customers
  const customer1 = await prisma.customer.create({
    data: {
      storeId: store.id,
      externalId: "cust_001",
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Wonderland",
      totalSpent: 250,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      storeId: store.id,
      externalId: "cust_002",
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Builder",
      totalSpent: 150,
    },
  });

  // Seed some products
  const product1 = await prisma.product.create({
    data: {
      storeId: store.id,
      externalId: "prod_001",
      title: "Golden Widget",
      price: 49.99,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      storeId: store.id,
      externalId: "prod_002",
      title: "Shiny Gadget",
      price: 79.99,
    },
  });

  // Seed some orders
  await prisma.order.create({
    data: {
      storeId: store.id,
      externalId: "ord_001",
      customerId: customer1.id,
      totalPrice: 100,
      createdAt: new Date(),
    },
  });

  await prisma.order.create({
    data: {
      storeId: store.id,
      externalId: "ord_002",
      customerId: customer2.id,
      totalPrice: 150,
      createdAt: new Date(),
    },
  });

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
