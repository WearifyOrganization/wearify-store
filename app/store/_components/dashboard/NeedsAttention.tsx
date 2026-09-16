"use client";

import { useRouter } from "next/navigation";
import { ShieldAllClear } from "../StoreIcons";

type Props = {
  lowStockCount: number;
  agingCount: number;
  /** False while the catalogue is still loading — neither state is known yet. */
  loaded: boolean;
};

export function NeedsAttention({ lowStockCount, agingCount, loaded }: Props) {
  const router = useRouter();
  const allClear = loaded && lowStockCount === 0 && agingCount === 0;

  const detail = [
    lowStockCount > 0
      ? `${lowStockCount} item${lowStockCount > 1 ? "s" : ""} low on stock`
      : null,
    agingCount > 0
      ? `${agingCount} style${agingCount > 1 ? "s" : ""} sitting 60+ days`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="hm-card hm-attn">
      <h2 className="hm-card-title">Needs Attention</h2>
      <div className="hm-attn-body">
        <div className="hm-attn-text">
          <span className="hm-attn-title">
            {allClear ? "All clear" : "Action needed"}
          </span>
          <p className="hm-attn-copy">
            {allClear ? "No low stock or aging style right now." : detail}
          </p>
          <button
            type="button"
            className="hm-attn-link"
            onClick={() => router.push("/store/inventory")}
          >
            View inventory
          </button>
        </div>
        <span className="hm-attn-art" aria-hidden>
          <ShieldAllClear />
        </span>
      </div>
    </section>
  );
}
