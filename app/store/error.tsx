"use client";

import RouteAuthError from "@/components/RouteAuthError";

// Store-segment error boundary. Catches render throws from any /store/* page —
// including Convex useQuery UNAUTHORIZED throws when the store session isn't yet
// attached / has expired — and routes them to the store login instead of a
// generic crash.
export default function StoreError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteAuthError {...props} loginPath="/store/login" segment="store" />;
}
