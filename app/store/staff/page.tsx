"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@wearify/shared/api";
import { Id } from "@wearify/shared/dataModel";
import { getToken } from "@/lib/phoneAuth";
import { cleanError, convexErrorCode } from "@/components/ui/toast";
import { IconPlus, IconTrash, IconClose } from "../_components/StoreIcons";
import { useAuthUser } from "@/lib/useAuth";

/* Team — built to the Surface Pro 8 handoff. Panel 995x660: title rule at 71,
   the "Staff & Role" subhead at 92, four outlined 210.51x70 role counters at
   137, then the 946-wide table card at 228 with a maroon 46px header row.

   Columns are the handoff's 200/150/150/100/100/100 on a 914px inner table —
   they sum to 800, and the leftover 114 is where the delete button sits
   (18px, 43px off the right edge). Widths are percentages so they hold. */

/* Only the Salesperson (#F7E6EA on #68262A) and Manager (#F0E7F5 on #8E4893)
   tags are specified; Owner follows the same recipe from the module palette. */
const ROLE_MAP: Record<string, { label: string; bg: string; fg: string }> = {
  R03: { label: "Owner", bg: "#ECF3ED", fg: "#27741E" },
  R04: { label: "Manager", bg: "#F0E7F5", fg: "#8E4893" },
  R05: { label: "Salesperson", bg: "#F7E6EA", fg: "#68262A" },
};

