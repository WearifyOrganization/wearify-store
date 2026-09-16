"use client";

import React, { useState } from "react";
import { useQuery, usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@wearify/shared/api";
import { getToken } from "@/lib/phoneAuth";
import { IconCaret } from "../_components/AddCatalogueIcons";
import { useAuthUser } from "@/lib/useAuth";
import { useToast, cleanError } from "@/components/ui/toast";

/* Orders — built to the Surface Pro 8 handoff. Panel 995x660: title rule at 71,
   stats rule at 239, then the bordered table card (946 wide, 16px inset, maroon
   46px header row). Column widths are the handoff's 200/100/100/100/200/150 on
   a 914px inner table, expressed as percentages so they hold as it narrows. */

const PAGE_SIZE = 20;

type OrderStatus = "pending" | "paid" | "completed" | "cancelled" | "refunded";

/* The handoff only specifies the Pending tag (#F6CBB7 on #68262A). The rest
   follow the same recipe using the palette already in the module. */
const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  pending:   { bg: "#F6CBB7", fg: "#68262A" },
  paid:      { bg: "#ECF3ED", fg: "#27741E" },
  completed: { bg: "#ECF3ED", fg: "#27741E" },
  cancelled: { bg: "#F7E6EA", fg: "#C0392B" },
  refunded:  { bg: "#F0E7F5", fg: "#5B3B7A" },
};

/* Handoff stat-card fills, in order. */
const STAT_TONES = ["#F7E6EA", "#F9F3E4", "#F0E7F5", "#ECF3ED"];

