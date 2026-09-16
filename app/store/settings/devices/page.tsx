"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@wearify/shared/api";
import { Id } from "@wearify/shared/dataModel";
import { useToast, cleanError } from "@/components/ui/toast";
import { useAuthToken, useAuthUser } from "@/lib/useAuth";
import {
  IconChevronLeft, IconMirrorLg, IconTabletLg, IconCalendar, IconClock,
} from "../../_components/StoreIcons";

/* Settings › Devices — built to the Surface Pro 8 handoff. Panel 995x660:
   a 35px back square + SETTINGS / Devices / lead at 16, rule at 105, the
   CONNECTED · Paired devices label at 121, then a three-up grid of 300x197
   device cards from 182 with a 22px row gap.

   Each card: a 73px #F7E6EA tile with a 48px 2px-stroke glyph, type · label,
   serial, an Active tag, a hairline, the paired/last-seen pair split by a
   vertical rule, and a full-width outlined Revoke. The green 2px underline on
   the card is the handoff's active accent.

   The design draws no pairing flow, so that block sits below the grid — see
   the note there. */

function formatWhen(ts?: number) {
  if (!ts) return "—";
  const d = new Date(ts);
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} mins ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function formatDate(ts?: number) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function useCountdown(expiresAt: number | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const msLeft = expiresAt - now;
  if (msLeft <= 0) return { expired: true, label: "expired" };
  const s = Math.ceil(msLeft / 1000);
  return { expired: false, label: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` };
}

function isTablet(type?: string) {
  return (type || "").toUpperCase().includes("TABLET");
}

export default function StoreDevicesPage() {
  const router = useRouter();
  const [selectedDevice, setSelectedDevice] = useState("");
  const [issuedCode, setIssuedCode] = useState<{ code: string; expiresAt: number; label: string; pairingId: Id<"kioskPairings"> } | null>(null);
  const [generating, setGenerating] = useState(false);
  const toast = useToast();

  const storeId = useAuthUser()?.storeId ?? null;
  const sessionToken = useAuthToken();

  const devices = useQuery(
    api.kioskPairing.listDevicesForStore,
    storeId && sessionToken ? { storeId, sessionToken } : "skip",
  );

  const createCode = useMutation(api.kioskPairing.createPairingCode);
  const revokeDevice = useMutation(api.kioskPairing.revokeDevice);

  // Paired = currently active. Free = provisioned/unclaimed (incl. re-pairable
  // after a revoke) — the candidates a code can be issued for.
  const paired = useMemo(() => (devices ?? []).filter((d) => d.lifecycle === "ACTIVE"), [devices]);
  const free = useMemo(() => (devices ?? []).filter((d) => d.lifecycle !== "ACTIVE"), [devices]);

  const countdown = useCountdown(issuedCode?.expiresAt);

  // Watch the issued code's live status so the display flips to "paired" the
  // moment a device consumes it, instead of ticking down to a stale expiry.
  const codeStatus = useQuery(
    api.kioskPairing.getPairingCodeStatus,
    issuedCode && sessionToken ? { pairingId: issuedCode.pairingId, sessionToken } : "skip",
  );
  const codePaired = codeStatus?.status === "consumed";

  const handleGenerate = async () => {
    if (!storeId || !sessionToken) return;
    if (!selectedDevice) { toast("Pick a device to pair first", "error"); return; }
    setGenerating(true);
    try {
      const res = await createCode({ storeId, sessionToken, deviceId: selectedDevice });
      if (!res.ok) { toast(res.error, "error"); return; }
      setIssuedCode({ code: res.code, expiresAt: res.expiresAt, label: res.deviceLabel ?? "device", pairingId: res.pairingId });
    } catch (e) {
      toast(cleanError(e, "Failed to generate code"), "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (deviceId: string, deviceLabel?: string) => {
    if (!sessionToken) return;
    const label = deviceLabel || deviceId;
    if (!confirm(`Revoke "${label}"? The device will be logged out and must be re-paired to work again.`)) return;
    try {
      await revokeDevice({ deviceId, sessionToken });
      toast(`Revoked "${label}"`, "success");
    } catch (e) {
      toast(cleanError(e, "Failed to revoke"), "error");
    }
  };

  const loading = !storeId || devices === undefined;

  return (
    <div className="dv">
      <div className="dv-panel">
        {/* ── Header ── */}
        <div className="dv-head">
          <button
            type="button"
            className="dv-back"
            onClick={() => router.push("/store/settings")}
            aria-label="Back to settings"
          >
            <IconChevronLeft />
          </button>
          <div className="dv-head-text">
            <span className="dv-eyebrow">Settings</span>
            <h1 className="dv-title">Devices</h1>
            <p className="dv-lead">Pair your mirror &amp; tablets, revoke the ones you no longer trust.</p>
          </div>
        </div>

        <div className="dv-rule" />

        {/* ── Paired devices ── */}
        <div className="dv-sechead">
          <span className="dv-sec-eyebrow">Connected</span>
          <h2 className="dv-sec-title">Paired devices</h2>
        </div>

        <div className="dv-grid">
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div key={`sk-${i}`} className="w-skeleton dv-sk" />
          ))}

          {!loading && paired.length === 0 && (
            <div className="dv-empty">
              <p className="dv-empty-title">No devices paired yet</p>
              <p className="dv-empty-text">Generate a pairing code below to connect your first mirror or tablet.</p>
            </div>
          )}

          {!loading && paired.map((d) => (
            <article key={d._id} className="dv-card">
              <div className="dv-card-top">
                <span className="dv-tile">
                  {isTablet(d.type) ? <IconTabletLg /> : <IconMirrorLg />}
                </span>
                <div className="dv-card-text">
                  <p className="dv-name">
                    {d.type}
                    <span className="dv-dot" aria-hidden />
                    {d.deviceLabel || "Device"}
                  </p>
                  <p className="dv-serial">{d.serialNumber || d.deviceId}</p>
                  <span className="dv-tag">
                    <span className="dv-tag-dot" aria-hidden />
                    Active
                  </span>
                </div>
              </div>

              <div className="dv-card-rule" />

              <div className="dv-meta">
                <div className="dv-meta-cell">
                  <span className="dv-meta-icon"><IconCalendar size={16} /></span>
                  <span className="dv-meta-text">
                    <span className="dv-meta-k">Paired</span>
                    <span className="dv-meta-v">{formatDate(d.pairedAt)}</span>
                  </span>
                </div>
                <div className="dv-meta-cell">
                  <span className="dv-meta-icon"><IconClock /></span>
                  <span className="dv-meta-text">
                    <span className="dv-meta-k">Last Seen</span>
                    <span className="dv-meta-v">{formatWhen(d.lastSeenAt)}</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="dv-revoke"
                onClick={() => handleRevoke(d.deviceId, d.deviceLabel)}
              >
                Revoke
              </button>
            </article>
          ))}
        </div>

        {/* ── Beyond the handoff ────────────────────────────────────
           The design draws only the paired grid, but without the pairing
           flow no device can ever reach that grid. It keeps the same card
           language and sits under its own section label. */}
        {!loading && (
          <>
            <div className="dv-sechead dv-sechead--pair">
              <span className="dv-sec-eyebrow">Setup</span>
              <h2 className="dv-sec-title">Pair a device</h2>
            </div>

            <div className="dv-pair">
              {issuedCode && codePaired ? (
                <>
                  <p className="dv-pair-ok">
                    Pairing successful — {issuedCode.label} is now paired
                    {codeStatus?.status === "consumed" && codeStatus.serialNumber ? ` · ${codeStatus.serialNumber}` : ""}.
                  </p>
                  <button type="button" className="dv-revoke dv-pair-btn" onClick={() => setIssuedCode(null)}>
                    Done
                  </button>
                </>
              ) : free.length === 0 ? (
                <p className="dv-pair-text">
                  No devices available to pair. Every device provisioned to your store is already
                  paired. Contact Wearify to provision more hardware.
                </p>
              ) : (
                <>
                  <p className="dv-pair-text">
                    Pick the device you&rsquo;re setting up, then enter its serial and this code on the
                    device&rsquo;s setup screen. The code works only for that device.
                  </p>

                  <div className="dv-pair-row">
                    <select
                      className="dv-select"
                      value={selectedDevice}
                      onChange={(e) => { setSelectedDevice(e.target.value); setIssuedCode(null); }}
                      aria-label="Device to pair"
                    >
                      <option value="">Select a device…</option>
                      {free.map((d) => (
                        <option key={d._id} value={d.deviceId}>
                          {d.type} · {d.serialNumber || d.deviceId}{d.revokedAt ? " (re-pairable)" : ""}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="dv-generate"
                      onClick={handleGenerate}
                      disabled={generating || !selectedDevice}
                    >
                      {generating ? "Generating…" : issuedCode && !countdown?.expired ? "Regenerate code" : "Generate pairing code"}
                    </button>
                  </div>

                  {issuedCode && !countdown?.expired && (
                    <div className="dv-code">
                      <span className="dv-code-label">{issuedCode.label}</span>
                      <span className="dv-code-value">{issuedCode.code}</span>
                      <span className="dv-code-exp">Expires in {countdown?.label}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .dv { color: #000; }
        .dv-panel { background: #fff; border-radius: 20px; padding: 16px 0 26px; }

        /* ── Header ───────────────────────────────────────────────── */
        .dv-head { display: flex; align-items: flex-start; gap: 16px; padding: 0 16px; }
        .dv-back {
          width: 35px; height: 35px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          color: var(--w-maroon-l); cursor: pointer;
        }
        .dv-back:hover { border-color: var(--w-maroon-l); }
        .dv-head-text { display: flex; flex-direction: column; min-width: 0; }
        .dv-eyebrow {
          font-size: 14px; font-weight: 500; line-height: 17px;
          text-transform: uppercase; color: #000;
        }
        .dv-title { margin-top: 8px; font-size: 24px; font-weight: 600; line-height: 29px; color: #000; }
        .dv-lead {
          max-width: 513px; margin-top: 2px;
          font-size: 14px; font-weight: 400; line-height: 17px; color: #727272;
        }

        .dv-rule { height: 1px; margin: 16px 16px 0; background: #E9E9E9; }

        /* ── Section label ────────────────────────────────────────── */
        .dv-sechead { display: flex; flex-direction: column; gap: 8px; padding: 16px 16px 0; }
        .dv-sechead--pair { padding-top: 28px; }
        .dv-sec-eyebrow {
          font-size: 14px; font-weight: 500; line-height: 17px;
          text-transform: uppercase; color: var(--w-maroon-l);
        }
        .dv-sec-title { font-size: 16px; font-weight: 600; line-height: 20px; color: #727272; }

        /* ── Device grid ──────────────────────────────────────────── */
        .dv-grid {
          display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px 31.5px; padding: 16px 16px 0;
        }
        .dv-sk { height: 197px; border-radius: 10px; }
        .dv-empty { grid-column: 1 / -1; padding: 48px 12px; text-align: center; }
        .dv-empty-title { font-size: 16px; font-weight: 600; color: #000; }
        .dv-empty-text { margin-top: 4px; font-size: 13px; color: #727272; }

        .dv-card {
          min-height: 197px; padding: 10px;
          background: #fff;
          border: 1px solid #D9D9D9;
          border-bottom: 2px solid #27741E;
          border-radius: 10px;
        }
        .dv-card-top { display: flex; gap: 10px; }
        .dv-tile {
          width: 73px; height: 73px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          background: #F7E6EA; border-radius: 8px; color: var(--w-maroon-l);
        }
        .dv-card-text { display: flex; flex-direction: column; min-width: 0; flex: 1; padding-top: 2px; }
        .dv-name {
          display: flex; align-items: center; gap: 6px;
          font-size: 14px; font-weight: 600; line-height: 13px; color: #000;
          overflow: hidden; white-space: nowrap;
        }
        .dv-dot { width: 4px; height: 4px; flex-shrink: 0; border-radius: 50%; background: #000; }
        .dv-serial {
          margin-top: 8px;
          font-size: 10px; font-weight: 500; line-height: 13px; color: #727272;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .dv-tag {
          align-self: flex-start; margin-top: 16px;
          display: inline-flex; align-items: center; justify-content: center; gap: 5px;
          min-width: 50px; height: 20px; padding: 0 8px;
          background: #EDFFFA; border-radius: 4px;
          font-size: 10px; font-weight: 600; line-height: 13px; color: #014737;
        }
        .dv-tag-dot { width: 4px; height: 4px; border-radius: 50%; background: #014737; }

        .dv-card-rule { height: 1px; margin-top: 10px; background: #D9D9D9; }

        /* Paired / Last Seen, split by a centred vertical rule. */
        .dv-meta {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          margin-top: 10px;
        }
        .dv-meta-cell { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 0 9px; }
        .dv-meta-cell + .dv-meta-cell { border-left: 1px solid #D9D9D9; }
        .dv-meta-icon { display: inline-flex; flex-shrink: 0; color: #141B34; }
        .dv-meta-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .dv-meta-k { font-size: 10px; font-weight: 400; line-height: 13px; color: #727272; }
        .dv-meta-v {
          font-size: 10px; font-weight: 500; line-height: 13px; color: #000;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .dv-revoke {
          width: 100%; height: 40px; margin-top: 16px;
          background: #fff; border: 1px solid var(--w-maroon-l); border-radius: 8px;
          font-family: inherit; font-size: 16px; font-weight: 500; line-height: 20px;
          color: var(--w-maroon-l); cursor: pointer;
        }
        .dv-revoke:hover { background: #FAF2F0; }

        /* ── Pairing flow ─────────────────────────────────────────── */
        .dv-pair {
          margin: 16px 16px 0; padding: 16px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 10px;
        }
        .dv-pair-text { max-width: 640px; font-size: 13px; line-height: 1.55; color: #727272; }
        .dv-pair-ok { font-size: 13px; font-weight: 600; line-height: 1.55; color: #27741E; }
        .dv-pair-btn { max-width: 280px; }
        .dv-pair-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 14px; }
        .dv-select {
          flex: 1 1 260px; min-width: 0; height: 40px; padding: 0 12px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          font-family: inherit; font-size: 14px; color: #000; outline: none;
        }
        .dv-select:focus { border-color: var(--w-maroon-l); }
        .dv-generate {
          flex-shrink: 0; height: 40px; padding: 0 20px;
          background: var(--w-maroon-l); border: none; border-radius: 8px;
          font-family: inherit; font-size: 14px; font-weight: 500; color: #fff; cursor: pointer;
        }
        .dv-generate:hover { background: var(--w-maroon); }
        .dv-generate:disabled { opacity: 0.6; cursor: not-allowed; }

        .dv-code {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          margin-top: 14px; padding: 20px;
          background: #FAF7F4; border: 1px solid #D9D9D9; border-radius: 10px;
        }
        .dv-code-label {
          font-size: 12px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--w-maroon-l);
        }
        .dv-code-value {
          font-family: var(--w-font-num), inherit;
          font-size: 34px; font-weight: 700; letter-spacing: 0.28em; color: #000;
        }
        .dv-code-exp { font-size: 12px; color: #727272; }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 1100px) {
          .dv-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 900px) {
          .dv-panel { border-radius: 16px; }
          .dv-title { font-size: 21px; }
        }
        @media (max-width: 620px) {
          .dv-grid { grid-template-columns: minmax(0, 1fr); }
          .dv-pair-row { flex-direction: column; }
          .dv-generate { width: 100%; }
        }
      `}</style>
    </div>
  );
}
