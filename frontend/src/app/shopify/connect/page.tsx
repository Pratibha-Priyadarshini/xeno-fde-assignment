"use client";
import { useState } from "react";

export default function ShopifyConnectPage() {
  const [shop, setShop] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    if (!shop) return alert("Please enter a Shopify shop domain");

    setLoading(true);
    // Redirect user to backend Shopify OAuth start endpoint
    window.location.href = `/api/shopify/auth?shop=${shop}`;
  };

  return (
    <div className="max-w-md mx-auto mt-20 card p-6">
      <h2 className="text-xl mb-4">Connect Shopify Store</h2>
      <p className="kv mb-4">
        Enter your Shopify dev store domain to connect your store to this app.
      </p>

      <input
        placeholder="Shop domain (e.g., dev-store.myshopify.com)"
        value={shop}
        onChange={(e) => setShop(e.target.value)}
        className="w-full p-3 rounded bg-black/40 mb-4"
        disabled={loading}
      />

      <button
        onClick={handleConnect}
        className="w-full px-4 py-2 rounded bg-yellow-500 text-black"
        disabled={loading}
      >
        {loading ? "Redirecting..." : "Connect Store"}
      </button>
    </div>
  );
}
