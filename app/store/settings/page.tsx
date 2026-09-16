"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@wearify/shared/api";
import { getToken } from "@/lib/phoneAuth";
import { useUploadFile } from "@/lib/useUpload";
import { GUARDS } from "@/lib/uploadGuards";
import { useToast, cleanError } from "@/components/ui/toast";
import {
  IconBackChevron, IconRowChevron, IconPin, IconHours, IconCall, IconEdit,
  IconWa, IconMail01, IconChatBubble, IconPinLg, IconUsers, IconTabletRow,
  IconBellRow, IconLink, IconSupport,
} from "../_components/AccountIcons";
import { useAuthUser } from "@/lib/useAuth";

/* Settings › Account — built to the Surface Pro 8 handoff. Panel 995 wide:
   the 35px back square + SETTINGS / Account at 16, rule at 86, then two 399
   columns from 102 with a 130px gutter.

   Left  — store identity (73px logo, Active + plan tags, address/hours/contact,
           Edit Profile), the three notification channels, and System.
   Right — Plans, the Manage list, and Support.

   Every glyph comes from public/store/account/ (see _components/AccountIcons),
   each tinted the colour the fragment ships with. */

type ToggleField = "notifyWhatsApp" | "notifyEmail" | "notifySms";

const CHANNELS: Array<{ field: ToggleField; title: string; desc: string; tile: string; Icon: React.FC<{ size?: number }> }> = [
  { field: "notifyWhatsApp", title: "WhatsApp Alerts", desc: "Order updates and customer messages", tile: "#F9E9E9", Icon: IconWa },
  { field: "notifyEmail", title: "Email digests", desc: "Daily and weekly summary report", tile: "#FDF6EA", Icon: IconMail01 },
  { field: "notifySms", title: "SMS alerts", desc: "Critical stock and session alerts", tile: "#F6F1FB", Icon: IconChatBubble },
];

const MANAGE: Array<{ label: string; desc: string; href?: string; tile: string; Icon: React.FC<{ size?: number }>; soon?: boolean }> = [
  { label: "Store profile", desc: "Address, hours and owner contact", href: "/store/settings/profile", tile: "#F9E9E9", Icon: IconPinLg },
  { label: "Staff & roles", desc: "Manage team members and permissions", href: "/store/staff", tile: "#FDF6EA", Icon: IconUsers },
  { label: "Devices", desc: "Pair and manage your mirrors & tablets", href: "/store/settings/devices", tile: "#F6F1FB", Icon: IconTabletRow },
  { label: "Notification", desc: "Alert channels and WhatsApp number", href: "/store/settings/notifications", tile: "#FDF6EA", Icon: IconBellRow },
  { label: "Campaigns", desc: "WhatsApp, SMS and email broadcasts", href: "/store/campaigns", tile: "#F9E9E9", Icon: IconChatBubble },
  { label: "Connected apps", desc: "WhatsApp, POS and integrations", tile: "#D9D9D9", Icon: IconLink, soon: true },
];

