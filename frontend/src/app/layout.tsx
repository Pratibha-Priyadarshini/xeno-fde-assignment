import "../styles/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Xeno FDE Dashboard",
  description: "Shopify ingestion & insights - Xeno FDE Assignment"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
