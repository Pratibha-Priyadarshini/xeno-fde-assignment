// frontend/src/app/page.tsx
"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent animate-pulse">
        Welcome to Xeno FDE Assignment
      </h1>
      <p className="mt-6 text-lg max-w-2xl text-yellow-200">
        Multi-tenant Shopify Data Ingestion & Insights Service.  
        Secure, Scalable, and Insightful.
      </p>
      <div className="mt-10 space-x-6">
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl bg-yellow-500 text-black font-semibold shadow-lg hover:scale-105 transform transition duration-300"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/auth"
          className="px-6 py-3 rounded-xl border border-yellow-400 text-yellow-300 font-semibold shadow-lg hover:bg-yellow-600 hover:text-black transition duration-300"
        >
          Login / Signup
        </Link>
      </div>
    </main>
  );
}
