"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@wearify/shared/api";
import { getToken } from "@/lib/phoneAuth";
import { cleanError } from "@/components/ui/toast";
import { useAuthUser } from "@/lib/useAuth";

/* Settings › Notifications — built to the Surface Pro 8 handoff. Panel 995x660:
   title rule at 71, the lead paragraph at 87, then two cards at 143 — Channels
   (463 wide) and WhatsApp business number (379), 45px apart.

   Channels holds an inset 361x210 white list with three 70px rows: a 40x40
   tinted tile, title + subtitle, and a 44x24 maroon toggle with an 18px knob. */

type ToggleField = "notifyWhatsApp" | "notifyEmail" | "notifySms";

/* Tile fills, in the order the handoff lists the channels. */
const TILE = ["#F9E9E9", "#FDF6EA", "#F6F1FB"];

export default function NotificationsPage() {
  // Cached at login; re-read during render so there is no loading pass.
  const storeId = useAuthUser()?.storeId ?? null;
  const updateStore = useMutation(api.stores.update);

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappNumberDirty, setWhatsappNumberDirty] = useState(false);
  const [savingNumber, setSavingNumber] = useState(false);
  const [toast, setToast] = useState("");

  const store = useQuery(
    api.stores.getStoreDetail,
    storeId ? { storeId, token: getToken() ?? undefined } : "skip",
  );

  useEffect(() => {
    if (!store || whatsappNumberDirty) return;
    setWhatsappNumber(store.whatsappNumber ?? "");
  }, [store, whatsappNumberDirty]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function toggle(field: ToggleField) {
    if (!store) return;
    try {
      await updateStore({ token: getToken() ?? undefined, id: store._id, [field]: !store[field] });
    } catch (e) {
      showToast(cleanError(e, "Failed to update"));
    }
  }

  async function saveWhatsappNumber() {
    if (!store) return;
    setSavingNumber(true);
    try {
      const num = whatsappNumber.trim();
      await updateStore({ token: getToken() ?? undefined, id: store._id, whatsappNumber: num || undefined });
      setWhatsappNumberDirty(false);
      showToast("WhatsApp number saved");
    } catch (e) {
      showToast(cleanError(e, "Failed to save"));
    } finally {
      setSavingNumber(false);
    }
  }

  const loading = !storeId || store === undefined;

  const CHANNELS: Array<{ field: ToggleField; title: string; sub: string; disabled?: boolean }> = [
    {
      field: "notifyWhatsApp",
      title: "WhatsApp",
      sub: "Instant alerts on your business WhatsApp",
    },
    {
      field: "notifyEmail",
      title: "Email",
      sub: store?.ownerEmail || "Set owner email in Store Profile",
      disabled: !store?.ownerEmail,
    },
    {
      field: "notifySms",
      title: "SMS",
      sub: store?.ownerPhone || "SMS to registered phone",
    },
  ];

  return (
    <div className="nt">
      <div className="nt-panel">
        <h1 className="nt-title">Notifications</h1>
        <div className="nt-rule" />

        <p className="nt-lead">
          Choose how Wearify contacts you about session alerts, low stock, pending approvals, and account
        </p>

        <div className="nt-grid">
          {/* ── Channels ── */}
          <section className="nt-card">
            <h2 className="nt-card-title">Channels</h2>

            <div className="nt-list">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={`sk-${i}`} className="nt-row">
                      <span className="w-skeleton nt-tile" />
                      <span className="nt-row-text">
                        <span className="w-skeleton nt-sk-line" />
                        <span className="w-skeleton nt-sk-sub" />
                      </span>
                    </div>
                  ))
                : CHANNELS.map(({ field, title, sub, disabled }, i) => (
                    <label key={field} className={`nt-row${disabled ? " is-off" : ""}`}>
                      <span className="nt-tile" style={{ background: TILE[i] }} aria-hidden />
                      <span className="nt-row-text">
                        <span className="nt-row-title">{title}</span>
                        <span className="nt-row-sub">{sub}</span>
                      </span>
                      <input
                        type="checkbox"
                        className="nt-check"
                        checked={!!store?.[field]}
                        disabled={disabled}
                        onChange={() => toggle(field)}
                        aria-label={`Toggle ${title} notifications`}
                      />
                      <span className="nt-toggle" aria-hidden><span className="nt-knob" /></span>
                    </label>
                  ))}
            </div>
          </section>

          {/* ── WhatsApp business number ── */}
          <section className="nt-card">
            <h2 className="nt-card-title">WhatsApp business number</h2>

            <p className="nt-hint">
              {loading
                ? " "
                : !store?.notifyWhatsApp
                  ? "Turn on the WhatsApp channel to set the number that receives alerts."
                  : store.whatsappVerified
                    ? "Verified — messages will be sent to this number."
                    : "Pending verification. Ops will confirm within 24h."}
            </p>

            {!loading && store?.notifyWhatsApp && (
              <div className="nt-warow">
                <input
                  className="nt-input"
                  value={whatsappNumber}
                  onChange={(e) => { setWhatsappNumber(e.target.value); setWhatsappNumberDirty(true); }}
                  placeholder="+91-00000 00000"
                  aria-label="WhatsApp business number"
                />
                <button
                  type="button"
                  className="nt-save"
                  onClick={saveWhatsappNumber}
                  disabled={savingNumber || !whatsappNumberDirty}
                >
                  {savingNumber ? "Saving…" : "Save number"}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {toast && <div className="w-toast">{toast}</div>}

      <style jsx>{`
        .nt { color: #000; }
        .nt-panel { background: #fff; border-radius: 20px; padding: 21px 0 26px; }
        .nt-title { padding: 0 24px; font-size: 24px; font-weight: 600; line-height: 29px; }
        .nt-rule { height: 1px; margin: 21px 25px 0 26px; background: #E9E9E9; }
        .nt-lead {
          max-width: 513px; padding: 0 25px 0 26px; margin-top: 16px;
          font-size: 16px; font-weight: 400; line-height: 20px; color: #000;
        }

        /* The handoff stops both cards 82px short of the panel edge; they are
           spread to the content width here, keeping the 463:379 proportion. */
        .nt-grid {
          display: grid;
          grid-template-columns: minmax(0, 463fr) minmax(0, 379fr);
          gap: 45px;
          padding: 36px 25px 0 26px;
          align-items: start;
        }

        /* ── Section card ("Session" in the handoff) ──────────────── */
        .nt-card {
          min-height: 315px;
          background: #fff;
          border: 0.81px solid #F3F6F7;
          border-radius: 10px;
          box-shadow: 0 1.575px 2.363px rgba(16, 16, 16, 0.16),
                      inset 0 -3.15px 3.15px rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(1.97px);
        }
        .nt-card-title {
          display: block; height: 46px; padding: 11.5px 16.2px 11.5px 19.44px;
          font-size: 16px; font-weight: 600; line-height: 23px; color: #161922;
        }

        /* ── Channel list ─────────────────────────────────────────── */
        .nt-list {
          margin: 21px 19px 38px;
          background: #fff; border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .nt-row {
          position: relative;
          display: flex; align-items: center; gap: 8px;
          height: 70px; padding: 0 10px;
          cursor: pointer;
        }
        .nt-row + .nt-row { border-top: 0.5px solid rgba(135, 135, 135, 0.8); }
        .nt-row.is-off { cursor: not-allowed; opacity: 0.55; }

        .nt-tile { width: 40px; height: 40px; flex-shrink: 0; border-radius: 10px; }
        .nt-row-text { display: flex; flex-direction: column; gap: 7px; min-width: 0; flex: 1; }
        .nt-row-title { font-size: 14px; font-weight: 600; line-height: 17px; color: #000; }
        .nt-row-sub {
          font-size: 10px; font-weight: 500; line-height: 12px; color: rgba(0, 0, 0, 0.6);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .nt-sk-line { width: 90px; height: 14px; border-radius: 4px; }
        .nt-sk-sub { width: 160px; height: 10px; border-radius: 4px; }

        /* The real input drives state and keeps the control keyboard-operable;
           the painted track sits on top of it. */
        .nt-check {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          width: 44px; height: 24px; margin: 0;
          opacity: 0; cursor: inherit; z-index: 1;
        }
        .nt-toggle {
          position: relative; width: 44px; height: 24px; flex-shrink: 0;
          border-radius: 100px; background: #D9D9D9;
          transition: background 0.18s var(--w-ease);
        }
        .nt-knob {
          position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px;
          border-radius: 100px; background: #fff;
          transition: transform 0.18s var(--w-ease);
        }
        .nt-check:checked ~ .nt-toggle { background: var(--w-maroon-l); }
        .nt-check:checked ~ .nt-toggle .nt-knob { transform: translateX(20px); }
        .nt-check:focus-visible ~ .nt-toggle { outline: 2px solid var(--w-maroon-l); outline-offset: 2px; }

        /* ── WhatsApp number ──────────────────────────────────────── */
        .nt-hint {
          padding: 7px 19px 0;
          font-size: 12px; font-weight: 500; line-height: 23px; color: #161922;
        }
        .nt-warow { display: flex; gap: 13.25px; margin: 12px 19px 0; }
        .nt-input {
          flex: 1; min-width: 0; height: 40px; padding: 0 12px;
          background: #fff; border: 1px solid var(--w-maroon-l); border-radius: 8px;
          font-family: inherit; font-size: 12px; font-weight: 500; line-height: 15px;
          color: var(--w-maroon-l); text-align: center; outline: none;
        }
        .nt-input::placeholder { color: var(--w-maroon-l); opacity: 0.75; }
        .nt-save {
          width: 138.89px; flex-shrink: 0; height: 40px;
          background: var(--w-maroon-l); border: none; border-radius: 8px;
          font-family: inherit; font-size: 12px; font-weight: 500; line-height: 15px;
          color: #fff; cursor: pointer;
        }
        .nt-save:hover { background: var(--w-maroon); }
        .nt-save:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .nt-panel { border-radius: 16px; padding: 18px 0 22px; }
          .nt-title { padding: 0 18px; font-size: 21px; }
          .nt-rule { margin-left: 18px; margin-right: 18px; }
          .nt-lead, .nt-grid { padding-left: 18px; padding-right: 18px; }
          .nt-grid { grid-template-columns: minmax(0, 1fr); gap: 18px; padding-top: 24px; }
          .nt-card { min-height: 0; }
          .nt-list { margin-bottom: 21px; }
        }
        @media (max-width: 480px) {
          .nt-warow { flex-direction: column; }
          .nt-save { width: 100%; }
        }
      `}</style>
    </div>
  );
}
