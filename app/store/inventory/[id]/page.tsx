"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@wearify/shared/api";
import { Id } from "@wearify/shared/dataModel";
import { getToken } from "@/lib/phoneAuth";
import { useToast, cleanError } from "@/components/ui/toast";
import { useUploadFile } from "@/lib/useUpload";
import { compressImage } from "@/lib/imageCompress";
import { GUARDS } from "@/lib/uploadGuards";
import SareeQrCard from "@/components/SareeQrCard";
import SareeCardPanel from "@/components/SareeCardPanel";
import { PHOTO_SLOTS, photosOf } from "@wearify/shared/sareePhotos";
import { IconChevronLeft, IconTrash, IconClose } from "../../_components/StoreIcons";
import {
  SAREE_PRICE_MAX,
  SAREE_PRICE_MIN,
  SAREE_STOCK_MAX,
  validateSareeName,
  validateSareePrice,
  validateSareeStock,
} from "@wearify/shared/sareeLimits";

/* Saree detail — no handoff for this screen, so it is assembled from the
   language the rest of the module already speaks:
     · the 35px back square + eyebrow/title/rule header of the settings pages
     · "Session" section cards — 0.81px #F3F6F7, radius 10, 46px header
     · the 210.51x70 tinted stat cards from orders/customers
     · the 39px ledger rows from billing
     · the 30px disc + 10px maroon track bars from analytics
     · the label(20) + 4 + control(40) field blocks from store profile
   Every behaviour of the previous build is kept. */

const SAREE_IMAGE: Record<string, string> = {
  "Chanderi Floral":           "/inventory/Chanderi-Floral.jpeg",
  "Chiffon Rose Garden":       "/inventory/Chiffon-Rose-Garden.webp",
  "Cotton Handloom Daily":     "/inventory/Cotton-Handloom-Daily.webp",
  "Georgette Sequin Party":    "/inventory/Georgette-Sequin-Party.webp",
  "Kanjeevaram Temple Border": "/inventory/Kanjeevaram-Temple-Border.webp",
  "Linen Summer Fresh":        "/inventory/Linen-Summer-Fresh.jpeg",
  "Organza Pastel Dream":      "/inventory/Organza-Pastel-Dream.jpeg",
  "Paithani Heritage":         "/inventory/Paithani-Heritage.webp",
  "Tussar Geometric":          "/inventory/Tussar-Geometric.webp",
};

/* The hero sits outside the styled-jsx tree, so it carries inline styles. */
function SareeImage({ name, fileId, fallbackGrad }: {
  name: string; fileId?: Id<"_storage">; fallbackGrad: string[];
}) {
  const localSrc = SAREE_IMAGE[name];
  const url = useQuery(api.files.getUrl, !localSrc && fileId ? { fileId } : "skip");
  const fit: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };

  // eslint-disable-next-line @next/next/no-img-element
  if (localSrc) return <img src={localSrc} alt={name} style={fit} />;
  // eslint-disable-next-line @next/next/no-img-element
  if (url) return <img src={url} alt={name} style={fit} />;
  return (
    <div style={{
      width: "100%", height: "100%",
      background: `linear-gradient(145deg, ${fallbackGrad[0]}, ${fallbackGrad[1] || fallbackGrad[0]})`,
    }} />
  );
}

const LEGACY_PHOTO_TABS = ["Front View", "Back View", "Pallu Detail", "Border Detail"];
const AI_TAB = "ai";

type PhotoTab = { key: string; label: string; fileId?: Id<"_storage"> };

/* Named slots for rows the six-slot uploader (or the four-slot photoshoot)
   wrote; positional labels for anything older. The AI try-on source is always
   last, whichever layout the row has. */
function photoTabsFor(saree: { photos?: unknown; photoLayout?: string; imageIds?: Id<"_storage">[]; aiGarmentImageId?: Id<"_storage"> }): PhotoTab[] {
  const tabs: PhotoTab[] = [];
  if (saree.photos || saree.photoLayout === "model_flatlay_pallu_border") {
    const photos = photosOf(saree as Parameters<typeof photosOf<Id<"_storage">>>[0]);
    for (const slot of PHOTO_SLOTS) {
      const fileId = photos[slot.key];
      if (fileId) tabs.push({ key: slot.key, label: slot.label, fileId });
    }
  } else {
    (saree.imageIds ?? []).slice(0, LEGACY_PHOTO_TABS.length).forEach((fileId, i) => {
      tabs.push({ key: `legacy-${i}`, label: LEGACY_PHOTO_TABS[i], fileId });
    });
  }
  tabs.push({ key: AI_TAB, label: "AI Try-On", fileId: saree.aiGarmentImageId });
  return tabs;
}
const FABRICS = ["Silk", "Pure Silk", "Cotton", "Georgette", "Crepe", "Chiffon", "Linen", "Cotton-Silk", "Organza", "Tissue"];