/* Orders money is stored in integer paise. */
function fmtINR(paise: number) {
  const r = paise / 100;
  return `₹${r.toLocaleString("en-IN", {
    minimumFractionDigits: r % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

function initials(o: { customerPhone?: string; orderId: string }) {
  const src = o.customerPhone || o.orderId;
  return src.replace(/[^A-Za-z0-9]/g, "").slice(-2).toUpperCase();
}

export default function OrdersPage() {
  // Cached at login; re-read during render so there is no loading pass.
  const storeId = useAuthUser()?.storeId ?? null;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const updateOrderStatus = useMutation(api.sessionOps.updateOrderStatus);
  const toast = useToast();
  // Marking paid is what settles staff revenue + customer CLV server-side.
  const setStatus = (orderId: string, status: OrderStatus) =>
    updateOrderStatus({ orderId, status, token: getToken() ?? undefined })
      .catch((e) => toast(cleanError(e, "Couldn't update the order."), "error"));

  // Whole-store totals, independent of how many pages are loaded.
  const summary = useQuery(
    api.sessionOps.ordersSummaryByStore,
    storeId ? { storeId, token: getToken() ?? undefined } : "skip",
  );

  // Server-side status filter, so a pill applies across the store not the page.
  const { results: orders, status: pageStatus, loadMore } = usePaginatedQuery(
    api.sessionOps.pageOrdersByStore,
    storeId
      ? { storeId, token: getToken() ?? undefined, status: filter === "all" ? undefined : filter }
      : "skip",
    { initialNumItems: PAGE_SIZE },
  );

  const stats = [
    { label: "Orders", value: String(summary?.count ?? 0) },
    { label: "Pending", value: String(summary?.pendingCount ?? 0) },
    { label: "Paid", value: String(summary?.paidCount ?? 0) },
    { label: "Revenue", value: fmtINR(summary?.totalRevenue ?? 0) },
  ];

  /* The handoff's pills read "All / Live / Pending / Low Stock" — catalogue
     labels pasted onto this screen. Order statuses take their place. */
  const FILTERS: Array<{ key: "all" | OrderStatus; label: string; count?: number }> = [
    { key: "all", label: "All", count: summary?.count },
    { key: "pending", label: "Pending", count: summary?.pendingCount },
    { key: "paid", label: "Paid", count: summary?.paidCount },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const loading = pageStatus === "LoadingFirstPage";

  return (
    <div className="ord">
      <div className="ord-panel">
        <h1 className="ord-title">Order</h1>
        <div className="ord-rule" />

        <div className="ord-subhead">
          <h2 className="ord-subtitle">Orders checkout</h2>
          <div className="ord-pills">
            {FILTERS.map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                className={`ord-pill${filter === key ? " is-on" : ""}`}
                onClick={() => { setFilter(key); setExpandedId(null); }}
              >
                {label}{count !== undefined ? ` ${count}` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stat strip ── */}
        <div className="ord-stats">
          {stats.map((s, i) => (
            <div key={s.label} className="ord-stat" style={{ background: STAT_TONES[i] }}>
              <span className="ord-stat-value">{s.value}</span>
              <span className="ord-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="ord-rule ord-rule--stats" />

        {/* ── Table ── */}
        <div className="ord-tablecard">
          <div className="ord-tablewrap">
            <table className="ord-table">
              <colgroup>
                <col style={{ width: "21.9%" }} />
                <col style={{ width: "10.9%" }} />
                <col style={{ width: "10.9%" }} />
                <col style={{ width: "10.9%" }} />
                <col style={{ width: "21.9%" }} />
                <col style={{ width: "16.4%" }} />
                <col style={{ width: "7%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th className="ord-c">Items</th>
                  <th className="ord-r">Amount</th>
                  <th className="ord-c">Status</th>
                  <th className="ord-r">Date</th>
                  <th aria-hidden />
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    <td colSpan={7}><div className="w-skeleton ord-sk" /></td>
                  </tr>
                ))}

                {!loading && orders.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="ord-empty">
                        <p className="ord-empty-title">
                          {filter === "all" ? "No orders yet" : `No ${filter} orders`}
                        </p>
                        <p className="ord-empty-text">
                          {filter === "all"
                            ? "Kiosk checkouts appear here in real time."
                            : "Nothing with this status right now."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && orders.map((o) => {
                  const open = expandedId === o._id;
                  const tone = STATUS_TONE[o.status] ?? STATUS_TONE.pending;
                  return (
                    <React.Fragment key={o._id}>
                      <tr className="ord-row" onClick={() => setExpandedId(open ? null : o._id)}>
                        <td>
                          <span className="ord-id">
                            <span className="ord-av">{initials(o)}</span>
                            Customer#{o.orderId}
                          </span>
                        </td>
                        <td>{o.customerPhone || "Walk-in"}</td>
                        <td className="ord-c">{o.items.length}</td>
                        <td className="ord-r">{fmtINR(o.total ?? 0)}</td>
                        <td className="ord-c">
                          <span className="ord-tag" style={{ background: tone.bg, color: tone.fg }}>
                            {o.status[0].toUpperCase() + o.status.slice(1)}
                          </span>
                        </td>
                        <td className="ord-r">{fmtDate(o.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className={`ord-chev${open ? " is-open" : ""}`}
                            aria-label={open ? "Hide order details" : "Show order details"}
                            aria-expanded={open}
                            onClick={(e) => { e.stopPropagation(); setExpandedId(open ? null : o._id); }}
                          >
                            <IconCaret />
                          </button>
                        </td>
                      </tr>

                      {open && (
                        <tr className="ord-detailrow">
                          <td colSpan={7}>
                            <div className="ord-detail">
                              <div className="ord-items">
                                {o.items.map((it, i) => (
                                  <div key={i} className="ord-item">
                                    <div>
                                      <div className="ord-item-name">{it.name}</div>
                                      <div className="ord-item-sub">{it.quantity} × {fmtINR(it.price)}</div>
                                    </div>
                                    <strong>{fmtINR(it.price * it.quantity)}</strong>
                                  </div>
                                ))}
                              </div>
                              <div className="ord-totals">
                                <Row label="Subtotal" value={fmtINR(o.subtotal ?? 0)} />
                                <Row label="GST" value={fmtINR(o.gst ?? 0)} />
                                <div className="ord-totals-rule" />
                                <Row label="Total" value={fmtINR(o.total ?? 0)} bold />
                                {o.paymentMethod && <Row label="Payment" value={o.paymentMethod} muted />}
                                {o.sessionId && <Row label="Session" value={o.sessionId} muted />}
                                {o.status === "pending" && (
                                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); setStatus(o.orderId, "paid"); }}
                                      style={{ flex: 1, height: 32, borderRadius: 6, border: "none", background: "#27741E", color: "#FFFFFF", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                                    >
                                      Mark paid
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); setStatus(o.orderId, "cancelled"); }}
                                      style={{ flex: 1, height: 32, borderRadius: 6, border: "1px solid #C0392B", background: "#FFFFFF", color: "#C0392B", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(pageStatus === "CanLoadMore" || pageStatus === "LoadingMore") && (
            <div className="ord-more">
              <button type="button" onClick={() => loadMore(PAGE_SIZE)} disabled={pageStatus === "LoadingMore"}>
                {pageStatus === "LoadingMore" ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .ord { color: #000; }
        .ord-panel { background: #fff; border-radius: 20px; padding: 21px 0 26px; }
        .ord-title { padding: 0 24px; font-size: 24px; font-weight: 600; line-height: 29px; }
        .ord-rule { height: 1px; margin: 21px 25px 0; background: #E9E9E9; }
        .ord-rule--stats { margin-top: 22px; }

        .ord-subhead {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
          padding: 21px 25px 0 26px;
        }
        .ord-subtitle { font-size: 20px; font-weight: 500; line-height: 24px; }

        .ord-pills { display: flex; gap: 11px; flex-wrap: wrap; }
        .ord-pill {
          min-width: 98px; height: 44px; padding: 0 20px;
          border: 1px solid #D9D9D9; border-radius: 10px;
          background: #fff; color: #000;
          font-family: inherit; font-size: 12px; font-weight: 500; line-height: 17px;
          white-space: nowrap; cursor: pointer;
          transition: background 0.18s var(--w-ease), color 0.18s var(--w-ease);
        }
        .ord-pill:hover { border-color: var(--w-maroon-l); }
        .ord-pill.is-on { background: var(--w-maroon-l); border-color: var(--w-maroon-l); color: #fff; }

        /* ── Stat strip ───────────────────────────────────────────── */
        /* The handoff stops the strip 48px short of the content edge; spread
           across the full width instead so nothing floats. */
        .ord-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          padding: 22px 25px 0 26px;
        }
        .ord-stat {
          display: flex; flex-direction: column;
          min-height: 70px; padding: 13px 12px;
          border-radius: 10px;
        }
        .ord-stat-value {
          font-size: 22px; font-weight: 600; line-height: 27px; color: #000;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ord-stat-label { font-size: 14px; font-weight: 500; line-height: 17px; color: #727272; }

        /* ── Table ────────────────────────────────────────────────── */
        .ord-tablecard {
          margin: 21px 25px 0 26px;
          padding: 16px 0;
          background: #fff;
          border: 1px solid #D9D9D9;
          border-radius: 10px;
          box-shadow: 0 1.575px 2.363px rgba(16, 16, 16, 0.16),
                      inset 0 -3.15px 3.15px rgba(255, 255, 255, 0.6);
        }
        .ord-tablewrap {
          margin: 0 16px;
          border: 0.81px solid #D9D9D9;
          border-radius: 6.48px;
          overflow-x: auto;
        }
        .ord-table { width: 100%; min-width: 780px; border-collapse: collapse; }

        .ord-table :global(thead tr) { background: var(--w-maroon-l); }
        .ord-table :global(th) {
          height: 46px; padding: 0 13px;
          text-align: left;
          font-size: 12px; font-weight: 700; line-height: 19px;
          text-transform: uppercase; color: #fff;
          white-space: nowrap;
        }
        .ord-table :global(td) {
          padding: 13px;
          font-size: 12px; font-weight: 500; line-height: 18px; color: #222222;
          border-bottom: 0.81px solid #D9D9D9;
          vertical-align: middle;
        }
        .ord-table :global(.ord-c) { text-align: center; }
        .ord-table :global(.ord-r) { text-align: right; }

        .ord-row { cursor: pointer; transition: background 0.14s var(--w-ease); }
        .ord-row:hover { background: #FAF7F4; }

        .ord-id { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; white-space: nowrap; }
        .ord-av {
          width: 25px; height: 25px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 50%; background: #CB857C;
          font-size: 12px; font-weight: 500; line-height: 18px; color: #000;
        }
        .ord-tag {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 76px; height: 23px; padding: 5px 16px;
          border-radius: 5px;
          font-size: 10px; font-weight: 600; line-height: 13px;
          box-shadow: 0 0 0 0.81px rgba(14, 159, 110, 0.11), 0 1.62px 3.24px rgba(0, 0, 0, 0.05);
        }
        .ord-chev {
          display: inline-flex; align-items: center; justify-content: center;
          width: 24px; height: 24px;
          border: none; background: none; cursor: pointer;
          color: var(--w-maroon-l);
          transition: transform 0.18s var(--w-ease);
        }
        .ord-chev.is-open { transform: rotate(180deg); }

        /* ── Expanded detail ──────────────────────────────────────── */
        .ord-detailrow :global(td) { background: #FAF7F4; }
        .ord-detail { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
        .ord-items { flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
        .ord-item { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
        .ord-item-name { font-weight: 600; color: #000; }
        .ord-item-sub { font-size: 11px; color: #727272; }
        .ord-totals {
          flex: 0 1 300px; min-width: 240px;
          display: flex; flex-direction: column; gap: 4px;
          padding: 12px 14px;
          background: #fff; border: 1px solid #E9E9E9; border-radius: 8px;
        }
        .ord-totals-rule { height: 1px; margin: 4px 0; background: #E9E9E9; }

        .ord-sk { height: 22px; border-radius: 4px; }
        .ord-empty { padding: 48px 12px; text-align: center; }
        .ord-empty-title { font-size: 15px; font-weight: 600; color: #000; }
        .ord-empty-text { margin-top: 4px; font-size: 12px; color: #727272; }

        .ord-more { display: flex; justify-content: center; padding: 16px 16px 0; }
        .ord-more :global(button) {
          min-width: 200px; height: 40px;
          border: 1px solid #D9D9D9; border-radius: 8px; background: #fff;
          font-family: inherit; font-size: 13px; font-weight: 600; color: var(--w-maroon-l);
          cursor: pointer;
        }
        .ord-more :global(button:hover) { border-color: var(--w-maroon-l); }
        .ord-more :global(button:disabled) { opacity: 0.6; cursor: not-allowed; }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .ord-panel { border-radius: 16px; padding: 18px 0 22px; }
          .ord-title { padding: 0 18px; font-size: 21px; }
          .ord-rule { margin-left: 18px; margin-right: 18px; }
          .ord-subhead, .ord-stats { padding-left: 18px; padding-right: 18px; }
          .ord-tablecard { margin-left: 18px; margin-right: 18px; }
          .ord-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .ord-pills { width: 100%; }
          .ord-pill { flex: 1; min-width: 0; padding: 0 10px; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
      <span style={{ color: "#727272", flexShrink: 0 }}>{label}</span>
      <span style={{
        fontWeight: bold ? 700 : 500,
        color: muted ? "#727272" : "#000",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{value}</span>
    </div>
  );
}
