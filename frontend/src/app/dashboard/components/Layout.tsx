"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <motion.header
        className="p-6 text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Xeno Dashboard
      </motion.header>
      <main className="flex-1 p-8">{children}</main>
      <footer className="p-6 text-sm text-gray-500 text-center">
        © 2025 Xeno FDE Assignment
      </footer>
    </div>
  );
}
