/**
 * Quick seed script to create a tenant, store, and some customers/products/orders
 * Usage: npx ts-node prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { shopDomain: "dev-shop.myshopify.com" },
    update: {},
    create: {
      name: "Dev Shop",
      shopDomain: "dev-shop.myshopify.com"
    }
  });

  const store = await prisma.store.upsert({
    where: { id: 1 },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Dev Store",
      domain: "dev-shop.myshopify.com"
    }
  });

  // create user
  await prisma.user.upsert({
    where: { email: "admin@devshop.com" },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "admin@devshop.com",
      password: "$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" // replace with bcrypt-hashed password
    }
  });

  console.log("Seed done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
