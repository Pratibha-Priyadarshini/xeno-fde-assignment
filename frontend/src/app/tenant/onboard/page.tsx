"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

export default function TenantOnboard() {
  const [shopDomain, setShopDomain] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [onboardedShop, setOnboardedShop] = useState<string | null>(null);

  const router = useRouter();

  async function handleOnboard(e: any) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Onboard tenant
      const res = await api.post("/shopify/onboard", { shopDomain, storeName });

      setMessage("✅ Onboarded successfully! You can now connect your Shopify store.");
      setOnboardedShop(shopDomain); // save shop domain for OAuth button
      setShopDomain("");
      setStoreName("");

    } catch (err: any) {
      setMessage("❌ Onboard failed: " + (err.message || err));
      setOnboardedShop(null);
    } finally {
      setLoading(false);
    }
  }

  function handleConnectShopify() {
    if (!onboardedShop) return;
    // Redirect to backend Shopify OAuth route
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/shopify/auth?shop=${onboardedShop}`;
  }

  return (
    <div className="max-w-2xl mx-auto card p-6">
      <h2 className="text-xl mb-2">Tenant Onboarding / Connect Shopify Store</h2>
      <p className="kv mb-4">
        This demo performs a simple tenant registration. Use Shopify dev store credentials for real integration.
      </p>

      {message && (
        <div className={`mb-3 p-2 rounded ${message.startsWith("✅") ? "bg-green-800" : "bg-red-800"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleOnboard} className="space-y-3">
        <input
          placeholder="Shop domain (e.g. dev-shop.myshopify.com)"
          value={shopDomain}
          onChange={e => setShopDomain(e.target.value)}
          className="w-full p-3 rounded bg-black/40"
          disabled={loading}
          required
        />
        <input
          placeholder="Store name (display)"
          value={storeName}
          onChange={e => setStoreName(e.target.value)}
          className="w-full p-3 rounded bg-black/40"
          disabled={loading}
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-yellow-500 text-black"
            disabled={loading}
          >
            {loading ? "Working..." : "Onboard store"}
          </button>

          {onboardedShop && (
            <button
              type="button"
              className="px-4 py-2 rounded bg-green-500 text-black"
              onClick={handleConnectShopify}
            >
              Connect Shopify Store
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
