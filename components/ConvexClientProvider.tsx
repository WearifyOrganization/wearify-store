"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

// Plain Convex client. Tailor functions take the session `token` as an
// argument, so no auth provider wraps the client (the Better Auth provider
// belongs to the admin console only).
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
