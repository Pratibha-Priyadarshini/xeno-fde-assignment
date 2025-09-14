import { Request, Response } from "express";
import prisma from "../db/prismaClient";

/**
 * GET /insights/summary?tenantId=...
 */
export async function summary(req: Request, res: Response) {
  const tenantId = Number(req.query.tenantId);
  if (!tenantId) return res.status(400).json({ message: "tenantId required" });

  // pick first store for tenant
  const store = await prisma.store.findFirst({ where: { tenantId } });
  if (!store) return res.json({ totalCustomers: 0, totalOrders: 0, totalRevenue: 0 });

  const [customersCount, ordersCount, revenueAgg] = await Promise.all([
    prisma.customer.count({ where: { storeId: store.id } }),
    prisma.order.count({ where: { storeId: store.id } }),
    prisma.order.aggregate({
      where: { storeId: store.id },
      _sum: { totalPrice: true }
    })
  ]);

  const totalRevenue = revenueAgg._sum.totalPrice ?? 0;

  res.json({ totalCustomers: customersCount, totalOrders: ordersCount, totalRevenue });
}

/**
 * GET /insights/orders?tenantId=...&from=YYYY-MM-DD&to=YYYY-MM-DD
 * returns timeseries array: [{ date: '2025-09-01', orders: 3, revenue: 120.50 }]
 */
export async function ordersTimeseries(req: Request, res: Response) {
  const tenantId = Number(req.query.tenantId);
  const from = req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();

  if (!tenantId) return res.status(400).json({ message: "tenantId required" });

  const store = await prisma.store.findFirst({ where: { tenantId } });
  if (!store) return res.json([]);

  const orders = await prisma.order.findMany({
    where: {
      storeId: store.id,
      createdAt: {
        gte: from,
        lte: to
      }
    },
    orderBy: { createdAt: "asc" }
  });

  // Group by date
  const map = new Map<string, { orders: number; revenue: number }>();
  orders.forEach((o) => {
    const d = o.createdAt.toISOString().slice(0, 10);
    const cur = map.get(d) ?? { orders: 0, revenue: 0 };
    cur.orders += 1;
    cur.revenue += Number(o.totalPrice);
    map.set(d, cur);
  });

  const timeseries = Array.from(map.entries()).map(([date, val]) => ({ date, ...val }));
  res.json(timeseries);
}

/**
 * GET /insights/top-customers?tenantId=...&limit=5
 */
export async function topCustomers(req: Request, res: Response) {
  const tenantId = Number(req.query.tenantId);
  const limit = Number(req.query.limit) || 5;
  if (!tenantId) return res.status(400).json({ message: "tenantId required" });

  const store = await prisma.store.findFirst({ where: { tenantId } });
  if (!store) return res.json([]);

  const customers = await prisma.customer.findMany({
    where: { storeId: store.id },
    orderBy: { totalSpent: "desc" },
    take: limit
  });

  res.json(customers);
}
