"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@wearify/shared/api";
import { Id } from "@wearify/shared/dataModel";

/**
 * Renders an image from Convex storage, optimized by next/image.
 * Shows a placeholder while loading or if no fileId provided.
 *
 * Uses `fill`, so the PARENT must be positioned (relative/absolute/fixed) and
 * carry the dimensions. Every current call site already is — the portfolio
 * tiles use `position: relative` with an aspect-ratio, which is exactly the
 * shape `fill` expects.
 *
 * `sizes` matters: without it next/image assumes 100vw and ships a
 * full-viewport file for what is usually a small tile. The default below suits
 * the 3-up portfolio grids; pass your own for anything larger.
 */
export function ConvexImage({
  fileId,
  alt,
  style,
  className,
  placeholder,
  sizes = "(max-width: 900px) 33vw, 240px",
  priority,
}: {
  fileId?: Id<"_storage"> | null;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  placeholder?: React.ReactNode;
  sizes?: string;
  priority?: boolean;
}) {
  const url = useQuery(
    api.files.getUrl,
    fileId ? { fileId } : "skip"
  );

  if (!fileId || url === undefined) {
    return <>{placeholder || null}</>;
  }

  if (url === null) {
    return <>{placeholder || null}</>;
  }

  return (
    <Image
      src={url}
      alt={alt || "Image"}
      fill
      sizes={sizes}
      priority={priority}
      // `fill` already applies position/inset/width/height; callers pass
      // objectFit (and occasionally redundant 100% sizing) through style.
      style={{ objectFit: "cover", ...style }}
      className={className}
    />
  );
}

/**
 * Hook to get a single Convex storage URL.
 * Returns `undefined` while the query is loading, `null` when there's no URL
 * (skipped / resolved-empty), or the URL string. Callers that only care about
 * truthiness can ignore the undefined/null distinction; SareeThumb uses it to
 * tell "still loading" from "no image" so it can show a shimmer, not a fallback.
 */
export function useConvexUrl(fileId?: Id<"_storage"> | null): string | null | undefined {
  return useQuery(
    api.files.getUrl,
    fileId ? { fileId } : "skip"
  );
}
