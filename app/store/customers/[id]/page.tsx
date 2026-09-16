"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@wearify/shared/api";
import { getToken } from "@/lib/phoneAuth";
import { Id } from "@wearify/shared/dataModel";
import { useToast, cleanError } from "@/components/ui/toast";
import { formatVisitDate } from "@/lib/utils";
import { IconProfileFill, IconPhoneFill } from "../../_components/StoreIcons";
import { useAuthUser } from "@/lib/useAuth";
import { languageLabel } from "@/lib/i18n";

/* Customer detail — built to the Surface Pro 8 handoff. Two columns inside the
   usual 1003px content band: a 695px profile panel and a 282px rail, 26px apart.

   Left panel (panel-relative): 70px maroon disc + name + tier pill at 20, rule
   at 106, "Preference" at 127, then Occasions / Fabrics / Colour Preferences,
   and the budget+language ledger at 488.

   Right rail: Contact 282x179, Loyalty 282x179 (three 41px ledger rows), then
   three 72px figure cards.

   The handoff draws only this one view, so the Visits / Feedback / Consent tabs
   the page carried before live on below the drawn content — see the note there. */

type Tab = "Visits" | "Feedback" | "Consent";

const STAR = "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";

/* The vocabularies the handoff draws, verbatim. Anything the customer has that
   isn't on these lists gets appended so nothing silently disappears. */
const OCCASIONS = ["Wedding", "Festival", "Party", "Office"];
const FABRICS = ["Silk", "Chanderi", "Tussar", "Georgette", "Cotton"];
const COLORS: Array<{ name: string; hex: string; ring?: boolean }> = [
  { name: "Red",    hex: "#C41F1F" },
  { name: "Yellow", hex: "#DAAC45" },
  { name: "Blue",   hex: "#4483AA" },
  { name: "Green",  hex: "#4EAF72" },
  { name: "Pink",   hex: "#E64D89" },
  { name: "Purple", hex: "#8E4893" },
  { name: "Orange", hex: "#EB630A" },
  { name: "Cream",  hex: "#F8F0E5" },
  { name: "Black",  hex: "#313130" },
  { name: "White",  hex: "#FFFFFF", ring: true },
];

/* The handoff prints the number as "+91 99000 00001"; storage keeps it bare. */
function fmtPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  const ten = d.length > 10 ? d.slice(-10) : d;
  const cc = d.length > 10 ? d.slice(0, d.length - 10) : "91";
  return ten.length === 10 ? `+${cc} ${ten.slice(0, 5)} ${ten.slice(5)}` : raw;
}

