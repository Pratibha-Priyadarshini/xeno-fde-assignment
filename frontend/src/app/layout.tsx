// frontend/src/app/layout.tsx
import "../styles/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Xeno FDE Dashboard",
  description: "Multi-tenant Shopify Data Insights",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-black via-gray-900 to-yellow-900 text-yellow-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
