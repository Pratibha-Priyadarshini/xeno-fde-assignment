/**
 * Keeps track of mock customers/products/orders per tenant for stateful simulation.
 */
interface TenantMockData {
  customers: Record<string, any>;
  products: Record<string, any>;
  orders: Record<string, any>;
}

const tenantStore: Record<number, TenantMockData> = {};

export function getTenantMockData(tenantId: number): TenantMockData {
  if (!tenantStore[tenantId]) {
	tenantStore[tenantId] = {
	  customers: {},
	  products: {},
	  orders: {},
	};
  }
  return tenantStore[tenantId];
}

/**
 * Mock Shopify API data for development/testing.
 * Returns sample customers, products, and orders.
 */
export async function fetchMockStoreData(tenantId: number) {
  // Example mock customers
  const customers = [
	{
	  id: "cust_001",
	  email: "alice@example.com",
	  first_name: "Alice",
	  last_name: "Wonderland",
	  total_spent: 250,
	},
	{
	  id: "cust_002",
	  email: "bob@example.com",
	  first_name: "Bob",
	  last_name: "Builder",
	  total_spent: 150,
	},
  ];

  // Example mock products
  const products = [
	{
	  id: "prod_001",
	  title: "Golden Widget",
	  variants: [{ price: 49.99 }],
	},
	{
	  id: "prod_002",
	  title: "Shiny Gadget",
	  variants: [{ price: 79.99 }],
	},
  ];

  // Example mock orders
  const orders = [
	{
	  id: "ord_001",
	  total_price: 100,
	  created_at: new Date(),
	  customer: { id: "cust_001" },
	},
	{
	  id: "ord_002",
	  total_price: 150,
	  created_at: new Date(),
	  customer: { id: "cust_002" },
	},
  ];

  return { customers, products, orders };
}