/* Same labels the catalogue list uses — raw status values read as debug text. */
const APPROVAL: Record<string, { label: string; bg: string; fg: string }> = {
  approved:    { label: "Live", bg: "#ECF3ED", fg: "#27741E" },
  pending:     { label: "Pending", bg: "#F6CBB7", fg: "#68262A" },
  corrections: { label: "Corrections", bg: "#F9F3E4", fg: "#7A5B12" },
  rejected:    { label: "Rejected", bg: "#F7E6EA", fg: "#C0392B" },
};

/* Handoff stat-card fills, in order. */
const STAT_TONES = ["#F7E6EA", "#F9F3E4", "#F0E7F5", "#ECF3ED"];

export default function SareeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sareeId = params.id as Id<"sarees">;

  const saree = useQuery(api.sarees.getById, sareeId ? { id: sareeId } : "skip");
  const updateSaree = useMutation(api.sarees.update);
  const updateStock = useMutation(api.sarees.updateStock);
  const deleteSaree = useMutation(api.sarees.remove);
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [stockInput, setStockInput] = useState("");
  const [editForm, setEditForm] = useState<Record<string, string | number>>({});
  const [saving, setSaving] = useState(false);
  const [photoTab, setPhotoTab] = useState(0);
  const [resubmitting, setResubmitting] = useState(false);

  const { upload } = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImageReupload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0] || !saree) return;
    const file = e.target.files[0];
    if (photoTabsFor(saree)[photoTab]?.key !== AI_TAB) {
      toast("Replace garment photos from the Try-on reference card section below", "error");
      return;
    }
    setUploadingImage(true);
    try {
      // Downscaled like every other saree photo, so a full-size original
      // never lands in storage or in the try-on request.
      const newFileId = await upload(await compressImage(file), GUARDS.sareePhoto, { token: getToken() ?? undefined });
      await updateSaree({ id: sareeId, token: getToken() ?? undefined, aiGarmentImageId: newFileId });
      toast("AI Try-On image updated!", "success");
    } catch (err: unknown) {
      toast(cleanError(err, "Failed to upload image"), "error");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /* ── Loading ── */
  if (saree === undefined) {
    return (
      <div className="sd">
        <div className="sd-panel">
          <div className="w-skeleton sd-sk-head" />
          <div className="sd-cols">
            <div className="w-skeleton sd-sk-hero" />
            <div className="w-skeleton sd-sk-body" />
          </div>
        </div>
        <style jsx>{`
          .sd-panel { background: #fff; border-radius: 20px; padding: 16px; }
          .sd-sk-head { height: 54px; border-radius: 10px; }
          .sd-cols { display: grid; grid-template-columns: minmax(0, 408fr) minmax(0, 531fr); gap: 24px; margin-top: 24px; }
          .sd-sk-hero { height: 480px; border-radius: 16px; }
          .sd-sk-body { height: 480px; border-radius: 10px; }
          @media (max-width: 900px) { .sd-cols { grid-template-columns: minmax(0, 1fr); } }
        `}</style>
      </div>
    );
  }

  /* ── Not found ── */
  if (saree === null) {
    return (
      <div className="sd">
        <div className="sd-panel sd-panel--empty">
          <p className="sd-nf-title">Saree not found</p>
          <p className="sd-nf-text">This saree may have been removed from your catalogue.</p>
          <button type="button" className="sd-btn sd-btn--solid" onClick={() => router.push("/store/inventory")}>
            Back to catalogue
          </button>
        </div>
        <style jsx>{`
          .sd-panel--empty { background: #fff; border-radius: 20px; padding: 64px 24px; text-align: center; }
          .sd-nf-title { font-size: 20px; font-weight: 600; color: #000; }
          .sd-nf-text { margin: 6px 0 18px; font-size: 13px; color: #727272; }
          .sd-btn--solid {
            height: 40px; padding: 0 20px;
            background: var(--w-maroon-l); border: none; border-radius: 10px;
            font-family: inherit; font-size: 14px; font-weight: 500; color: #fff; cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  const isPending = saree.approvalStatus === "pending";
  const isCorrections = saree.approvalStatus === "corrections";

  async function handleResubmit() {
    setResubmitting(true);
    try { await updateSaree({ token: getToken() ?? undefined, id: sareeId, approvalStatus: "pending" }); }
    catch (e) { toast(cleanError(e, "Couldn't resubmit for approval — please try again."), "error"); }
    finally { setResubmitting(false); }
  }

  function startEditing() {
    setEditing(true);
    setEditForm({
      name: saree!.name, price: saree!.price,
      fabric: saree!.fabric, description: saree!.description || "",
      region: saree!.region || "", weave: saree!.weave || "",
      careInstructions: saree!.careInstructions || "",
    });
  }

  async function handleSave() {
    // This form had no validation at all — it sent whatever was typed straight
    // to sarees.update, which accepted ₹0 and negatives. Same rules as the add
    // form now, so an edit cannot undo what creation enforced.
    const invalid =
      validateSareeName(String(editForm.name ?? "")) ??
      validateSareePrice(Number(editForm.price));
    if (invalid) { toast(invalid, "error"); return; }

    setSaving(true);
    try {
      await updateSaree({
        token: getToken() ?? undefined,
        id: sareeId,
        name: editForm.name as string || undefined,
        price: editForm.price ? Number(editForm.price) : undefined,
        fabric: editForm.fabric as string || undefined,
        description: editForm.description as string || undefined,
        region: editForm.region as string || undefined,
        weave: editForm.weave as string || undefined,
        careInstructions: editForm.careInstructions as string || undefined,
      });
      setEditing(false);
    } catch (e) { toast(cleanError(e, "Couldn't save changes — please try again."), "error"); }
    finally { setSaving(false); }
  }

  async function handleStockUpdate() {
    const n = parseInt(stockInput);
    // Used to `return` silently here, so an invalid entry made the Update
    // button look broken. Say what's wrong instead.
    const invalid = Number.isNaN(n) ? "Enter a stock quantity" : validateSareeStock(n);
    if (invalid) { toast(invalid, "error"); return; }
    try {
      await updateStock({ token: getToken() ?? undefined, id: sareeId, stock: n });
      setStockInput("");
    } catch (e) {
      toast(cleanError(e, "Couldn't update stock — please try again."), "error");
    }
  }

  async function handleDelete() {
    try {
      await deleteSaree({ token: getToken() ?? undefined, id: sareeId });
      router.push("/store/inventory");
    } catch (e) {
      toast(cleanError(e, "Couldn't delete this saree — please try again."), "error");
    }
  }

  const discount = saree.mrp && saree.mrp > saree.price
    ? Math.round(((saree.mrp - saree.price) / saree.mrp) * 100) : 0;
  const grad = saree.grad || ["#0D1F35", "#1A5276"];
  const photoTabs = photoTabsFor(saree);
  const activeTab = photoTabs[Math.min(photoTab, photoTabs.length - 1)];
  const onAiTab = activeTab?.key === AI_TAB;
  const stockTone = saree.stock <= 0
    ? { label: "Out of stock", bg: "#F7E6EA", fg: "#C0392B" }
    : saree.stock <= 5
      ? { label: `${saree.stock} left`, bg: "#F9F3E4", fg: "#7A5B12" }
      : { label: `${saree.stock} in stock`, bg: "#ECF3ED", fg: "#27741E" };
  const approval = APPROVAL[saree.approvalStatus ?? ""] ?? null;

  const tryOnRate = (saree.views ?? 0) > 0 ? Math.round(((saree.tryOns ?? 0) / (saree.views ?? 1)) * 100) : 0;
  const conversionRate = (saree.tryOns ?? 0) > 0 ? Math.round(((saree.conversions ?? 0) / Math.max(saree.tryOns ?? 1, 1)) * 100) : 0;

  const STATS = [
    { label: "Views", value: String(saree.views ?? 0) },
    { label: "Try-Ons", value: String(saree.tryOns ?? 0) },
    { label: "Try-On rate", value: `${tryOnRate}%` },
    { label: "Sales", value: String(saree.conversions ?? 0) },
  ];

  const LEDGER: Array<{ k: string; v: string }> = [
    { k: "Fabric", v: saree.fabric || "—" },
    { k: "Occasion", v: saree.occasion || "—" },
    ...(saree.region ? [{ k: "Region", v: saree.region }] : []),
    ...(saree.weave ? [{ k: "Weave", v: saree.weave }] : []),
    ...(saree.colorName ? [{ k: "Colour", v: saree.colorName }] : []),
    ...(saree.weight ? [{ k: "Weight", v: saree.weight }] : []),
    ...(saree.careInstructions ? [{ k: "Care", v: saree.careInstructions }] : []),
    { k: "SKU", v: saree._id.slice(-6).toUpperCase() },
    { k: "In catalogue", v: `${saree.daysOld ?? 0} days` },
  ];

  return (
    <div className="sd">
      <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageReupload} />

      <div className="sd-panel">
        {/* ── Header ── */}
        <div className="sd-head">
          <button type="button" className="sd-back" onClick={() => router.back()} aria-label="Back to catalogue">
            <IconChevronLeft />
          </button>
          <div className="sd-head-text">
            <span className="sd-eyebrow">Catalogue</span>
            <h1 className="sd-title">{saree.name}</h1>
          </div>
          <div className="sd-head-actions">
            {!isPending && (
              <button
                type="button"
                className="sd-btn"
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Check out ${saree.name} (${saree.fabric}) at ₹${saree.price.toLocaleString("en-IN")} on Wearify!`,
                  );
                  window.open(`https://wa.me/?text=${msg}`, "_blank");
                }}
              >
                Share
              </button>
            )}
            {!editing && !isPending && (
              <button type="button" className="sd-btn sd-btn--solid" onClick={startEditing}>
                Edit details
              </button>
            )}
          </div>
        </div>

        <div className="sd-rule" />

        {/* ── Approval banners ── */}
        {isPending && (
          <div className="sd-banner" style={{ background: "#F6CBB7", color: "#68262A" }}>
            <strong>Pending admin approval</strong>
            <span>Awaiting admin review. Editing is not available until approved.</span>
          </div>
        )}
        {isCorrections && (
          <div className="sd-banner sd-banner--stack" style={{ background: "#F9F3E4", color: "#7A5B12" }}>
            <strong>Corrections requested</strong>
            <span>Admin has requested changes. Please edit and resubmit.</span>
            {saree.correctionNote && <p className="sd-note">{saree.correctionNote}</p>}
            <button type="button" className="sd-btn sd-btn--solid sd-btn--tight" onClick={handleResubmit} disabled={resubmitting}>
              {resubmitting ? "Resubmitting…" : "Resubmit for approval"}
            </button>
          </div>
        )}

        {/* ── Media + details ── */}
        <div className="sd-cols">
          {/* LEFT — hero + photo tabs */}
          <div className="sd-media">
            <div className="sd-hero">
              <SareeImage
                name={saree.name}
                fileId={activeTab?.fileId}
                fallbackGrad={grad}
              />
              {saree.tag && <span className="sd-hero-tag">{saree.tag}</span>}
              {saree.stock > 0 && saree.stock <= 5 && <span className="sd-hero-low">Low stock</span>}
              {editing && onAiTab && (
                <button
                  type="button"
                  className="sd-reupload"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Uploading…" : "Reupload AI image"}
                </button>
              )}
            </div>

            <div className="sd-tabs">
              {photoTabs.map((tab, i) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`sd-tab${activeTab?.key === tab.key ? " is-on" : ""}`}
                  onClick={() => setPhotoTab(i)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — headline, price, edit form, ledger, stock */}
          <div className="sd-body">
            <section className="sd-card">
              <div className="sd-idblock">
                {editing ? (
                  <label className="sd-field">
                    <span className="sd-label">Saree name</span>
                    <input
                      className="sd-input"
                      value={editForm.name as string}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </label>
                ) : (
                  <h2 className="sd-name">{saree.name}</h2>
                )}

                <p className="sd-meta">
                  {saree.fabric}{saree.region ? ` · ${saree.region}` : ""} · SKU {saree._id.slice(-6).toUpperCase()}
                </p>

                {editing ? (
                  <label className="sd-field sd-field--gap">
                    <span className="sd-label">Price</span>
                    <span className="sd-price-wrap">
                      <span className="sd-price-prefix" aria-hidden>₹</span>
                      <input
                        className="sd-input sd-input--price"
                        type="number"
                        min={SAREE_PRICE_MIN}
                        max={SAREE_PRICE_MAX}
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      />
                    </span>
                  </label>
                ) : (
                  <div className="sd-price-row">
                    <span className="sd-price">₹{saree.price.toLocaleString("en-IN")}</span>
                    {discount > 0 && saree.mrp && (
                      <>
                        <span className="sd-mrp">₹{saree.mrp.toLocaleString("en-IN")}</span>
                        <span className="sd-tag" style={{ background: "#ECF3ED", color: "#27741E" }}>{discount}% off</span>
                      </>
                    )}
                  </div>
                )}

                <div className="sd-tags">
                  <span className="sd-tag" style={{ background: stockTone.bg, color: stockTone.fg }}>{stockTone.label}</span>
                  {approval && (
                    <span className="sd-tag" style={{ background: approval.bg, color: approval.fg }}>{approval.label}</span>
                  )}
                </div>

                {editing ? (
                  <label className="sd-field sd-field--gap">
                    <span className="sd-label">Description</span>
                    <textarea
                      className="sd-input sd-textarea"
                      value={editForm.description as string}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </label>
                ) : saree.description ? (
                  <p className="sd-desc">{saree.description}</p>
                ) : null}
              </div>

              {/* Edit-only fields */}
              {editing && (
                <div className="sd-editblock">
                  <div className="sd-pair">
                    <label className="sd-field">
                      <span className="sd-label">Fabric</span>
                      <span className="sd-select-wrap">
                        <select
                          className="sd-input sd-select"
                          value={editForm.fabric as string}
                          onChange={(e) => setEditForm({ ...editForm, fabric: e.target.value })}
                        >
                          {FABRICS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </span>
                    </label>
                    <label className="sd-field">
                      <span className="sd-label">Region</span>
                      <input
                        className="sd-input"
                        value={editForm.region as string}
                        onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="sd-pair sd-pair--gap">
                    <label className="sd-field">
                      <span className="sd-label">Weave</span>
                      <input
                        className="sd-input"
                        value={editForm.weave as string}
                        onChange={(e) => setEditForm({ ...editForm, weave: e.target.value })}
                      />
                    </label>
                    <label className="sd-field">
                      <span className="sd-label">Care instructions</span>
                      <input
                        className="sd-input"
                        value={editForm.careInstructions as string}
                        onChange={(e) => setEditForm({ ...editForm, careInstructions: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="sd-editactions">
                    <button type="button" className="sd-btn" onClick={() => setEditing(false)} disabled={saving}>
                      Cancel
                    </button>
                    <button type="button" className="sd-btn sd-btn--solid" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Attributes ledger */}
            {!editing && (
              <section className="sd-card">
                <h2 className="sd-card-title">Attributes</h2>
                <div className="sd-ledger">
                  {LEDGER.map(({ k, v }) => (
                    <div key={k} className="sd-lrow">
                      <span className="sd-lk">{k}</span>
                      <span className="sd-lv">{v}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Stock */}
            {!isPending && (
              <section className="sd-card">
                <h2 className="sd-card-title">Stock</h2>
                <div className="sd-stock">
                  <p className="sd-stock-now">
                    Currently <strong>{saree.stock}</strong> in stock
                  </p>
                  <div className="sd-stockrow">
                    <input
                      className="sd-input"
                      type="number"
                      min={0}
                      max={SAREE_STOCK_MAX}
                      value={stockInput}
                      placeholder={String(saree.stock)}
                      onChange={(e) => setStockInput(e.target.value)}
                      aria-label="New stock quantity"
                    />
                    <button type="button" className="sd-btn sd-btn--solid" onClick={handleStockUpdate}>
                      Update
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* ── Performance ── */}
        <section className="sd-card sd-card--wide">
          <h2 className="sd-card-title">Performance</h2>

          <div className="sd-stats">
            {STATS.map((s, i) => (
              <div key={s.label} className="sd-stat" style={{ background: STAT_TONES[i] }}>
                <span className="sd-stat-value">{s.value}</span>
                <span className="sd-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {(saree.tryOns ?? 0) > 0 && (saree.views ?? 0) > 0 ? (
            <div className="sd-bars">
              {[
                { key: "tryon", label: "Try-on rate", pct: tryOnRate },
                { key: "conv", label: "Conversion", pct: conversionRate },
              ].map(({ key, label, pct }) => (
                <div key={key} className="sd-bar">
                  <span className="sd-bar-dot" aria-hidden />
                  <span className="sd-bar-label">{label}</span>
                  <span className="sd-bar-track">
                    <span className="sd-bar-fill" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                  </span>
                  <span className="sd-bar-pct">{pct}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="sd-none">Views and try-ons appear as soon as customers use the kiosk.</p>
          )}
        </section>

        {/* ── Try-on reference card: preview, flags, guides, photo slots ── */}
        <section className="sd-card sd-card--wide">
          <div className="sd-cardpanel">
            <SareeCardPanel sareeId={sareeId} auth="store" />
          </div>
        </section>

        {/* ── QR + AI tags ── */}
        {(saree.approvalStatus === "approved" || (saree.aiTags && saree.aiTags.length > 0)) && (
          <div className="sd-lower">
            {saree.approvalStatus === "approved" && (
              <div className="sd-qr"><SareeQrCard saree={saree} /></div>
            )}
            {saree.aiTags && saree.aiTags.length > 0 && (
              <section className="sd-card">
                <h2 className="sd-card-title">AI tags</h2>
                <div className="sd-chips">
                  {saree.aiTags.map((t) => <span key={t} className="sd-chip">{t}</span>)}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── Danger zone ── */}
        {!isPending && (
          <div className="sd-danger">
            <button type="button" className="sd-delete" onClick={() => setShowDelete(true)}>
              <IconTrash size={16} />
              Delete saree
            </button>
          </div>
        )}
      </div>

      {/* ── Delete dialog ── */}
      {showDelete && (
        <div
          className="sd-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDelete(false); }}
        >
          <div className="sd-sheet">
            <div className="sd-sheet-head">
              <div className="sd-sheet-text">
                <span className="sd-sheet-eyebrow">CATALOGUE</span>
                <h2 className="sd-sheet-title">Delete this saree?</h2>
              </div>
              <button type="button" className="sd-sheet-close" aria-label="Close" onClick={() => setShowDelete(false)}>
                <IconClose />
              </button>
            </div>
            <div className="sd-sheet-rule" />
            <p className="sd-sheet-body">
              This will permanently remove &ldquo;{saree.name}&rdquo; from your catalogue. This cannot be undone.
            </p>
            <div className="sd-sheet-actions">
              <button type="button" className="sd-btn" onClick={() => setShowDelete(false)}>Cancel</button>
              <button type="button" className="sd-btn sd-btn--danger" onClick={handleDelete}>Delete saree</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sd { color: #000; }
        .sd-panel { background: #fff; border-radius: 20px; padding: 16px 0 26px; }

        /* ── Header ───────────────────────────────────────────────── */
        .sd-head { display: flex; align-items: flex-start; gap: 16px; padding: 0 16px; }
        .sd-back {
          width: 35px; height: 35px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          color: var(--w-maroon-l); cursor: pointer;
        }
        .sd-back:hover { border-color: var(--w-maroon-l); }
        .sd-head-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
        .sd-eyebrow {
          font-size: 14px; font-weight: 500; line-height: 17px;
          text-transform: uppercase; color: #000;
        }
        .sd-title {
          margin-top: 8px; font-size: 24px; font-weight: 600; line-height: 29px; color: #000;
          overflow: hidden; text-overflow: ellipsis;
        }
        .sd-head-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; flex-wrap: wrap; }
        .sd-rule { height: 1px; margin: 16px 16px 0; background: #E9E9E9; }

        /* ── Buttons ──────────────────────────────────────────────── */
        .sd-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          height: 40px; padding: 0 18px;
          background: #fff; border: 1px solid var(--w-maroon-l); border-radius: 10px;
          font-family: inherit; font-size: 14px; font-weight: 500; line-height: 17px;
          color: var(--w-maroon-l); white-space: nowrap; cursor: pointer;
        }
        .sd-btn:hover { background: #FAF2F0; }
        .sd-btn--solid { background: var(--w-maroon-l); border-color: var(--w-maroon-l); color: #fff; }
        .sd-btn--solid:hover { background: var(--w-maroon); }
        .sd-btn--danger { background: #C0392B; border-color: #C0392B; color: #fff; }
        .sd-btn--danger:hover { background: #A93226; }
        .sd-btn--tight { height: 34px; align-self: flex-start; }
        .sd-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Banners ──────────────────────────────────────────────── */
        .sd-banner {
          display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
          margin: 16px 16px 0; padding: 12px 16px; border-radius: 10px;
          font-size: 12px; line-height: 1.5;
        }
        .sd-banner :global(strong) { font-size: 13px; font-weight: 700; }
        .sd-banner--stack { flex-direction: column; align-items: flex-start; gap: 6px; }
        .sd-note {
          width: 100%; margin-top: 4px; padding: 10px 12px;
          background: rgba(255, 255, 255, 0.7); border-radius: 8px;
          font-size: 12px; line-height: 1.5;
        }

        /* ── Columns ──────────────────────────────────────────────── */
        .sd-cols {
          display: grid; grid-template-columns: minmax(0, 408fr) minmax(0, 531fr);
          gap: 24px; padding: 21px 16px 0; align-items: start;
        }
        .sd-media { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
        .sd-body { display: flex; flex-direction: column; gap: 21px; min-width: 0; }

        /* ── Hero ─────────────────────────────────────────────────── */
        .sd-hero {
          position: relative; aspect-ratio: 3 / 4; overflow: hidden;
          background: #FAF7F4; border-radius: 16px;
        }
        .sd-hero-tag, .sd-hero-low {
          position: absolute; top: 12px;
          display: inline-flex; align-items: center; height: 23px; padding: 0 12px;
          border-radius: 5px;
          font-size: 10px; font-weight: 600; line-height: 13px;
          backdrop-filter: blur(2.5px);
        }
        .sd-hero-tag { left: 12px; background: rgba(255, 255, 255, 0.8); color: #68262A; }
        .sd-hero-low { right: 12px; background: #F9F3E4; color: #7A5B12; }
        .sd-reupload {
          position: absolute; right: 12px; bottom: 12px;
          height: 34px; padding: 0 14px;
          background: #fff; border: 1px solid var(--w-maroon-l); border-radius: 8px;
          font-family: inherit; font-size: 12px; font-weight: 600; color: var(--w-maroon-l); cursor: pointer;
        }

        .sd-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
        .sd-tab {
          height: 34px; padding: 0 14px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          font-family: inherit; font-size: 12px; font-weight: 500; color: #000;
          white-space: nowrap; cursor: pointer;
          transition: background 0.18s var(--w-ease), color 0.18s var(--w-ease);
        }
        .sd-tab:hover { border-color: var(--w-maroon-l); }
        .sd-tab.is-on { background: var(--w-maroon-l); border-color: var(--w-maroon-l); color: #fff; }

        /* ── Cards ────────────────────────────────────────────────── */
        .sd-card {
          background: #fff;
          border: 0.81px solid #F3F6F7;
          border-radius: 10px;
          box-shadow: 0 1.575px 2.363px rgba(16, 16, 16, 0.16),
                      inset 0 -3.15px 3.15px rgba(255, 255, 255, 0.6);
        }
        .sd-card--wide { margin: 21px 16px 0; }
        .sd-cardpanel { padding: 16px 19px 20px; }
        .sd-card-title {
          display: block; height: 46px; padding: 11.5px 16.2px 11.5px 19.44px;
          border-bottom: 1px solid #D9D9D9;
          font-size: 16px; font-weight: 600; line-height: 23px; color: #161922;
        }

        /* ── Headline block ───────────────────────────────────────── */
        .sd-idblock { padding: 19px; }
        .sd-name { font-size: 20px; font-weight: 600; line-height: 24px; color: #000; }
        .sd-meta { margin-top: 8px; font-size: 12px; font-weight: 500; line-height: 15px; color: #727272; }
        .sd-price-row { display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
        .sd-price { font-size: 32px; font-weight: 600; line-height: 32px; color: #161922; }
        .sd-mrp { font-size: 14px; font-weight: 500; color: #9E9E9E; text-decoration: line-through; }
        .sd-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .sd-tag {
          display: inline-flex; align-items: center; justify-content: center;
          height: 23px; padding: 0 14px; border-radius: 5px;
          font-size: 10px; font-weight: 600; line-height: 13px; white-space: nowrap;
          box-shadow: 0 0 0 0.81px rgba(14, 159, 110, 0.11), 0 1.62px 3.24px rgba(0, 0, 0, 0.05);
        }
        .sd-desc { margin-top: 16px; font-size: 13px; line-height: 1.6; color: #444; }

        /* ── Fields ───────────────────────────────────────────────── */
        .sd-editblock { padding: 0 19px 19px; border-top: 1px solid #E9E9E9; padding-top: 19px; }
        .sd-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .sd-field--gap { margin-top: 16px; }
        .sd-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
        .sd-pair--gap { margin-top: 16px; }
        .sd-label { font-size: 12px; font-weight: 500; line-height: 20px; color: #000; }
        .sd-input {
          width: 100%; height: 40px; padding: 0 10px;
          background: #fff; border: 1px solid #D9D9D9; border-radius: 8px;
          font-family: inherit; font-size: 14px; font-weight: 400; line-height: 20px;
          color: #000; outline: none;
        }
        .sd-input::placeholder { color: #9E9E9E; }
        .sd-input:focus { border-color: var(--w-maroon-l); }
        .sd-textarea { height: 95px; padding: 10px; resize: vertical; }
        .sd-select-wrap { display: block; }
        .sd-select { appearance: none; padding-right: 32px; }
        /* Same maroon prefix tile as the add-to-catalogue price field. */
        .sd-price-wrap { position: relative; display: block; }
        .sd-price-prefix {
          position: absolute; left: 0; top: -1px;
          width: 50.87px; height: 42px;
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--w-maroon-l); border-radius: 8px;
          font-size: 14px; color: #fff; pointer-events: none;
        }
        .sd-input--price { padding-left: 61px; }
        .sd-editactions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

        /* ── Ledger ───────────────────────────────────────────────── */
        .sd-lrow {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          min-height: 39px; padding: 6px 19px;
        }
        .sd-lrow + .sd-lrow { border-top: 1px solid #E9E9E9; }
        .sd-lk { font-size: 12px; font-weight: 500; line-height: 15px; color: #000; flex-shrink: 0; }
        .sd-lv {
          font-size: 12px; font-weight: 500; line-height: 15px; color: #727272;
          text-align: right; min-width: 0; overflow: hidden; text-overflow: ellipsis;
        }

        /* ── Stock ────────────────────────────────────────────────── */
        .sd-stock { padding: 16px 19px 19px; }
        .sd-stock-now { font-size: 12px; font-weight: 500; color: #727272; }
        .sd-stock-now :global(strong) { color: #000; font-weight: 600; }
        .sd-stockrow { display: flex; gap: 10px; margin-top: 12px; }
        .sd-stockrow .sd-input { flex: 1; min-width: 0; }

        /* ── Performance ──────────────────────────────────────────── */
        .sd-stats {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px; padding: 19px 19px 0;
        }
        .sd-stat {
          display: flex; flex-direction: column;
          min-height: 70px; padding: 13px 12px; border-radius: 10px;
        }
        .sd-stat-value { font-size: 22px; font-weight: 600; line-height: 27px; color: #000; }
        .sd-stat-label { font-size: 14px; font-weight: 500; line-height: 17px; color: #727272; }

        .sd-bars { display: flex; flex-direction: column; gap: 17px; padding: 19px 19px 21px; }
        .sd-bar { display: flex; align-items: center; gap: 8px; height: 30px; }
        .sd-bar-dot { width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%; background: #CB857C; }
        .sd-bar-label {
          width: 92px; flex-shrink: 0;
          font-size: 10px; font-weight: 600; line-height: 15px; color: #222222;
        }
        .sd-bar-track {
          flex: 1; min-width: 0; height: 10px;
          background: #D9D9D9; border-radius: 50px; overflow: hidden;
        }
        .sd-bar-fill { display: block; height: 100%; background: var(--w-maroon-l); border-radius: 50px; }
        .sd-bar-pct {
          width: 34px; flex-shrink: 0; text-align: right;
          font-size: 10px; font-weight: 600; line-height: 15px; color: #222222;
        }
        .sd-none { padding: 19px; font-size: 12px; line-height: 1.55; color: #727272; }

        /* ── QR + AI tags ─────────────────────────────────────────── */
        .sd-lower {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 21px; padding: 21px 16px 0; align-items: start;
        }
        .sd-qr { min-width: 0; }
        .sd-chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 19px; }
        .sd-chip {
          display: inline-flex; align-items: center;
          height: 30px; padding: 0 14px;
          background: #FAF7F4; border: 1px solid #D9D9D9; border-radius: 8px;
          font-size: 12px; font-weight: 500; color: #444;
        }

        /* ── Danger zone ──────────────────────────────────────────── */
        .sd-danger { margin: 26px 16px 0; padding-top: 20px; border-top: 1px solid #E9E9E9; }
        .sd-delete {
          display: inline-flex; align-items: center; gap: 8px;
          height: 40px; padding: 0 18px;
          background: #fff; border: 1px solid #C0392B; border-radius: 10px;
          font-family: inherit; font-size: 14px; font-weight: 500;
          color: #C0392B; cursor: pointer;
        }
        .sd-delete:hover { background: #FDF1EF; }

        /* ── Delete dialog ────────────────────────────────────────── */
        .sd-overlay {
          position: fixed; inset: 0; z-index: 60;
          display: flex; align-items: safe center; justify-content: center;
          padding: 24px 16px; background: rgba(0, 0, 0, 0.45); overflow-y: auto;
        }
        .sd-sheet {
          width: 457px; max-width: 100%; padding: 20px 18px;
          background: #fff; border-radius: 16px;
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22);
        }
        .sd-sheet-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .sd-sheet-text { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
        .sd-sheet-eyebrow { font-size: 12px; font-weight: 500; line-height: 15px; color: #727272; }
        .sd-sheet-title { font-size: 16px; font-weight: 600; line-height: 20px; color: #000; }
        .sd-sheet-close {
          width: 24px; height: 24px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border: none; background: none; color: #000; cursor: pointer;
        }
        .sd-sheet-rule { height: 1px; margin-top: 20px; background: #D9D9D9; }
        .sd-sheet-body { padding-top: 20px; font-size: 13px; line-height: 1.6; color: #444; }
        .sd-sheet-actions { display: flex; justify-content: center; gap: 10px; margin-top: 24px; }
        .sd-sheet-actions .sd-btn { width: 141px; }
        .sd-sheet-actions .sd-btn--danger { width: 191px; }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .sd-panel { border-radius: 16px; }
          .sd-title { font-size: 21px; }
          .sd-cols { grid-template-columns: minmax(0, 1fr); }
          .sd-media { max-width: 420px; }
          .sd-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .sd-head { flex-wrap: wrap; }
          .sd-head-actions { width: 100%; }
          .sd-head-actions .sd-btn { flex: 1; }
          .sd-pair { grid-template-columns: minmax(0, 1fr); }
          .sd-stats { grid-template-columns: minmax(0, 1fr); }
          .sd-sheet-actions { flex-direction: column-reverse; }
          .sd-sheet-actions .sd-btn, .sd-sheet-actions .sd-btn--danger { width: 100%; }
        }
      `}</style>
    </div>
  );
}
