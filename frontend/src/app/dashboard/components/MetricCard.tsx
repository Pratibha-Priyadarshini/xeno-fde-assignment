"use client";
import { motion } from "framer-motion";

export default function MetricCard({ title, value }: { title: string; value: any }) {
  return (
    <motion.div
      className="p-6 bg-gray-900 rounded-2xl shadow-lg text-center"
      whileHover={{ scale: 1.05 }}
    >
      <h3 className="text-lg text-gray-400">{title}</h3>
      <p className="text-3xl font-bold text-yellow-400">{value}</p>
    </motion.div>
  );
}
