"use client";
import { useState } from "react";
import { motion } from "framer-motion";
// Update the import path below if your api file is at 'src/lib/api.ts'
import api from "../../../lib/api";

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [shopDomain, setShopDomain] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      if (mode === "login") {
        const res = await api.post("/auth/signin", { email, password });
        localStorage.setItem("token", res.token);
        window.location.href = "/dashboard";
      } else {
        // pass tenantName & shopDomain (backend will auto-generate if omitted)
        const res = await api.post("/auth/signup", { email, password, tenantName, shopDomain });
        localStorage.setItem("token", res.token);
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      alert(err?.message || "Auth error");
    }
  }

  return (
    <motion.div className="card p-8 w-full max-w-md mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex gap-2 mb-6">
        <button className={`flex-1 py-2 rounded ${mode === "login" ? "bg-yellow-500 text-black" : "text-yellow-300"}`} onClick={() => setMode("login")}>Login</button>
        <button className={`flex-1 py-2 rounded ${mode === "signup" ? "bg-yellow-500 text-black" : "text-yellow-300"}`} onClick={() => setMode("signup")}>Sign up</button>
      </div>

      <form onSubmit={handleSubmit}>
        <input required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 rounded mb-3 bg-black/40" />
        <input required value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 rounded mb-3 bg-black/40" />
        {mode === "signup" && (
          <>
            <input value={tenantName} onChange={e => setTenantName(e.target.value)} placeholder="Tenant name (optional)" className="w-full p-3 rounded mb-3 bg-black/40" />
            <input value={shopDomain} onChange={e => setShopDomain(e.target.value)} placeholder="Shop domain (optional)" className="w-full p-3 rounded mb-3 bg-black/40" />
          </>
        )}
        <button type="submit" className="w-full py-3 rounded bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold">{mode === "login" ? "Login" : "Create account"}</button>
      </form>
    </motion.div>
  );
}
