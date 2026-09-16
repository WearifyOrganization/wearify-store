"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@wearify/shared/api";
import { useUploadFile } from "@/lib/useUpload";
import { SAREE_COLORS } from "@wearify/shared/colors";
import { GUARDS } from "@/lib/uploadGuards";
import { compressImage, FLAT_LAY_MAX_DIM } from "@/lib/imageCompress";
import { Id } from "@wearify/shared/dataModel";
import { getToken } from "@/lib/phoneAuth";
import { cleanError } from "@/components/ui/toast";
import {
  IconBack, IconCaret, IconPlusSmall, IconAlert,
  IconSlotModel, IconSlotFlatLay, IconSlotBody, IconSlotPallu, IconSlotBorder, IconSlotBlouse,
} from "../../_components/AddCatalogueIcons";
import { useAuthUser } from "@/lib/useAuth";
import {
  SAREE_PRICE_MAX,
  SAREE_PRICE_MIN,
  SAREE_STOCK_MAX,
  validateSareeName,
  validateSareePhotos,
  validateSareePrice,
  validateSareeStock,
} from "@wearify/shared/sareeLimits";
import {
  FLAT_LAY_GUIDE,
  FLAT_LAY_MIN_SHORT_EDGE,
  PHOTO_SLOTS,
  OPTIONAL_PHOTO_SLOTS,
  REQUIRED_PHOTO_SLOTS,
  type PhotoSlotKey,
  type SareePhotos,
} from "@wearify/shared/sareePhotos";

/* Add new saree — built to the Surface Pro 8 handoff. Panel 995x660 with a
   515 / 408 split (21px gutter); the photo dropzones are the handoff's 2x2 of
   231.41 x 129.25 dashed tiles. Every glyph comes from the shipped
   public/store/add-catalouge/ fragments — see AddCatalogueIcons. */

const TYPES = ["Banarasi", "Kanjeevaram", "Chanderi", "Tussar", "Organza", "Chiffon", "Georgette", "Cotton", "Linen", "Paithani"];
const FABRICS = ["Silk", "Pure Silk", "Cotton", "Georgette", "Crepe", "Chiffon", "Linen", "Cotton-Silk", "Organza", "Tissue"];
const OCCASIONS = ["Wedding", "Festival", "Party", "Office", "Daily", "Gift"];
const WEIGHTS = ["Light", "Medium", "Heavy"];


/* The seven named slots (convex/shared/sareePhotos). Only the model and flat
   lay are required; the close-ups sharpen the try-on reference card and each
   falls back to a crop of the flat lay when absent. The flat lay is the one
   garment authority for the try-on — there is no separate "AI image". */
const SLOT_ICONS: Record<PhotoSlotKey, (p: { size?: number }) => React.JSX.Element> = {
  model: IconSlotModel,
  flatLay: IconSlotFlatLay,
  body: IconSlotBody,
  pallu: IconSlotPallu,
  hemBorder: IconSlotBorder,
  shoulderBorder: IconSlotBorder,
  blouse: IconSlotBlouse,
};

type PhotoKey = PhotoSlotKey;
type PhotoState = Record<PhotoKey, File | null>;
type PhotoPreview = Record<PhotoKey, string | null>;

const EMPTY_PHOTOS: PhotoState = { model: null, flatLay: null, body: null, pallu: null, hemBorder: null, shoulderBorder: null, blouse: null };
const EMPTY_PREVIEWS: PhotoPreview = Object.fromEntries(
  Object.keys(EMPTY_PHOTOS).map((k) => [k, null]),
) as PhotoPreview;

