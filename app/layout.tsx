import type { Metadata, Viewport } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Wearify — Retailer",
  description: "Wearify retailer dashboard: inventory and saree cards, customers, sessions, orders, staff, campaigns and store settings.",
  applicationName: "Wearify Retailer",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// The retailer dashboard authenticates with a bearer token held in
// localStorage (lib/useAuth, lib/phoneAuth); nothing resolves on the server,
// so the root layout only mounts the Convex client. Module fonts are loaded
// by app/store/layout.tsx via next/font.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
