"use client";

import { IconChevronDown, IconReset } from "../StoreIcons";
import { greeting, today, PERIODS, type Period } from "../../_lib/dashboardFormat";

type Props = {
  storeName: string;
  ownerName: string;
  activeSessions: number;
  catalogPct: number;
  conversionRate: number;
  period: Period;
  onPeriodChange: (period: Period) => void;
  onReset: () => void;
};

export function DashboardHeader({
  storeName,
  ownerName,
  activeSessions,
  catalogPct,
  conversionRate,
  period,
  onPeriodChange,
  onReset,
}: Props) {
  return (
    <header className="hm-head">
      <div className="hm-head-text">
        <p className="hm-eyebrow">
          {(storeName || "Your store").toUpperCase()}{" "}
          <span className="hm-eyebrow-dot">•</span> {today()}
        </p>
        <h1 className="hm-title">
          {greeting()}, {ownerName || "there"} <span aria-hidden>👋</span>
        </h1>
        <p className="hm-sub">
          <strong>{activeSessions}</strong> sessions live now{" "}
          <span className="hm-sub-dot">•</span> Catalogue{" "}
          <strong>{catalogPct}%</strong> live <span className="hm-sub-dot">•</span>{" "}
          Converting at <strong>{conversionRate}%</strong>
        </p>
      </div>

      <div className="hm-controls">
        <label className="hm-period">
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value as Period)}
            aria-label="Reporting period"
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <span className="hm-period-text">{period}</span>
          <IconChevronDown size={13} />
        </label>
        <button type="button" className="hm-reset" onClick={onReset}>
          Reset data
          <IconReset size={19} />
        </button>
      </div>
    </header>
  );
}
