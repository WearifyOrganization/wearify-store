import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Convex Storage serves saree photos; SareeThumb (via lib/ConvexImage)
    // renders them through next/image. `**.convex.cloud` covers any
    // deployment/region host.
    remotePatterns: [
      { protocol: "https", hostname: "**.convex.cloud", pathname: "/api/storage/**" },
    ],
  },
};

// Without SENTRY_AUTH_TOKEN the plugin skips source-map upload and the build
// still succeeds; stack traces are just minified until the token is set.
// `project` is the Sentry project for this surface (Phase 4C configures it).
export default withSentryConfig(nextConfig, {
  org: "wearify-k2",
  project: "wearify-store",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Maps are uploaded to Sentry, then deleted — never served from the CDN.
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  webpack: {
    treeshake: { removeDebugLogging: true },
    // Convex runs our crons, not Vercel.
    automaticVercelMonitors: false,
  },
});
