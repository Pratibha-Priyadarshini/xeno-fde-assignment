import { upsertOrderFromWebhook, upsertCustomerFromWebhook, upsertProductFromWebhook } from "../services/ingestion.service";
import prisma from "../db/prismaClient";

describe("Ingestion service basic", () => {
  let tenantId: number;

  beforeAll(async () => {
    // Clean previous data
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.tenant.deleteMany();

    // create a tenant and store for testing
    const tenant = await prisma.tenant.create({ data: { name: "testTenant", shopDomain: "t.myshop.com" } });
    tenantId = tenant.id;
    await prisma.store.create({ data: { tenantId, name: "s", domain: "t.myshop.com" } });
  });

  afterAll(async () => {
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.$disconnect();
  });

  it("upserts customer/order/product without errors", async () => {
    const custPayload = { id: "1001", email: "alice@example.com", first_name: "Alice", last_name: "A" };
    await expect(upsertCustomerFromWebhook(tenantId, custPayload)).resolves.toBeUndefined();

    const prodPayload = { id: "2001", title: "T-Shirt", variants: [{ price: "19.99" }] };
    await expect(upsertProductFromWebhook(tenantId, prodPayload)).resolves.toBeUndefined();

    const orderPayload = {
      id: "3001",
      total_price: "29.99",
      created_at: new Date().toISOString(),
      customer: { id: "1001", email: "alice@example.com" }
    };
    await expect(upsertOrderFromWebhook(tenantId, orderPayload)).resolves.toBeUndefined();

    // Check DB
    const customers = await prisma.customer.findMany({ where: { storeId: 1 } });
    const products = await prisma.product.findMany({ where: { storeId: 1 } });
    const orders = await prisma.order.findMany({ where: { storeId: 1 } });

    expect(customers.length).toBeGreaterThan(0);
    expect(products.length).toBeGreaterThan(0);
    expect(orders.length).toBeGreaterThan(0);
  }, 20000);
});
