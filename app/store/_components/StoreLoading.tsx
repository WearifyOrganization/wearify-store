"use client";

type Props = {
  label: string;
  /** Wrapper class — the layout renders it full-screen, pages render it inline. */
  className?: string;
  markSize?: number;
};

export function StoreLoading({
  label,
  className = "w-page-loading",
  markSize = 18,
}: Props) {
  return (
    <div className={className}>
      <div className="w-loadscreen-inner">
        <div className="w-load-mark">
          <span className="w-logomark-letter" style={{ fontSize: markSize }}>
            W
          </span>
        </div>
        <div>
          <span className="w-load-text">{label}</span>
          <span className="w-load-dots">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>
    </div>
  );
}
