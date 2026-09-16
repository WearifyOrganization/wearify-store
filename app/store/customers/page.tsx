"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@wearify/shared/api";
import { getToken } from "@/lib/phoneAuth";
import { formatVisitDate } from "@/lib/utils";
import { IconSearch, IconFilter, IconChevronRight } from "../_components/StoreIcons";
import { useAuthUser } from "@/lib/useAuth";
import { initialsOf } from "@/lib/profileHelpers";

/* Customers — built to the Surface Pro 8 handoff. Panel 995x660: title rule at
   70, the four 210.51x70 stat cards at 91, second rule at 182, the 946x44 search
   at 203, the filter button + segment switch at 254, a third rule at 315, then
   the bordered table card (946 wide, 16px inset, maroon 46px header row).

   Table columns are the handoff's 200/200/100/150/100 on a 914px inner table —
   they only sum to 750, and the leftover 164 is exactly where the row chevron
   sits (right: 30px). So the sixth column is that gap, not a mistake. Widths are
   percentages so the proportions hold as the table narrows. */

type Segment = "All" | "VIP" | "Regular" | "New" | "At Risk";

/* Only the green Regular tag is specified (#EDFFFA on #014737). The rest follow
   the same recipe from the palette already in the module — VIP wears the peach
   the screenshot shows it in. */
const SEGMENT_TONE: Record<string, { bg: string; fg: string }> = {
  VIP:       { bg: "#F6CBB7", fg: "#68262A" },
  Regular:   { bg: "#EDFFFA", fg: "#014737" },
  New:       { bg: "#F9F3E4", fg: "#7A5B12" },
  "At Risk": { bg: "#F7E6EA", fg: "#C0392B" },
};

/* Handoff stat-card fills, in order. */
const STAT_TONES = ["#F7E6EA", "#F9F3E4", "#F0E7F5", "#ECF3ED"];

/* The switch labels are set as the handoff draws them: "All" in sentence case,
   the segments shouting. */
const SEGMENTS: Array<{ key: Segment; label: string }> = [
  { key: "All", label: "All" },
  { key: "VIP", label: "VIP" },
  { key: "Regular", label: "REGULAR" },
  { key: "New", label: "NEW" },
  { key: "At Risk", label: "AT RISK" },
];

/* Walk-ins have no name, so their avatar falls back to the tail of the id the
   "Customer#XXXXXX" label is built from. Named customers get real initials. */
function initials(id: string): string {
  return id.replace(/[^A-Za-z0-9]/g, "").slice(-2).toUpperCase();
}

