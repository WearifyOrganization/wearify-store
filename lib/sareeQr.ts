import QRCode from "qrcode";

// Shared QR contract between /store (encode + download) and /kiosk (decode).
// We reuse the saree's permanent Convex _id as the payload — no DB field, no
// stored image. The prefix lets the kiosk reject random/non-Wearify QRs.
export const SAREE_QR_PREFIX = "wfsaree:";

export function encodeSareeQr(id: string): string {
  return `${SAREE_QR_PREFIX}${id}`;
}

// Returns the saree id if the scanned text is a Wearify saree QR, else null.
export function parseSareeQr(text: string): string | null {
  const t = text.trim();
  if (!t.startsWith(SAREE_QR_PREFIX)) return null;
  const id = t.slice(SAREE_QR_PREFIX.length).trim();
  return id.length > 0 ? id : null;
}

// Renders a printable PNG: the QR on top, saree name + SKU labelled underneath,
// and triggers a browser download. Client-only (uses canvas/DOM).
export async function downloadSareeQrPng(
  id: string,
  name: string,
  sku: string,
): Promise<void> {
  const QR_SIZE = 512;
  const PAD = 32;
  const NAME_H = 44;
  const SKU_H = 30;
  const W = QR_SIZE + PAD * 2;
  const H = QR_SIZE + PAD * 2 + NAME_H + SKU_H;

  const dataUrl = await QRCode.toDataURL(encodeSareeQr(id), {
    width: QR_SIZE,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  const qrImg = await loadImage(dataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(qrImg, PAD, PAD, QR_SIZE, QR_SIZE);

  ctx.textAlign = "center";
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "600 30px system-ui, -apple-system, sans-serif";
  ctx.fillText(truncate(name, 26), W / 2, QR_SIZE + PAD * 2 + 4, QR_SIZE);
  ctx.fillStyle = "#8a8a8a";
  ctx.font = "500 22px system-ui, -apple-system, sans-serif";
  ctx.fillText(`SKU ${sku}`, W / 2, QR_SIZE + PAD * 2 + NAME_H, QR_SIZE);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Failed to render QR image");

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wearify-qr-${sku}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
