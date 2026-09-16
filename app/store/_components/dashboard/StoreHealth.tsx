"use client";

import { band } from "../../_lib/dashboardFormat";

const RING_R = 55.8;
const RING_C = 2 * Math.PI * RING_R;

export type HealthRow = { label: string; pct: number };

type Props = {
  healthScore: number;
  rows: HealthRow[];
};

/* 124px donut — 62px outer radius, 12.4px band, so r = 55.8 (handoff geometry). */
function ScoreRing({ score }: { score: number }) {
  const clamped = Math.min(Math.max(score, 0), 100);
  const { label, tone } = band(score);

  return (
    <div className="hm-ring">
      <svg width="124" height="124" viewBox="0 0 124 124" aria-hidden>
        <circle
          cx="62"
          cy="62"
          r={RING_R}
          fill="none"
          stroke="var(--w-maroon-l)"
          strokeOpacity="0.6"
          strokeWidth="12.4"
        />
        <circle
          cx="62"
          cy="62"
          r={RING_R}
          fill="none"
          stroke="var(--w-maroon-l)"
          strokeWidth="12.4"
          strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={RING_C - (clamped / 100) * RING_C}
          transform="rotate(-90 62 62)"
          style={{ transition: "stroke-dashoffset 0.9s var(--w-ease)" }}
        />
      </svg>
      <div className="hm-ring-mid">
        <span className="hm-ring-pct">{score}%</span>
        <span className="hm-ring-cap">Overall Score</span>
        <span className={`hm-ring-band hm-ring-band--${tone}`}>
          <span className="hm-ring-dot" />
          {label}
        </span>
      </div>
    </div>
  );
}

function HealthBar({ label, pct }: HealthRow) {
  const { label: bandLabel, tone } = band(pct);
  return (
    <div className="hm-bar-row">
      <span className="hm-bar-dot" aria-hidden />
      <span className="hm-bar-label">{label}</span>
      <span className="hm-bar-track">
        <span className="hm-bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
      </span>
      <span className="hm-bar-pct">{pct}%</span>
      <span className={`hm-pill hm-pill--${tone}`}>{bandLabel}</span>
    </div>
  );
}

export function StoreHealth({ healthScore, rows }: Props) {
  return (
    <section className="hm-card hm-health">
      <h2 className="hm-card-title">Store Health</h2>
      <div className="hm-health-body">
        <ScoreRing score={healthScore} />
        <div className="hm-bars">
          {rows.map((row) => (
            <HealthBar key={row.label} {...row} />
          ))}
        </div>
      </div>
    </section>
  );
}
