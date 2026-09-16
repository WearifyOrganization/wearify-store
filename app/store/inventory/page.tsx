"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@wearify/shared/api";
import { getToken } from "@/lib/phoneAuth";
import { SareeThumb } from "@/components/SareeThumb";
import { IconPlus, IconSearch } from "../_components/StoreIcons";
import { useAuthUser } from "@/lib/useAuth";

/* Catalogue — built to the Surface Pro 8 handoff. The panel is a 20px-radius
   white sheet; inside it the grid is 5 x 176px cards with 16px gutters (944px,
   exactly the width of the header divider). Below 1180px the grid reflows via
   auto-fill rather than dropping to a fixed column count. */

type FilterKey = "all" | "approved" | "pending" | "low_stock";

const PAGE_SIZE = 25;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Live" },
  { key: "pending", label: "Pending" },
  { key: "low_stock", label: "Low Stock" },
];

/* The handoff gives a card one pill, top-right, showing the saree's tag. For a
   saree that isn't live yet the approval state matters more to the merchant
   than the marketing tag, so it takes the slot and changes colour. */
const APPROVAL_PILL: Record<string, { label: string; tone: string }> = {
  pending:     { label: "Pending", tone: "warn" },
  corrections: { label: "Corrections", tone: "warn" },
  rejected:    { label: "Rejected", tone: "danger" },
};