export default function AddSareePage() {
  const router = useRouter();
  const createSaree = useMutation(api.sarees.create);
  const { upload } = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<PhotoKey | null>(null);

  // Cached at login; re-read during render so there is no loading pass.
  const storeId = useAuthUser()?.storeId ?? null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showAdditional, setShowAdditional] = useState(false);

  const [photos, setPhotos] = useState<PhotoState>(EMPTY_PHOTOS);
  const [previews, setPreviews] = useState<PhotoPreview>(EMPTY_PREVIEWS);
  // A soft warning, not a block: a small flat lay still builds a card, but
  // its border strips go soft, and the merchant can reshoot now rather than
  // after the card comes back flagged.
  const [flatLayWarning, setFlatLayWarning] = useState("");

  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiDone, setAiDone] = useState(false);
  const [aiTagging, setAiTagging] = useState(false);
  const [newTag, setNewTag] = useState("");

  const [name, setName] = useState("");
  // Required attributes start EMPTY, not at options[0]. Defaulting the colour
  // to SAREE_COLORS[0] silently filed every untouched saree as "Red" — the same
  // trap for fabric/type/occasion. The user picks, or Save tells them to.
  const [type, setType] = useState("");
  const [fabric, setFabric] = useState("");
  const [occasion, setOccasion] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [weave, setWeave] = useState("");
  const [weight, setWeight] = useState("");
  const [careInstructions, setCareInstructions] = useState("");

  const photoCount = Object.values(photos).filter(Boolean).length;
  const requiredDone = REQUIRED_PHOTO_SLOTS.filter((k) => photos[k]).length;
  const optionalDone = OPTIONAL_PHOTO_SLOTS.filter((k) => photos[k]).length;
  const requiredMet = requiredDone === REQUIRED_PHOTO_SLOTS.length;

  useEffect(() => {
    if (photoCount >= 2 && !aiTagging && !aiDone) autoTagFromAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoCount]);

  // Derive tags from the attributes actually selected — deterministic, editable.
  function autoTagFromAttributes() {
    setAiTagging(true); setAiDone(false); setAiTags([]);
    setTimeout(() => {
      const tags = [type, fabric, occasion, color, region, weave]
        .map((v) => (v || "").trim())
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i);
      setAiTags(tags); setAiTagging(false); setAiDone(true);
    }, 600);
  }

  function handlePhotoClick(slot: PhotoKey) {
    setActiveSlot(slot);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!activeSlot || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setPhotos((prev) => ({ ...prev, [activeSlot]: file }));
    setPreviews((prev) => ({ ...prev, [activeSlot]: URL.createObjectURL(file) }));
    setError("");
    if (activeSlot === "flatLay") checkFlatLay(file);
    e.target.value = "";
  }

  async function checkFlatLay(file: File) {
    setFlatLayWarning("");
    if (typeof createImageBitmap !== "function") return;
    try {
      const bmp = await createImageBitmap(file);
      const short = Math.min(bmp.width, bmp.height);
      bmp.close();
      if (short < FLAT_LAY_MIN_SHORT_EDGE) {
        setFlatLayWarning(`This flat lay is only ${short}px on its short edge — under ${FLAT_LAY_MIN_SHORT_EDGE}px the border detail will not survive in the try-on. A larger photo is better.`);
      }
    } catch {
      /* unreadable here; the server will still validate it */
    }
  }

  function clearSlot(slot: PhotoKey) {
    setError("");
    if (slot === "flatLay") setFlatLayWarning("");
    setPhotos((prev) => ({ ...prev, [slot]: null }));
    setPreviews((prev) => ({ ...prev, [slot]: null }));
  }

  function removeTag(tag: string) { setAiTags(aiTags.filter((t) => t !== tag)); }
  function addTag() {
    const t = newTag.trim();
    if (t && !aiTags.includes(t)) { setAiTags([...aiTags, t]); setNewTag(""); }
  }

  /* Any edit clears a stale banner. It used to survive until the next Save, so
     the form went on accusing you of a field you had already fixed — and the
     photo dropzones were the only input that cleared it. Mirrors the mark()
     wrapper /c/me/profile already uses. */
  function edited<T>(set: (v: T) => void) {
    return (v: T) => { setError(""); set(v); };
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function handleSave(addAnother: boolean) {
    // Same rules the mutation enforces (convex/shared/sareeLimits), run here
    // BEFORE any upload — the old order uploaded first and only then let
    // sarees.create reject the row, stranding the blobs in storage.
    const invalid =
      validateSareeName(name) ??
      validateSareePrice(Number(price)) ??
      validateSareeStock(Number(stock)) ??
      (Number(stock) < 1 ? "Stock must be at least 1" : null) ??
      (!fabric || !color || !type || !occasion
        ? "Choose fabric, primary colour, type and occasion"
        : null) ??
      validateSareePhotos(photos);
    if (invalid) { setError(invalid); return; }
    if (!storeId) { setError("Store ID not found. Please re-login."); return; }

    setLoading(true); setError("");
    try {
      // Upload photos in parallel before writing the row so one slow upload
      // doesn't block the rest. Each is downscaled + WebP-compressed first;
      // the flat lay keeps more pixels because the card is cut from it.
      const filled = PHOTO_SLOTS.map((s) => s.key).filter((k) => photos[k]);
      const uploaded = await Promise.all(
        filled.map(async (k) => {
          const compressed = await compressImage(photos[k]!, k === "flatLay" ? { maxDim: FLAT_LAY_MAX_DIM } : {});
          return [k, await upload(compressed, GUARDS.sareePhoto, { token: getToken() ?? undefined })] as const;
        }),
      );
      const slotIds: SareePhotos = {};
      for (const [k, id] of uploaded) slotIds[k] = id as Id<"_storage">;

      const stockNum = parseInt(stock);
      const status = stockNum <= 0 ? "out_of_stock" : stockNum <= 5 ? "low_stock" : "active";

      await createSaree({
        token: getToken() ?? undefined,
        storeId, name: name.trim(), type, fabric, occasion,
        price: parseFloat(price), stock: stockNum, status,
        colors: [color], colorName: color,
        description: description.trim() || undefined,
        region: region.trim() || undefined, weave: weave.trim() || undefined,
        weight: weight || undefined, careInstructions: careInstructions.trim() || undefined,
        aiTags: aiTags.length > 0 ? aiTags : undefined,
        photos: slotIds,
      });

      if (addAnother) {
        showToast("Saree added! Form reset.");
        setName(""); setPrice(""); setStock("1"); setDescription("");
        setRegion(""); setWeave(""); setWeight(""); setCareInstructions("");
        setPhotos(EMPTY_PHOTOS); setPreviews(EMPTY_PREVIEWS); setFlatLayWarning("");
        setAiTags([]); setAiDone(false);
      } else {
        router.push("/store/inventory");
      }
    } catch (err: unknown) {
      setError(cleanError(err, "Failed to add saree"));
    } finally { setLoading(false); }
  }

  return (
    <div className="ac">
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

      <div className="ac-panel">
        {/* ── Panel header ── */}
        <div className="ac-head">
          <button type="button" className="ac-back" onClick={() => router.back()} aria-label="Back to catalogue">
            <IconBack />
          </button>
          <h1 className="ac-title">Catalogue</h1>
        </div>
        <div className="ac-rule" />
        <h2 className="ac-subtitle">Add new saree</h2>

        {error && (
          <div className="ac-error" role="alert">
            <IconAlert size={13} />
            {error}
          </div>
        )}

        <div className="ac-cols">
          {/* ════ LEFT · photos + additional detail ════ */}
          <div className="ac-left">
            <section className="ac-photos">
              <h3 className="ac-h3">Photos</h3>
              <p className="ac-hint">
                Model and flat lay are required. Body, pallu, both borders and the blouse are optional — each one sharpens the try-on.
              </p>
              <p className="ac-guide">{FLAT_LAY_GUIDE}</p>
              {flatLayWarning && (
                <p className="ac-warn" role="status">
                  <IconAlert size={11} />
                  {flatLayWarning}
                </p>
              )}

              <div className="ac-zones">
                {PHOTO_SLOTS.map(({ key, label, hint, required }) => {
                  const Icon = SLOT_ICONS[key];
                  const preview = previews[key];
                  return (
                    <div key={key} className={`ac-zone${preview ? " is-filled" : ""}`}>
                      <button
                        type="button"
                        className="ac-zone-btn"
                        title={hint}
                        onClick={() => handlePhotoClick(key)}
                        aria-label={preview ? `Replace ${label} photo` : `Add ${label} photo`}
                      >
                        {preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={preview} alt={label} className="ac-zone-img" />
                        ) : (
                          <>
                            <Icon size={28} />
                            <IconPlusSmall />
                            <span className="ac-zone-label">{label}</span>
                            <span className={`ac-zone-req${required ? " is-required" : ""}`}>{required ? "Required" : "Optional"}</span>
                          </>
                        )}
                      </button>
                      {preview && (
                        <>
                          <span className="ac-zone-tag">{label}</span>
                          <button type="button" className="ac-zone-x" onClick={() => clearSlot(key)} aria-label={`Remove ${label} photo`}>
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className={`ac-req${requiredMet ? " is-met" : ""}`}>
                <IconAlert size={10} />
                {requiredDone} of {REQUIRED_PHOTO_SLOTS.length} required photos added
                <span className="ac-req-opt"> · {optionalDone} of {OPTIONAL_PHOTO_SLOTS.length} optional</span>
              </p>
            </section>

            {/* Additional Detail — collapsible maroon bar */}
            <section className={`ac-more${showAdditional ? " is-open" : ""}`}>
              <button type="button" className="ac-more-bar" onClick={() => setShowAdditional((v) => !v)} aria-expanded={showAdditional}>
                <span className="ac-more-title">Additional Detail</span>
                <span className="ac-more-right">
                  Optional
                  <span className="ac-more-caret"><IconCaret /></span>
                </span>
              </button>

              {showAdditional && (
                <div className="ac-more-body">
                  <Field label="Description">
                    <textarea className="ac-input ac-textarea" rows={3} value={description}
                      onChange={(e) => setDescription(e.target.value)} placeholder="Weave, drape, styling notes…" />
                  </Field>
                  <div className="ac-row">
                    <Field label="Region"><input className="ac-input" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g., Mumbai" /></Field>
                    <Field label="Weave"><input className="ac-input" value={weave} onChange={(e) => setWeave(e.target.value)} placeholder="e.g., Handloom" /></Field>
                  </div>
                  <div className="ac-row">
                    <Field label="Weight">
                      <Select value={weight} onChange={setWeight} options={["", ...WEIGHTS]} placeholder="Select" />
                    </Field>
                    <Field label="Care instructions"><input className="ac-input" value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} placeholder="e.g., Dry clean only" /></Field>
                  </div>

                  {(aiTagging || aiDone) && (
                    <Field label="Auto-tags">
                      {aiTagging ? (
                        <span className="ac-hint">Deriving tags…</span>
                      ) : (
                        <div className="ac-tags">
                          {aiTags.map((t) => (
                            <span key={t} className="ac-tag">
                              {t}
                              <button type="button" onClick={() => removeTag(t)} aria-label={`Remove ${t}`}>×</button>
                            </span>
                          ))}
                          <input
                            className="ac-tag-input"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                            placeholder="Add tag…"
                          />
                        </div>
                      )}
                    </Field>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* ════ RIGHT · basic details ════ */}
          <section className="ac-basic">
            <h3 className="ac-h3">Basic Details</h3>

            <div className="ac-fields">
              <Field label="Saree name">
                <input className="ac-input" value={name} onChange={(e) => edited(setName)(e.target.value)} placeholder="e.g., KAnjivaram Bridal Silk" />
              </Field>

              <Field label="Price (₹)" required>
                <div className="ac-price">
                  <span className="ac-price-prefix">₹</span>
                  <input className="ac-input ac-price-input" type="number" inputMode="numeric" value={price}
                    min={SAREE_PRICE_MIN} max={SAREE_PRICE_MAX}
                    onChange={(e) => edited(setPrice)(e.target.value)} placeholder="12500" />
                </div>
              </Field>

              <Field label="Stock qty" required>
                <input className="ac-input" type="number" inputMode="numeric" value={stock}
                  min={1} max={SAREE_STOCK_MAX} onChange={(e) => edited(setStock)(e.target.value)} />
              </Field>

              <div className="ac-row">
                <Field label="Fabric" required><Select value={fabric} onChange={edited(setFabric)} options={["", ...FABRICS]} /></Field>
                <Field label="Primary color" required><Select value={color} onChange={edited(setColor)} options={["", ...SAREE_COLORS]} /></Field>
              </div>

              <div className="ac-row">
                <Field label="Type" required><Select value={type} onChange={edited(setType)} options={["", ...TYPES]} /></Field>
                <Field label="Occasion" required><Select value={occasion} onChange={edited(setOccasion)} options={["", ...OCCASIONS]} /></Field>
              </div>
            </div>

            <div className="ac-actions">
              <button type="button" className="ac-btn ac-btn--ghost" onClick={() => handleSave(true)} disabled={loading}>
                {loading ? "Saving…" : "Save & add another"}
              </button>
              <button type="button" className="ac-btn ac-btn--solid" onClick={() => handleSave(false)} disabled={loading}>
                {loading ? "Saving…" : "Save"}
              </button>
            </div>
          </section>
        </div>
      </div>

      {toast && <div className="ac-toast">{toast}</div>}

      <style jsx>{`
        /* ── Panel ────────────────────────────────────────────────── */
        .ac { color: #000; }
        .ac-panel { background: #fff; border-radius: 20px; padding: 18px 0 26px; }
        .ac-head { display: flex; align-items: center; gap: 10px; padding: 0 26px; }
        .ac-back {
          width: 35px; height: 35px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid var(--w-maroon-l); border-radius: 50%;
          background: #fff; color: var(--w-maroon-l); cursor: pointer;
          box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
          transition: background 0.18s var(--w-ease);
        }
        .ac-back:hover { background: var(--w-cream-deep); }
        .ac-title { font-size: 24px; font-weight: 600; line-height: 29px; color: #000; }
        .ac-rule { height: 1px; margin: 18px 25px 0; background: #E9E9E9; }
        .ac-subtitle { padding: 21px 26px 0; font-size: 20px; font-weight: 500; line-height: 24px; }

        .ac-error {
          display: flex; align-items: center; gap: 8px;
          margin: 14px 26px 0; padding: 10px 14px;
          border-radius: 8px;
          background: rgba(192, 57, 43, 0.08);
          color: #C0392B; font-size: 13px; font-weight: 600;
        }

        /* Handoff split: 515 / 408 with a 21px gutter (944 content width). */
        .ac-cols {
          display: grid;
          grid-template-columns: minmax(0, 515fr) minmax(0, 408fr);
          gap: 21px;
          align-items: start;
          padding: 21px 25px 0 26px;
        }
        .ac-left { display: flex; flex-direction: column; gap: 21px; }

        /* ── Photos ───────────────────────────────────────────────── */
        .ac-photos { background: #FAF7F4; border-radius: 16px; padding: 16px 20px 20px; }
        .ac-h3 { font-size: 16px; font-weight: 600; line-height: 20px; color: #000; }
        .ac-hint { margin-top: 8px; font-size: 16px; font-weight: 500; line-height: 20px; color: #727272; }
        .ac-guide { margin-top: 8px; font-size: 13px; line-height: 18px; color: #4A4A4A; }
        .ac-warn {
          display: flex; align-items: flex-start; gap: 6px;
          margin-top: 10px; padding: 8px 12px; border-radius: 8px;
          background: #F9F3E4; color: #7A5B12; font-size: 12px; font-weight: 500; line-height: 16px;
        }

        .ac-zones {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px 13px;
          margin-top: 16px;
        }
        .ac-zone { position: relative; }
        .ac-zone-btn {
          width: 100%;
          aspect-ratio: 231 / 129;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 4px;
          border: 2px dashed var(--w-maroon-l);
          border-radius: 10px;
          background: #fff;
          color: var(--w-maroon-l);
          cursor: pointer;
          overflow: hidden;
          padding: 0;
          transition: background 0.18s var(--w-ease);
        }
        .ac-zone-btn:hover { background: var(--w-cream); }
        .ac-zone.is-filled .ac-zone-btn { border-style: solid; }
        .ac-zone-label { font-size: 16px; font-weight: 500; line-height: 20px; color: #727272; }
        .ac-zone-req { font-size: 10px; font-weight: 600; line-height: 12px; color: #9A9A9A; text-transform: uppercase; letter-spacing: 0.04em; }
        .ac-zone-req.is-required { color: var(--w-maroon-l); }
        .ac-req-opt { font-weight: 500; color: #727272; }
        .ac-zone-img { width: 100%; height: 100%; object-fit: cover; }
        .ac-zone-tag {
          position: absolute; left: 8px; bottom: 8px;
          padding: 2px 8px; border-radius: 100px;
          background: rgba(255, 255, 255, 0.85);
          font-size: 10px; font-weight: 600; color: var(--w-maroon-l);
        }
        .ac-zone-x {
          position: absolute; top: 6px; right: 6px;
          width: 20px; height: 20px; border: none; border-radius: 50%;
          background: rgba(0, 0, 0, 0.55); color: #fff;
          font-size: 14px; line-height: 1; cursor: pointer;
        }

        .ac-req {
          display: flex; align-items: center; gap: 5px;
          margin-top: 14px;
          font-size: 12px; font-weight: 600; line-height: 15px;
          color: var(--w-maroon-l);
        }
        .ac-req.is-met { color: #27741E; }

        /* ── Additional detail ────────────────────────────────────── */
        .ac-more { border-radius: 10px; overflow: hidden; background: var(--w-maroon-l); }
        .ac-more-bar {
          width: 100%; height: 52px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          border: none; background: transparent; cursor: pointer;
          font-family: inherit; color: #fff;
        }
        .ac-more-title { font-size: 16px; font-weight: 600; line-height: 20px; }
        .ac-more-right { display: inline-flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 400; line-height: 17px; }
        .ac-more-caret { display: inline-flex; transition: transform 0.2s var(--w-ease); }
        .ac-more.is-open .ac-more-caret { transform: rotate(180deg); }
        .ac-more-body {
          display: flex; flex-direction: column; gap: 14px;
          padding: 4px 20px 20px;
          background: #FAF7F4;
        }

        /* ── Basic details ────────────────────────────────────────── */
        .ac-basic { background: #FAF7F4; border-radius: 16px; padding: 16px 33px 18px; }
        .ac-fields { display: flex; flex-direction: column; gap: 10px; margin-top: 9px; }
        .ac-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }

        .ac-price { position: relative; display: flex; align-items: center; }
        .ac-price-prefix {
          position: absolute; left: 0; top: -1px;
          width: 50.87px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; background: var(--w-maroon-l);
          color: #fff; font-size: 14px; line-height: 18px;
          pointer-events: none;
        }
        .ac-price-input { padding-left: 61px; }

        .ac-actions { display: flex; gap: 13px; margin-top: 18px; }
        .ac-btn {
          height: 40px; flex: 1;
          border-radius: 8px; cursor: pointer;
          font-family: inherit; font-size: 16px; font-weight: 500; line-height: 20px;
          transition: background 0.18s var(--w-ease);
        }
        .ac-btn--ghost { flex: 188.75; border: 1px solid var(--w-maroon-l); background: #fff; color: var(--w-maroon-l); }
        .ac-btn--ghost:hover { background: var(--w-cream-deep); }
        .ac-btn--solid { flex: 138.89; border: none; background: var(--w-maroon-l); color: #fff; }
        .ac-btn--solid:hover { background: var(--w-maroon-d); }
        .ac-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Tags ─────────────────────────────────────────────────── */
        .ac-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .ac-tag {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 8px; border-radius: 100px;
          background: rgba(104, 38, 42, 0.1);
          font-size: 11px; font-weight: 600; color: var(--w-maroon-l);
        }
        .ac-tag :global(button) { border: none; background: none; cursor: pointer; color: inherit; font-size: 13px; line-height: 1; }
        .ac-tag-input {
          min-width: 90px; height: 26px; padding: 0 8px;
          border: 1px solid #D9D9D9; border-radius: 100px;
          background: #fff; font-family: inherit; font-size: 11px; outline: none;
        }

        .ac-toast {
          position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%);
          padding: 12px 20px; border-radius: 10px;
          background: var(--w-maroon-l); color: #fff;
          font-size: 13px; font-weight: 600; z-index: 60;
        }

        /* ── Reflow ───────────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .ac-cols { grid-template-columns: minmax(0, 1fr); }
        }
        @media (max-width: 900px) {
          .ac-panel { border-radius: 16px; }
          .ac-head, .ac-subtitle { padding-left: 18px; padding-right: 18px; }
          .ac-rule { margin-left: 18px; margin-right: 18px; }
          .ac-cols { padding: 18px; }
          .ac-hint, .ac-zone-label { font-size: 14px; }
          .ac-basic { padding: 16px 18px 18px; }
        }
        @media (max-width: 560px) {
          .ac-row { grid-template-columns: minmax(0, 1fr); }
          .ac-actions { flex-direction: column; }
          .ac-btn { flex: none; width: 100%; }
        }
      `}</style>

      {/* Shared field/select chrome — global so the child components below can
          use it (styled-jsx only scopes JSX inside this component's tree). */}
      <style jsx global>{`
        .ac-field { display: flex; flex-direction: column; gap: 4px; }
        .ac-label { font-size: 12px; font-weight: 500; line-height: 20px; color: #000; }
        .ac-label i { font-style: normal; color: var(--w-maroon-l); }
        .ac-input {
          width: 100%; height: 40px; padding: 0 10px;
          border: 1px solid #D9D9D9; border-radius: 8px;
          background: #fff;
          font-family: var(--w-font), "Montserrat", system-ui, sans-serif;
          font-size: 14px; font-weight: 400; line-height: 20px; color: #000;
          outline: none;
          transition: border-color 0.18s var(--w-ease);
        }
        .ac-input:focus { border-color: var(--w-maroon-l); }
        .ac-input::placeholder { color: rgba(0, 0, 0, 0.4); }
        .ac-textarea { height: auto; padding: 10px; resize: vertical; }
        .ac-select-wrap { position: relative; display: block; }
        .ac-select-wrap select {
          appearance: none;
          padding-right: 30px;
          cursor: pointer;
        }
        .ac-select-caret {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          display: inline-flex; color: #141B34; pointer-events: none;
        }
      `}</style>
    </div>
  );
}

/* ── Field / Select ─────────────────────────────────────────────── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="ac-field">
      <span className="ac-label">{label}{required && <i>*</i>}</span>
      {children}
    </label>
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <span className="ac-select-wrap">
      <select className="ac-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o || "_"} value={o}>{o || placeholder || "Select"}</option>
        ))}
      </select>
      <span className="ac-select-caret"><IconCaret /></span>
    </span>
  );
}
