/* Add-to-catalogue icons.
 *
 * The navigation/control glyphs come from the shipped handoff. The four photo
 * slot glyphs are semantic line icons for their current Model / Flat lay /
 * Pallu / Border labels. All use currentColor so one component serves the
 * maroon and white uses.
 */

type P = { size?: number };
const meta = { "aria-hidden": true, focusable: "false" } as const;

/* 4_vector — panel back chevron */
export function IconBack({ size = 16 }: P) {
  return (
    <svg width={size * 9 / 16} height={size} viewBox="0 0 9 16" fill="none" {...meta}>
      <path d="M7.75 0.75C7.75 0.75 0.750012 5.90538 0.75 7.75C0.749988 9.59473 7.75 14.75 7.75 14.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="1.5" />
    </svg>
  );
}

/* 20_vector — select caret (27_vector is the same path in white; currentColor
   covers both, so the white copy is not duplicated here) */
export function IconCaret({ size = 9 }: P) {
  return (
    <svg width={size} height={size * 5 / 9} viewBox="0 0 9 5" fill="none" {...meta}>
      <path d="M8.5 0.500033C8.5 0.500033 5.55407 4.5 4.5 4.5C3.44587 4.5 0.5 0.5 0.5 0.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none"  />
    </svg>
  );
}

/* 30_vector — the "+" under each dropzone glyph */
export function IconPlusSmall({ size = 14 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" {...meta}>
      <path d="M6.75 0.75V12.75M12.75 6.75H0.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="1.5" />
    </svg>
  );
}

/* Model photo — person silhouette, not the old blouse glyph. */
export function IconSlotModel({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" {...meta}>
      <circle cx="14" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 25c.7-6.2 4-9.3 9.5-9.3s8.8 3.1 9.5 9.3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

/* Flat lay — an unfolded length of cloth viewed from above. */
export function IconSlotFlatLay({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" {...meta}>
      <rect x="3" y="5" width="22" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 5v18M19 5v18M3 9h22M3 19h22" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

/* Pallu — wide terminal panel with hanging tassels. */
export function IconSlotPallu({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" {...meta}>
      <rect x="4" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M4 15h20M8 8h12M7 21v4M12 21v4M17 21v4M22 21v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

/* Border — a narrow repeating selvedge strip. */
export function IconSlotBorder({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" {...meta}>
      <rect x="3" y="8" width="22" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h22M3 16h22M7 12v4M12 12v4M17 12v4M22 12v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

/* Body — a swatch of the main field, its weave suggested by a dot grid. */
export function IconSlotBody({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" {...meta}>
      <rect x="4" y="4" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="10" r="1.6" fill="currentColor" />
      <circle cx="18" cy="10" r="1.6" fill="currentColor" />
      <circle cx="14" cy="14" r="1.6" fill="currentColor" />
      <circle cx="10" cy="18" r="1.6" fill="currentColor" />
      <circle cx="18" cy="18" r="1.6" fill="currentColor" />
    </svg>
  );
}

/* Blouse — a short-sleeved bodice, neckline down the middle. */
export function IconSlotBlouse({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" {...meta}>
      <path d="M9 4h3c0 2 1 3 2 3s2-1 2-3h3l5 5-3 4-2-1v12H9V12l-2 1-3-4 5-5z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M14 7v5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

/* Alert — 24 (ring) + 25 (stem) + 26 (dot) */
export function IconAlert({ size = 11 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 11 11" fill="none" {...meta}>
      <path d="M5.5 10.5C8.26142 10.5 10.5 8.26142 10.5 5.5C10.5 2.73858 8.26142 0.5 5.5 0.5C2.73858 0.5 0.5 2.73858 0.5 5.5C0.5 8.26142 2.73858 10.5 5.5 10.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none"  />
      <g transform="translate(5 3)"><path d="M0.5 2.5V0.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none"  /></g>
      <g transform="translate(4.88 6.9)"><path d="M0.6875 0.625H0.625M0.75 0.625C0.75 0.555965 0.69405 0.5 0.625 0.5C0.55595 0.5 0.5 0.555965 0.5 0.625C0.5 0.694035 0.55595 0.75 0.625 0.75C0.69405 0.75 0.75 0.694035 0.75 0.625Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none"  /></g>
    </svg>
  );
}
