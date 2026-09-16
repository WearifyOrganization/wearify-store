"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@wearify/shared/api";
import { Id } from "@wearify/shared/dataModel";
import { getToken } from "@/lib/phoneAuth";
import { cleanError } from "@/components/ui/toast";
import {
  IconWhatsApp, IconCalendar, IconCalendarLg, IconPlus,
  IconClose, IconMail, IconChat, IconCaretDown,
} from "../_components/StoreIcons";
import { useAuthUser } from "@/lib/useAuth";

/* Campaigns — built to the Surface Pro 8 handoff. Panel 995x660: title rule at
   71, the four 210.51x70 tinted stat cards at 91, then 443x181 campaign cards
   at 202 in two columns.

   The handoff draws two card states and they differ, so the build branches the
   same way:
     · sent/completed — status pill top-right, "Created …" + a segment pill in
       the meta row, a hairline, and the Delivered/Opened/Clicked strip.
     · scheduled/draft — status + channel pills in the meta row, audience,
       schedule and created lines in the body, and a 443x40 Send Now beneath.

   The WhatsApp glyph in the 70px maroon disc is public/store/whatsapp.svg. */

type Channel = "whatsapp" | "sms" | "email";

/* Only COMPLETED (#F0F7EC on #27741E) and SCHEDULED (#F6CBB7 on #68262A) are
   specified; sent and draft follow the same recipe from the module palette. */
const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  completed: { bg: "#F0F7EC", fg: "#27741E" },
  sent:      { bg: "#F0F7EC", fg: "#27741E" },
  scheduled: { bg: "#F6CBB7", fg: "#68262A" },
  draft:     { bg: "#F0E7F5", fg: "#5B3B7A" },
};

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
};

/* Handoff stat-card fills, in order. */
const STAT_TONES = ["#F7E6EA", "#F9F3E4", "#F0E7F5", "#ECF3ED"];