function union(fixed: string[], picked?: string[]) {
  const extra = (picked ?? []).filter((p) => !fixed.some((f) => f.toLowerCase() === p.toLowerCase()));
  return [...fixed, ...extra];
}
function has(picked: string[] | undefined, name: string) {
  return (picked ?? []).some((p) => p.toLowerCase() === name.toLowerCase());
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as Id<"customers">;

  // Cached at login; re-read during render so there is no loading pass.
  const storeId = useAuthUser()?.storeId ?? null;
  const [activeTab, setActiveTab] = useState<Tab>("Visits");

  const customer     = useQuery(api.customers.getById, customerId ? { customerId, token: getToken() ?? undefined } : "skip");
  const storeLink    = useQuery(api.customers.getStoreLink, storeId && customerId ? { customerId, storeId, token: getToken() ?? undefined } : "skip");
  const visitHistory = useQuery(api.customers.listVisitHistory, customerId ? { customerId, token: getToken() ?? undefined } : "skip");
  const feedback     = useQuery(
    api.customers.listFeedbackByCustomerAndStore,
    storeId && customerId ? { customerId, storeId, token: getToken() ?? undefined } : "skip"
  );
  const updateConsent = useMutation(api.customers.updateConsent);
  const toast = useToast();

  async function toggleConsent(field: string, current: boolean | undefined) {
    try {
      await updateConsent({
        token: getToken() ?? undefined,
        customerId,
        [field]: !current,
        consentGrantedDate: new Date().toISOString().split("T")[0],
      });
    } catch (e) {
      toast(cleanError(e, "Couldn't save the consent change — please try again."), "error");
    }
  }

  /* ── Loading ── */
  if (customer === undefined) {
    return (
      <div className="cd">
        <div className="cd-grid">
          <div className="cd-panel"><div className="w-skeleton cd-sk-panel" /></div>
          <div className="cd-rail"><div className="w-skeleton cd-sk-rail" /></div>
        </div>
        <style jsx>{`
          .cd-grid { display: grid; grid-template-columns: minmax(0, 695fr) minmax(0, 282fr); gap: 26px; }
          .cd-panel, .cd-rail { background: #fff; border-radius: 20px; padding: 20px; }
          .cd-rail { border-radius: 10px; }
          .cd-sk-panel { height: 560px; border-radius: 12px; }
          .cd-sk-rail { height: 560px; border-radius: 12px; }
          @media (max-width: 900px) { .cd-grid { grid-template-columns: minmax(0, 1fr); } }
        `}</style>
      </div>
    );
  }

  /* ── Not found ── */
  if (customer === null) {
    return (
      <div className="cd">
        <div className="cd-panel cd-panel--empty">
          <p className="cd-nf-title">Customer not found</p>
          <p className="cd-nf-text">This profile may have been removed, or the link is incorrect.</p>
          <button type="button" className="cd-nf-btn" onClick={() => router.push("/store/customers")}>
            Back to customers
          </button>
        </div>
        <style jsx>{`
          .cd-panel--empty { background: #fff; border-radius: 20px; padding: 64px 24px; text-align: center; }
          .cd-nf-title { font-size: 20px; font-weight: 600; color: #000; }
          .cd-nf-text { margin-top: 6px; font-size: 13px; color: #727272; }
          .cd-nf-btn {
            margin-top: 18px; height: 40px; padding: 0 20px;
            border: none; border-radius: 10px; background: var(--w-maroon-l);
            font-family: inherit; font-size: 14px; font-weight: 500; color: #fff; cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  const tier = customer.loyaltyTier ?? "Regular";
  const displayName = customer.name && customer.name !== "Guest"
    ? customer.name
    : `Customer#${String(customerId).slice(-6).toUpperCase()}`;

  const occasions = union(OCCASIONS, customer.preferredOccasions);
  const fabrics = union(FABRICS, customer.preferredFabrics);

  const feedbackCount = feedback?.length ?? 0;
  const feedbackAvg = feedback && feedback.length > 0
    ? Math.round((feedback.reduce((s, f) => s + f.rating, 0) / feedback.length) * 10) / 10
    : 0;

  const consentItems = [
    { field: "consentHistory",    label: "Browse & purchase history", desc: "Allow storing visit and purchase data", on: customer.consentHistory ?? false },
    { field: "consentMessages",   label: "Marketing messages",        desc: "WhatsApp, SMS, and email campaigns",    on: customer.consentMessages ?? false },
    { field: "consentAiPersonal", label: "AI personalization",        desc: "AI-powered recommendations and styling", on: customer.consentAiPersonal ?? false },
    { field: "consentPhotos",     label: "Photos & try-on images",    desc: "Store virtual try-on photos",           on: customer.consentPhotos ?? false },
  ];

  const TABS: Tab[] = ["Visits", "Feedback", "Consent"];

  return (
    <div className="cd">
      <div className="cd-grid">

        {/* ════ LEFT · profile panel ════════════════════════════════ */}
        <div className="cd-panel">
          <div className="cd-head">
            <span className="cd-disc"><IconProfileFill /></span>
            <div className="cd-head-text">
              <h1 className="cd-name">{displayName}</h1>
              <span className="cd-tier">{tier} tier</span>
            </div>
          </div>

          <div className="cd-rule" />

          <h2 className="cd-h2">Preference</h2>

          <h3 className="cd-h3">Occasions</h3>
          <div className="cd-chips">
            {occasions.map((o) => (
              <span key={o} className={`cd-chip${has(customer.preferredOccasions, o) ? " is-on" : ""}`}>{o}</span>
            ))}
          </div>

          <h3 className="cd-h3 cd-h3--fabrics">Fabrics</h3>
          <div className="cd-chips">
            {fabrics.map((f) => (
              <span key={f} className={`cd-chip${has(customer.preferredFabrics, f) ? " is-on" : ""}`}>{f}</span>
            ))}
          </div>

          <h3 className="cd-h3 cd-h3--colors">Color Preferences (optional)</h3>
          <div className="cd-swatches">
            {COLORS.map(({ name, hex, ring }) => (
              <span key={name} className={`cd-swatch${has(customer.preferredColors, name) ? " is-on" : ""}`}>
                <span
                  className="cd-dot"
                  style={{ background: hex, ...(ring ? { border: "1px solid #D9D9D9" } : null) }}
                />
                {name}
              </span>
            ))}
          </div>

          {/* Budget + language ledger */}
          <div className="cd-ledger">
            <div className="cd-ledger-row">
              <span className="cd-ledger-k">Budget range</span>
              <span className="cd-ledger-v">{customer.budgetRange || "Not set"}</span>
            </div>
            <div className="cd-ledger-rule" />
            <div className="cd-ledger-row">
              <span className="cd-ledger-k">Language</span>
              <span className="cd-ledger-v">{languageLabel(customer.language)}</span>
            </div>
          </div>

          {/* ── Beyond the handoff ──────────────────────────────────
             The design draws only the profile above. Visit history,
             feedback and DPDP consent were already on this page and
             have nowhere else to live, so they sit below the fold in
             the same visual language rather than being dropped. */}
          <div className="cd-more">
            <div className="cd-tabs" role="tablist" aria-label="Customer records">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === t}
                  className={`cd-tab${activeTab === t ? " is-on" : ""}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                  {t === "Feedback" && feedbackCount > 0 ? ` ${feedbackCount}` : ""}
                </button>
              ))}
            </div>

            {activeTab === "Visits" && (
              visitHistory === undefined ? <div className="w-skeleton cd-sk-block" />
              : !visitHistory || visitHistory.length === 0 ? <p className="cd-none">No visits recorded.</p>
              : (
                <div className="cd-tablewrap">
                  <table className="cd-table">
                    <thead>
                      <tr><th>Date</th><th>Store</th><th>Staff</th><th>Sarees</th><th>Outcome</th><th>Points</th></tr>
                    </thead>
                    <tbody>
                      {visitHistory.map((v) => (
                        <tr key={v._id}>
                          <td>{v.date}</td>
                          <td>{v.storeName || "Store Visit"}</td>
                          <td>{v.staffName || "Staff"}</td>
                          <td>{v.sareesTried ?? 0}</td>
                          <td>{v.purchased ? "Purchased" : "—"}</td>
                          <td>{(v.pointsEarned ?? 0) > 0 ? `+${v.pointsEarned}` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {activeTab === "Feedback" && (
              feedback === undefined ? <div className="w-skeleton cd-sk-block" />
              : !feedback || feedback.length === 0 ? <p className="cd-none">No feedback yet.</p>
              : (
                <div className="cd-fb-list">
                  <p className="cd-fb-avg">{feedbackAvg.toFixed(1)} average across {feedbackCount} rating{feedbackCount === 1 ? "" : "s"}</p>
                  {feedback.map((f) => (
                    <div key={f._id} className="cd-fb">
                      <div className="cd-fb-head">
                        <span className="cd-stars">
                          {[1, 2, 3, 4, 5].map((n) => {
                            const on = n <= f.rating;
                            return (
                              <svg key={n} width="13" height="13" viewBox="0 0 24 24"
                                fill={on ? "#D4A843" : "none"} stroke={on ? "#D4A843" : "#D9D9D9"}
                                strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
                                <polygon points={STAR} />
                              </svg>
                            );
                          })}
                        </span>
                        <span className="cd-fb-date">{f.date}</span>
                      </div>
                      {f.chips && f.chips.length > 0 && (
                        <div className="cd-fb-chips">
                          {f.chips.map((c) => <span key={c} className="cd-chip cd-chip--sm">{c}</span>)}
                        </div>
                      )}
                      {f.comment && <p className="cd-fb-quote">&ldquo;{f.comment}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === "Consent" && (
              <div className="cd-consent">
                <p className="cd-consent-intro">
                  Manage customer data consent per the Digital Personal Data Protection Act.
                  Changes are saved immediately.
                </p>
                {consentItems.map(({ field, label, desc, on }) => (
                  <label key={field} className="cd-consent-row">
                    <span className="cd-consent-main">
                      <span className="cd-consent-label">{label}</span>
                      <span className="cd-consent-desc">{desc}</span>
                    </span>
                    <input type="checkbox" className="w-toggle" checked={on} onChange={() => toggleConsent(field, on)} />
                  </label>
                ))}
                {customer.consentGrantedDate && (
                  <p className="cd-consent-stamp">Last updated: {customer.consentGrantedDate}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ════ RIGHT · rail ════════════════════════════════════════ */}
        <div className="cd-rail">

          {/* Contact */}
          <section className="cd-card cd-card--tall cd-card--contact">
            <h2 className="cd-card-title">Contact</h2>
            <div className="cd-contact">
              <span className="cd-disc"><IconProfileFill /></span>
              <div className="cd-contact-text">
                <p className="cd-name">{displayName}</p>
                <p className="cd-phone">
                  <IconPhoneFill />
                  {fmtPhone(customer.phone)}
                </p>
              </div>
            </div>
            <div className="cd-card-rule" />
            <span className="cd-tier cd-tier--foot">{tier} tier</span>
          </section>

          {/* Loyalty */}
          <section className="cd-card cd-card--tall cd-card--loyalty">
            <div className="cd-card-head">
              <h2 className="cd-card-title">Loyalty</h2>
              <span className="cd-tier">{tier} tier</span>
            </div>
            <div className="cd-card-rule" />
            <div className="cd-lrow">
              <span className="cd-lk">Points</span>
              <span className="cd-lv">{customer.loyaltyPoints ?? 0}</span>
            </div>
            <div className="cd-card-rule" />
            <div className="cd-lrow">
              <span className="cd-lk">Last visit</span>
              <span className="cd-lv">{formatVisitDate(storeLink?.lastVisit, "N/A")}</span>
            </div>
            <div className="cd-card-rule" />
            <div className="cd-lrow">
              <span className="cd-lk">Visits (this store)</span>
              <span className="cd-lv">{storeLink?.visits ?? 0}</span>
            </div>
          </section>

          {/* Figure cards */}
          <section className="cd-card cd-card--fig">
            <span className="cd-fig-value">₹{(storeLink?.clv ?? 0).toLocaleString("en-IN")}</span>
            <span className="cd-fig-label">Lifetime value</span>
          </section>
          <section className="cd-card cd-card--fig">
            <span className="cd-fig-value">{customer.totalVisits ?? 0}</span>
            <span className="cd-fig-label">Total Visit</span>
          </section>
          <section className="cd-card cd-card--fig">
            <span className="cd-fig-value">{customer.loyaltyPoints ?? 0}</span>
            <span className="cd-fig-label">Loyalty point</span>
          </section>
        </div>
      </div>

      <style jsx>{`
        .cd { color: #000; }
        .cd-grid {
          display: grid;
          grid-template-columns: minmax(0, 695fr) minmax(0, 282fr);
          gap: 26px;
          align-items: start;
        }

        /* ── Left panel ───────────────────────────────────────────── */
        .cd-panel { background: #fff; border-radius: 20px; padding: 20px 16px 24px; }

        .cd-head { display: flex; align-items: center; gap: 16px; }
        .cd-disc {
          width: 70px; height: 70px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 50%; background: var(--w-maroon-l); color: #fff;
        }
        .cd-head-text { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; min-width: 0; }
        .cd-name { font-size: 20px; font-weight: 600; line-height: 24px; color: #000; }
        .cd-tier {
          display: inline-flex; align-items: center; justify-content: center;
          height: 27px; padding: 0 16px;
          background: #fff; border: 0.5px solid rgba(114, 114, 114, 0.8); border-radius: 8px;
          font-size: 12px; font-weight: 600; line-height: 18px; letter-spacing: -0.023em;
          color: var(--w-maroon-l); white-space: nowrap;
        }

        .cd-rule { height: 1px; margin: 16px -16px 0; background: #E9E9E9; }

        .cd-h2 { margin: 20px 0 0 4px; font-size: 20px; font-weight: 600; line-height: 24px; }
        .cd-h3 { margin: 22px 0 0 4px; font-size: 16px; font-weight: 500; line-height: 20px; }
        .cd-h3--fabrics { margin-top: 16px; }
        /* The handoff sets this one heading in Poppins. */
        .cd-h3--colors { margin-top: 16px; font-family: var(--w-font-display), inherit; line-height: 24px; }

        .cd-chips { display: flex; flex-wrap: wrap; gap: 9px; margin: 12px 0 0 4px; }
        .cd-chip {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 102px; height: 40px; padding: 0 14px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          font-size: 14px; font-weight: 400; line-height: 17px; color: #000;
        }
        .cd-chip.is-on { border-color: var(--w-maroon-l); background: #FAF2F0; font-weight: 500; }
        .cd-chip--sm { min-width: 0; height: 26px; padding: 0 10px; font-size: 11px; }

        .cd-swatches {
          display: grid; grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 11px 12px; margin: 8px 0 0 4px;
        }
        .cd-swatch {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          height: 40px; padding: 0 10px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          font-size: 12px; font-weight: 400; line-height: 18px; letter-spacing: -0.023em; color: #000;
        }
        .cd-swatch.is-on { border-color: var(--w-maroon-l); background: #FAF2F0; font-weight: 500; }
        .cd-dot { width: 20px; height: 20px; flex-shrink: 0; border-radius: 50%; }

        .cd-ledger { width: 282px; max-width: 100%; margin: 16px 0 0 4px; }
        .cd-ledger-row { display: flex; align-items: center; gap: 16px; height: 41px; padding: 0 16px; }
        .cd-ledger-rule { height: 1px; background: #E9E9E9; }
        .cd-ledger-k { width: 117px; flex-shrink: 0; font-size: 12px; font-weight: 600; line-height: 15px; }
        .cd-ledger-v { font-size: 12px; font-weight: 500; line-height: 15px; }

        /* ── Records below the drawn design ──────────────────────── */
        .cd-more { margin: 24px 4px 0; padding-top: 20px; border-top: 1px solid #E9E9E9; }
        .cd-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
        .cd-tab {
          height: 34px; padding: 0 16px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          font-family: inherit; font-size: 13px; font-weight: 500; color: #000; cursor: pointer;
          transition: background 0.18s var(--w-ease), color 0.18s var(--w-ease);
        }
        .cd-tab:hover { border-color: var(--w-maroon-l); }
        .cd-tab.is-on { background: var(--w-maroon-l); border-color: var(--w-maroon-l); color: #fff; }

        .cd-none { margin-top: 16px; font-size: 13px; color: #727272; }
        .cd-sk-block { height: 120px; margin-top: 16px; border-radius: 8px; }

        .cd-tablewrap { margin-top: 16px; border: 1px solid #E9E9E9; border-radius: 8px; overflow-x: auto; }
        .cd-table { width: 100%; min-width: 520px; border-collapse: collapse; }
        .cd-table :global(th) {
          height: 38px; padding: 0 12px; text-align: left;
          background: #FAF7F4;
          font-size: 11px; font-weight: 700; text-transform: uppercase; color: #68262A;
          white-space: nowrap;
        }
        .cd-table :global(td) {
          padding: 11px 12px; font-size: 12px; font-weight: 500; color: #222;
          border-top: 1px solid #E9E9E9; white-space: nowrap;
        }

        .cd-fb-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
        .cd-fb-avg { font-size: 12px; font-weight: 600; color: #727272; }
        .cd-fb { padding: 14px; border: 1px solid #E9E9E9; border-radius: 8px; }
        .cd-fb-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .cd-stars { display: inline-flex; gap: 2px; }
        .cd-fb-date { font-size: 11px; color: #727272; }
        .cd-fb-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .cd-fb-quote { margin-top: 10px; font-size: 13px; line-height: 1.55; font-style: italic; color: #444; }

        .cd-consent { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
        .cd-consent-intro { font-size: 12px; line-height: 1.6; color: #727272; }
        .cd-consent-row {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 12px 14px; border: 1px solid #E9E9E9; border-radius: 8px; cursor: pointer;
        }
        .cd-consent-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .cd-consent-label { font-size: 13px; font-weight: 600; color: #000; }
        .cd-consent-desc { font-size: 11px; color: #727272; }
        .cd-consent-stamp { font-size: 11px; color: #9E9E9E; }

        /* ── Right rail ───────────────────────────────────────────── */
        .cd-rail { display: flex; flex-direction: column; gap: 8px; }
        .cd-card { background: #fff; border-radius: 10px; padding: 16px; }
        .cd-card--tall { margin-bottom: 8px; }
        .cd-card-title { font-size: 16px; font-weight: 600; line-height: 20px; color: #000; }
        .cd-card-head {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          min-height: 27px;
        }
        .cd-card-rule { height: 1px; margin: 0 -16px; background: #E9E9E9; }

        /* Contact — 179 tall: 16 pad, 20 title, 16, 70 disc, 16, rule, 6, 27 pill, 8. */
        .cd-card--contact { padding-bottom: 8px; }
        .cd-contact { display: flex; align-items: center; gap: 16px; margin: 16px 0; }
        .cd-contact-text { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
        .cd-phone {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 14px; font-weight: 500; line-height: 17px; color: #727272;
        }
        .cd-tier--foot { margin-top: 6px; }

        /* Loyalty — 179 tall: 16 pad, 27 head, 13, rule, then three 41px rows. */
        .cd-card--loyalty { padding-bottom: 0; }
        .cd-card--loyalty .cd-card-head { margin-bottom: 13px; }

        /* Loyalty ledger — the handoff's three 41px rows. */
        .cd-lrow {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          height: 41px;
        }
        .cd-lk { font-size: 12px; font-weight: 400; line-height: 15px; color: #000; }
        .cd-lv { font-size: 12px; font-weight: 500; line-height: 15px; color: #727272; text-align: right; }

        .cd-card--fig {
          display: flex; flex-direction: column; gap: 8px;
          min-height: 72px; padding-bottom: 13px;
        }
        .cd-fig-value { font-size: 16px; font-weight: 600; line-height: 20px; color: #000; }
        .cd-fig-label { font-size: 12px; font-weight: 600; line-height: 15px; color: #727272; }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 1100px) {
          .cd-swatches { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @media (max-width: 900px) {
          .cd-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
          .cd-panel { border-radius: 16px; padding: 18px 14px 20px; }
          .cd-rule { margin-left: -14px; margin-right: -14px; }
          .cd-swatches { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .cd-head { align-items: flex-start; }
          .cd-chip { min-width: 0; flex: 1 1 96px; }
          .cd-swatches { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .cd-ledger-k { width: auto; }
          .cd-ledger-row { justify-content: space-between; padding: 0; }
        }
      `}</style>
    </div>
  );
}
