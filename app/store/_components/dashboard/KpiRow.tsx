"use client";

import {
  IconMoney,
  IconUserGroup,
  IconChartUp,
  IconTv,
} from "../StoreIcons";

type Props = {
  todayRevenue: number;
  customerCount: number;
  conversionRate: number;
  sessionCount: number;
  activeSessions: number;
};

export function KpiRow({
  todayRevenue,
  customerCount,
  conversionRate,
  sessionCount,
  activeSessions,
}: Props) {
  const kpis = [
    {
      value: `₹${todayRevenue.toLocaleString("en-IN")}`,
      label: "Today's revenue",
      Icon: IconMoney,
      badge: null,
    },
    {
      value: String(customerCount),
      label: "Customers",
      Icon: IconUserGroup,
      badge: null,
    },
    {
      value: `${conversionRate}%`,
      label: "Conversion",
      Icon: IconChartUp,
      badge: conversionRate > 0 ? "active" : null,
    },
    {
      value: String(sessionCount),
      label: "Session",
      Icon: IconTv,
      badge: activeSessions > 0 ? `${activeSessions} Live` : null,
    },
  ];

  return (
    <section className="hm-kpis" aria-label="Key figures">
      {kpis.map(({ value, label, Icon, badge }) => (
        <div key={label} className="hm-card hm-kpi">
          <div className="hm-kpi-body">
            <span className="hm-kpi-value">{value}</span>
            <span className="hm-kpi-label">{label}</span>
            {badge && <span className="hm-kpi-badge">{badge}</span>}
          </div>
          <span className="hm-kpi-icon">
            <Icon size={24} />
          </span>
        </div>
      ))}
    </section>
  );
}
