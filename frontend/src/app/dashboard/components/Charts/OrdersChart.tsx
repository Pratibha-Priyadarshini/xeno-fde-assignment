"use client";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

interface OrdersChartProps {
  data: any[];
  onFilter: (from?: string, to?: string) => Promise<void>;
}

export default function OrdersChart({ data, onFilter }: OrdersChartProps) {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  async function handleFilter(e: any) {
    e.preventDefault();
    await onFilter(from, to);
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Orders Over Time</h3>
          <div className="kv text-gray-400">Daily order count with revenue tooltip</div>
        </div>

        <form onSubmit={handleFilter} className="flex gap-2 items-center">
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="p-2 rounded bg-black/40 text-white"
          />
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="p-2 rounded bg-black/40 text-white"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition"
          >
            Apply
          </button>
        </form>
      </div>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            {/* SVG gradient for line fill */}
            <defs>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD700" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#FFD700" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#333" strokeDasharray="4 4" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{ backgroundColor: "#111", borderColor: "#444" }}
              labelStyle={{ color: "#fff" }}
              formatter={(value: any, name: string) => {
                if (name === "orders") return [`${value}`, "Orders"];
                if (name === "revenue") return [`$${value}`, "Revenue"];
                return [value, name];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#FFD700"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              fill="url(#ordersGradient)"
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
