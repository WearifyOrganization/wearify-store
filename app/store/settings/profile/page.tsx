"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@wearify/shared/api";
import { getToken } from "@/lib/phoneAuth";
import { cleanError } from "@/components/ui/toast";
import { IconChevronLeft } from "../../_components/StoreIcons";
import { useAuthUser } from "@/lib/useAuth";

/* Settings › Store profile — built to the Surface Pro 8 handoff. Panel 995x660:
   the 35px back square + SETTINGS / Store profile at 16, rule at 86, then two
   408-wide #FAF7F4 cards on the left (Hours, Owner) and Store details on the
   right, 21px apart. Save row bottom-right.

   Every field is the same block: a 12/500 lh20 label, 4px, then a 40px control
   on 1px #D9D9D9 at radius 8. Blocks sit 16px apart, paired controls 8px. */

export default function StoreProfilePage() {
  const router = useRouter();
  // Cached at login; re-read during render so there is no loading pass.
  const storeId = useAuthUser()?.storeId ?? null;
  const updateStore = useMutation(api.stores.update);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setStateVal] = useState("");
  const [address, setAddress] = useState("");
  const [pin, setPin] = useState("");
  const [area, setArea] = useState("");
  const [hours, setHours] = useState("");
  const [closedOn, setClosedOn] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [dirty, setDirty] = useState(false);

  const store = useQuery(
    api.stores.getStoreDetail,
    storeId ? { storeId, token: getToken() ?? undefined } : "skip",
  );

  useEffect(() => {
    if (!store || dirty) return;
    setName(store.name ?? "");
    setCity(store.city ?? "");
    setStateVal(store.state ?? "");
    setAddress(store.address ?? "");
    setPin(store.pin ?? "");
    setArea(store.area ?? "");
    setHours(store.hours ?? "");
    setClosedOn(store.closedOn ?? "");
    setOwnerName(store.ownerName ?? "");
    setOwnerEmail(store.ownerEmail ?? "");
    // The handoff's "Phone number" is the store's contact number — the same
    // field the notifications screen edits. There is no separate owner phone.
    setPhone((store.whatsappNumber ?? "").replace(/^\+?91[\s-]?/, ""));
  }, [store, dirty]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function bind(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      setDirty(true);
    };
  }

  async function handleSave() {
    if (!store) return;
    if (!name.trim()) { showToast("Store name is required"); return; }
    if (!city.trim()) { showToast("City is required"); return; }
    setSaving(true);
    try {
      const digits = phone.replace(/\D/g, "");
      await updateStore({
        token: getToken() ?? undefined,
        id: store._id,
        name: name.trim(),
        city: city.trim(),
        state: state.trim() || undefined,
        address: address.trim() || undefined,
        pin: pin.trim() || undefined,
        area: area.trim() || undefined,
        hours: hours.trim() || undefined,
        closedOn: closedOn.trim() || undefined,
        ownerName: ownerName.trim() || undefined,
        ownerEmail: ownerEmail.trim() || undefined,
        whatsappNumber: digits ? `+91 ${digits}` : undefined,
      });
      setDirty(false);
      showToast("Profile updated");
    } catch (e) {
      showToast(cleanError(e, "Failed to save"));
    } finally {
      setSaving(false);
    }
  }

  const loading = !storeId || store === undefined;

  return (
    <div className="sp">
      <div className="sp-panel">
        {/* ── Header ── */}
        <div className="sp-head">
          <button
            type="button"
            className="sp-back"
            onClick={() => router.push("/store/settings")}
            aria-label="Back to settings"
          >
            <IconChevronLeft />
          </button>
          <div className="sp-head-text">
            <span className="sp-eyebrow">Settings</span>
            <h1 className="sp-title">Store profile</h1>
          </div>
        </div>

        <div className="sp-rule" />

        {loading ? (
          <div className="sp-cols">
            <div className="sp-col">
              <div className="w-skeleton sp-sk" style={{ height: 138 }} />
              <div className="w-skeleton sp-sk" style={{ height: 217 }} />
            </div>
            <div className="w-skeleton sp-sk" style={{ height: 473 }} />
          </div>
        ) : (
          <>
            <div className="sp-cols">
              {/* ── Left ── */}
              <div className="sp-col">
                <section className="sp-card">
                  <h2 className="sp-card-title">Hours</h2>
                  <div className="sp-pair sp-pair--gap">
                    <label className="sp-field">
                      <span className="sp-label">Opening hours</span>
                      <input className="sp-input" value={hours} onChange={bind(setHours)} placeholder="10:00 AM - 9:00 PM" />
                    </label>
                    <label className="sp-field">
                      <span className="sp-label">Closed on</span>
                      <input className="sp-input" value={closedOn} onChange={bind(setClosedOn)} placeholder="e.g. Sunday" />
                    </label>
                  </div>
                </section>

                {/* The handoff titles this card "Hours" too — a copy of the one
                    above. It holds the owner's details, so it is named for them. */}
                <section className="sp-card">
                  <h2 className="sp-card-title">Owner</h2>
                  <div className="sp-pair sp-pair--gap">
                    <label className="sp-field">
                      <span className="sp-label">Owner name</span>
                      <input className="sp-input" value={ownerName} onChange={bind(setOwnerName)} placeholder="Smita Kabra" />
                    </label>
                    <label className="sp-field">
                      <span className="sp-label">Owner email</span>
                      <input className="sp-input" type="email" value={ownerEmail} onChange={bind(setOwnerEmail)} placeholder="owner@store.com" />
                    </label>
                  </div>

                  <label className="sp-field sp-field--gap">
                    <span className="sp-label">Phone number</span>
                    <span className="sp-phone">
                      <span className="sp-cc" aria-hidden>+91</span>
                      <input
                        className="sp-input sp-input--phone"
                        inputMode="numeric"
                        value={phone}
                        onChange={bind(setPhone)}
                        placeholder="7025896301"
                      />
                    </span>
                  </label>
                </section>
              </div>

              {/* ── Right ── */}
              <section className="sp-card sp-card--details">
                <h2 className="sp-card-title">Store details</h2>

                <label className="sp-field sp-field--gap">
                  <span className="sp-label">Store name*</span>
                  <input className="sp-input" value={name} onChange={bind(setName)} placeholder="e.g., Kanjivaram Bridal Silk" />
                </label>

                {/* The handoff labels both this and the field below
                    "Area / localty"; the tall one is the street address. */}
                <label className="sp-field sp-field--gap">
                  <span className="sp-label">Address</span>
                  <textarea className="sp-input sp-textarea" value={address} onChange={bind(setAddress)} placeholder="123 Fashion Street, Dadar" />
                </label>

                <div className="sp-pair sp-pair--gap">
                  <label className="sp-field">
                    <span className="sp-label">Area / locality</span>
                    <input className="sp-input" value={area} onChange={bind(setArea)} placeholder="Dadar" />
                  </label>
                  <label className="sp-field">
                    <span className="sp-label">PIN code</span>
                    <input className="sp-input" inputMode="numeric" value={pin} onChange={bind(setPin)} placeholder="400028" />
                  </label>
                </div>

                <div className="sp-pair sp-pair--gap">
                  <label className="sp-field">
                    <span className="sp-label">City</span>
                    <input className="sp-input" value={city} onChange={bind(setCity)} placeholder="Mumbai" />
                  </label>
                  <label className="sp-field">
                    <span className="sp-label">State</span>
                    <input className="sp-input" value={state} onChange={bind(setStateVal)} placeholder="Maharashtra" />
                  </label>
                </div>
              </section>
            </div>

            {/* ── Save row ── */}
            <div className="sp-foot">
              <span className="sp-status">{dirty ? "Unsaved changes" : "All changes saved"}</span>
              <button type="button" className="sp-save" onClick={handleSave} disabled={saving || !dirty}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </>
        )}
      </div>

      {toast && <div className="w-toast">{toast}</div>}

      <style jsx>{`
        .sp { color: #000; }
        .sp-panel { background: #fff; border-radius: 20px; padding: 16px 0 24px; }

        /* ── Header ───────────────────────────────────────────────── */
        .sp-head { display: flex; align-items: flex-start; gap: 16px; padding: 0 16px; }
        .sp-back {
          width: 35px; height: 35px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          color: var(--w-maroon-l); cursor: pointer;
        }
        .sp-back:hover { border-color: var(--w-maroon-l); }
        .sp-head-text { display: flex; flex-direction: column; min-width: 0; }
        .sp-eyebrow {
          font-size: 14px; font-weight: 500; line-height: 17px;
          text-transform: uppercase; color: #000;
        }
        .sp-title { margin-top: 8px; font-size: 24px; font-weight: 600; line-height: 29px; color: #000; }
        .sp-rule { height: 1px; margin: 16px 16px 0; background: #E9E9E9; }

        /* The handoff stops both columns 142px short of the panel edge while
           the save row runs the full width; spread so the two agree. */
        .sp-cols {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 21px; padding: 21px 16px 0; align-items: start;
        }
        .sp-col { display: flex; flex-direction: column; gap: 21px; min-width: 0; }
        .sp-sk { border-radius: 16px; }

        /* ── Card ─────────────────────────────────────────────────── */
        .sp-card { padding: 16px 33px 22px; background: #FAF7F4; border-radius: 16px; }
        .sp-card--details { padding-bottom: 69px; }
        .sp-card-title { font-size: 16px; font-weight: 600; line-height: 20px; color: #000; }

        /* ── Fields ───────────────────────────────────────────────── */
        .sp-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .sp-pair {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px; align-items: start;
        }
        .sp-field--gap, .sp-pair--gap { margin-top: 16px; }

        .sp-label { font-size: 12px; font-weight: 500; line-height: 20px; color: #000; }
        .sp-input {
          width: 100%; height: 40px; padding: 0 10px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          font-family: inherit; font-size: 14px; font-weight: 400; line-height: 20px;
          color: #000; outline: none;
        }
        .sp-input::placeholder { color: #9E9E9E; }
        .sp-input:focus { border-color: var(--w-maroon-l); }
        .sp-textarea { height: 95px; padding: 10px; resize: vertical; }

        /* +91 tile sits on the input's left edge, 1px proud top and bottom. */
        .sp-phone { position: relative; display: block; }
        .sp-cc {
          position: absolute; left: 0; top: -1px;
          width: 50.87px; height: 42px;
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--w-maroon-l); border-radius: 8px;
          font-size: 14px; font-weight: 400; line-height: 18px; color: #fff;
          pointer-events: none;
        }
        .sp-input--phone { padding-left: 61px; }

        /* ── Save row ─────────────────────────────────────────────── */
        .sp-foot {
          display: flex; align-items: center; justify-content: flex-end;
          gap: 13px; padding: 24px 16px 0;
        }
        .sp-status { font-size: 16px; font-weight: 500; line-height: 20px; color: var(--w-maroon-l); }
        .sp-save {
          width: 167px; height: 40px;
          background: var(--w-maroon-l); border: none; border-radius: 8px;
          font-family: inherit; font-size: 16px; font-weight: 500; line-height: 20px;
          color: #fff; cursor: pointer;
        }
        .sp-save:hover { background: var(--w-maroon); }
        .sp-save:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .sp-panel { border-radius: 16px; }
          .sp-title { font-size: 21px; }
          .sp-cols { grid-template-columns: minmax(0, 1fr); }
          .sp-card { padding-left: 20px; padding-right: 20px; }
          .sp-card--details { padding-bottom: 22px; }
        }
        @media (max-width: 520px) {
          .sp-pair { grid-template-columns: minmax(0, 1fr); gap: 0; }
          .sp-pair .sp-field + .sp-field { margin-top: 16px; }
          .sp-foot { flex-direction: column-reverse; align-items: stretch; }
          .sp-save { width: 100%; }
          .sp-status { text-align: center; }
        }
      `}</style>
    </div>
  );
}
