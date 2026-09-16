"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@wearify/shared/api";
import { getToken } from "@/lib/phoneAuth";
import { IconChevronLeft } from "../../_components/StoreIcons";
import { useAuthUser } from "@/lib/useAuth";

/* Settings › Billing — built to the Surface Pro 8 handoff. Panel 995x660: the
   35px back square + SETTINGS / Billing at 16, rule at 86, then two columns
   starting at x51 — a 353-wide stack (Current plan on #FAF7F4, then Change plan
   or payment) and the 282-wide Billing details card, 30px apart.

   Billing details is a 7-row ledger on a 39px pitch: label left 12/500 #000,
   value right 12/500 #727272, hairline between each. */

/* The handoff's only status chip: #EDFFFA on #014737. */
const CHIP_TONE: Record<string, { bg: string; fg: string; bd: string }> = {
  ok:      { bg: "#EDFFFA", fg: "#014737", bd: "rgba(1, 71, 55, 0.8)" },
  pending: { bg: "#F9F3E4", fg: "#7A5B12", bd: "rgba(122, 91, 18, 0.8)" },
  bad:     { bg: "#F7E6EA", fg: "#C0392B", bd: "rgba(192, 57, 43, 0.8)" },
};

function chipTone(status?: string) {
  const s = (status || "").toLowerCase();
  if (["active", "signed", "accepted", "approved"].includes(s)) return CHIP_TONE.ok;
  if (s === "pending") return CHIP_TONE.pending;
  if (["expired", "terminated", "rejected", "cancelled", "canceled"].includes(s)) return CHIP_TONE.bad;
  return CHIP_TONE.pending;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function capitalize(s: string | undefined): string {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function BillingPage() {
  const router = useRouter();
  // Cached at login; re-read during render so there is no loading pass.
  const storeId = useAuthUser()?.storeId ?? null;

  const store = useQuery(
    api.stores.getStoreDetail,
    storeId ? { storeId, token: getToken() ?? undefined } : "skip",
  );

  const loading = !storeId || store === undefined;

  const planName = store?.subscriptionPlan || store?.plan || "Starter";
  const mrr = store?.mrr ?? 0;
  const billingCycle = store?.billingCycle || "Monthly";
  const agreement = capitalize(store?.agreementStatus);
  const tone = chipTone(store?.agreementStatus);
  const last4 = store?.bankAccount ? store.bankAccount.slice(-4) : "";

  /* The handoff lists seven rows; bank and PAN join only when the store has
     them, so nothing renders as an empty line.

     Rows are plain data, never JSX: styled-jsx only scopes markup that appears
     inside the returned tree, so a chip built out here would render unstyled.
     The Agreement row flags itself instead and the map draws the chip. */
  const ROWS: Array<{ k: string; v: string; chip?: boolean }> = store
    ? [
        { k: "Plan", v: planName },
        { k: "Billing cycle", v: billingCycle },
        { k: "Amount", v: `₹${mrr.toLocaleString("en-IN")}` },
        { k: "Next billing", v: store.nextBillingDate ? formatDate(store.nextBillingDate) : "Not scheduled" },
        { k: "Agreement", v: agreement, chip: true },
        { k: "Payment method", v: store.paymentMethod ? capitalize(store.paymentMethod) : "Not Configured" },
        ...(store.bankName
          ? [{ k: "Bank", v: `${store.bankName}${last4 ? ` · ••••${last4}` : ""}` }]
          : []),
        ...(store.gstin ? [{ k: "GSTIN", v: store.gstin }] : []),
        ...(store.pan ? [{ k: "PAN", v: store.pan }] : []),
      ]
    : [];

  return (
    <div className="bl">
      <div className="bl-panel">
        {/* ── Header ── */}
        <div className="bl-head">
          <button
            type="button"
            className="bl-back"
            onClick={() => router.push("/store/settings")}
            aria-label="Back to settings"
          >
            <IconChevronLeft />
          </button>
          <div className="bl-head-text">
            <span className="bl-eyebrow">Settings</span>
            <h1 className="bl-title">Billing</h1>
          </div>
        </div>

        <div className="bl-rule" />

        {loading ? (
          <div className="bl-cols">
            <div className="bl-col">
              <div className="w-skeleton bl-sk" />
              <div className="w-skeleton bl-sk" />
            </div>
            <div className="w-skeleton bl-sk bl-sk--tall" />
          </div>
        ) : !store ? (
          <div className="bl-empty">
            <p className="bl-empty-title">Store not found</p>
            <p className="bl-empty-text">We couldn&apos;t load billing details for this store.</p>
          </div>
        ) : (
          <div className="bl-cols">
            {/* ── Left ── */}
            <div className="bl-col">
              <section className="bl-card bl-card--plan">
                <div className="bl-card-head bl-card-head--ruled">
                  <h2 className="bl-card-eyebrow">Current plan</h2>
                </div>
                <div className="bl-plan-body">
                  <div className="bl-plan-left">
                    <p className="bl-plan-name">{planName}</p>
                    <span className="bl-chip" style={{ background: tone.bg, color: tone.fg, borderColor: tone.bd }}>
                      {agreement}
                    </span>
                  </div>
                  <div className="bl-plan-price">
                    <span className="bl-price">₹{mrr.toLocaleString("en-IN")}</span>
                    <span className="bl-cycle">/{billingCycle.toLowerCase()}</span>
                  </div>
                </div>
              </section>

              <section className="bl-card">
                <div className="bl-card-head">
                  <h2 className="bl-card-title">Change plan or payment</h2>
                </div>
                <p className="bl-card-text">
                  To change your plan or update the payment method, contact your Wearify account manager.
                </p>
              </section>
            </div>

            {/* ── Right ── */}
            <section className="bl-details">
              <h2 className="bl-details-title">Billing details</h2>
              <div className="bl-ledger">
                {ROWS.map(({ k, v, chip }) => (
                  <div key={k} className="bl-row">
                    <span className="bl-k">{k}</span>
                    {chip ? (
                      <span className="bl-chip" style={{ background: tone.bg, color: tone.fg, borderColor: tone.bd }}>
                        {v}
                      </span>
                    ) : (
                      <span className="bl-v">{v}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <style jsx>{`
        .bl { color: #000; }
        .bl-panel { background: #fff; border-radius: 20px; padding: 16px 0 26px; }

        /* ── Header ───────────────────────────────────────────────── */
        .bl-head { display: flex; align-items: flex-start; gap: 16px; padding: 0 16px; }
        .bl-back {
          width: 35px; height: 35px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          color: var(--w-maroon-l); cursor: pointer;
        }
        .bl-back:hover { border-color: var(--w-maroon-l); }
        .bl-head-text { display: flex; flex-direction: column; min-width: 0; }
        .bl-eyebrow {
          font-size: 14px; font-weight: 500; line-height: 17px;
          text-transform: uppercase; color: #000;
        }
        .bl-title { margin-top: 8px; font-size: 24px; font-weight: 600; line-height: 29px; color: #000; }
        .bl-rule { height: 1px; margin: 16px 16px 0; background: #E9E9E9; }

        /* The handoff indents the columns to x51 and leaves the right of the
           panel empty. Kept as drawn — stretching a 282px ledger across the
           full 963 would strand its labels and values at opposite edges. */
        .bl-cols {
          display: flex; flex-wrap: wrap; gap: 30px;
          padding: 26px 16px 0 51px; align-items: flex-start;
        }
        .bl-col { display: flex; flex-direction: column; gap: 30px; width: 353px; max-width: 100%; }

        .bl-sk { height: 139px; border-radius: 10px; }
        .bl-sk--tall { width: 282px; height: 325px; }

        /* ── Left cards ───────────────────────────────────────────── */
        .bl-card {
          min-height: 139px;
          background: #fff;
          border: 0.81px solid #F3F6F7;
          border-radius: 10px;
          box-shadow: 0 1.575px 2.363px rgba(16, 16, 16, 0.16),
                      inset 0 -3.15px 3.15px rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(1.97px);
        }
        .bl-card--plan { background: #FAF7F4; }
        .bl-card-head { display: flex; align-items: center; height: 46px; padding: 0 16px; }
        .bl-card-head--ruled { border-bottom: 1px solid #D9D9D9; }
        .bl-card-eyebrow {
          font-size: 12px; font-weight: 600; line-height: 23px;
          text-transform: uppercase; color: var(--w-maroon-l);
        }
        .bl-card-title { font-size: 16px; font-weight: 600; line-height: 23px; color: var(--w-maroon-l); }
        .bl-card-text {
          max-width: 337px; padding: 0 16px;
          font-size: 12px; font-weight: 500; line-height: 20px; color: #727272;
        }

        .bl-plan-body {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; padding: 16px 11px 20px 16px;
        }
        .bl-plan-left { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-width: 0; }
        .bl-plan-name { font-size: 16px; font-weight: 500; line-height: 20px; color: #000; }
        .bl-plan-price { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
        .bl-price { font-size: 20px; font-weight: 400; line-height: 24px; color: #000; }
        .bl-cycle { font-size: 20px; font-weight: 400; line-height: 24px; color: #727272; }

        .bl-chip {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 62px; height: 27px; padding: 0 10px;
          border: 0.5px solid; border-radius: 8px;
          font-size: 12px; font-weight: 500; line-height: 18px; letter-spacing: -0.023em;
          white-space: nowrap;
        }

        /* ── Billing details ──────────────────────────────────────── */
        .bl-details {
          width: 282px; max-width: 100%;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 10px;
        }
        .bl-details-title {
          display: block; padding: 16px 16px 0;
          font-size: 16px; font-weight: 600; line-height: 20px; color: #000;
        }
        .bl-ledger { margin-top: 20px; }
        .bl-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          min-height: 39px; padding: 6px 15px 6px 16px;
          border-top: 1px solid #E9E9E9;
        }
        .bl-k { font-size: 12px; font-weight: 500; line-height: 15px; color: #000; flex-shrink: 0; }
        .bl-v {
          font-size: 12px; font-weight: 500; line-height: 15px; color: #727272;
          text-align: right; min-width: 0;
          overflow: hidden; text-overflow: ellipsis;
        }

        .bl-empty { padding: 64px 16px; text-align: center; }
        .bl-empty-title { font-size: 16px; font-weight: 600; color: #000; }
        .bl-empty-text { margin-top: 4px; font-size: 13px; color: #727272; }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .bl-panel { border-radius: 16px; }
          .bl-title { font-size: 21px; }
          .bl-cols { padding-left: 18px; padding-right: 18px; gap: 18px; }
          .bl-col { gap: 18px; }
        }
        @media (max-width: 480px) {
          .bl-col, .bl-details { width: 100%; }
          .bl-plan-body { flex-direction: column; }
          .bl-plan-price { align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
