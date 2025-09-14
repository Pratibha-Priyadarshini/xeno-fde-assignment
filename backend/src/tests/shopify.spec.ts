/**
 * Basic test to ensure ingestion mapping functions run without throwing.
 * Run: npm test
 */
import { upsertOrderFromWebhook, upsertCustomerFromWebhook, upsertProductFromWebhook } from "../services/ingestion.service";
import prisma from "../db/prismaClient";

describe("Ingestion service basic", () => {
  beforeAll(async () => {
    // create a tenant and store for testing
    await prisma.tenant.create({ data: { name: "testTenant", shopDomain: "t.myshop.com" } });
    const tenant = await prisma.tenant.findUnique({ where: { shopDomain: "t.myshop.com" } });
    await prisma.store.create({ data: { tenantId: tenant!.id, name: "s", domain: "t.myshop.com" } });
  });

  afterAll(async () => {
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.$disconnect();
  });

  it("upserts customer/order/product", async () => {
    const tenant = await prisma.tenant.findFirst();
    expect(tenant).toBeDefined();

    const custPayload = { id: 1001, email: "alice@example.com", first_name: "Alice", last_name: "A" };
    await expect(upsertCustomerFromWebhook(tenant!.id, custPayload)).resolves.toBeUndefined();

    const prodPayload = { id: 2001, title: "T-Shirt", variants: [{ price: "19.99" }] };
    await expect(upsertProductFromWebhook(tenant!.id, prodPayload)).resolves.toBeUndefined();

    const orderPayload = { id: 3001, total_price: "29.99", created_at: new Date().toISOString(), customer: { id: 1001, email: "alice@example.com" } };
    await expect(upsertOrderFromWebhook(tenant!.id, orderPayload)).resolves.toBeUndefined();

    // check DB
    const customers = await prisma.customer.findMany();
    const products = await prisma.product.findMany();
    const orders = await prisma.order.findMany();
    expect(customers.length).toBeGreaterThan(0);
    expect(products.length).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
  }, 20000);
});