export default function CampaignsPage() {
  // Cached at login; re-read during render so there is no loading pass.
  const storeId = useAuthUser()?.storeId ?? null;
  const [showModal, setShowModal] = useState(false);
  const dispatchCampaign = useAction(api.campaignOps.dispatchCampaign);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function handleSend(campaignId: Id<"campaigns">) {
    setDispatchingId(campaignId);
    setBanner(null);
    try {
      const r = await dispatchCampaign({ token: getToken() ?? undefined, id: campaignId });
      const parts: string[] = [];
      if (r.sent) parts.push(`${r.sent} sent`);
      if (r.simulated) parts.push(`${r.simulated} simulated`);
      if (r.failed) parts.push(`${r.failed} failed`);
      if (r.skipped) parts.push(`${r.skipped} skipped (no contact)`);
      const total = r.sent + r.simulated + r.failed + r.skipped;
      setBanner({
        kind: "ok",
        text: total === 0
          ? "No recipients matched — add customers to this segment first."
          : `Dispatched: ${parts.join(", ")}`,
      });
    } catch (e) {
      setBanner({ kind: "err", text: cleanError(e, "Dispatch failed") });
    } finally {
      setDispatchingId(null);
    }
  }

  const campaigns = useQuery(
    api.campaignOps.listCampaignsByStore,
    storeId ? { storeId, token: getToken() ?? undefined } : "skip"
  );

  const all = campaigns ?? [];
  const sentCount = all.filter((c) => c.status === "sent" || c.status === "completed").length;
  const scheduledCount = all.filter((c) => c.status === "scheduled").length;
  const draftCount = all.filter((c) => c.status === "draft").length;

  const stats = [
    { label: "Total", value: all.length },
    { label: "Sent", value: sentCount },
    { label: "Scheduled", value: scheduledCount },
    { label: "Drafts", value: draftCount },
  ];

  const loading = campaigns === undefined;

  return (
    <div className="cmp">
      <div className="cmp-panel">
        <div className="cmp-head">
          <h1 className="cmp-title">Campaigns</h1>
          {/* Not in the handoff, but campaigns have to start somewhere. */}
          <button type="button" className="cmp-new" onClick={() => setShowModal(true)}>
            <IconPlus size={16} />
            New campaign
          </button>
        </div>
        <div className="cmp-rule" />

        {banner && (
          <button
            type="button"
            className={`cmp-banner${banner.kind === "err" ? " is-err" : ""}`}
            onClick={() => setBanner(null)}
          >
            {banner.text}<span className="cmp-banner-hint">tap to dismiss</span>
          </button>
        )}

        {/* ── Stat strip ── */}
        <div className="cmp-stats">
          {stats.map(({ label, value }, i) => (
            <div key={label} className="cmp-stat" style={{ background: STAT_TONES[i] }}>
              <span className="cmp-stat-value">{value}</span>
              <span className="cmp-stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Campaign cards ── */}
        <div className="cmp-grid">
          {loading && Array.from({ length: 2 }).map((_, i) => (
            <div key={`sk-${i}`} className="w-skeleton cmp-sk" />
          ))}

          {!loading && all.length === 0 && (
            <div className="cmp-empty">
              <p className="cmp-empty-title">No campaigns yet</p>
              <p className="cmp-empty-text">Create your first campaign to reach customers.</p>
              <button type="button" className="cmp-new" onClick={() => setShowModal(true)}>
                <IconPlus size={16} />
                New campaign
              </button>
            </div>
          )}

          {!loading && all.map((c) => {
            const isSent = c.status === "sent" || c.status === "completed";
            const tone = STATUS_TONE[c.status] ?? STATUS_TONE.draft;
            const chTone = STATUS_TONE.completed;
            return (
              <div key={c._id} className="cmp-cell">
                <article className="cmp-card">
                  <div className="cmp-card-head">
                    <span className="cmp-disc">
                      {c.channel === "whatsapp"
                        ? <IconWhatsApp />
                        : <span className="cmp-disc-letter">{(CHANNEL_LABEL[c.channel] ?? c.channel).charAt(0)}</span>}
                    </span>

                    <div className="cmp-card-text">
                      <h2 className="cmp-card-title">{c.name}</h2>
                      <div className="cmp-meta">
                        {isSent ? (
                          <>
                            <span className="cmp-created">Created {c.createdAt}</span>
                            {c.segment && <span className="cmp-tierpill">{c.segment}</span>}
                          </>
                        ) : (
                          <>
                            <span className="cmp-pill" style={{ background: tone.bg, color: tone.fg }}>
                              {c.status}
                            </span>
                            <span className="cmp-pill" style={{ background: chTone.bg, color: chTone.fg }}>
                              {CHANNEL_LABEL[c.channel] ?? c.channel}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {isSent && (
                      <span className="cmp-pill cmp-pill--corner" style={{ background: tone.bg, color: tone.fg }}>
                        {c.status}
                      </span>
                    )}
                  </div>

                  {isSent ? (
                    <>
                      <div className="cmp-card-rule" />
                      <div className="cmp-figs">
                        {[
                          { label: "Delivered", value: c.delivered ?? 0 },
                          { label: "Opened", value: c.opened ?? 0 },
                          { label: "Clicked", value: c.clicked ?? 0 },
                        ].map((m) => (
                          <div key={m.label} className="cmp-fig">
                            <span className="cmp-fig-value">{m.value}</span>
                            <span className="cmp-fig-label">{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="cmp-lines">
                      <p className="cmp-line">{c.segment || "All Customers"}</p>
                      {c.scheduledDate && (
                        <p className="cmp-line cmp-line--icon">
                          <IconCalendar />
                          Scheduled {c.scheduledDate}
                        </p>
                      )}
                      <p className="cmp-line">Created {c.createdAt}</p>
                    </div>
                  )}
                </article>

                {!isSent && (
                  <button
                    type="button"
                    className="cmp-send"
                    onClick={() => handleSend(c._id)}
                    disabled={dispatchingId === c._id}
                  >
                    {dispatchingId === c._id ? "Sending…" : "Send Now"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showModal && storeId && (
        <CreateCampaignModal storeId={storeId} onClose={() => setShowModal(false)} />
      )}

      <style jsx>{`
        .cmp { color: #000; }
        .cmp-panel { background: #fff; border-radius: 20px; padding: 21px 0 26px; }
        .cmp-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap; padding: 0 25px 0 24px;
        }
        .cmp-title { font-size: 24px; font-weight: 600; line-height: 29px; }
        .cmp-new {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          height: 40px; padding: 0 16px;
          background: var(--w-maroon-l); border: none; border-radius: 10px;
          font-family: inherit; font-size: 14px; font-weight: 500; color: #fff; cursor: pointer;
        }
        .cmp-new:hover { background: var(--w-maroon); }
        .cmp-rule { height: 1px; margin: 21px 25px 0 26px; background: #E9E9E9; }

        .cmp-banner {
          display: block; width: calc(100% - 50px); margin: 16px 25px 0 24px;
          padding: 10px 14px; text-align: left;
          background: #ECF3ED; border: none; border-radius: 8px;
          font-family: inherit; font-size: 12px; font-weight: 600; color: #27741E; cursor: pointer;
        }
        .cmp-banner.is-err { background: #F7E6EA; color: #C0392B; }
        .cmp-banner-hint { margin-left: 8px; font-weight: 500; opacity: 0.6; }

        /* ── Stat strip ───────────────────────────────────────────── */
        /* The handoff stops the strip 48px short of the content edge; spread
           across the full width instead so nothing floats. */
        .cmp-stats {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px; padding: 20px 25px 0 24px;
        }
        .cmp-stat {
          display: flex; flex-direction: column;
          min-height: 70px; padding: 13px 12px; border-radius: 10px;
        }
        .cmp-stat-value { font-size: 22px; font-weight: 600; line-height: 27px; color: #000; }
        .cmp-stat-label { font-size: 14px; font-weight: 500; line-height: 17px; color: #727272; }

        /* ── Campaign cards ───────────────────────────────────────── */
        .cmp-grid {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px 10px; padding: 41px 25px 0 24px; align-items: start;
        }
        .cmp-cell { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
        .cmp-sk { height: 181px; border-radius: 10px; }

        .cmp-card {
          min-height: 181px; padding: 14px 16px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 10px;
        }
        .cmp-card-head { display: flex; align-items: flex-start; gap: 16px; }
        .cmp-disc {
          width: 70px; height: 70px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 50%; background: var(--w-maroon-l); color: #fff;
        }
        .cmp-disc-letter { font-size: 26px; font-weight: 600; }
        .cmp-card-text { display: flex; flex-direction: column; gap: 12px; min-width: 0; flex: 1; }
        .cmp-card-title {
          font-size: 20px; font-weight: 600; line-height: 24px; color: #000;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .cmp-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; min-height: 28px; }
        .cmp-created { font-size: 14px; font-weight: 500; line-height: 17px; color: #727272; }

        .cmp-pill {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 113px; height: 28px; padding: 0 12px;
          border-radius: 14px;
          font-size: 12px; font-weight: 600; line-height: 15px;
          text-transform: uppercase; white-space: nowrap;
        }
        .cmp-pill--corner { flex-shrink: 0; margin-top: 5px; }
        .cmp-tierpill {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 48px; height: 27px; padding: 0 12px;
          background: #fff; border: 0.5px solid rgba(114, 114, 114, 0.8); border-radius: 8px;
          font-size: 12px; font-weight: 600; line-height: 18px; letter-spacing: -0.023em;
          color: var(--w-maroon-l); white-space: nowrap;
        }

        .cmp-card-rule { height: 1px; margin: 16px -16px 0; background: #E9E9E9; }
        .cmp-figs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 17px; }
        .cmp-fig { display: flex; flex-direction: column; align-items: center; }
        .cmp-fig-value { font-size: 22px; font-weight: 600; line-height: 27px; color: #000; }
        .cmp-fig-label { font-size: 14px; font-weight: 500; line-height: 17px; color: #727272; }

        .cmp-lines { display: flex; flex-direction: column; gap: 5px; margin-top: 11px; }
        .cmp-line {
          display: flex; align-items: center; gap: 3px;
          font-size: 14px; font-weight: 500; line-height: 17px; color: #727272;
        }
        .cmp-line--icon :global(svg) { flex-shrink: 0; }

        .cmp-send {
          height: 40px; width: 100%;
          background: var(--w-maroon-l); border: none; border-radius: 8px;
          font-family: inherit; font-size: 16px; font-weight: 500; color: #fff; cursor: pointer;
        }
        .cmp-send:hover { background: var(--w-maroon); }
        .cmp-send:disabled { opacity: 0.65; cursor: not-allowed; }

        .cmp-empty { grid-column: 1 / -1; padding: 56px 12px; text-align: center; }
        .cmp-empty-title { font-size: 16px; font-weight: 600; color: #000; }
        .cmp-empty-text { margin: 4px 0 18px; font-size: 13px; color: #727272; }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .cmp-panel { border-radius: 16px; padding: 18px 0 22px; }
          .cmp-title { font-size: 21px; }
          .cmp-head, .cmp-stats, .cmp-grid { padding-left: 18px; padding-right: 18px; }
          .cmp-rule { margin-left: 18px; margin-right: 18px; }
          .cmp-banner { width: calc(100% - 36px); margin-left: 18px; margin-right: 18px; }
          .cmp-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .cmp-grid { grid-template-columns: minmax(0, 1fr); padding-top: 24px; }
        }
        @media (max-width: 560px) {
          .cmp-card-head { flex-wrap: wrap; }
          .cmp-disc { width: 54px; height: 54px; }
          .cmp-card-title { font-size: 17px; white-space: normal; }
        }
      `}</style>
    </div>
  );
}

/* ── Create Campaign Modal ───────────────────────────────────────── */
/* Built to the dialog handoff: 457x648 sheet, radius 16, a 421px content
   column inset 18px, and a strict 20px rhythm — header block, rule at 80,
   then label(20) + 4 + control(40) field blocks 20px apart, buttons last.

   The handoff pairs the SMS chip with an envelope and the Email chip with a
   speech bubble; the glyphs are swapped back here. The chip fills and text
   colours stay exactly where the design puts them. */
const CHANNEL_CHIP: Record<Channel, { bg: string; fg: string }> = {
  whatsapp: { bg: "#F9E9E9", fg: "#68262A" },
  sms:      { bg: "#FDF6EA", fg: "#FFA100" },
  email:    { bg: "#F6F1FB", fg: "#A400FF" },
};

function CreateCampaignModal({ storeId, onClose }: { storeId: string; onClose: () => void }) {
  const createCampaign = useMutation(api.campaignOps.createCampaign);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [template, setTemplate] = useState("");
  const [segment, setSegment] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const CHANNELS: Channel[] = ["whatsapp", "sms", "email"];
  const SEGMENTS = ["VIP", "Regular", "New", "At Risk"];

  async function handleSubmit() {
    if (!name.trim()) { setError("Campaign name is required"); return; }
    setLoading(true);
    setError("");
    try {
      await createCampaign({
        token: getToken() ?? undefined,
        storeId,
        name: name.trim(),
        channel,
        template: template.trim() || undefined,
        segment: segment || undefined,
        scheduledDate: scheduledDate || undefined,
        status: scheduledDate ? "scheduled" : "draft",
        createdAt: new Date().toISOString().split("T")[0],
      });
      onClose();
    } catch (err: unknown) {
      setError(cleanError(err, "Failed to create campaign"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="cm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cm-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cm-sheet">
        <div className="cm-head">
          <div className="cm-head-text">
            <span className="cm-eyebrow">MARKETING</span>
            <h2 id="cm-title" className="cm-title">New campaign</h2>
          </div>
          <button type="button" className="cm-close" aria-label="Close" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="cm-rule" />

        <div className="cm-body">
          {error && <p className="cm-error" role="alert">{error}</p>}

          <div className="cm-field">
            <label className="cm-label" htmlFor="cm-name">Campaign name*</label>
            <input
              id="cm-name" className="cm-input" type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mohal lal"
            />
          </div>

          <div className="cm-field">
            <span className="cm-label">Channel*</span>
            <div className="cm-chips">
              {CHANNELS.map((ch) => {
                const t = CHANNEL_CHIP[ch];
                const on = channel === ch;
                return (
                  <button
                    key={ch}
                    type="button"
                    className={`cm-chip${on ? " is-on" : ""}`}
                    style={{ background: t.bg, color: t.fg }}
                    onClick={() => setChannel(ch)}
                    aria-pressed={on}
                  >
                    {ch === "whatsapp" ? <IconWhatsApp size={24} />
                      : ch === "sms" ? <IconChat size={24} />
                      : <IconMail size={24} />}
                    {CHANNEL_LABEL[ch]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="cm-field">
            <label className="cm-label" htmlFor="cm-template">Message template*</label>
            <textarea
              id="cm-template" className="cm-input cm-textarea" value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Hi (name), Check out our new collection"
            />
          </div>

          <div className="cm-field">
            <label className="cm-label" htmlFor="cm-segment">Target segment*</label>
            <span className="cm-control">
              <select
                id="cm-segment" className="cm-input cm-select" value={segment}
                onChange={(e) => setSegment(e.target.value)}
              >
                <option value="">All customers</option>
                {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="cm-adorn" aria-hidden><IconCaretDown /></span>
            </span>
          </div>

          <div className="cm-field">
            <label className="cm-label" htmlFor="cm-date">Schedule date*</label>
            <span className="cm-control">
              <input
                id="cm-date" className="cm-input cm-date" type="date" value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              <span className="cm-adorn" aria-hidden><IconCalendarLg /></span>
            </span>
          </div>

          <div className="cm-actions">
            <button type="button" className="cm-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="button" className="cm-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating…" : "Create campaign"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cm-overlay {
          position: fixed; inset: 0; z-index: 60;
          display: flex; align-items: safe center; justify-content: center;
          padding: 24px 16px;
          background: rgba(0, 0, 0, 0.45);
          overflow-y: auto;
        }
        .cm-sheet {
          width: 457px; max-width: 100%;
          padding: 20px 18px;
          background: #fff; border-radius: 16px;
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22);
        }

        .cm-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; min-height: 40px; }
        .cm-head-text { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
        .cm-eyebrow { font-size: 12px; font-weight: 500; line-height: 15px; color: #727272; }
        .cm-title { font-size: 16px; font-weight: 600; line-height: 20px; color: #000; }
        .cm-close {
          width: 24px; height: 24px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border: none; background: none; color: #000; cursor: pointer;
        }

        .cm-rule { height: 1px; margin-top: 20px; background: #D9D9D9; }

        /* Every field block is label(20) + 4 + control(40), 20px apart. */
        .cm-body { display: flex; flex-direction: column; gap: 20px; padding-top: 20px; }
        .cm-field { display: flex; flex-direction: column; gap: 4px; }
        .cm-label { font-size: 12px; font-weight: 500; line-height: 20px; color: #000; }

        .cm-input {
          width: 100%; height: 40px; padding: 0 10px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          font-family: inherit; font-size: 14px; font-weight: 400; line-height: 20px; color: #000;
          outline: none;
        }
        .cm-input::placeholder { color: #9E9E9E; }
        .cm-input:focus { border-color: var(--w-maroon-l); }
        .cm-textarea { height: 108px; padding: 10px; resize: vertical; }

        .cm-control { position: relative; display: block; }
        .cm-adorn {
          position: absolute; top: 8px; right: 10px;
          display: inline-flex; color: #000; pointer-events: none;
        }
        .cm-select { appearance: none; padding-right: 40px; }
        .cm-date { padding-right: 40px; }
        /* The handoff draws its own calendar mark, so the native one goes. */
        .cm-date::-webkit-calendar-picker-indicator { opacity: 0; width: 24px; cursor: pointer; }

        .cm-chips { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
        .cm-chip {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          height: 40px; padding: 0 8px;
          border: 1.5px solid transparent; border-radius: 8px;
          font-family: inherit; font-size: 14px; font-weight: 500; line-height: 20px;
          white-space: nowrap; cursor: pointer;
        }
        .cm-chip.is-on { border-color: currentColor; }

        .cm-error {
          padding: 10px 12px; border-radius: 8px;
          background: #F7E6EA; color: #C0392B;
          font-size: 12px; font-weight: 600; line-height: 1.4;
        }

        /* Centred 342px row: 141 Cancel + 10 + 191 Create. */
        .cm-actions { display: flex; justify-content: center; gap: 10px; }
        .cm-cancel, .cm-submit {
          height: 40px; border-radius: 8px;
          font-family: inherit; font-size: 16px; font-weight: 500; line-height: 20px; cursor: pointer;
        }
        .cm-cancel {
          width: 141px;
          background: #fff; border: 1px solid var(--w-maroon-l); color: var(--w-maroon-l);
        }
        .cm-submit {
          width: 191px;
          background: var(--w-maroon-l); border: none; color: #fff;
        }
        .cm-submit:hover { background: var(--w-maroon); }
        .cm-cancel:disabled, .cm-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        @media (max-width: 420px) {
          .cm-chips { grid-template-columns: minmax(0, 1fr); }
          .cm-actions { flex-direction: column-reverse; }
          .cm-cancel, .cm-submit { width: 100%; }
        }
      `}</style>
    </div>
  );
}
