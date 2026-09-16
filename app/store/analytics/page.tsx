"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@wearify/shared/api";
import { getToken } from "@/lib/phoneAuth";
import {
  IconMoney, IconUserGroup, IconChartUp, IconTv,
  IconStaffQa, IconAnalyticsQa, IconCampaignsQa,
} from "../_components/StoreIcons";
import { IconCatalogue } from "../_components/NavIcons";
import { useAuthUser } from "@/lib/useAuth";

/* Analytics — built to the Surface Pro 8 handoff. Panel 995x1171: title rule at
   71, the four 225x124.85 WidgetSummary cards at 92, the 463-wide chart pair at
   238, Inventory Health (944x175) at 598 and the report grid (944x352) at 794.

   The four KPI icons are the handoff's own names — money-security,
   user-group-03, computer-chart-up, modern-tv — which are exactly the four
   glyphs the home dashboard already uses, so they come from StoreIcons
   unchanged. The report tiles reuse the home quick-action set. */

/* Funnel + category rows are plain data. They are rendered inline at both call
   sites rather than through a <BarRow> component on purpose: styled-jsx only
   scopes JSX that appears inside the returned tree, so a component defined out
   here would render completely unstyled. */
type Bar = { key: string; label: string; pct: number; caption: string };

export default function AnalyticsPage() {
  // Cached at login; re-read during render so there is no loading pass.
  const storeId = useAuthUser()?.storeId ?? null;

  const sarees = useQuery(api.sarees.listByStore, storeId ? { storeId } : "skip");
  const store  = useQuery(api.stores.getStoreDetail, storeId ? { storeId, token: getToken() ?? undefined } : "skip");

  const loading = sarees === undefined || store === undefined;

  /* ── Derived metrics (unchanged) ── */
  const totalRevenue     = (sarees ?? []).reduce((a, s) => a + s.price * (s.conversions ?? 0), 0);
  const totalConversions = (sarees ?? []).reduce((a, s) => a + (s.conversions ?? 0), 0);
  const totalTryOns      = (sarees ?? []).reduce((a, s) => a + (s.tryOns ?? 0), 0);
  const totalViews       = (sarees ?? []).reduce((a, s) => a + (s.views ?? 0), 0);
  const avgBasket        = totalConversions > 0 ? Math.round(totalRevenue / totalConversions) : 0;
  const convRate         = totalTryOns > 0 ? Math.round((totalConversions / totalTryOns) * 100) : (store?.conversionRate ?? 0);
  const footfall         = store?.sessions ?? 0;
  const todayRevenue     = Math.round((store?.mrr ?? 0) / 30);

  const totalItems  = (sarees ?? []).length;
  const activeItems = (sarees ?? []).filter((s) => s.approvalStatus === "approved").length;
  const pendingItems = (sarees ?? []).filter((s) => s.approvalStatus === "pending").length;
  const lowStock    = (sarees ?? []).filter((s) => s.stock > 0 && s.stock <= 5).length;
  const outOfStock  = (sarees ?? []).filter((s) => s.stock <= 0).length;
  const agingItems  = (sarees ?? []).filter((s) => (s.daysOld ?? 0) >= 60 && (s.conversions ?? 0) === 0).length;

  const catMap: Record<string, number> = {};
  (sarees ?? []).forEach((s) => {
    catMap[s.type] = (catMap[s.type] || 0) + s.price * (s.conversions ?? 0);
  });
  const catData = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCatRev = catData[0]?.[1] || 1;

  const maxFunnel = Math.max(totalViews, totalTryOns, totalConversions, 1);
  const viewsPct  = Math.round((totalViews / maxFunnel) * 100);
  const tryOnsPct = Math.round((totalTryOns / maxFunnel) * 100);
  const convPct   = Math.round((totalConversions / maxFunnel) * 100);

  const topType = catData[0]?.[0] ?? "Banarasi";
  const topPct  = catData[0] ? Math.round((catData[0][1] / (totalRevenue || 1)) * 100) : 0;
  const aiInsight = totalRevenue > 0
    ? `${topType} sarees are driving ${topPct}% of your revenue this period.${lowStock > 0 ? ` ${lowStock} item${lowStock > 1 ? "s" : ""} are running low on stock — consider reordering.` : " Inventory levels look healthy."}`
    : `Add sarees to your catalogue and track sessions to unlock revenue insights and AI-powered demand forecasts.`;

  /* Cards 1 and 2 carry a two-line label and no pill; 3 and 4 a one-line label
     and a green pill — exactly as the handoff draws them. */
  const KPIS = [
    { value: `₹${totalRevenue.toLocaleString("en-IN")}`, label: "Est. revenue\nAll time", pill: null, Icon: IconMoney },
    { value: String(avgBasket), label: "Avg basket\nPer sale", pill: null, Icon: IconUserGroup },
    { value: `${convRate}%`, label: "Conversion", pill: "Try-on buy", Icon: IconChartUp },
    { value: String(footfall), label: "Session", pill: `₹${todayRevenue.toLocaleString("en-IN")} today`, Icon: IconTv },
  ];

  const HEALTH = [
    { value: totalItems, label: "Total items" },
    { value: activeItems, label: "Live" },
    { value: lowStock, label: "Low stock" },
    { value: outOfStock, label: "Out of stock" },
  ];

  const funnelBars: Bar[] = [
    { key: "views", label: "Views", pct: viewsPct, caption: `${viewsPct}%` },
    { key: "tryon", label: "Try-on", pct: tryOnsPct, caption: `${tryOnsPct}%` },
    { key: "conv", label: "Conversion", pct: convPct, caption: `${convPct}%` },
  ];

  const catBars: Bar[] = catData.map(([type, rev]) => ({
    key: type,
    label: type,
    pct: Math.round((rev / maxCatRev) * 100),
    caption: `${Math.round((rev / (totalRevenue || 1)) * 100)}%`,
  }));

  const REPORTS = [
    { label: "Revenue detail",    subtitle: "Daily & monthly breakdown",  Icon: IconMoney },
    { label: "Category report",   subtitle: "Performance by saree type",  Icon: IconAnalyticsQa },
    { label: "Health score",      subtitle: "Store health metrics",       Icon: IconChartUp },
    { label: "AI forecast",       subtitle: "Demand predictions",         Icon: IconCampaignsQa },
    { label: "Staff leaderboard", subtitle: "Team performance ranking",   Icon: IconStaffQa },
    { label: "Dead stock",        subtitle: "Slow-moving inventory",      Icon: IconCatalogue },
  ];

  return (
    <div className="an">
      <div className="an-panel">
        <h1 className="an-title">Analytics</h1>
        <div className="an-rule" />

        {/* ── KPI row ── */}
        <div className="an-kpis">
          {KPIS.map(({ value, label, pill, Icon }) => (
            <div key={label} className="an-kpi">
              <div className="an-kpi-body">
                <span className="an-kpi-value">{value}</span>
                <span className="an-kpi-label">{label}</span>
                {pill && <span className="an-kpi-pill">{pill}</span>}
              </div>
              <span className="an-kpi-icon"><Icon size={24} /></span>
            </div>
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="an-charts">
          <div className="an-col">
            {/* Sales funnel */}
            <section className="an-card">
              <h2 className="an-card-title">Sales Funnel</h2>
              <div className="an-bars">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <div key={i} className="w-skeleton an-sk-bar" />)
                ) : totalViews === 0 && totalTryOns === 0 ? (
                  <p className="an-none">Views and try-ons appear as soon as customers use the kiosk.</p>
                ) : (
                  funnelBars.map(({ key, label, pct, caption }) => (
                    <div key={key} className="an-bar">
                      <span className="an-bar-dot" aria-hidden />
                      <span className="an-bar-label">{label}</span>
                      <span className="an-bar-track">
                        <span className="an-bar-fill" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                      </span>
                      <span className="an-bar-pct">{caption}</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* AI insight */}
            <section className="an-card an-card--ai">
              <div className="an-ai-head">
                <span className="an-ai-icon"><IconCampaignsQa size={16} /></span>
                <span className="an-ai-eyebrow">AI INSIGHT</span>
              </div>
              <p className="an-ai-text">{aiInsight}</p>
            </section>
          </div>

          {/* Revenue by category */}
          <section className="an-card">
            <h2 className="an-card-title">Revenue by category</h2>
            <div className="an-bars">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-skeleton an-sk-bar" />)
              ) : catBars.length === 0 ? (
                <p className="an-none">Category revenue appears after your first kiosk checkout.</p>
              ) : (
                catBars.map(({ key, label, pct, caption }) => (
                  <div key={key} className="an-bar">
                    <span className="an-bar-dot" aria-hidden />
                    <span className="an-bar-label">{label}</span>
                    <span className="an-bar-track">
                      <span className="an-bar-fill" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                    </span>
                    <span className="an-bar-pct">{caption}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ── Inventory health ── */}
        <section className="an-card an-card--wide">
          <h2 className="an-card-title">Inventory Health</h2>
          <div className="an-health">
            {HEALTH.map(({ value, label }) => (
              <div key={label} className="an-health-cell">
                <span className="an-health-value">{value}</span>
                <span className="an-health-label">{label}</span>
              </div>
            ))}
          </div>

          {(agingItems > 0 || pendingItems > 0) && (
            <div className="an-alerts">
              {agingItems > 0 && (
                <p className="an-alert">
                  <strong>Aging inventory</strong> — {agingItems} saree{agingItems > 1 ? "s" : ""} in catalogue 60+ days without a sale
                </p>
              )}
              {pendingItems > 0 && (
                <p className="an-alert">
                  <strong>Pending approval</strong> — {pendingItems} item{pendingItems > 1 ? "s" : ""} awaiting admin review
                </p>
              )}
            </div>
          )}
        </section>

        {/* ── Reports ── */}
        <section className="an-card an-card--wide">
          <h2 className="an-card-title">Reports</h2>
          <div className="an-reports">
            {REPORTS.map(({ label, subtitle, Icon }) => (
              <div key={label} className="an-report">
                <span className="an-report-icon"><Icon size={22} /></span>
                <span className="an-report-text">
                  <span className="an-report-title">{label}</span>
                  <span className="an-report-sub">{subtitle}</span>
                </span>
                <span className="an-report-tag">Coming soon</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .an { color: #000; }
        .an-panel { background: #fff; border-radius: 20px; padding: 21px 0 26px; }
        .an-title { padding: 0 24px; font-size: 24px; font-weight: 600; line-height: 29px; }
        .an-rule { height: 1px; margin: 21px 25px 0 26px; background: #E9E9E9; }

        /* ── KPI row ──────────────────────────────────────────────── */
        .an-kpis {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px; padding: 21px 25px 0 26px;
        }
        .an-kpi {
          position: relative;
          display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
          min-height: 124.85px; padding: 19.44px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 10px;
          box-shadow: 0 1.575px 2.363px rgba(16, 16, 16, 0.16),
                      inset 0 -3.15px 3.15px rgba(255, 255, 255, 0.6);
        }
        .an-kpi-body { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
        .an-kpi-value {
          font-size: 32px; font-weight: 600; line-height: 32px; color: #161922;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .an-kpi-label {
          font-size: 16px; font-weight: 500; line-height: 18px; color: #222222;
          opacity: 0.6; white-space: pre-line;
        }
        .an-kpi-pill {
          align-self: flex-start; margin-top: 1px; padding: 2px 8px;
          background: #DDF3E9; border-radius: 30px;
          font-size: 10px; font-weight: 600; line-height: 18px; color: #27741E;
          white-space: nowrap;
        }
        /* The tile hangs 10px past the padding box, flush toward the card edge. */
        .an-kpi-icon {
          position: absolute; top: 19.75px; right: 9.5px;
          width: 54px; height: 54px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; background: var(--w-maroon-l); color: #fff;
        }

        /* ── Section card ("Session" in the handoff) ──────────────── */
        .an-card {
          background: #fff;
          border: 0.81px solid #F3F6F7;
          border-radius: 10px;
          box-shadow: 0 1.575px 2.363px rgba(16, 16, 16, 0.16),
                      inset 0 -3.15px 3.15px rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(1.97px);
        }
        .an-card-title {
          display: block; height: 46px; padding: 11.5px 16.2px 11.5px 19.44px;
          font-size: 16px; font-weight: 600; line-height: 23px; color: #161922;
        }
        .an-card--wide { margin: 20px 25px 0 26px; }

        .an-charts {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px; padding: 21px 25px 0 26px; align-items: start;
        }
        .an-col { display: flex; flex-direction: column; gap: 18px; min-width: 0; }

        /* ── Bars ─────────────────────────────────────────────────── */
        .an-bars { display: flex; flex-direction: column; gap: 17px; padding: 9px 16px 21px 19px; }
        .an-bar { display: flex; align-items: center; gap: 4px; height: 30px; }
        .an-bar-dot { width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%; background: #CB857C; }
        .an-bar-label {
          width: 74px; flex-shrink: 0;
          font-size: 10px; font-weight: 600; line-height: 15px; color: #222222;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .an-bar-track {
          flex: 1; min-width: 0; height: 10px;
          background: #D9D9D9; border-radius: 50px; overflow: hidden;
        }
        .an-bar-fill { display: block; height: 100%; background: var(--w-maroon-l); border-radius: 50px; }
        .an-bar-pct {
          width: 34px; flex-shrink: 0; text-align: right;
          font-size: 10px; font-weight: 600; line-height: 15px; color: #222222;
        }
        .an-sk-bar { height: 30px; border-radius: 15px; }
        .an-none { font-size: 12px; line-height: 1.55; color: #727272; }

        /* ── AI insight ───────────────────────────────────────────── */
        .an-card--ai { padding: 19px; }
        .an-ai-head { display: flex; align-items: center; gap: 10px; }
        .an-ai-icon {
          width: 26px; height: 26px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 6px; background: var(--w-maroon-l); color: #fff;
        }
        .an-ai-eyebrow {
          font-size: 14px; font-weight: 700; letter-spacing: 0.06em; color: var(--w-maroon-l);
        }
        .an-ai-text { margin-top: 14px; font-size: 12px; font-weight: 500; line-height: 1.65; color: #222222; }

        /* ── Inventory health ─────────────────────────────────────── */
        .an-health {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px; padding: 0 19px 21px;
        }
        .an-health-cell {
          display: flex; flex-direction: column;
          min-height: 70px; padding: 13px 12px;
          border: 1px solid #D9D9D9; border-radius: 10px;
        }
        .an-health-value { font-size: 22px; font-weight: 600; line-height: 27px; color: #000; }
        .an-health-label { font-size: 14px; font-weight: 500; line-height: 17px; color: #727272; }
        .an-alerts { display: flex; flex-direction: column; gap: 8px; padding: 0 19px 21px; }
        .an-alert { font-size: 12px; line-height: 1.5; color: #727272; }
        .an-alert :global(strong) { color: #000; font-weight: 600; }

        /* ── Reports ──────────────────────────────────────────────── */
        .an-reports {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px 18px; padding: 0 19px 21px;
        }
        .an-report {
          display: flex; align-items: center; gap: 10px;
          min-height: 72px; padding: 13px 10px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 10px;
        }
        .an-report-icon {
          width: 46px; height: 46px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 8px; background: var(--w-maroon-l); color: #fff;
        }
        .an-report-text { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
        .an-report-title {
          font-size: 14px; font-weight: 600; line-height: 17px;
          letter-spacing: 0.04em; text-transform: capitalize; color: #000;
        }
        .an-report-sub {
          font-size: 10px; font-weight: 500; line-height: 12px; letter-spacing: 0.04em; color: #727272;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .an-report-tag {
          flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 101px; height: 23px; padding: 5px 16px;
          background: #D9D9D9; border-radius: 5px;
          font-size: 10px; font-weight: 600; line-height: 13px; color: #727272;
          box-shadow: 0 0 0 0.81px rgba(14, 159, 110, 0.11), 0 1.62px 3.24px rgba(0, 0, 0, 0.05);
        }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 1100px) {
          .an-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 900px) {
          .an-panel { border-radius: 16px; padding: 18px 0 22px; }
          .an-title { padding: 0 18px; font-size: 21px; }
          .an-rule, .an-card--wide { margin-left: 18px; margin-right: 18px; }
          .an-kpis, .an-charts { padding-left: 18px; padding-right: 18px; }
          .an-charts { grid-template-columns: minmax(0, 1fr); }
          .an-health, .an-reports { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 620px) {
          .an-kpis, .an-health, .an-reports { grid-template-columns: minmax(0, 1fr); }
          .an-kpi { min-height: 0; }
          .an-bar-label { width: 62px; }
          .an-report-tag { display: none; }
        }
      `}</style>
    </div>
  );
}
