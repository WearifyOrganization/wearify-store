"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { encodeSareeQr, downloadSareeQrPng } from "@/lib/sareeQr";
import { useToast, cleanError } from "@/components/ui/toast";

type SareeQrCardSaree = {
  _id: string;
  name: string;
  approvalStatus?: string;
};

export default function SareeQrCard({ saree }: { saree: SareeQrCardSaree }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toast = useToast();
  const [renderFailed, setRenderFailed] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRenderFailed(false);
    QRCode.toCanvas(canvasRef.current, encodeSareeQr(saree._id), {
      width: 180,
      margin: 1,
      errorCorrectionLevel: "M",
    }).catch((e) => {
      console.error("Failed to render saree QR", e);
      setRenderFailed(true);
    });
  }, [saree._id]);

  // Defensive: parent also gates on approvalStatus.
  if (saree.approvalStatus !== "approved") return null;

  const sku = saree._id.slice(-6).toUpperCase();

  async function handleDownload() {
    try {
      await downloadSareeQrPng(saree._id, saree.name, sku);
    } catch (e) {
      toast(cleanError(e, "Couldn't download the QR — please try again."), "error");
    }
  }

  return (
    <div className="w-card w-card-padded">
      <div className="w-card-header"><span className="w-card-title">Saree QR</span></div>
      {/* Wraps: text beside the code when the card is wide, stacked when narrow. */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
        <div style={{ flex: "1 1 240px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
          <p style={{ fontSize: 13, color: "var(--w-ink-muted)", margin: 0, maxWidth: 340 }}>
            Print and attach to the saree — scan it at the kiosk to open this saree.
          </p>
          {renderFailed && (
            <p style={{ fontSize: 13, color: "var(--w-danger, #c0392b)", margin: 0 }}>
              Couldn&apos;t generate the QR code in this browser. Try refreshing the page.
            </p>
          )}
          <div className="w-mono" style={{ fontSize: 13, color: "var(--w-ink-muted)" }}>SKU {sku}</div>
          {!renderFailed && (
            <button className="w-btn w-btn-primary w-btn-sm" onClick={handleDownload}>
              Download QR
            </button>
          )}
        </div>
        {!renderFailed && (
          <div style={{ flex: "0 0 auto", margin: "0 auto" }}>
            <canvas ref={canvasRef} style={{ borderRadius: 8, display: "block" }} />
          </div>
        )}
      </div>
    </div>
  );
}
