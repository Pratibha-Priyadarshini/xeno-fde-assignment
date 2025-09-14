"use client";
import Layout from "./components/Layout";
import MetricCard from "./components/MetricCard";
import OrdersChart from "./components/Charts/OrdersChart";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const resSummary = await api.get("/insights/summary?tenantId=1");
      const resOrders = await api.get("/insights/orders?tenantId=1");
      setSummary(resSummary);
      setOrders(resOrders);
    }
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Customers" value={summary?.totalCustomers || 0} />
        <MetricCard title="Orders" value={summary?.totalOrders || 0} />
        <MetricCard
          title="Revenue"
          value={`$${summary?.totalRevenue?.toFixed(2) || "0.00"}`}
        />
      </div>
      <div className="mt-10">
        <OrdersChart data={orders || []} />
      </div>
    </Layout>
  );
}
