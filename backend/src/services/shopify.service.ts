import prisma from "../db/prismaClient";
import { logger } from "../utils/logger";
import { getTenantMockData } from "./shopify.mockStore";

// Random helpers
function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomPrice(min = 10, max = 200) { return Number((Math.random() * (max - min) + min).toFixed(2)); }
function randomDate() {
  const now = new Date();
  const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

export async function fetchStoreData(tenantId: number) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Tenant not found");

  logger.info("Fetching stateful mock Shopify data for tenant %d", tenantId);

  const mockData = getTenantMockData(tenantId);

  // 1️⃣ Customers
  const numCustomers = randomInt(2, 5);
  const customers: any[] = [];

  for (let i = 0; i < numCustomers; i++) {
    let cust = Object.values(mockData.customers)[i];
    if (!cust) {
      // Create new customer
      cust = {
        id: `cust_${tenantId}_${Date.now()}_${i}`,
        email: `user${i}@tenant${tenantId}.mock.com`,
        first_name: `User${i}`,
        last_name: `Tenant${tenantId}`,
        total_spent: 0
      };
      mockData.customers[cust.id] = cust;
    }
    customers.push(cust);
  }

  // 2️⃣ Products
  const numProducts = randomInt(2, 4);
  const products: any[] = [];
  for (let i = 0; i < numProducts; i++) {
    let prod = Object.values(mockData.products)[i];
    if (!prod) {
      prod = {
        id: `prod_${tenantId}_${Date.now()}_${i}`,
        title: `Product ${i} of Tenant ${tenantId}`,
        price: randomPrice(20, 150)
      };
      mockData.products[prod.id] = prod;
    }
    products.push(prod);
  }

  // 3️⃣ Orders
  const numOrders = randomInt(3, 7);
  const orders: any[] = [];

  for (let i = 0; i < numOrders; i++) {
    const customer = customers[randomInt(0, customers.length - 1)];
    const total_price = randomPrice(50, 500);

    // Update customer's totalSpent
    customer.total_spent += total_price;

    const order = {
      id: `ord_${tenantId}_${Date.now()}_${i}`,
      total_price,
      created_at: randomDate().toISOString(),
      customer: { id: customer.id }
    };
    mockData.orders[order.id] = order;
    orders.push(order);
  }

  return { customers, products, orders };
}

export async function registerWebhooks(tenantId: number, webhookCallbackBaseUrl: string) {
  logger.info("registerWebhooks stub: tenant=%d url=%s", tenantId, webhookCallbackBaseUrl);
  return true;
}
