"use client";

import { useRouter } from "next/navigation";
import { timeAgo } from "../../_lib/dashboardFormat";

export type SessionRow = {
  _id: string;
  sessionId: string;
  staffName?: string;
  status: string;
  startTime: number;
};

type Props = {
  /** undefined while the query is in flight. */
  sessions: SessionRow[] | undefined;
};

export function RecentSessions({ sessions }: Props) {
  const router = useRouter();
  const rows = (sessions ?? []).slice(0, 5);

  return (
    <section className="hm-card hm-sessions">
      <div className="hm-sessions-head">
        <h2>Recent Session</h2>
        <button type="button" onClick={() => router.push("/store/analytics")}>
          View All
        </button>
      </div>
      {rows.length === 0 ? (
        <div className="hm-sessions-empty">
          {sessions === undefined
            ? "Loading sessions…"
            : "Kiosk try-ons appear here in real time — add items to your catalogue so customers can start trying styles."}
        </div>
      ) : (
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead>
              <tr>
                <th>SESSION</th>
                <th>STAFF</th>
                <th>STATUS</th>
                <th>STARTED</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s._id}>
                  <td>{s.sessionId}</td>
                  <td>{s.staffName || "Staff"}</td>
                  <td>
                    <span
                      className={`hm-status hm-status--${s.status === "active" ? "active" : "done"}`}
                    >
                      {s.status === "active" ? "Active" : "Completed"}
                    </span>
                  </td>
                  <td>{timeAgo(s.startTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
