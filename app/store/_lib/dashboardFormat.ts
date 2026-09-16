export const PERIODS = ["This month", "This week", "Today", "All time"] as const;
export type Period = (typeof PERIODS)[number];

export const DEFAULT_PERIOD: Period = "This month";

export type HealthTone = "good" | "warn";

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function today(now: Date = new Date()): string {
  return now
    .toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}

export function timeAgo(ts: number, now: number = Date.now()): string {
  const mins = Math.floor((now - ts) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* Health bands drive both the pill label and its colour. */
export function band(pct: number): { label: string; tone: HealthTone } {
  if (pct >= 85) return { label: "Excellent", tone: "good" };
  if (pct >= 60) return { label: "Good", tone: "good" };
  return { label: "Need Attention", tone: "warn" };
}
