import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-yellow-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 shadow-lg flex items-center justify-center text-black font-bold">X</div>
          <div>
            <div className="text-lg font-semibold">Xeno Insights</div>
            <div className="text-xs kv">Multi-tenant demo</div>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <a href="/dashboard" className={`px-3 py-1 rounded ${path === "/dashboard" ? "bg-yellow-500 text-black" : "text-yellow-200"}`}>Dashboard</a>
          <a href="/tenant/onboard" className={`px-3 py-1 rounded ${path.startsWith("/tenant") ? "bg-yellow-500 text-black" : "text-yellow-200"}`}>Tenant Onboard</a>
          <button
            onClick={() => { localStorage.removeItem("token"); window.location.href = "/auth"; }}
            className="px-3 py-1 rounded text-sm border border-yellow-700"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