export default function SettingsPage() {
  const router = useRouter();
  // Cached at login; re-read during render so there is no loading pass.
  const storeId = useAuthUser()?.storeId ?? null;

  const updateStore = useMutation(api.stores.update);
  const toast = useToast();

  const store = useQuery(
    api.stores.getStoreDetail,
    storeId ? { storeId, token: getToken() ?? undefined } : "skip",
  );
  const logoUrl = useQuery(
    api.files.getUrl,
    store?.logoFileId ? { fileId: store.logoFileId } : "skip",
  );

  const { upload } = useUploadFile();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  async function handleLogoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !store) return;
    setLogoUploading(true);
    try {
      const fileId = await upload(file, GUARDS.storeLogo, { token: getToken() ?? undefined });
      await updateStore({ token: getToken() ?? undefined, id: store._id, logoFileId: fileId });
    } catch (err: unknown) {
      toast(cleanError(err, "Upload failed"), "error");
    } finally { setLogoUploading(false); }
  }

  async function toggleNotif(field: ToggleField) {
    if (!store) return;
    try {
      await updateStore({ token: getToken() ?? undefined, id: store._id, [field]: !store[field] });
    } catch (err) {
      toast(cleanError(err, "Failed to update notification setting"), "error");
    }
  }

  async function toggleEssentialMode() {
    if (!store) return;
    try {
      await updateStore({ token: getToken() ?? undefined, id: store._id, essentialMode: !store.essentialMode });
    } catch (err) {
      toast(cleanError(err, "Failed to update Essential Mode"), "error");
    }
  }

  const loading = !storeId || store === undefined;

  const planName = store?.subscriptionPlan || store?.plan || "No plan";
  const mrr = store?.mrr ?? null;
  const nextBilling = store?.nextBillingDate
    ? new Date(store.nextBillingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Not scheduled";
  const place = [store?.city, store?.state].filter(Boolean).join(", ") || "Location not set";
  const initial = (store?.name ?? "S").charAt(0).toUpperCase();

  return (
    <div className="ac">
      <div className="ac-panel">
        {/* ── Header ── */}
        <div className="ac-head">
          <button type="button" className="ac-back" onClick={() => router.back()} aria-label="Back">
            <IconBackChevron />
          </button>
          <div className="ac-head-text">
            <span className="ac-eyebrow">Settings</span>
            <h1 className="ac-title">Account</h1>
          </div>
        </div>

        <div className="ac-rule" />

        <div className="ac-cols">
          {/* ════ LEFT ════════════════════════════════════════════ */}
          <div className="ac-col">
            {/* Identity */}
            <section className="ac-card">
              <div className="ac-id">
                <button
                  type="button"
                  className="ac-logo"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  aria-label={logoUrl ? "Change store logo" : "Upload store logo"}
                >
                  {logoUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={logoUrl} alt="" className="ac-logo-img" />
                    : <span className="ac-logo-letter">{initial}</span>}
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" className="ac-file" onChange={handleLogoPick} />

                <div className="ac-id-text">
                  <p className="ac-name">{store?.name || "My Store"}</p>
                  <p className="ac-place">{place}</p>
                  <span className="ac-tags">
                    <span className="ac-tag ac-tag--ok">
                      <span className="ac-tag-dot" aria-hidden />
                      {store?.status || "active"}
                    </span>
                    <span className="ac-tag ac-tag--plan">
                      <span className="ac-tag-dot" aria-hidden />
                      {planName}
                    </span>
                  </span>
                </div>
              </div>

              <div className="ac-facts">
                <p className="ac-fact"><IconPin />{store?.address || "Address not set"}</p>
                <p className="ac-fact"><IconHours />{store?.hours || "Hours not set"}</p>
                <p className="ac-fact"><IconCall />{store?.ownerEmail || store?.whatsappNumber || "Contact not set"}</p>
              </div>

              <button type="button" className="ac-edit" onClick={() => router.push("/store/settings/profile")}>
                Edit Profile
                <IconEdit />
              </button>
            </section>

            {/* Channels */}
            <section className="ac-card">
              <h2 className="ac-card-title">Channels</h2>
              <div className="ac-list">
                {CHANNELS.map(({ field, title, desc, tile, Icon }) => (
                  <label key={field} className="ac-row">
                    <span className="ac-tile" style={{ background: tile }}><Icon /></span>
                    <span className="ac-row-text">
                      <span className="ac-row-title">{title}</span>
                      <span className="ac-row-sub">{desc}</span>
                    </span>
                    <input
                      type="checkbox"
                      className="ac-check"
                      checked={!!store?.[field]}
                      disabled={loading}
                      onChange={() => toggleNotif(field)}
                      aria-label={title}
                    />
                    <span className="ac-toggle" aria-hidden><span className="ac-knob" /></span>
                  </label>
                ))}
              </div>
            </section>

            {/* System */}
            <section className="ac-card">
              <h2 className="ac-card-title">System</h2>
              <div className="ac-list ac-list--one">
                <label className="ac-row">
                  <span className="ac-tile" style={{ background: "#FDF6EA" }}><IconBellRow /></span>
                  <span className="ac-row-text">
                    <span className="ac-row-title">Essential Mode</span>
                    <span className="ac-row-sub">Lightweight interface for slow connections</span>
                  </span>
                  <input
                    type="checkbox"
                    className="ac-check"
                    checked={!!store?.essentialMode}
                    disabled={loading}
                    onChange={toggleEssentialMode}
                    aria-label="Essential Mode"
                  />
                  <span className="ac-toggle" aria-hidden><span className="ac-knob" /></span>
                </label>
              </div>
            </section>
          </div>

          {/* ════ RIGHT ═══════════════════════════════════════════ */}
          <div className="ac-col">
            {/* Plans */}
            <section className="ac-card ac-card--plans">
              <h2 className="ac-plans-title">Plans</h2>
              <div className="ac-plan-body">
                <div className="ac-plan-row">
                  <span className="ac-plan-left">
                    <span className="ac-plan-eyebrow">Current Plan</span>
                    <span className="ac-plan-name">{planName}</span>
                  </span>
                  <span className="ac-plan-price">
                    <span className="ac-price">{mrr !== null ? `₹${mrr.toLocaleString("en-IN")}` : "—"}</span>
                    <span className="ac-cycle">/monthly</span>
                  </span>
                </div>
                <div className="ac-plan-foot">
                  <span className="ac-next">Next billing: <strong>{nextBilling}</strong></span>
                  <button type="button" className="ac-upgrade" onClick={() => router.push("/store/settings/billing")}>
                    Upgrade
                  </button>
                </div>
              </div>
            </section>

            {/* Manage */}
            <section className="ac-card">
              <h2 className="ac-card-title">Manage</h2>
              <div className="ac-list">
                {MANAGE.map(({ label, desc, href, tile, Icon, soon }) => {
                  const inner = (
                    <>
                      <span className="ac-tile" style={{ background: tile }}><Icon /></span>
                      <span className="ac-row-text">
                        <span className="ac-row-title">{label}</span>
                        <span className="ac-row-sub">{desc}</span>
                      </span>
                      {soon
                        ? <span className="ac-soon">soon</span>
                        : <span className="ac-chev" aria-hidden><IconRowChevron /></span>}
                    </>
                  );
                  if (soon || !href) {
                    return <div key={label} className="ac-row ac-row--off">{inner}</div>;
                  }
                  return (
                    <button key={label} type="button" className="ac-row" onClick={() => router.push(href)}>
                      {inner}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Support */}
            <section className="ac-card">
              <h2 className="ac-card-title">Help</h2>
              <div className="ac-list ac-list--one">
                <div className="ac-row ac-row--off">
                  <span className="ac-tile" style={{ background: "#D9D9D9" }}><IconSupport /></span>
                  <span className="ac-row-text">
                    <span className="ac-row-title">Support</span>
                    <span className="ac-row-sub">Help centre, FAQs and raise a ticket</span>
                  </span>
                  <span className="ac-soon">soon</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <p className="ac-version">Wearify Retailer · v4.0 · Phygify Technoservices Pvt. Ltd.</p>
      </div>

      <style jsx>{`
        .ac { color: #000; }
        .ac-panel { background: #fff; border-radius: 20px; padding: 16px 0 26px; }

        /* ── Header ───────────────────────────────────────────────── */
        .ac-head { display: flex; align-items: flex-start; gap: 16px; padding: 0 16px; }
        .ac-back {
          width: 35px; height: 35px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px; cursor: pointer;
        }
        .ac-back:hover { border-color: var(--w-maroon-l); }
        .ac-head-text { display: flex; flex-direction: column; min-width: 0; }
        .ac-eyebrow {
          font-size: 14px; font-weight: 500; line-height: 17px;
          text-transform: uppercase; color: #000;
        }
        .ac-title { margin-top: 8px; font-size: 24px; font-weight: 600; line-height: 29px; color: #000; }
        .ac-rule { height: 1px; margin: 16px 16px 0; background: #E9E9E9; }

        /* The handoff's 130px gutter, with the columns spread to the panel. */
        .ac-cols {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 130px; padding: 16px 16px 0; align-items: start;
        }
        .ac-col { display: flex; flex-direction: column; gap: 21px; min-width: 0; }

        /* ── Card ─────────────────────────────────────────────────── */
        .ac-card {
          background: #fff;
          border: 0.81px solid #F3F6F7;
          border-radius: 10px;
          box-shadow: 0 1.575px 2.363px rgba(16, 16, 16, 0.16),
                      inset 0 -3.15px 3.15px rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(1.97px);
        }
        .ac-card-title {
          display: block; height: 46px; padding: 11.5px 16.2px 11.5px 19.44px;
          border-bottom: 1px solid #D9D9D9;
          font-size: 16px; font-weight: 600; line-height: 23px; color: #161922;
        }

        /* ── Identity ─────────────────────────────────────────────── */
        .ac-id {
          display: flex; align-items: flex-start; gap: 20px;
          padding: 28px 19px 28px 19px;
          border-bottom: 1px solid #D9D9D9;
        }
        .ac-logo {
          width: 73px; height: 73px; flex-shrink: 0; padding: 0; overflow: hidden;
          display: inline-flex; align-items: center; justify-content: center;
          border: none; border-radius: 8px; cursor: pointer;
          background: linear-gradient(135deg, var(--w-maroon), var(--w-maroon-l));
        }
        .ac-logo:disabled { cursor: wait; }
        .ac-logo-img { width: 100%; height: 100%; object-fit: cover; }
        .ac-logo-letter { font-size: 28px; font-weight: 700; color: #F6CBB7; }
        .ac-file { display: none; }

        .ac-id-text { display: flex; flex-direction: column; min-width: 0; padding-top: 2px; }
        .ac-name {
          font-size: 14px; font-weight: 600; line-height: 13px; color: #000;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ac-place {
          margin-top: 8px;
          font-size: 10px; font-weight: 500; line-height: 13px; color: #727272;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ac-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .ac-tag {
          display: inline-flex; align-items: center; justify-content: center; gap: 5px;
          height: 20px; padding: 0 8px; border-radius: 4px;
          font-size: 10px; font-weight: 600; line-height: 13px;
          text-transform: capitalize; white-space: nowrap;
        }
        .ac-tag-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
        .ac-tag--ok { background: #EDFFFA; color: #014737; }
        .ac-tag--plan { background: #F6CBB7; color: #68262A; }

        .ac-facts { display: flex; flex-direction: column; gap: 8px; padding: 16px 19px 0; }
        .ac-fact {
          display: flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 500; line-height: 16px; color: #727272;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ac-fact :global(svg) { flex-shrink: 0; }

        .ac-edit {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          height: 36px; padding: 0 14px; margin: 16px 19px 19px;
          background: var(--w-maroon-l); border: 1px solid #fff; border-radius: 10px;
          font-family: inherit; font-size: 12px; font-weight: 600; line-height: 13px;
          color: #fff; cursor: pointer;
        }
        .ac-edit:hover { background: var(--w-maroon); }

        /* ── Row lists ────────────────────────────────────────────── */
        .ac-list {
          margin: 16px 19px 26px;
          background: #fff; border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .ac-list--one { box-shadow: none; border: 0.5px solid rgba(135, 135, 135, 0.8); }

        .ac-row {
          position: relative; width: 100%;
          display: flex; align-items: center; gap: 8px;
          min-height: 70px; padding: 10px;
          background: none; border: none; text-align: left;
          font-family: inherit; cursor: pointer;
        }
        .ac-row + .ac-row { border-top: 0.5px solid rgba(135, 135, 135, 0.8); }
        .ac-row--off { cursor: default; }
        .ac-row:not(.ac-row--off):hover { background: #FAF7F4; }
        .ac-list--one .ac-row { min-height: 86px; }

        .ac-tile {
          width: 40px; height: 40px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 10px;
        }
        .ac-row-text { display: flex; flex-direction: column; gap: 7px; min-width: 0; flex: 1; }
        .ac-row-title { font-size: 14px; font-weight: 600; line-height: 17px; color: #000; }
        .ac-row-sub {
          font-size: 10px; font-weight: 500; line-height: 12px; color: rgba(0, 0, 0, 0.6);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ac-chev { display: inline-flex; flex-shrink: 0; padding-right: 8px; }
        .ac-soon {
          flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 62px; height: 27px; padding: 0 10px;
          background: #D9D9D9; border: 0.5px solid #727272; border-radius: 8px;
          font-size: 12px; font-weight: 400; line-height: 18px; letter-spacing: -0.023em;
          color: #727272;
        }

        /* Toggle: the real input drives state, the painted track sits over it. */
        .ac-check {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          width: 44px; height: 24px; margin: 0; opacity: 0; cursor: inherit; z-index: 1;
        }
        .ac-toggle {
          position: relative; width: 44px; height: 24px; flex-shrink: 0;
          border-radius: 100px; background: #D9D9D9;
          transition: background 0.18s var(--w-ease);
        }
        .ac-knob {
          position: absolute; top: 3px; left: 3px; width: 18px; height: 18px;
          border-radius: 100px; background: #fff;
          transition: transform 0.18s var(--w-ease);
        }
        .ac-check:checked ~ .ac-toggle { background: var(--w-maroon-l); }
        .ac-check:checked ~ .ac-toggle .ac-knob { transform: translateX(20px); }
        .ac-check:focus-visible ~ .ac-toggle { outline: 2px solid var(--w-maroon-l); outline-offset: 2px; }

        /* ── Plans ────────────────────────────────────────────────── */
        .ac-card--plans { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }
        .ac-plans-title {
          display: block; height: 40px; padding: 8.5px 16px;
          border-bottom: 1px solid #D9D9D9;
          font-size: 12px; font-weight: 600; line-height: 23px;
          text-transform: uppercase; color: var(--w-maroon-l);
        }
        .ac-plan-body { padding: 13px 16px 16px; }
        .ac-plan-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .ac-plan-left { display: flex; flex-direction: column; min-width: 0; }
        .ac-plan-eyebrow { font-size: 10px; font-weight: 500; font-style: italic; line-height: 20px; color: #727272; }
        .ac-plan-name { font-size: 16px; font-weight: 500; line-height: 20px; color: #000; }
        .ac-plan-price { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
        .ac-price { font-size: 16px; font-weight: 600; line-height: 20px; color: var(--w-maroon-l); }
        .ac-cycle { font-size: 16px; font-weight: 400; line-height: 20px; color: #727272; }

        .ac-plan-foot {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap; margin-top: 16px;
        }
        .ac-next { font-size: 12px; font-weight: 500; color: #727272; }
        .ac-next :global(strong) { color: #000; font-weight: 600; }
        .ac-upgrade {
          height: 32px; padding: 0 16px;
          background: var(--w-maroon-l); border: none; border-radius: 8px;
          font-family: inherit; font-size: 12px; font-weight: 500; color: #fff; cursor: pointer;
        }
        .ac-upgrade:hover { background: var(--w-maroon); }

        .ac-version {
          padding: 26px 16px 0; text-align: center;
          font-size: 10px; letter-spacing: 0.04em; color: #9E9E9E;
        }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 1180px) {
          .ac-cols { gap: 40px; }
        }
        @media (max-width: 900px) {
          .ac-panel { border-radius: 16px; }
          .ac-title { font-size: 21px; }
          .ac-cols { grid-template-columns: minmax(0, 1fr); gap: 21px; }
        }
        @media (max-width: 520px) {
          .ac-id { flex-direction: column; gap: 14px; }
          .ac-list { margin-left: 12px; margin-right: 12px; }
        }
      `}</style>
    </div>
  );
}
