"use client";
import { motion } from "framer-motion";

export default function MetricCard({ title, value }: { title: string; value: any }) {
  return (
    <motion.div className="card p-6" whileHover={{ y: -4 }}>
      <div className="text-sm kv">{title}</div>
      <div className="text-3xl font-bold text-yellow-400 mt-2">{value}</div>
    </motion.div>
  );
}