function roleInfo(role: string) {
  return ROLE_MAP[role] ?? { label: role, bg: "#F9F3E4", fg: "#7A5B12" };
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function StaffPage() {
  // Cached at login; re-read during render so there is no loading pass.
  const storeId = useAuthUser()?.storeId ?? null;
  const [showForm, setShowForm] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<Id<"staff"> | null>(null);
  const [toast, setToast] = useState("");
  const removeStaff = useMutation(api.stores.removeStaff);

  const staff = useQuery(
    api.stores.listStaffByStore,
    storeId ? { storeId, token: getToken() ?? undefined } : "skip",
  );

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleRemove(id: Id<"staff">) {
    try {
      await removeStaff({ token: getToken() ?? undefined, id });
      setConfirmRemove(null);
      showToast("Staff removed");
    } catch (e) {
      showToast(cleanError(e, "Failed to remove staff"));
    }
  }

  const removingMember = staff?.find((s) => s._id === confirmRemove) ?? null;
  const loading = staff === undefined;
  const all = staff ?? [];

  const STATS = [
    { label: "Team Member", value: all.length },
    { label: "Owners", value: all.filter((s) => s.role === "R03").length },
    { label: "Manager", value: all.filter((s) => s.role === "R04").length },
    { label: "Salesperson", value: all.filter((s) => s.role === "R05").length },
  ];

  return (
    <div className="tm">
      <div className="tm-panel">
        <h1 className="tm-title">Team</h1>
        <div className="tm-rule" />

        <div className="tm-subhead">
          <h2 className="tm-subtitle">Staff &amp; Role</h2>
          <button type="button" className="tm-add" onClick={() => setShowForm(true)}>
            <IconPlus size={16} />
            Add Staff
          </button>
        </div>

        {/* ── Role counters ── */}
        <div className="tm-stats">
          {STATS.map(({ label, value }) => (
            <div key={label} className="tm-stat">
              <span className="tm-stat-value">{value}</span>
              <span className="tm-stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="tm-tablecard">
          <div className="tm-tablewrap">
            <table className="tm-table">
              <colgroup>
                <col style={{ width: "21.9%" }} />
                <col style={{ width: "16.4%" }} />
                <col style={{ width: "16.4%" }} />
                <col style={{ width: "10.9%" }} />
                <col style={{ width: "10.9%" }} />
                <col style={{ width: "10.9%" }} />
                <col style={{ width: "12.6%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th className="tm-c">Phone</th>
                  <th className="tm-c">Sessions</th>
                  <th className="tm-c">Conversion</th>
                  <th className="tm-c">Revenue</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    <td colSpan={7}><div className="w-skeleton tm-sk" /></td>
                  </tr>
                ))}

                {!loading && all.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="tm-empty">
                        <p className="tm-empty-title">No team members yet</p>
                        <p className="tm-empty-text">
                          Add your first staff member to give them a tablet PIN and start tracking sessions.
                        </p>
                        <button type="button" className="tm-add" onClick={() => setShowForm(true)}>
                          <IconPlus size={16} />
                          Add Staff
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && all.map((s) => {
                  const info = roleInfo(s.role);
                  return (
                    <tr key={s._id}>
                      <td>
                        <span className="tm-id">
                          <span className="tm-av">{initials(s.name)}</span>
                          {s.name}
                        </span>
                      </td>
                      <td>
                        <span className="tm-tag" style={{ background: info.bg, color: info.fg }}>
                          {info.label}
                        </span>
                      </td>
                      <td className="tm-c">{s.phone}</td>
                      <td className="tm-c">{s.sessionCount ?? 0}</td>
                      <td className="tm-c">{s.conversion ?? 0}%</td>
                      <td className="tm-c">₹{(s.revenue ?? 0).toLocaleString("en-IN")}</td>
                      <td className="tm-actioncell">
                        <button
                          type="button"
                          className="tm-del"
                          aria-label={`Remove ${s.name}`}
                          onClick={() => setConfirmRemove(s._id)}
                        >
                          <IconTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Dialogs ── */}
      {showForm && storeId && (
        <AddStaffForm
          storeId={storeId}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); showToast("Staff added successfully"); }}
        />
      )}

      {removingMember && (
        <div className="w-dialog-overlay" onClick={() => setConfirmRemove(null)}>
          <div className="w-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="w-dialog-title">Remove staff?</h2>
            <p className="w-dialog-body">
              Remove <strong>{removingMember.name}</strong> from your team? They will lose access to the
              tablet. This can&rsquo;t be undone.
            </p>
            <div className="w-dialog-actions" style={{ justifyContent: "flex-end" }}>
              <button className="w-btn w-btn-ghost" onClick={() => setConfirmRemove(null)}>Cancel</button>
              <button className="w-btn w-btn-danger" onClick={() => handleRemove(removingMember._id)}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="w-toast">{toast}</div>}

      <style jsx>{`
        .tm { color: #000; }
        .tm-panel { background: #fff; border-radius: 20px; padding: 21px 0 26px; }
        .tm-title { padding: 0 24px; font-size: 24px; font-weight: 600; line-height: 29px; }
        .tm-rule { height: 1px; margin: 21px 25px 0 26px; background: #E9E9E9; }

        .tm-subhead {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap; padding: 21px 25px 0 26px;
        }
        .tm-subtitle { font-size: 20px; font-weight: 500; line-height: 24px; }
        .tm-add {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          height: 40px; padding: 0 16px;
          background: var(--w-maroon-l); border: none; border-radius: 10px;
          font-family: inherit; font-size: 14px; font-weight: 500; color: #fff; cursor: pointer;
        }
        .tm-add:hover { background: var(--w-maroon); }

        /* ── Role counters ────────────────────────────────────────── */
        .tm-stats {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px; padding: 21px 25px 0 26px;
        }
        .tm-stat {
          display: flex; flex-direction: column;
          min-height: 70px; padding: 13px 12px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 10px;
        }
        .tm-stat-value { font-size: 22px; font-weight: 600; line-height: 27px; color: #000; }
        .tm-stat-label { font-size: 14px; font-weight: 500; line-height: 17px; color: #727272; }

        /* ── Table ────────────────────────────────────────────────── */
        .tm-tablecard {
          margin: 21px 25px 0 24px;
          padding: 16px 0;
          background: #fff;
          border: 1px solid #D9D9D9;
          border-radius: 10px;
          box-shadow: 0 1.575px 2.363px rgba(16, 16, 16, 0.16),
                      inset 0 -3.15px 3.15px rgba(255, 255, 255, 0.6);
        }
        .tm-tablewrap {
          margin: 0 16px;
          border: 0.81px solid #D9D9D9;
          border-radius: 6.48px;
          overflow-x: auto;
        }
        .tm-table { width: 100%; min-width: 780px; border-collapse: collapse; }

        .tm-table :global(thead tr) { background: var(--w-maroon-l); }
        .tm-table :global(th) {
          height: 46px; padding: 0 13px;
          text-align: left;
          font-size: 12px; font-weight: 700; line-height: 19px;
          text-transform: uppercase; color: #fff; white-space: nowrap;
        }
        .tm-table :global(td) {
          padding: 13px;
          font-size: 12px; font-weight: 500; line-height: 18px; color: #222222;
          border-bottom: 0.81px solid #D9D9D9;
          vertical-align: middle;
        }
        .tm-table :global(.tm-c) { text-align: center; }

        .tm-id { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; white-space: nowrap; }
        .tm-av {
          width: 25px; height: 25px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 50%; background: #CB857C;
          font-size: 12px; font-weight: 500; line-height: 18px; color: #000;
        }
        .tm-tag {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 78px; height: 23px; padding: 5px 16px;
          border-radius: 5px;
          font-size: 10px; font-weight: 600; line-height: 12px;
          box-shadow: 0 0 0 0.81px rgba(14, 159, 110, 0.11), 0 1.62px 3.24px rgba(0, 0, 0, 0.05);
        }

        /* The bin sits 43px off the row's right edge, per the handoff. */
        .tm-actioncell { text-align: right; padding-right: 43px !important; }
        .tm-del {
          display: inline-flex; align-items: center; justify-content: center;
          width: 24px; height: 24px;
          border: none; background: none; cursor: pointer; color: var(--w-maroon-l);
        }
        .tm-del:hover { color: var(--w-maroon); }

        .tm-sk { height: 22px; border-radius: 4px; }
        .tm-empty { padding: 48px 12px; text-align: center; }
        .tm-empty-title { font-size: 16px; font-weight: 600; color: #000; }
        .tm-empty-text { margin: 4px 0 18px; font-size: 12px; color: #727272; }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .tm-panel { border-radius: 16px; padding: 18px 0 22px; }
          .tm-title { padding: 0 18px; font-size: 21px; }
          .tm-rule { margin-left: 18px; margin-right: 18px; }
          .tm-subhead, .tm-stats { padding-left: 18px; padding-right: 18px; }
          .tm-tablecard { margin-left: 18px; margin-right: 18px; }
          .tm-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .tm-stats { grid-template-columns: minmax(0, 1fr); }
          .tm-add { width: 100%; }
        }
      `}</style>
    </div>
  );
}

/* ── Add Staff dialog ─────────────────────────────────────────────────
   Same sheet as the New campaign dialog: 457x648 at radius 16, a 421px
   content column inset 18px, and a 20px rhythm — header, rule at 80, then
   label(20) + 4 + control(40) blocks 20px apart, buttons last.

   The role chips reuse the dialog channel palette: pink/maroon, cream/amber,
   lilac/violet, in the order the handoff lists the roles. */
const ROLE_CHIP: Record<string, { label: string; bg: string; fg: string }> = {
  R05: { label: "Salesperson", bg: "#F9E9E9", fg: "#68262A" },
  R04: { label: "Manager", bg: "#FDF6EA", fg: "#FFA100" },
  R03: { label: "Owner", bg: "#F6F1FB", fg: "#A400FF" },
};

function AddStaffForm({
  storeId,
  onClose,
  onSuccess,
}: {
  storeId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const createStaff = useMutation(api.stores.createStaff);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("R05");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ROLES = ["R05", "R04", "R03"];

  async function handleSubmit() {
    if (!name.trim()) { setError("Name is required"); return; }
    if (phone.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    if (!/^\d{4}$/.test(pin)) { setError("PIN must be exactly 4 digits"); return; }
    setLoading(true);
    setError("");
    try {
      await createStaff({ token: getToken() ?? undefined, name: name.trim(), phone: "+91" + phone, pin, role, storeId });
      onSuccess();
    } catch (err: unknown) {
      const taken = convexErrorCode(err) === "PIN_TAKEN" || (err instanceof Error && err.message.includes("PIN_TAKEN"));
      setError(taken
        ? "This PIN is already in use at this store. Please pick a different PIN."
        : cleanError(err, "Failed to add staff"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="as-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="as-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="as-sheet">
        <div className="as-head">
          <div className="as-head-text">
            <span className="as-eyebrow">NEW TEAM MEMBER</span>
            <h2 id="as-title" className="as-title">Add Staff</h2>
          </div>
          <button type="button" className="as-close" aria-label="Close" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="as-rule" />

        <div className="as-body">
          {error && <p className="as-error" role="alert">{error}</p>}

          <div className="as-field">
            <label className="as-label" htmlFor="as-name">Full name*</label>
            <input
              id="as-name" className="as-input" type="text" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="Mohal lal"
            />
          </div>

          <div className="as-field">
            <label className="as-label" htmlFor="as-phone">Phone number*</label>
            <span className="as-phone">
              <span className="as-cc" aria-hidden>+91</span>
              <input
                id="as-phone" className="as-input as-input--phone" type="tel" inputMode="numeric"
                value={phone} maxLength={10}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9098510236"
              />
            </span>
          </div>

          <div className="as-field">
            <label className="as-label" htmlFor="as-pin">Tablet PIN (4 digits)</label>
            <input
              id="as-pin" className="as-input" type="password" inputMode="numeric"
              value={pin} maxLength={4}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="0000"
            />
          </div>

          <div className="as-field">
            <span className="as-label">Role*</span>
            <div className="as-chips">
              {ROLES.map((id) => {
                const t = ROLE_CHIP[id];
                const on = role === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`as-chip${on ? " is-on" : ""}`}
                    style={{ background: t.bg, color: t.fg }}
                    onClick={() => setRole(id)}
                    aria-pressed={on}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="as-actions">
            <button type="button" className="as-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="button" className="as-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? "Adding…" : "Add Staff Member"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .as-overlay {
          position: fixed; inset: 0; z-index: 60;
          display: flex; align-items: safe center; justify-content: center;
          padding: 24px 16px;
          background: rgba(0, 0, 0, 0.45);
          overflow-y: auto;
        }
        .as-sheet {
          width: 457px; max-width: 100%;
          display: flex; flex-direction: column;
          min-height: 648px; padding: 20px 18px;
          background: #fff; border-radius: 16px;
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22);
        }

        .as-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; min-height: 40px; }
        .as-head-text { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
        .as-eyebrow { font-size: 12px; font-weight: 500; line-height: 15px; color: #727272; }
        .as-title { font-size: 16px; font-weight: 600; line-height: 20px; color: #000; }
        .as-close {
          width: 24px; height: 24px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border: none; background: none; color: #000; cursor: pointer;
        }

        .as-rule { height: 1px; margin-top: 20px; background: #D9D9D9; }

        /* Every field block is label(20) + 4 + control(40), 20px apart. The
           actions are pushed to the foot of the 648px sheet. */
        .as-body { display: flex; flex-direction: column; gap: 20px; flex: 1; padding-top: 20px; }
        .as-field { display: flex; flex-direction: column; gap: 4px; }
        .as-label { font-size: 12px; font-weight: 500; line-height: 20px; color: #000; }

        .as-input {
          width: 100%; height: 40px; padding: 0 10px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          font-family: inherit; font-size: 14px; font-weight: 400; line-height: 20px;
          color: #000; outline: none;
        }
        .as-input::placeholder { color: #9E9E9E; }
        .as-input:focus { border-color: var(--w-maroon-l); }

        /* +91 tile sits on the input's left edge, 1px proud top and bottom. */
        .as-phone { position: relative; display: block; }
        .as-cc {
          position: absolute; left: 0; top: -1px;
          width: 50.87px; height: 42px;
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--w-maroon-l); border-radius: 8px;
          font-size: 14px; font-weight: 400; line-height: 18px; color: #fff;
          pointer-events: none;
        }
        .as-input--phone { padding-left: 61px; }

        .as-chips { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
        .as-chip {
          display: inline-flex; align-items: center; justify-content: center;
          height: 40px; padding: 0 8px;
          border: 1.5px solid transparent; border-radius: 8px;
          font-family: inherit; font-size: 14px; font-weight: 500; line-height: 20px;
          white-space: nowrap; cursor: pointer;
        }
        .as-chip.is-on { border-color: currentColor; }

        .as-error {
          padding: 10px 12px; border-radius: 8px;
          background: #F7E6EA; color: #C0392B;
          font-size: 12px; font-weight: 600; line-height: 1.4;
        }

        /* Centred 342px row: 141 Cancel + 10 + 191 Add. */
        .as-actions { display: flex; justify-content: center; gap: 10px; margin-top: auto; }
        .as-cancel, .as-submit {
          height: 40px; border-radius: 8px;
          font-family: inherit; font-size: 16px; font-weight: 500; line-height: 20px; cursor: pointer;
        }
        .as-cancel {
          width: 141px;
          background: #fff; border: 1px solid var(--w-maroon-l); color: var(--w-maroon-l);
        }
        .as-submit {
          width: 191px;
          background: var(--w-maroon-l); border: none; color: #fff;
        }
        .as-submit:hover { background: var(--w-maroon); }
        .as-cancel:disabled, .as-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        @media (max-width: 420px) {
          .as-sheet { min-height: 0; }
          .as-chips { grid-template-columns: minmax(0, 1fr); }
          .as-actions { flex-direction: column-reverse; }
          .as-cancel, .as-submit { width: 100%; }
        }
      `}</style>
    </div>
  );
}
