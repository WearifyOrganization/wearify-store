"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Montserrat, Poppins, Space_Grotesk } from "next/font/google";
import { useQuery } from "convex/react";
import { api } from "@wearify/shared/api";
import { ToastProvider } from "@/components/ui/toast";
import { useLogout, useRequireRole } from "@/lib/useAuth";
import {
  IconHome, IconCatalogue, IconOrder, IconCustomers,
  IconAnalytics, IconSettings, IconSignOut,
} from "./_components/NavIcons";
import { IconPlus, IconBell, IconChipChevron } from "./_components/StoreIcons";
import { StoreLoading } from "./_components/StoreLoading";
import "./store-theme.css";

/* Same three faces the tablet runs on: Montserrat for everything, Poppins for
   the one big greeting, Space Grotesk for numerals. */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--w-font",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--w-font-display",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--w-font-num",
  display: "swap",
});

const SHELL_CLASS = `store-shell ${montserrat.variable} ${poppins.variable} ${spaceGrotesk.variable}`;

/* Icons are real inline SVGs (see _components/NavIcons) coloured via
   currentColor, so one component serves the white (idle) and maroon (active)
   state. Labels/routes follow the navbar handoff — note it says "Order", not
   "Orders". */
const NAV_ITEMS = [
  { key: "home", label: "Home", href: "/store", Icon: IconHome },
  { key: "catalogue", label: "Catalogue", href: "/store/inventory", Icon: IconCatalogue },
  { key: "orders", label: "Order", href: "/store/orders", Icon: IconOrder },
  { key: "customers", label: "Customers", href: "/store/customers", Icon: IconCustomers },
  { key: "analytics", label: "Analytics", href: "/store/analytics", Icon: IconAnalytics },
  { key: "settings", label: "Settings", href: "/store/settings", Icon: IconSettings },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/store" ? pathname === "/store" : pathname.startsWith(href));
}

/* Brand mark — the rail's 27x25 cream tile, showing the store's own logo when
   one is uploaded and its initial otherwise. */
function StoreMark({ storeName, logoUrl }: { storeName: string; logoUrl: string | null }) {
  const initial = storeName ? storeName.charAt(0).toUpperCase() : "S";
  return (
    <span className="w-logomark">
      {logoUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={logoUrl} alt="" className="w-logomark-img" />
        : <span className="w-logomark-letter">{initial}</span>}
    </span>
  );
}

/* ── TopBar ─────────────────────────────────────────────────────────── */
/* 80px white band starting at the rail seam. Left: the WEARIFY wordmark, whose
   "I" is a maroon stem under a blush dot (the handoff draws it as two shapes,
   not a glyph). Right: Add Items, the notification disc, a hairline, and the
   store chip. */
function TopBar({ storeName, storeCode }: { storeName: string; storeCode: string }) {
  return (
    <header className="w-topbar">
      <span className="w-wordmark" aria-label="Wearify">
        WEAR
        <span className="w-wordmark-i" aria-hidden>
          <span className="w-wordmark-dot" />
          <span className="w-wordmark-stem" />
        </span>
        FY
      </span>

      <div className="w-topbar-actions">
        <Link href="/store/inventory/add" className="w-topbar-cta">
          <IconPlus size={16} />
          Add Items
        </Link>

        <button className="w-notif-btn" aria-label="Notifications">
          <IconBell size={20} />
        </button>

        <span className="w-topbar-divider" aria-hidden />

        <Link href="/store/settings" className="w-storechip">
          <span className="w-storechip-avatar" aria-hidden>W</span>
          <span className="w-storechip-text">
            <span className="w-storechip-name">{storeName || "My Store"}</span>
            <span className="w-storechip-id">Store ID: {storeCode || "—"}</span>
          </span>
          <IconChipChevron size={9} />
        </Link>
      </div>
    </header>
  );
}

/* ── Bottom Nav (mobile) ────────────────────────────────────────────── */
/* Not in the handoff (which only draws the desktop rail) — it wears the same
   maroon/cream language so the two read as one system. */
function BottomNav() {
  const isActive = useIsActive();
  return (
    <nav className="w-bottomnav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ key, label, href, Icon }) => (
        <Link key={key} href={href} className={`w-navitem${isActive(href) ? " active" : ""}`}>
          <span className="w-navicon-wrap"><Icon /></span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

/* ── Side Rail (tablet+) ────────────────────────────────────────────── */
function SideRail({ storeName, logoUrl }: { storeName: string; logoUrl: string | null }) {
  const isActive = useIsActive();
  /* Sign-out revokes the session server-side BEFORE dropping the local token —
     clearing localStorage alone leaves the token valid for anyone holding a copy.
     The shared hook in lib/useAuth does the revoke + clear for every module. */
  const logout = useLogout("/store/login");
  return (
    <nav className="w-siderail" aria-label="Main navigation">
      {/* Header — 80px band, hairline underneath, store logo tile + name */}
      <Link href="/store/settings/profile" className="w-rail-head" title="Store profile">
        <StoreMark storeName={storeName} logoUrl={logoUrl} />
        <span className="w-rail-head-name">{storeName || "My Store"}</span>
      </Link>

      <div className="w-rail-nav">
        {NAV_ITEMS.map(({ key, label, href, Icon }) => (
          <Link
            key={key}
            href={href}
            className={`w-rail-item${isActive(href) ? " active" : ""}`}
          >
            <span className="w-rail-icon"><Icon /></span>
            <span className="w-rail-label">{label}</span>
          </Link>
        ))}
      </div>

      {/* Sign out — pinned 30px off the bottom */}
      <button onClick={() => void logout()} className="w-rail-logout">
        <IconSignOut />
        <span>Sign out</span>
      </button>
    </nav>
  );
}

/* ── Layout ─────────────────────────────────────────────────────────── */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/store/login";

  // Guard the whole /store subtree to a store_owner session. The hook owns
  // the token read, the server validation, and the redirect-on-reject; the
  // login page opts out via `enabled` so it can render for signed-out users.
  const { user, isPending } = useRequireRole("store_owner", "/store/login", {
    enabled: !isLoginPage,
  });

  // Cached client-side profile — instant first paint for the brand mark.
  // Authoritative values still come from the server queries below.
  const storeName = user?.storeName ?? "My Store";
  const storeId = user?.storeId ?? null;

  // Store logo for the brand mark (falls back to the store initial).
  const store = useQuery(
    api.stores.getByStoreId,
    storeId ? { storeId } : "skip",
  );
  const logoUrl = useQuery(
    api.files.getUrl,
    store?.logoFileId ? { fileId: store.logoFileId } : "skip",
  ) ?? null;

  if (isLoginPage) return <div className={SHELL_CLASS}>{children}</div>;
  if (isPending) {
    return (
      <StoreLoading
        label="Loading store"
        className={`${SHELL_CLASS} w-loadscreen`}
        markSize={20}
      />
    );
  }

  return (
    <ToastProvider>
      <div className={SHELL_CLASS}>
        <TopBar storeName={storeName} storeCode={storeId ?? ""} />
        <SideRail storeName={storeName} logoUrl={logoUrl} />
        <main className="w-main">
          <div className="w-main-inner">
            {children}
          </div>
          {/* Same copyright band every other module ends on */}
          <footer className="w-foot">
            © Copyright {new Date().getFullYear()} Phygify Technoservices Pvt. Ltd.
          </footer>
        </main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
