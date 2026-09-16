"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@wearify/shared/api";
import { cleanError } from "@/components/ui/toast";
import { setToken, setStoredUser } from "@/lib/phoneAuth";
import { useOtpInput } from "@/lib/useOtpInput";
import "../store-theme.css";

type LoginTab = "otp" | "password";
type OtpStep = "phone" | "otp" | "set-password";

/* Reference frame is 1280×800. Every clamp() below tops out at the exact
   figure from the handoff, so at ≥1280px the screen is pixel-for-pixel the
   design and scales down fluidly from there. */

export default function StoreLoginPage() {
  const router = useRouter();
  const loginWithOtp = useMutation(api.phoneAuth.loginWithOtp);
  const sendOtp = useAction(api.phoneAuth.sendOtp);
  const verifyOtp = useAction(api.phoneAuth.verifyOtp);
  const loginWithPassword = useMutation(api.phoneAuth.loginWithPassword);
  const setPasswordMut = useMutation(api.phoneAuth.setPassword);

  const [tab, setTab] = useState<LoginTab>("otp");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpStep, setOtpStep] = useState<OtpStep>("phone");
  // Set when the owner came in via "Forgot password?": the set-password step
  // then shows even though the account already has one — otherwise a password
  // can never be changed, since that step is gated on hasPassword being false.
  const [resetMode, setResetMode] = useState(false);
  // Reveal is view-only local state — nothing is stored, logged or sent.
  // The reset step asked for a password twice with no way to see either.
  const [showNew, setShowNew] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Both CTAs used to stay live on a half-typed number and only complain after
  // the click. The kiosk and customer app gate the button instead, so this
  // screen now matches them — with a hint, so gating never means silence.
  const phoneComplete = phone.length === 10;
  const phoneHint = phone.length > 0 && !phoneComplete ? "Enter all 10 digits" : "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoginData, setOtpLoginData] = useState<{ token: string; storeId: string; storeName: string } | null>(null);

  // Shared with the tablet and register screens — it spreads a pasted or
  // SMS-autofilled code across all six boxes instead of keeping one character.
  const {
    digits: otpDigits,
    refs: otpRefs,
    handleInput: handleOtpDigit,
    handlePaste: handleOtpPaste,
    handleKeyDown: handleOtpKeyDown,
  } = useOtpInput({ onEdit: () => setError("") });

  function saveAndGo(token: string, storeId: string, storeName: string) {
    setToken(token);
    setStoredUser({ phone: "", name: "", storeId, storeName, role: "store_owner" });
    router.replace("/store");
  }

  async function handleSendOtp() {
    if (phone.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    setLoading(true); setError("");
    try {
      const _otp = await sendOtp({ phone: "+91" + phone });
      if (!_otp.success) { setError(_otp.error || "Could not send the OTP. Try again."); return; }
      setOtpStep("otp");
    } catch (e: unknown) { setError(cleanError(e, "Could not send the OTP. Check your connection and try again.")); }
    finally { setLoading(false); }
  }

  async function handleVerifyOtp() {
    const otp = otpDigits.join("");
    if (otp.length !== 6) { setError("Enter all 6 digits of the OTP"); return; }
    setLoading(true); setError("");
    try {
      const _v = await verifyOtp({ phone: "+91" + phone, otp });
      if (!_v.success) { setError(_v.error || "Invalid OTP"); setLoading(false); return; }
      const r = await loginWithOtp({ phone: "+91" + phone, verifyToken: _v.verifyToken ?? "", role: "store_owner" });
      if (!r.success) { setError(r.error || "Login failed"); setLoading(false); return; }
      if (r.hasPassword && !resetMode) {
        saveAndGo(r.token!, r.storeId!, r.storeName || "My Store");
        return;
      }
      setOtpLoginData({ token: r.token!, storeId: r.storeId!, storeName: r.storeName || "My Store" });
      setOtpStep("set-password");
    } catch (e: unknown) { setError(cleanError(e, "Login failed")); }
    finally { setLoading(false); }
  }

  async function handleSetPassword() {
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true); setError("");
    try {
      const r = await setPasswordMut({ token: otpLoginData?.token, phone: "+91" + phone, password: newPassword, role: "store_owner" });
      if (!r?.success) { setError(r?.error || "Failed to set password"); return; }
      if (otpLoginData) saveAndGo(otpLoginData.token, otpLoginData.storeId, otpLoginData.storeName);
    } catch (e: unknown) { setError(cleanError(e, "Failed to set password")); }
    finally { setLoading(false); }
  }

  async function handlePasswordLogin() {
    if (phone.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    if (!password) { setError("Enter your password"); return; }
    setLoading(true); setError("");
    try {
      const r = await loginWithPassword({ phone: "+91" + phone, password, role: "store_owner" });
      if (!r.success) { setError(r.error || "Login failed"); setLoading(false); return; }
      saveAndGo(r.token!, r.storeId!, r.storeName || "My Store");
    } catch (e: unknown) { setError(cleanError(e, "Login failed")); }
    finally { setLoading(false); }
  }

  function onPhoneKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    if (tab === "otp") handleSendOtp(); else handlePasswordLogin();
  }

  /* NOTE: the phone field is written out at both call sites rather than hoisted
     into a variable — styled-jsx only scopes JSX that appears inside the
     returned tree, so a hoisted element silently loses every .sl-* rule. */
  return (
    <div className="sl-page">
      {/* Decoration lives in its own clipping layer. It must NOT be clipped by
          .sl-page itself: the rings hang ~195px past the edges, and any overflow
          value on .sl-page (even overflow-x) turns it into a scroll container,
          which gives the screen 195px of phantom bottom scroll. */}
      <div className="sl-decor" aria-hidden>
        <div className="sl-bg" />
        <span className="sl-ring sl-ring--tl" />
        <span className="sl-ring sl-ring--br" />
      </div>

      <div className="sl-stack">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/store/otp-login/logo.webp" alt="Wearify" className="sl-logo" />

        {/* The password screen's card is drawn 552px with a tighter bottom
            inset than the OTP screen's 461px one — matching the handoff rather
            than normalising the two. */}
        <section className={`sl-card${tab === "password" ? " sl-card--tight" : ""}`}>
          <h1 className="sl-title">Welcome Back</h1>
          <p className="sl-sub">Sign in to your store dashboard</p>

          {/* Segmented control — pill widths mirror the 131/134 split in the design */}
          <div className="sl-tabs" role="tablist">
            {([
              { key: "otp", label: "OTP login", grow: 131 },
              { key: "password", label: "Password login", grow: 134 },
            ] as const).map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                className={`sl-tab${tab === t.key ? " is-on" : ""}`}
                style={{ flexGrow: t.grow }}
                onClick={() => { setTab(t.key); setError(""); setResetMode(false); if (t.key === "otp") setOtpStep("phone"); }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="sl-body">
            {error && (
              <div className="sl-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* ── OTP · phone step (the reference screen) ── */}
            {tab === "otp" && otpStep === "phone" && (
              <>
                <div className="sl-field">
                  <label className="sl-label" htmlFor="sl-phone">Mobile Number</label>
                  <div className="sl-inputwrap">
                    <span className="sl-prefix">+91</span>
                    <input
                      id="sl-phone"
                      type="tel"
                      inputMode="numeric"
                      className="sl-input"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      onKeyDown={onPhoneKeyDown}
                    />
                  </div>
                </div>
                {phoneHint && <p className="sl-hint">{phoneHint}</p>}
                <button className="sl-btn" onClick={handleSendOtp} disabled={loading || !phoneComplete}>
                  {loading ? "Sending…" : "Send OTP"}
                </button>
              </>
            )}

            {/* ── OTP · verify step ── */}
            {tab === "otp" && otpStep === "otp" && (
              <>
                <div className="sl-field">
                  <span className="sl-label">Enter OTP</span>
                  <div className="sl-otp">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigit(i, e.target.value)}
                        onPaste={(e) => handleOtpPaste(i, e)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onFocus={(e) => e.target.select()}
                        aria-label={`OTP digit ${i + 1}`}
                        placeholder="0"
                        className={digit ? "is-filled" : undefined}
                      />
                    ))}
                  </div>
                </div>
                <button className="sl-btn" onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? "Verifying…" : "Login"}
                </button>
              </>
            )}

            {/* ── OTP · set-password step ── */}
            {tab === "otp" && otpStep === "set-password" && (
              <>
                <div className="sl-verified">
                  <span className="sl-verified-mark">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <div>
                    <div className="sl-verified-title">OTP verified</div>
                    <div className="sl-verified-sub">
                      {resetMode ? "Choose a new password — you'll be signed out on other devices" : "Set a password for quicker future logins"}
                    </div>
                  </div>
                </div>
                <div className="sl-field">
                  <label className="sl-label" htmlFor="sl-newpass">New password</label>
                  <div className="sl-inputwrap">
                    <input
                      id="sl-newpass"
                      className="sl-input"
                      type={showNew ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      className="sl-reveal"
                      onClick={() => setShowNew((v) => !v)}
                      aria-label={showNew ? "Hide password" : "Show password"}
                      aria-pressed={showNew}
                      tabIndex={-1}
                    >
                      <EyeIcon off={showNew} />
                    </button>
                  </div>
                </div>
                <div className="sl-field">
                  <label className="sl-label" htmlFor="sl-confirmpass">Confirm password</label>
                  <div className="sl-inputwrap">
                    <input
                      id="sl-confirmpass"
                      className="sl-input"
                      type={showNew ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      className="sl-reveal"
                      onClick={() => setShowNew((v) => !v)}
                      aria-label={showNew ? "Hide password" : "Show password"}
                      aria-pressed={showNew}
                      tabIndex={-1}
                    >
                      <EyeIcon off={showNew} />
                    </button>
                  </div>
                </div>
                <button className="sl-btn" onClick={handleSetPassword} disabled={loading}>
                  {loading ? "Saving…" : "Set password & continue"}
                </button>
                <button
                  className="sl-link"
                  onClick={() => otpLoginData && saveAndGo(otpLoginData.token, otpLoginData.storeId, otpLoginData.storeName)}
                >
                  Skip for now
                </button>
              </>
            )}

            {/* ── Password login ── */}
            {tab === "password" && (
              <>
                <div className="sl-field">
                  <label className="sl-label" htmlFor="sl-phone-pw">Mobile Number</label>
                  <div className="sl-inputwrap">
                    <span className="sl-prefix">+91</span>
                    <input
                      id="sl-phone-pw"
                      type="tel"
                      inputMode="numeric"
                      className="sl-input"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      onKeyDown={onPhoneKeyDown}
                    />
                  </div>
                </div>
                <div className="sl-field">
                  <label className="sl-label" htmlFor="sl-password">Password</label>
                  <div className="sl-inputwrap">
                    <input
                      id="sl-password"
                      className="sl-input"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      placeholder="Password"
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                    />
                    <button
                      type="button"
                      className="sl-reveal"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      tabIndex={-1}
                    >
                      <EyeIcon off={showPassword} />
                    </button>
                  </div>
                </div>
                {phoneHint && <p className="sl-hint">{phoneHint}</p>}
                <button className="sl-btn" onClick={handlePasswordLogin} disabled={loading || !phoneComplete}>
                  {loading ? "Signing in…" : "Sign in"}
                </button>
                <button
                  className="sl-link"
                  onClick={() => { setTab("otp"); setOtpStep("phone"); setError(""); setPassword(""); setResetMode(true); }}
                >
                  Forgot password?
                </button>
              </>
            )}
          </div>
        </section>

        <p className="sl-terms">
          By logging in, you agree to Wearify&rsquo;s Terms of Service and Privacy Policy
        </p>
        <p className="sl-copy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/store/otp-login/14_vector.svg" alt="" className="sl-copy-mark" />
          Copyright {new Date().getFullYear()} Phygify Technoservices Pvt. Ltd.
        </p>
      </div>

      <style jsx>{`
        /* ── Frame ─────────────────────────────────────────────────── */
        .sl-page {
          position: relative;
          min-height: 100dvh;
          display: flex;
          justify-content: center;
          /* The password card is 552px; with the logo and legal lines the stack
             is 749px, so anything more than ~25px of inset overflows an 800px
             viewport and defeats the centring. "safe center" keeps the top of
             the stack reachable when it genuinely doesn't fit. */
          align-items: center;
          align-items: safe center;
          padding: 24px 20px;
          background: #ffffff;
          font-family: var(--w-font), "Montserrat", system-ui, sans-serif;
          color: #111111;
        }
        /* Motif scale is pinned to the reference: at 1280×800 the width term wins
           and the image draws 1280×1400.6 centred (y −300.3) — pixel-identical to
           the handoff's pattern transform. The 100vw / 91.4vh terms only kick in
           to guarantee coverage on wider or taller viewports; plain "cover" would
           let a portrait tablet blow the sarees up to ~2× the intended size.
           (91.4vh = the width at which the 1199:1312 art is exactly 100vh tall.)
           The handoff CSS says fill-opacity 0.1, but that reads almost blank —
           this is the one dial for how present the sarees are. */
        .sl-decor {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .sl-bg {
          position: absolute;
          inset: 0;
          background-image: url("/store/otp-login/background.webp");
          background-repeat: no-repeat;
          background-position: center;
          background-size: max(1280px, 100vw, 91.4vh) auto;
          opacity: 0.12;
          pointer-events: none;
        }
        /* Two 474/477px rings bleeding off opposite corners (design: 53px stroke,
           #71221D @ 20%). Offsets are expressed as a ratio of the ring so the
           bleed stays proportional when the ring shrinks on smaller screens. */
        .sl-ring {
          --sl-ring: clamp(240px, 37vw, 477px);
          position: absolute;
          width: var(--sl-ring);
          height: var(--sl-ring);
          border-radius: 50%;
          border: clamp(28px, 4.14vw, 53px) solid #71221d;
          opacity: 0.2;
          pointer-events: none;
        }
        .sl-ring--tl {
          top: calc(var(--sl-ring) * -0.413);
          left: calc(var(--sl-ring) * -0.413);
        }
        .sl-ring--br {
          bottom: calc(var(--sl-ring) * -0.409);
          right: calc(var(--sl-ring) * -0.409);
        }

        /* ── Centre stack: logo · card · terms · copyright ──────────── */
        .sl-stack {
          position: relative;
          z-index: 1;
          width: min(512px, 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .sl-logo {
          width: clamp(112px, 11.41vw, 146px);
          height: auto;
          display: block;
        }

        /* ── Card ──────────────────────────────────────────────────── */
        .sl-card {
          width: 100%;
          margin-top: 16px;
          background: #ffffff;
          border-radius: 15px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
          padding: 35px clamp(20px, 3.05vw, 39px) 45px;
        }
        .sl-card--tight {
          padding-bottom: 22px;
        }
        .sl-title {
          font-size: clamp(20px, 1.875vw, 24px);
          font-weight: 600;
          line-height: 110%;
          color: #111111;
          text-align: center;
        }
        .sl-sub {
          margin-top: 4px;
          font-size: clamp(15px, 1.41vw, 18px);
          font-weight: 400;
          line-height: 34px;
          color: rgba(17, 17, 17, 0.65);
          text-align: center;
        }

        /* ── Segmented control ─────────────────────────────────────── */
        .sl-tabs {
          margin: 14px auto 0;
          width: min(286px, 100%);
          height: 59px;
          display: flex;
          gap: 5px;
          padding: 8px;
          background: #faf7f4;
          border-radius: 29.5px;
        }
        .sl-tab {
          flex: 1 1 0;
          min-width: 0;
          height: 43px;
          border: none;
          background: transparent;
          border-radius: 21.5px;
          font-family: inherit;
          font-size: 16px;
          font-weight: 500;
          line-height: 34px;
          color: #68262a;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.18s var(--w-ease), box-shadow 0.18s var(--w-ease);
        }
        .sl-tab.is-on {
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(17, 17, 17, 0.07);
        }

        /* ── Form body ─────────────────────────────────────────────── */
        /* Stacked field groups sit 8px apart (the password screen packs Mobile
           Number and Password into one block); the CTA adds 37px on top so the
           last-field→button gap lands on the design's 45px. */
        .sl-body {
          margin-top: 29px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sl-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sl-label {
          font-size: clamp(16px, 1.56vw, 20px);
          font-weight: 600;
          line-height: 34px;
          color: #111111;
        }
        .sl-inputwrap {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 64px;
          padding: 0 16px;
          background: #ffffff;
          border: 1.58552px solid #eeeeee;
          border-radius: 15px;
          transition: border-color 0.18s var(--w-ease);
        }
        .sl-inputwrap:focus-within {
          border-color: #71221d;
        }
        .sl-prefix {
          flex-shrink: 0;
          font-size: clamp(15px, 1.41vw, 18px);
          font-weight: 400;
          line-height: 26px;
          color: #111111;
        }
        .sl-input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          font-family: inherit;
          font-size: clamp(15px, 1.41vw, 18px);
          font-weight: 400;
          line-height: 26px;
          color: #111111;
        }
        .sl-input::placeholder {
          color: rgba(17, 17, 17, 0.35);
        }

        /* ── Primary action ────────────────────────────────────────── */
        .sl-btn {
          width: 100%;
          margin-top: 37px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: none;
          border-radius: 10px;
          background: #71221d;
          color: #ffffff;
          font-family: inherit;
          font-size: clamp(16px, 1.56vw, 20px);
          font-weight: 600;
          line-height: 34px;
          cursor: pointer;
          transition: background 0.18s var(--w-ease);
        }
        .sl-btn:hover:not(:disabled) {
          background: #5e1c17;
        }
        .sl-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .sl-link {
          align-self: center;
          margin-top: 8px;
          border: none;
          background: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          color: #71221d;
        }
        .sl-link:hover {
          text-decoration: underline;
        }

        /* ── OTP boxes ─────────────────────────────────────────────── */
        .sl-otp {
          display: flex;
          gap: 10px;
        }
        .sl-otp :global(input) {
          flex: 1 1 0;
          min-width: 0;
          height: 64px;
          text-align: center;
          font-family: inherit;
          font-size: clamp(18px, 1.875vw, 24px);
          font-weight: 600;
          color: #111111;
          background: #ffffff;
          border: 1.58552px solid #eeeeee;
          border-radius: 15px;
          outline: none;
          transition: border-color 0.18s var(--w-ease), background 0.18s var(--w-ease);
        }
        .sl-otp :global(input::placeholder) {
          color: rgba(17, 17, 17, 0.3);
          font-weight: 500;
        }
        .sl-otp :global(input:focus),
        .sl-otp :global(input.is-filled) {
          border-color: #71221d;
        }

        /* ── Verified banner (set-password step) ───────────────────── */
        .sl-verified {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 8px;
        }
        .sl-verified-mark {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(45, 133, 68, 0.12);
          color: #2d8544;
        }
        .sl-verified-title {
          font-size: 18px;
          font-weight: 600;
          color: #111111;
        }
        .sl-verified-sub {
          font-size: 14px;
          line-height: 22px;
          color: rgba(17, 17, 17, 0.65);
        }

        /* ── Error ─────────────────────────────────────────────────── */
        .sl-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(192, 57, 43, 0.08);
          color: #c0392b;
          font-size: 14px;
          font-weight: 500;
          line-height: 20px;
          margin-bottom: 8px;
        }

        /* ── Legal footer ──────────────────────────────────────────── */
        .sl-hint {
          margin-top: 8px;
          font-size: 13px;
          font-weight: 500;
          line-height: 18px;
          color: rgba(17, 17, 17, 0.5);
        }
        .sl-reveal {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0;
          border: none;
          border-radius: 8px;
          background: none;
          color: rgba(17, 17, 17, 0.45);
          cursor: pointer;
          transition: color 0.18s var(--w-ease);
        }
        .sl-reveal:hover { color: #71221d; }

        /* text-wrap: balance evens the two lines instead of letting the last
           word ("Policy") sit alone — the stack is 512px and the sentence is
           just over one line at this size. */
        .sl-terms {
          text-wrap: balance;
          margin-top: 16px;
          font-size: 14px;
          font-weight: 500;
          line-height: 26px;
          text-align: center;
          color: #111111;
        }
        .sl-copy {
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
          line-height: 17px;
          color: #727272;
        }
        .sl-copy-mark {
          width: 10px;
          height: 10px;
          flex-shrink: 0;
        }

        /* ── Tablet / phone ────────────────────────────────────────── */
        @media (max-width: 900px) {
          .sl-btn {
            margin-top: 26px;
          }
        }
        @media (max-width: 640px) {
          .sl-page {
            padding: 20px 16px;
          }
          .sl-card {
            padding: 28px 20px 32px;
          }
          .sl-card--tight {
            padding-bottom: 24px;
          }
          .sl-sub,
          .sl-label {
            line-height: 26px;
          }
          .sl-body {
            margin-top: 22px;
          }
          .sl-btn {
            margin-top: 18px;
          }
          .sl-inputwrap,
          .sl-btn,
          .sl-otp :global(input) {
            height: 56px;
          }
          .sl-otp {
            gap: 7px;
          }
          .sl-tab {
            font-size: 14px;
          }
          .sl-terms,
          .sl-copy {
            font-size: 12.5px;
            line-height: 20px;
          }
        }

        /* ── Short viewports ───────────────────────────────────────────
           The design's stack is 749px tall on the password tab, so on a real
           laptop (a 1280×800 window is ~1280×690 of viewport once browser
           chrome is taken off) it would overflow and scroll. Below 790px of
           height the vertical rhythm compacts to fit — type sizes are left
           alone, only the air between things gives way. The reference match at
           1280×800 is untouched because 800 > 790. Must stay last: it
           deliberately outranks the max-width block on landscape phones. */
        @media (max-height: 790px) {
          .sl-page {
            padding: 16px 20px;
          }
          .sl-logo {
            width: clamp(92px, 8.6vw, 112px);
          }
          .sl-card {
            margin-top: 10px;
            padding: 22px clamp(20px, 3.05vw, 39px) 28px;
          }
          .sl-card--tight {
            padding-bottom: 20px;
          }
          .sl-sub,
          .sl-label {
            line-height: 26px;
          }
          .sl-tabs {
            margin-top: 10px;
            height: 50px;
          }
          .sl-tab {
            height: 34px;
            line-height: 32px;
          }
          .sl-body {
            margin-top: 16px;
          }
          .sl-inputwrap,
          .sl-btn,
          .sl-otp :global(input) {
            height: 54px;
          }
          .sl-btn {
            margin-top: 22px;
          }
          .sl-terms {
            margin-top: 12px;
          }
        }
      `}</style>
    </div>
  );
}

/* Eye / eye-off, drawn inline to match the form's other SVGs rather than
   pulling lucide in for one glyph on the login screen. */
function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {off ? (
        <>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61A18.15 18.15 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.39-1.61" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </>
      ) : (
        <>
          <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}