export default function CustomersPage() {
  const router = useRouter();
  // Cached at login; re-read during render so there is no loading pass.
  const storeId = useAuthUser()?.storeId ?? null;
  const [search, setSearch] = useState("");
  const [activeSegment, setActiveSegment] = useState<Segment>("All");

  const links = useQuery(
    api.customers.listByStore,
    storeId ? { storeId, token: getToken() ?? undefined } : "skip",
  );

  const allLinks = links ?? [];

  const counts: Record<Segment, number> = {
    All:       allLinks.length,
    VIP:       allLinks.filter((l) => l.segment === "VIP").length,
    Regular:   allLinks.filter((l) => l.segment === "Regular").length,
    New:       allLinks.filter((l) => (l.segment ?? "New") === "New").length,
    "At Risk": allLinks.filter((l) => l.segment === "At Risk").length,
  };

  const totalClv = allLinks.reduce((sum, l) => sum + (l.clv ?? 0), 0);
  const repeatCount = allLinks.filter((l) => (l.visits ?? 0) >= 2).length;

  const stats = [
    { label: "Customers", value: String(allLinks.length) },
    { label: "Repeat customers", value: String(repeatCount) },
    { label: "VIP", value: String(counts.VIP) },
    { label: "Total spend", value: `₹${totalClv.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  ];

  /* Label shown in the table, and the thing search has to match. Mirrors the
     detail page: real name when we have one, "Customer#XXXXXX" for walk-ins
     who never gave one. */
  const labelOf = (l: { customerName?: string; customerId: string }) =>
    l.customerName && l.customerName !== "Guest"
      ? l.customerName
      : `Customer#${String(l.customerId).slice(-6).toUpperCase()}`;

  const filtered = allLinks.filter((l) => {
    const seg = l.segment ?? "New";
    if (activeSegment !== "All" && seg !== activeSegment) return false;
    if (!search) return true;
    // Was matching String(l.customerId) — the Convex document id, which is
    // never shown and never typed. Searching a customer's own name returned
    // nothing. Digits are compared bare so "98765" finds "+91 98765 43210".
    const q = search.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    return (
      labelOf(l).toLowerCase().includes(q) ||
      seg.toLowerCase().includes(q) ||
      (qDigits.length > 0 && (l.customerPhone ?? "").replace(/\D/g, "").includes(qDigits))
    );
  });

  const loading = links === undefined;
  const goto = (id: string) => router.push(`/store/customers/${id}`);

  return (
    <div className="cst">
      <div className="cst-panel">
        <h1 className="cst-title">Customers</h1>
        <div className="cst-rule" />

        {/* ── Stat strip ── */}
        <div className="cst-stats">
          {stats.map((s, i) => (
            <div key={s.label} className="cst-stat" style={{ background: STAT_TONES[i] }}>
              <span className="cst-stat-value">{s.value}</span>
              <span className="cst-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="cst-rule cst-rule--stats" />

        {/* ── Search ── */}
        <div className="cst-searchbar">
          <span className="cst-search-icon"><IconSearch /></span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or phone…"
            aria-label="Search customers"
          />
        </div>

        {/* ── Filter button + segment switch ── */}
        <div className="cst-filters">
          <button type="button" className="cst-filter-btn" aria-label="Filter customers">
            <IconFilter />
          </button>

          <div className="cst-switch" role="tablist" aria-label="Customer segment">
            {SEGMENTS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeSegment === key}
                className={`cst-seg${activeSegment === key ? " is-on" : ""}`}
                onClick={() => setActiveSegment(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="cst-rule cst-rule--filters" />

        {/* ── Table ── */}
        <div className="cst-tablecard">
          <div className="cst-tablewrap">
            <table className="cst-table">
              <colgroup>
                <col style={{ width: "21.9%" }} />
                <col style={{ width: "21.9%" }} />
                <col style={{ width: "10.9%" }} />
                <col style={{ width: "16.4%" }} />
                <col style={{ width: "10.9%" }} />
                <col style={{ width: "18%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Segment</th>
                  <th>Visits</th>
                  <th className="cst-c">Last seen</th>
                  <th className="cst-c">Spend</th>
                  <th aria-hidden />
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    <td colSpan={6}><div className="w-skeleton cst-sk" /></td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="cst-empty">
                        <p className="cst-empty-title">
                          {search || activeSegment !== "All" ? "No customers match" : "No customers yet"}
                        </p>
                        <p className="cst-empty-text">
                          {search || activeSegment !== "All"
                            ? "Try a different search term or segment."
                            : "Customers appear here after their first visit at the kiosk."}
                        </p>
                        {(search || activeSegment !== "All") && (
                          <button
                            type="button"
                            className="cst-empty-btn"
                            onClick={() => { setSearch(""); setActiveSegment("All"); }}
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && filtered.map((link) => {
                  const seg = link.segment ?? "New";
                  const tone = SEGMENT_TONE[seg] ?? SEGMENT_TONE.Regular;
                  const id = String(link.customerId);
                  const label = labelOf(link);
                  return (
                    <tr
                      key={link._id}
                      className="cst-row"
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${label}`}
                      onClick={() => goto(link.customerId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          goto(link.customerId);
                        }
                      }}
                    >
                      <td>
                        <span className="cst-id">
                          <span className="cst-av">{link.customerName ? initialsOf(link.customerName) : initials(id)}</span>
                          {label}
                        </span>
                      </td>
                      <td>
                        <span className="cst-tag" style={{ background: tone.bg, color: tone.fg }}>{seg}</span>
                      </td>
                      <td>{link.visits ?? 0}</td>
                      <td className="cst-c">{formatVisitDate(link.lastVisit).toUpperCase()}</td>
                      <td className="cst-c">
                        {(link.clv ?? 0) > 0 ? `₹${(link.clv ?? 0).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="cst-chevcell">
                        <span className="cst-chev" aria-hidden><IconChevronRight /></span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cst { color: #000; }
        .cst-panel { background: #fff; border-radius: 20px; padding: 21px 0 26px; }
        .cst-title { padding: 0 24px; font-size: 24px; font-weight: 600; line-height: 29px; }
        .cst-rule { height: 1px; margin: 20px 25px 0; background: #E9E9E9; }
        .cst-rule--stats { margin-top: 21px; }
        .cst-rule--filters { margin-top: 17px; background: #E0E0E0; }

        /* ── Stat strip ───────────────────────────────────────────── */
        /* The handoff stops the strip 48px short of the content edge; spread
           across the full width instead so nothing floats. */
        .cst-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          padding: 21px 25px 0 24px;
        }
        .cst-stat {
          display: flex; flex-direction: column;
          min-height: 70px; padding: 13px 12px;
          border-radius: 10px;
        }
        .cst-stat-value {
          font-size: 22px; font-weight: 600; line-height: 27px; color: #000;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .cst-stat-label { font-size: 14px; font-weight: 500; line-height: 17px; color: #727272; }

        /* ── Search ───────────────────────────────────────────────── */
        .cst-searchbar {
          display: flex; align-items: center; gap: 10px;
          height: 44px; margin: 21px 25px 0 24px; padding: 0 12px;
          background: #fff;
          border: 1px solid #E0E0E0; border-radius: 8px;
        }
        .cst-search-icon { display: inline-flex; flex-shrink: 0; color: #0A0A0A; }
        .cst-searchbar :global(input) {
          flex: 1; min-width: 0;
          border: none; outline: none; background: none;
          font-family: inherit; font-size: 14px; font-weight: 400; line-height: 140%;
          color: #0A0A0A;
        }
        .cst-searchbar :global(input::placeholder) { color: #9E9E9E; }

        /* ── Filter button + segment switch ───────────────────────── */
        .cst-filters {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          padding: 7px 25px 0 24px;
        }
        .cst-filter-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 42.78px; height: 44px; flex-shrink: 0;
          background: var(--w-maroon-l);
          border: 1px solid #fff; border-radius: 10px;
          color: #fff; cursor: pointer;
        }

        /* Grey trough with the pills riding inside it — the handoff's 361x44
           #E0E0E0 rect. */
        .cst-switch {
          display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
          height: 44px; padding: 6px 8px;
          background: #E0E0E0; border-radius: 10px;
        }
        .cst-seg {
          height: 32px; padding: 0 12px;
          background: #fff; border: none; border-radius: 7px;
          font-family: inherit; font-size: 11px; font-weight: 500; line-height: 14px;
          color: #000; white-space: nowrap; cursor: pointer;
          transition: background 0.18s var(--w-ease), color 0.18s var(--w-ease);
        }
        .cst-seg:hover { background: #F6F6F6; }
        .cst-seg.is-on { background: var(--w-maroon-l); color: #fff; }

        /* ── Table ────────────────────────────────────────────────── */
        .cst-tablecard {
          margin: 21px 25px 0 24px;
          padding: 16px 0;
          background: #fff;
          border: 1px solid #D9D9D9;
          border-radius: 10px;
          box-shadow: 0 1.575px 2.363px rgba(16, 16, 16, 0.16),
                      inset 0 -3.15px 3.15px rgba(255, 255, 255, 0.6);
        }
        .cst-tablewrap {
          margin: 0 16px;
          border: 0.81px solid #D9D9D9;
          border-radius: 6.48px;
          overflow-x: auto;
        }
        .cst-table { width: 100%; min-width: 760px; border-collapse: collapse; }

        .cst-table :global(thead tr) { background: var(--w-maroon-l); }
        .cst-table :global(th) {
          height: 46px; padding: 0 13px;
          text-align: left;
          font-size: 12px; font-weight: 700; line-height: 19px;
          text-transform: uppercase; color: #fff;
          white-space: nowrap;
        }
        .cst-table :global(td) {
          padding: 13px;
          font-size: 12px; font-weight: 500; line-height: 18px; color: #222222;
          border-bottom: 0.81px solid #D9D9D9;
          vertical-align: middle;
        }
        .cst-table :global(.cst-c) { text-align: center; }

        .cst-row { cursor: pointer; transition: background 0.14s var(--w-ease); }
        .cst-row:hover { background: #FAF7F4; }
        .cst-row:focus-visible { outline: 2px solid var(--w-maroon-l); outline-offset: -2px; }

        .cst-id { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; white-space: nowrap; }
        .cst-av {
          width: 25px; height: 25px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 50%; background: #CB857C;
          font-size: 12px; font-weight: 500; line-height: 18px; color: #000;
        }
        .cst-tag {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 73px; height: 23px; padding: 5px 16px;
          border-radius: 5px;
          font-size: 10px; font-weight: 600; line-height: 13px;
          box-shadow: 0 0 0 0.81px rgba(14, 159, 110, 0.11), 0 1.62px 3.24px rgba(0, 0, 0, 0.05);
        }
        /* The chevron sits 30px off the row's right edge, per the handoff. */
        .cst-chevcell { text-align: right; padding-right: 30px !important; }
        .cst-chev { display: inline-flex; color: #141B34; }

        .cst-sk { height: 22px; border-radius: 4px; }
        .cst-empty { padding: 48px 12px; text-align: center; }
        .cst-empty-title { font-size: 15px; font-weight: 600; color: #000; }
        .cst-empty-text { margin-top: 4px; font-size: 12px; color: #727272; }
        .cst-empty-btn {
          margin-top: 14px; height: 34px; padding: 0 18px;
          border: 1px solid #D9D9D9; border-radius: 8px; background: #fff;
          font-family: inherit; font-size: 12px; font-weight: 600; color: var(--w-maroon-l);
          cursor: pointer;
        }
        .cst-empty-btn:hover { border-color: var(--w-maroon-l); }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .cst-panel { border-radius: 16px; padding: 18px 0 22px; }
          .cst-title { padding: 0 18px; font-size: 21px; }
          .cst-rule { margin-left: 18px; margin-right: 18px; }
          .cst-stats, .cst-filters { padding-left: 18px; padding-right: 18px; }
          .cst-searchbar { margin-left: 18px; margin-right: 18px; }
          .cst-tablecard { margin-left: 18px; margin-right: 18px; }
          .cst-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .cst-switch { height: auto; width: 100%; }
          .cst-seg { flex: 1; padding: 0 8px; }
        }
      `}</style>
    </div>
  );
}
