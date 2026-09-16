"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@wearify/shared/api";
import { useAuthToken, useAuthUser } from "@/lib/useAuth";
import { DashboardHeader } from "./_components/dashboard/DashboardHeader";
import { KpiRow } from "./_components/dashboard/KpiRow";
import { StoreHealth } from "./_components/dashboard/StoreHealth";
import { QuickActions } from "./_components/dashboard/QuickActions";
import { NeedsAttention } from "./_components/dashboard/NeedsAttention";
import { RecentSessions } from "./_components/dashboard/RecentSessions";
import { StoreLoading } from "./_components/StoreLoading";
import { DEFAULT_PERIOD, type Period } from "./_lib/dashboardFormat";
import "./dashboard.css";

export default function StoreHome() {
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);

  // Profile cached at login, read during render — no loading pass, and the
  // header updates immediately if the profile changes in another tab.
  const user = useAuthUser();
  const token = useAuthToken();
  const storeId = user?.storeId ?? null;
  const ownerName = user?.name?.split(" ")[0] ?? "";
  const storeName = user?.storeName ?? "";

  const store = useQuery(
    api.stores.getStoreDetail,
    storeId ? { storeId, token: token ?? undefined } : "skip",
  );
  const sessions = useQuery(
    api.sessionOps.listSessionsByStore,
    storeId ? { storeId, token: token ?? undefined } : "skip",
  );
  const sarees = useQuery(api.sarees.listByStore, storeId ? { storeId } : "skip");

  if (!storeId) return <StoreLoading label="Loading dashboard" />;

  const conversionRate = store?.conversionRate ?? 0;
  const catalogPct = store?.catalogUtilization ?? 0;
  const activeSessions = sessions?.filter((s) => s.status === "active").length ?? 0;

  return (
    <div className="hm">
      <DashboardHeader
        storeName={storeName}
        ownerName={ownerName}
        activeSessions={activeSessions}
        catalogPct={catalogPct}
        conversionRate={conversionRate}
        period={period}
        onPeriodChange={setPeriod}
        onReset={() => setPeriod(DEFAULT_PERIOD)}
      />

      <KpiRow
        todayRevenue={Math.round((store?.mrr ?? 0) / 30)}
        customerCount={(sessions ?? []).filter((s) => s.customerPhone).length}
        conversionRate={conversionRate}
        sessionCount={store?.sessions ?? 0}
        activeSessions={activeSessions}
      />

      <StoreHealth
        healthScore={store?.healthScore ?? 0}
        rows={[
          { label: "Catalogue", pct: catalogPct },
          { label: "Session", pct: store?.featureScore ?? 0 },
          { label: "CRM", pct: Math.min(100, Math.round((store?.sessions ?? 0) / 2)) },
        ]}
      />

      <div className="hm-split">
        <QuickActions />
        <NeedsAttention
          lowStockCount={sarees?.filter((s) => s.status === "low_stock").length ?? 0}
          agingCount={sarees?.filter((s) => (s.daysOld ?? 0) >= 60).length ?? 0}
          loaded={sarees !== undefined}
        />
      </div>

      <RecentSessions sessions={sessions} />
    </div>
  );
}
