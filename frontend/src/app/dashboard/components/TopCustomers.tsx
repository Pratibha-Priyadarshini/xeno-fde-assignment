"use client";

export default function TopCustomers({ customers }: { customers: any[] }) {
  return (
    <div className="card p-6">
      <h3 className="text-lg mb-4 font-semibold">Top Customers</h3>
      <div className="space-y-3">
        {customers.length === 0 && (
          <div className="kv text-gray-400">No customers yet</div>
        )}

        {customers.map((c: any) => {
          const name = c.email ?? `${c.firstName ?? ""} ${c.lastName ?? ""}`;
          const initials = name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={c.id}
              className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-yellow-500 text-black font-bold rounded-full">
                  {initials}
                </div>
                <div>
                  <div className="font-semibold">{name}</div>
                  <div className="kv text-gray-400">ID: {c.externalId ?? c.id}</div>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-400 font-bold">
                ${(c.totalSpent ?? 0).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
