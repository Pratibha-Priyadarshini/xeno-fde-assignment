"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-extrabold gold-text"
        >
          Xeno FDE — Shopify Data Ingestion & Insights
        </motion.h1>

        <p className="mt-4 text-gray-300">
          Multi-tenant demo: ingest orders, customers and products from Shopify,
          store using PostgreSQL + Prisma and visualize metrics in a modern dashboard.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/auth" className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold shadow-lg">Login / Signup</Link>
          <Link href="/dashboard" className="px-6 py-3 rounded-xl border border-yellow-500 text-yellow-300">Open Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
