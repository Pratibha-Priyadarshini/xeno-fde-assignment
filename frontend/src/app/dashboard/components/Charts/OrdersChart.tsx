"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

export default function OrdersChart({ data }: { data: any[] }) {
  return (
    <motion.div
      className="bg-gray-900 p-6 rounded-2xl shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-lg mb-4 text-gray-400">Orders Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#FFD700" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
