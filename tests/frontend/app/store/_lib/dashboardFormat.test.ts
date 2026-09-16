import { describe, expect, it } from "vitest";
import { band, greeting, timeAgo, today } from "@/app/store/_lib/dashboardFormat";

describe("greeting", () => {
  it("splits on noon and 5pm", () => {
    expect(greeting(new Date(2026, 0, 1, 0))).toBe("Good Morning");
    expect(greeting(new Date(2026, 0, 1, 11, 59))).toBe("Good Morning");
    expect(greeting(new Date(2026, 0, 1, 12))).toBe("Good Afternoon");
    expect(greeting(new Date(2026, 0, 1, 16, 59))).toBe("Good Afternoon");
    expect(greeting(new Date(2026, 0, 1, 17))).toBe("Good Evening");
    expect(greeting(new Date(2026, 0, 1, 23))).toBe("Good Evening");
  });
});

describe("today", () => {
  it("renders an uppercased en-IN long date", () => {
    expect(today(new Date(2026, 6, 30))).toBe("THURSDAY, 30 JULY 2026");
  });
});

describe("timeAgo", () => {
  const now = Date.UTC(2026, 6, 30, 12, 0, 0);
  const ago = (ms: number) => timeAgo(now - ms, now);

  it("labels sub-minute gaps as Just now", () => {
    expect(ago(0)).toBe("Just now");
    expect(ago(59_000)).toBe("Just now");
  });

  it("steps through minutes, hours and days", () => {
    expect(ago(60_000)).toBe("1m ago");
    expect(ago(59 * 60_000)).toBe("59m ago");
    expect(ago(60 * 60_000)).toBe("1h ago");
    expect(ago(23 * 3_600_000)).toBe("23h ago");
    expect(ago(24 * 3_600_000)).toBe("1d ago");
    expect(ago(10 * 24 * 3_600_000)).toBe("10d ago");
  });
});

describe("band", () => {
  it("bands on 85 and 60", () => {
    expect(band(100)).toEqual({ label: "Excellent", tone: "good" });
    expect(band(85)).toEqual({ label: "Excellent", tone: "good" });
    expect(band(84)).toEqual({ label: "Good", tone: "good" });
    expect(band(60)).toEqual({ label: "Good", tone: "good" });
    expect(band(59)).toEqual({ label: "Need Attention", tone: "warn" });
    expect(band(0)).toEqual({ label: "Need Attention", tone: "warn" });
  });
});
