"use client";

import { useRouter } from "next/navigation";
import {
  IconAddItem,
  IconCustomersQa,
  IconStaffQa,
  IconCampaignsQa,
  IconAnalyticsQa,
  IconSettingQa,
} from "../StoreIcons";

const QUICK_ACTIONS = [
  { label: "Add item", href: "/store/inventory/add", Icon: IconAddItem },
  { label: "Customers", href: "/store/customers", Icon: IconCustomersQa },
  { label: "Staff", href: "/store/staff", Icon: IconStaffQa },
  { label: "Campaigns", href: "/store/campaigns", Icon: IconCampaignsQa },
  { label: "Analytics", href: "/store/analytics", Icon: IconAnalyticsQa },
  { label: "Setting", href: "/store/settings", Icon: IconSettingQa },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <section className="hm-card hm-qa">
      <h2 className="hm-card-title">Quick Actions</h2>
      <div className="hm-qa-grid">
        {QUICK_ACTIONS.map(({ label, href, Icon }) => (
          <button
            key={label}
            type="button"
            className="hm-qa-tile"
            onClick={() => router.push(href)}
          >
            <span className="hm-qa-disc">
              <Icon size={16} />
            </span>
            <span className="hm-qa-label">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
