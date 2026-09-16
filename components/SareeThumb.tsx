"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Id } from "@wearify/shared/dataModel";
import { useConvexUrl } from "@/lib/ConvexImage";

// Local-asset fallback for seeded sarees (served from /public/inventory).
// Keyed by exact saree.name. Seeded sarees were shipped with repo-local images
// before Convex Storage uploads existed, so they don't have imageIds.
export const SAREE_IMAGE: Record<string, string> = {
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

type SareeThumbProps = {
  name: string;
  fileId?: Id<"_storage"> | null;
  grad?: string[];
  imageCount?: number;
  // next/image `sizes` — the rendered CSS width of this thumb, so the optimizer
  // serves an appropriately small file. Default suits card/grid use; large
  // surfaces (the detail gallery) should pass their own.
  sizes?: string;
  // ponytail: emoji/emojiSize retained for call-site compat; no longer rendered
  // (replaced by a "No photos" label — emoji read as unprofessional).
  emoji?: string;
  emojiSize?: number;
  gradientAngle?: number;
  // "cover" crops to fill. "contain" shows everything but letterboxes.
  // "fill" shows everything AND fills the box by stretching on the short axis —
  // no bars, at the cost of distortion proportional to the aspect mismatch.
  fit?: "cover" | "contain" | "fill";
  /** Load immediately instead of next/image's default `loading="lazy"`.
   *  For anything that MOVES ITSELF into view — the kiosk's Trending marquee —
   *  lazy loading is wrong: the card slides in, only then starts fetching, and
   *  the customer sees the shimmer skeleton pop to a photo at the same spot on
   *  every pass. IntersectionObserver has no way to know the card was always
   *  going to arrive. */
  eager?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

// Local seeded image → Convex Storage URL → gradient placeholder + count label.
// The image fades in only once its pixels have actually painted; until then a
// frosted shimmer sits over a neutral gradient, so nothing flashes on first
// load (no alt text, no blank frame). Fills its parent — size the wrapper.
export function SareeThumb({
  name,
  fileId,
  grad,
  imageCount,
  sizes = "(max-width: 900px) 50vw, 33vw",
  gradientAngle = 145,
  fit = "cover",
  eager = false,
  className,
  style,
}: SareeThumbProps) {
  const localSrc = SAREE_IMAGE[name];
  // Only fetch the Convex URL if the local-seed map didn't resolve.
  const url = useConvexUrl(!localSrc ? fileId : null);
  const src = localSrc || url || null;

  // Track which src has finished painting. Keyed by src so switching sarees
  // re-arms the shimmer for the new image instead of showing it prematurely.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = !!src && loadedSrc === src;

  const g = grad && grad.length ? grad : ["#E8E0D4", "#D4A843"];
  const bg = `linear-gradient(${gradientAngle}deg, ${g[0]}, ${g[1] || g[0]})`;

  // `url === undefined` = the Convex URL query is still resolving; keep the
  // shimmer up for that window too so there's no gap before the <img> mounts.
  const pending = !!fileId && !localSrc && url === undefined;

  if (src || pending) {
    return (
      <div
        className={className}
        style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: bg, ...style }}
      >
        {!loaded && <span className="st-glass-skel" aria-hidden />}
        {src && (
          <Image
            key={src}
            src={src}
            alt={name}
            fill
            sizes={sizes}
            loading={eager ? "eager" : undefined}
            onLoad={() => setLoadedSrc(src)}
            // The image sits above the shimmer and stays visible: while loading
            // it's transparent (shimmer shows through), once painted it covers
            // the shimmer. No opacity gate, so a cache hit whose load fires
            // before React attaches can never get stuck invisible.
            style={{ objectFit: fit }}
          />
        )}
        <style jsx>{`
          .st-glass-skel {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(232, 224, 212, 0.55), rgba(212, 168, 67, 0.28));
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
          .st-glass-skel::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
              105deg,
              transparent 30%,
              rgba(255, 255, 255, 0.55) 50%,
              transparent 70%
            );
            transform: translateX(-100%);
            animation: st-sheen 1.6s ease-in-out infinite;
          }
          @keyframes st-sheen {
            to {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }

  // Genuinely no photo → gradient with a neutral count label (was an emoji).
  const label = imageCount ? `${imageCount} photo${imageCount === 1 ? "" : "s"}` : "No photos";
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        background: bg,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <span
        style={{
          fontSize: "clamp(10px, 1.1vw, 13px)",
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: "rgba(94, 74, 42, 0.72)",
          textAlign: "center",
          padding: "0 6px",
        }}
      >
        {label}
      </span>
    </div>
  );
}