export default function CataloguePage() {
  const router = useRouter();
  // Cached at login; re-read during render so there is no loading pass.
  const storeId = useAuthUser()?.storeId ?? null;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounced so each keystroke doesn't re-subscribe the paginated query.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Counts cover the WHOLE store (server-side), independent of the loaded page.
  const summary = useQuery(
    api.sarees.sareesSummaryByStore,
    storeId ? { storeId, token: getToken() ?? undefined } : "skip",
  );

  const { results: sarees, status: pageStatus, loadMore } = usePaginatedQuery(
    api.sarees.pageSareesByStore,
    storeId
      ? { storeId, token: getToken() ?? undefined, filter, search: debouncedSearch || undefined }
      : "skip",
    { initialNumItems: PAGE_SIZE },
  );

  const counts: Record<FilterKey, number> = {
    all: summary?.all ?? 0,
    approved: summary?.approved ?? 0,
    pending: summary?.pending ?? 0,
    low_stock: summary?.low_stock ?? 0,
  };

  const loading = pageStatus === "LoadingFirstPage";

  return (
    <div className="cat">
      <div className="cat-panel">

        {/* ── Panel header ── */}
        <h1 className="cat-title">Catalogue</h1>
        <div className="cat-rule" />

        <div className="cat-subhead">
          <h2 className="cat-subtitle">Your Collection</h2>
          <button type="button" className="cat-add" onClick={() => router.push("/store/inventory/add")}>
            <IconPlus size={16} />
            Add Items
          </button>
        </div>

        {/* ── Search + filter pills ── */}
        <div className="cat-toolbar">
          <div className="cat-search">
            <IconSearch size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sarees by name, style, fabric...."
              aria-label="Search sarees"
            />
          </div>

          <div className="cat-pills">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`cat-pill${filter === key ? " is-on" : ""}`}
                onClick={() => setFilter(key)}
              >
                {label} {counts[key]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="cat-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="cat-card" aria-hidden>
                <div className="cat-thumb w-skeleton" />
                <div className="cat-meta">
                  <div className="w-skeleton cat-sk" style={{ width: "70%" }} />
                  <div className="w-skeleton cat-sk" style={{ width: "40%" }} />
                  <div className="w-skeleton cat-sk" style={{ width: "50%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : sarees.length === 0 ? (
          <div className="cat-empty">
            <p className="cat-empty-title">
              {search || filter !== "all" ? "No items match" : "Your catalogue is empty"}
            </p>
            <p className="cat-empty-text">
              {search || filter !== "all"
                ? "Try a different search term or filter."
                : "Add your first saree to start building your collection."}
            </p>
            {!search && filter === "all" && (
              <button type="button" className="cat-add" onClick={() => router.push("/store/inventory/add")}>
                <IconPlus size={16} />
                Add Items
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="cat-grid">
              {sarees.map((saree) => {
                const approval = APPROVAL_PILL[saree.approvalStatus ?? ""];
                const pill = approval ?? (saree.tag ? { label: saree.tag, tone: "brand" } : null);
                return (
                  <a
                    key={saree._id}
                    href={`/store/inventory/${saree._id}`}
                    className="cat-card"
                    onClick={(e) => { e.preventDefault(); router.push(`/store/inventory/${saree._id}`); }}
                  >
                    <div className="cat-thumb">
                      <SareeThumb name={saree.name} fileId={saree.imageIds?.[0]} grad={saree.grad || ["#68262A", "#9A5A50"]} />
                      {pill && <span className={`cat-tag cat-tag--${pill.tone}`}>{pill.label}</span>}
                      {saree.occasion && <span className="cat-occasion">{saree.occasion}</span>}
                    </div>
                    <div className="cat-meta">
                      <span className="cat-name">{saree.name}</span>
                      <span className="cat-place">
                        <span className="cat-place-dot" aria-hidden />
                        {saree.region || saree.fabric}
                      </span>
                      <span className="cat-price">₹{saree.price.toLocaleString("en-IN")}</span>
                    </div>
                  </a>
                );
              })}
            </div>

            {(pageStatus === "CanLoadMore" || pageStatus === "LoadingMore") && (
              <div className="cat-more">
                <button
                  type="button"
                  onClick={() => loadMore(PAGE_SIZE)}
                  disabled={pageStatus === "LoadingMore"}
                >
                  {pageStatus === "LoadingMore" ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        /* ── Panel ────────────────────────────────────────────────── */
        .cat { color: #000; }
        .cat-panel {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 21px 0 26px;
        }
        .cat-title {
          padding: 0 24px;
          font-size: 24px;
          font-weight: 600;
          line-height: 29px;
          color: #000;
        }
        .cat-rule {
          height: 1px;
          margin: 21px 25px 0;
          background: #E9E9E9;
        }

        .cat-subhead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 21px 25px 0;
        }
        .cat-subtitle {
          font-size: 20px;
          font-weight: 500;
          line-height: 24px;
          color: #000;
        }
        .cat-add {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 120px;
          height: 40px;
          flex-shrink: 0;
          border: none;
          border-radius: 10px;
          background: var(--w-maroon-l);
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          line-height: 17px;
          cursor: pointer;
          transition: background 0.18s var(--w-ease);
        }
        .cat-add:hover { background: var(--w-maroon-d); }

        /* ── Toolbar ──────────────────────────────────────────────── */
        .cat-toolbar {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          padding: 21px 25px 0;
        }
        .cat-search {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1 1 320px;
          max-width: 464px;
          height: 44px;
          padding: 0 12px;
          background: #FFFFFF;
          border: 1px solid #E0E0E0;
          border-radius: 8px;
          color: #0A0A0A;
          transition: border-color 0.18s var(--w-ease);
        }
        .cat-search:focus-within { border-color: var(--w-maroon-l); }
        .cat-search :global(input) {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          font-family: inherit;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: #0A0A0A;
        }
        .cat-search :global(input::placeholder) { color: #9E9E9E; }

        .cat-pills { display: flex; gap: 11px; flex-wrap: wrap; }
        .cat-pill {
          min-width: 98px;
          height: 44px;
          padding: 0 24px;
          border: 1px solid #D9D9D9;
          border-radius: 10px;
          background: #FFFFFF;
          color: #000;
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          line-height: 17px;
          white-space: nowrap;
          cursor: pointer;
          transition: background 0.18s var(--w-ease), color 0.18s var(--w-ease);
        }
        .cat-pill:hover { border-color: var(--w-maroon-l); }
        .cat-pill.is-on {
          background: var(--w-maroon-l);
          border-color: var(--w-maroon-l);
          color: #FFFFFF;
        }

        /* ── Grid ─────────────────────────────────────────────────── */
        /* auto-fill at the handoff's 176px card so the row count follows the
           panel width instead of being pinned to five. */
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
          gap: 16px;
          padding: 25px 25px 0;
        }
        .cat-card {
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(104, 38, 42, 0.1);
          border-radius: 10px;
          background: #fff;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s var(--w-spring), box-shadow 0.2s var(--w-ease);
        }
        .cat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(104, 38, 42, 0.12);
        }
        .cat-thumb {
          position: relative;
          aspect-ratio: 176 / 218;
          overflow: hidden;
          border-radius: 10px;
          background: var(--w-cream-deep);
        }
        .cat-tag {
          position: absolute;
          top: 6px;
          right: 6px;
          display: inline-flex;
          align-items: center;
          height: 19px;
          padding: 0 10px;
          border-radius: 100px;
          font-size: 8px;
          font-weight: 500;
          line-height: 11px;
          text-transform: capitalize;
          color: #FFFFFF;
        }
        .cat-tag--brand { background: var(--w-maroon-l); }
        .cat-tag--warn { background: #9A7B18; }
        .cat-tag--danger { background: #C0392B; }
        .cat-occasion {
          position: absolute;
          left: 6px;
          bottom: 6px;
          display: inline-flex;
          align-items: center;
          height: 19px;
          padding: 0 10px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.8);
          border: 0.3px solid #FFFFFF;
          backdrop-filter: blur(2.5px);
          -webkit-backdrop-filter: blur(2.5px);
          color: var(--w-maroon-l);
          font-size: 8px;
          font-weight: 500;
          line-height: 11px;
          text-transform: capitalize;
        }

        .cat-meta {
          display: flex;
          flex-direction: column;
          padding: 4px 6px 6px;
        }
        .cat-name {
          font-size: 12px;
          font-weight: 400;
          line-height: 17px;
          color: #000;
          text-transform: capitalize;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cat-place {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 400;
          line-height: 14px;
          color: #878787;
          text-transform: capitalize;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cat-place-dot {
          width: 2px;
          height: 2px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #878787;
        }
        .cat-price {
          font-size: 12px;
          font-weight: 600;
          line-height: 24px;
          color: #000;
        }
        .cat-sk { height: 11px; border-radius: 4px; margin-top: 5px; }

        /* ── Empty / load more ────────────────────────────────────── */
        .cat-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 64px 25px;
          text-align: center;
        }
        .cat-empty-title { font-size: 16px; font-weight: 600; color: #000; }
        .cat-empty-text { font-size: 13px; color: #727272; margin-bottom: 8px; }

        .cat-more { display: flex; justify-content: center; padding: 24px 25px 0; }
        .cat-more :global(button) {
          min-width: 200px;
          height: 44px;
          border: 1px solid #D9D9D9;
          border-radius: 10px;
          background: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          color: var(--w-maroon-l);
          cursor: pointer;
        }
        .cat-more :global(button:hover) { border-color: var(--w-maroon-l); }
        .cat-more :global(button:disabled) { opacity: 0.6; cursor: not-allowed; }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .cat-panel { padding: 18px 0 22px; border-radius: 16px; }
          .cat-title { padding: 0 18px; font-size: 21px; }
          .cat-rule { margin: 16px 18px 0; }
          .cat-subhead, .cat-toolbar { padding-left: 18px; padding-right: 18px; }
          .cat-grid, .cat-more { padding-left: 18px; padding-right: 18px; }
          .cat-search { max-width: none; }
        }
        @media (max-width: 620px) {
          .cat-subhead { flex-wrap: wrap; }
          .cat-pills { width: 100%; }
          .cat-pill { flex: 1; min-width: 0; padding: 0 10px; }
          .cat-grid { grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); }
        }
      `}</style>
    </div>
  );
}
