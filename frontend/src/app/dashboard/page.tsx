"use client";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import MetricCard from "./components/MetricCard";
import OrdersChart from "./components/Charts/OrdersChart";
import TopCustomers from "./components/TopCustomers";
import api from "../../lib/api";

export default function DashboardPage() {
  const [tenantId] = useState<number>(1); // demo tenant
  const [summary, setSummary] = useState<any>({
    totalCustomers: 12,
    totalOrders: 34,
    totalRevenue: 1234.56,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Mock data ---
  const mockSummary = { totalCustomers: 12, totalOrders: 34, totalRevenue: 1234.56 };

  const mockOrders = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (9 - i));
    return {
      date: d.toISOString().split("T")[0],
      orders: Math.floor(Math.random() * 10) + 1,
      revenue: Math.floor(Math.random() * 500) + 50,
    };
  });

  const mockCustomers = [
    { id: 1, firstName: "Alice", lastName: "Smith", totalSpent: 345.5 },
    { id: 2, firstName: "Bob", lastName: "Johnson", totalSpent: 290.0 },
    { id: 3, email: "charlie@example.com", totalSpent: 230.2 },
    { id: 4, firstName: "Diana", lastName: "Lee", totalSpent: 180.8 },
    { id: 5, firstName: "Ethan", lastName: "Brown", totalSpent: 150.0 },
  ];

  async function loadDashboard(from?: string, to?: string) {
    setLoading(true);
    try {
      if (!tenantId) return;

      // Fetch data from backend
      const [sRes, oRes, tRes] = await Promise.all([
        api.get(`/insights/summary?tenantId=${tenantId}`),
        api.get(`/insights/orders?tenantId=${tenantId}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`),
        api.get(`/insights/top-customers?tenantId=${tenantId}&limit=5`),
      ]);

      // Unwrap Axios-style responses
      const s = sRes?.data ?? mockSummary;
      const o = oRes?.data ?? mockOrders;
      const t = tRes?.data ?? mockCustomers;

      setSummary(s);
      setOrders(o.map((r: any) => ({
        date: r.date,
        orders: r.orders ?? r.count ?? 0,
        revenue: r.revenue ?? 0,
      })));
      setTopCustomers(t);

    } catch (err) {
      console.error("Dashboard load error:", err);
      // Fallback to mock data
      setSummary(mockSummary);
      setOrders(mockOrders);
      setTopCustomers(mockCustomers);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20 text-gray-400">Loading dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <MetricCard title="Customers" value={summary.totalCustomers} />
          <MetricCard title="Orders" value={summary.totalOrders} />
          <MetricCard title="Revenue" value={`$${summary.totalRevenue.toFixed(2)}`} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrdersChart
            data={orders}
            onFilter={async (from?: string, to?: string) => loadDashboard(from, to)}
          />
          <TopCustomers customers={topCustomers} />
        </div>
      </div>
    </Layout>
  );
}
