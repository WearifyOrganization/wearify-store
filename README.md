# Wearify Retailer Dashboard

The store owner's web app (`/store/*`): dashboard, inventory with named photo
slots and reference-card review, saree QR labels, customers and their visits,
sessions and orders, staff, campaigns, and store settings. One of the six
Wearify frontends; it talks to the single Wearify Convex backend
(`wearify-backend`) through the generated contract package `@wearify/shared`
and holds no backend code of its own.

## How it fits

```
wearify-store  ──▶  @wearify/shared (typed api, dataModel, rules)  ──▶  wearify-backend (Convex)
```

- **Auth:** `/store/login` sends a phone OTP (`phoneAuth.*`), stores the
  returned bearer token and user in `localStorage` (`lib/phoneAuth`,
  `lib/clientStore`); `useRequireRole("store_owner", "/store/login")` in
  `app/store/layout.tsx` guards every page and every Convex call passes
  `token`. No cookies, no middleware, no Better Auth.
- **Backend functions used:** `sarees.*`, `sareeCards.*`, `stores.*`,
  `customers.*`, `sessionOps.*`, `campaignOps.*`, `dashboard.*`,
  `kioskPairing.*` (own devices), `phoneAuth.*`, `files.*`.
- **Shared rules used:** `sareePhotos`, `sareeLimits`, `colors`, `cardFlags`,
  `personName`, `city`, `profileBounds` from `@wearify/shared`.
- **Saree cards:** `components/SareeCardPanel` (review flags, guide overrides,
  rebuild) on the inventory detail page; the card pipeline itself runs in the
  backend.
- **QR labels:** `components/SareeQrCard` + `lib/sareeQr` encode the saree id
  as `wfsaree:<id>` and render a printable PNG with the `qrcode` package,
  browser-side. The kiosk decodes the same prefix.
- **Uploads:** `lib/useUpload` + `lib/uploadGuards`, with `lib/imageCompress`
  downscaling flat-lays to WebP in the browser (`OffscreenCanvas`) before
  upload. No `sharp` on this side.
- **Images:** `components/SareeThumb` → `lib/ConvexImage` → `files.getUrl`,
  rendered with `next/image` (`**.convex.cloud` allowed in `next.config.ts`);
  seeded sarees without storage ids fall back to `public/inventory/*`.
- **i18n:** `lib/i18n` supplies the language list and label lookup shown on
  the customer detail page.
- **Fonts:** Montserrat, Poppins and Space Grotesk via `next/font` in
  `app/store/layout.tsx`.
- **Observability:** Sentry via `instrumentation*.ts` and `sentry.*.config.ts`
  with the PII scrubber in `lib/sentryScrub.ts`; inert without a DSN.

## Development

```bash
pnpm install          # pnpm 11 (packageManager); `npx pnpm@11.13.1` if not installed
cp .env.example .env.local   # fill NEXT_PUBLIC_CONVEX_URL
pnpm dev
```

`@wearify/shared` is pinned to a git tag of the `wearify-shared` repository (see
`package.json`); the URL currently points at the sibling checkout and the
deployment phase switches it to the GitHub organisation with no other change.
`dev` and `build` keep `--webpack` so the bundler and the Sentry webpack
options match the monorepo's production build.

## Checks

```bash
pnpm type-check
pnpm test             # vitest, jsdom
pnpm lint
pnpm build
```

## Environment

Names only; see `.env.example`. `NEXT_PUBLIC_CONVEX_URL` is required at build
time. Sentry variables are optional. This app needs no server-side secrets.

## Notes from the extraction

- `eslint-plugin-react-hooks` is pinned in `pnpm-workspace.yaml` to the
  version the monorepo lockfile resolves.
