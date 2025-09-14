"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import api from "../../../lib/api";

export default function AuthForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [shopDomain, setShopDomain] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      let res;
      if (isSignup) {
        res = await api.post("/auth/signup", {
          email,
          password,
          tenantName,
          shopDomain,
        });
      } else {
        res = await api.post("/auth/signin", { email, password });
      }
      localStorage.setItem("token", res.token);
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Authentication failed!");
    }
  }

  return (
    <motion.form
      className="bg-gray-900 p-8 rounded-2xl shadow-xl w-96"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold mb-4 text-yellow-400">
        {isSignup ? "Sign Up" : "Sign In"}
      </h2>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {isSignup && (
        <>
          <input
            type="text"
            placeholder="Tenant Name"
            className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Shop Domain"
            className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
          />
        </>
      )}

      <button
        type="submit"
        className="w-full p-2 mb-4 rounded bg-gradient-to-r from-yellow-400 to-yellow-600 font-bold text-black hover:scale-105 transition"
      >
        {isSignup ? "Create Account" : "Login"}
      </button>

      <p
        className="text-yellow-300 text-sm cursor-pointer hover:underline"
        onClick={() => setIsSignup(!isSignup)}
      >
        {isSignup
          ? "Already have an account? Sign in"
          : "New user? Create an account"}
      </p>
    </motion.form>
  );
}
