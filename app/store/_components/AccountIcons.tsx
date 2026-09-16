/* Icons for Settings › Account.
 *
 * Every glyph below is reassembled from the handoff's own exports in
 * public/store/account/ — the design ships each icon as a pile of one-path
 * SVGs, so the path data here is verbatim and only the placement is
 * reconstructed (from the spec's percentage insets where it gives them, from
 * the fragment geometry where the export was cut off).
 *
 * The palette is deliberately NOT swapped to currentColor: this screen tints
 * each tile's glyph individually (maroon WhatsApp, amber mail, violet chat,
 * amber staff, violet devices, grey disabled), and those colours come straight
 * from the fragments.
 */

type P = { size?: number };

const meta = { "aria-hidden": true, focusable: false as const };

/* ── Header ─────────────────────────────────────────────────────────── */

/* 91_vector — the back chevron inside the 35px outlined square. */
export function IconBackChevron({ size = 16 }: P) {
  return (
    <svg width={size * 9 / 16} height={size} viewBox="0 0 9 16" fill="none" {...meta}>
      <path d="M7.75 0.75C7.75 0.75 0.750012 5.90538 0.75 7.75C0.749988 9.59473 7.75 14.75 7.75 14.75" stroke="#68262A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* 53_vector — the row chevron on the manage list. */
export function IconRowChevron({ size = 14 }: P) {
  return (
    <svg width={size * 8 / 14} height={size} viewBox="0 0 8 14" fill="none" {...meta}>
      <path d="M0.75005 0.75C0.75005 0.75 6.75 5.1689 6.75 6.75C6.75 8.3312 0.75 12.75 0.75 12.75" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ── Identity card, 16px at 1px stroke ──────────────────────────────── */

/* 45 + 46 — location-01. */
export function IconPin({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...meta}>
      <g transform="translate(1.5 0.83)"><path d="M7.57847 13.4113C7.2894 13.682 6.90293 13.8333 6.50073 13.8333C6.09853 13.8333 5.71213 13.682 5.423 13.4113C2.77535 10.9173 -0.772826 8.13127 0.957514 4.08644C1.89309 1.89944 4.13889 0.5 6.50073 0.5C8.8626 0.5 11.1084 1.89944 12.044 4.08644C13.7721 8.1262 10.2327 10.9259 7.57847 13.4113Z" stroke="#68262A" fill="none" /></g>
      <g transform="translate(5.17 4.5)"><path d="M5.16667 2.83333C5.16667 4.122 4.122 5.16667 2.83333 5.16667C1.54467 5.16667 0.5 4.122 0.5 2.83333C0.5 1.54467 1.54467 0.5 2.83333 0.5C4.122 0.5 5.16667 1.54467 5.16667 2.83333Z" stroke="#68262A" fill="none" /></g>
    </svg>
  );
}

/* 43 + 44 — time-02. */
export function IconHours({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...meta}>
      <g transform="translate(0.83 0.83)"><path d="M7.16667 13.8333C10.8485 13.8333 13.8333 10.8485 13.8333 7.16667C13.8333 3.48477 10.8485 0.5 7.16667 0.5C3.48477 0.5 0.5 3.48477 0.5 7.16667C0.5 10.8485 3.48477 13.8333 7.16667 13.8333Z" stroke="#68262A" fill="none" /></g>
      <g transform="translate(6.51 4.17)"><path d="M1.5 2.83945C0.947733 2.83945 0.5 3.28719 0.5 3.83945C0.5 4.39172 0.947733 4.83945 1.5 4.83945C2.05227 4.83945 2.5 4.39172 2.5 3.83945C2.5 3.28719 2.05227 2.83945 1.5 2.83945ZM1.5 2.83945V0.5M3.5046 5.84719L2.20553 4.54812" stroke="#68262A" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

/* 47 — call-02. */
export function IconCall({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...meta}>
      <g transform="translate(1.5 1.5)"><path d="M4.6055 2.30828L4.33707 1.70429C4.16155 1.30938 4.07379 1.11191 3.94254 0.960795C3.77805 0.771415 3.56364 0.632082 3.32378 0.558689C3.13239 0.500122 2.9163 0.500122 2.48414 0.500122C1.85194 0.500122 1.53584 0.500122 1.27048 0.621649C0.957912 0.764802 0.675625 1.07564 0.563151 1.40052C0.467671 1.67632 0.495025 1.95974 0.549718 2.52659C1.13194 8.56023 4.43988 11.8682 10.4735 12.4504C11.0404 12.5051 11.3238 12.5324 11.5996 12.437C11.9245 12.3245 12.2353 12.0422 12.3785 11.7296C12.5 11.4643 12.5 11.1482 12.5 10.516C12.5 10.0838 12.5 9.86776 12.4414 9.67636C12.368 9.4365 12.2287 9.2221 12.0393 9.05756C11.8882 8.92636 11.6908 8.83856 11.2958 8.66303L10.6918 8.39463C10.2642 8.20456 10.0503 8.1095 9.83304 8.08883C9.62504 8.06903 9.41537 8.09823 9.22071 8.17403C9.01731 8.25323 8.83757 8.40303 8.47797 8.7027C8.1201 9.0009 7.94117 9.15003 7.7225 9.2299C7.52864 9.30076 7.27237 9.32696 7.06824 9.2969C6.8379 9.26296 6.66157 9.1687 6.30884 8.98023C5.2115 8.39376 4.60635 7.78863 4.01991 6.6913C3.83143 6.33856 3.73718 6.16223 3.70324 5.9319C3.67316 5.72776 3.69938 5.4715 3.7702 5.27763C3.85008 5.05898 3.99921 4.88003 4.29746 4.52212C4.59708 4.16258 4.74689 3.9828 4.8261 3.7794C4.9019 3.58475 4.93108 3.37506 4.9113 3.16711C4.89063 2.9498 4.79558 2.73596 4.6055 2.30828Z" stroke="#68262A" fill="none" /></g>
    </svg>
  );
}

/* 40 + 41 + 42 — edit-02, white on the Edit Profile button. */
export function IconEdit({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...meta}>
      <g transform="translate(0.83 0.83)"><path d="M8.54913 1.75697C9.04593 1.21872 9.29433 0.9496 9.55827 0.79262C10.1951 0.41384 10.9794 0.40206 11.6269 0.761546C11.8953 0.910533 12.1513 1.17208 12.6633 1.69517C13.1754 2.21827 13.4315 2.47981 13.5773 2.75395C13.9292 3.41541 13.9177 4.21653 13.5469 4.86713C13.3932 5.13677 13.1297 5.39052 12.6029 5.898L6.33373 11.9362C5.33525 12.8979 4.836 13.3788 4.21204 13.6225C3.58808 13.8662 2.90213 13.8483 1.53024 13.8124L1.34359 13.8075C0.925941 13.7966 0.717114 13.7911 0.595727 13.6533C0.474334 13.5156 0.490907 13.3029 0.524054 12.8775L0.542054 12.6465C0.635341 11.449 0.681981 10.8503 0.915807 10.3121C1.14963 9.77393 1.55296 9.337 2.35962 8.463L8.54913 1.75697Z" stroke="#FFFFFF" fill="none" /></g>
      <g transform="translate(8.17 2.17)"><path d="M0.353516 0.353516L5.02018 5.02018" stroke="#FFFFFF" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(8.83 14.17)"><path d="M0.5 0.5H5.83333" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

/* ── 24px tile glyphs, 1.5px stroke ─────────────────────────────────── */

/* 13 + 14 — whatsapp. Tinted per tile: maroon when live, #141B34 when muted. */
export function IconWa({ size = 24, color = "#68262A" }: P & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(1.25 1.25)"><path d="M10.75 20.75C16.2728 20.75 20.75 16.2728 20.75 10.75C20.75 5.22715 16.2728 0.75 10.75 0.75C5.22715 0.75 0.75 5.22715 0.75 10.75C0.75 12.1289 1.02907 13.4426 1.53382 14.6377C1.81278 15.2981 1.95226 15.6284 1.96953 15.878C1.9868 16.1276 1.91334 16.4021 1.76642 16.9512L0.75 20.75L4.54877 19.7336C5.09788 19.5867 5.37244 19.5132 5.62202 19.5305C5.87161 19.5477 6.20185 19.6872 6.86235 19.9662C8.05745 20.4709 9.3711 20.75 10.75 20.75Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(6.25 6.25)"><path d="M2.33815 6.12754L3.20909 5.04584C3.57616 4.58994 4.0299 4.16554 4.0655 3.5585C4.0744 3.40518 3.9666 2.71681 3.7508 1.3401C3.66601 0.799054 3.16086 0.750244 2.72332 0.750244C2.15314 0.750244 1.86805 0.750244 1.58495 0.879554C1.22714 1.04299 0.85979 1.50255 0.77917 1.88757C0.71539 2.1922 0.76279 2.40211 0.85759 2.82193C1.26023 4.60504 2.20481 6.36604 3.66948 7.83074C5.1342 9.29544 6.8952 10.24 8.6783 10.6426C9.0981 10.7374 9.308 10.7848 9.6127 10.721C9.9977 10.6404 10.4572 10.2731 10.6207 9.91525C10.75 9.63215 10.75 9.34714 10.75 8.77694C10.75 8.33934 10.7012 7.83424 10.1601 7.74944C8.7834 7.53364 8.0951 7.42584 7.9417 7.43474C7.3347 7.47034 6.9103 7.92404 6.4544 8.29114L5.3727 9.16204" stroke={color} strokeWidth="1.5" fill="none" /></g>
    </svg>
  );
}

/* 16 + 17 — mail-01. */
export function IconMail01({ size = 24, color = "#FFA100" }: P & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(1.25 5.25)"><path d="M0.369141 0.652588L7.28216 4.56956C9.83074 6.01359 10.9075 6.01359 13.4561 4.56956L20.3691 0.652588" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(1.25 2.75)"><path d="M0.76577 10.7256C0.83114 13.7912 0.86383 15.3239 1.99496 16.4594C3.12608 17.5948 4.70033 17.6343 7.84883 17.7134C9.7893 17.7622 11.7107 17.7622 13.6512 17.7134C16.7997 17.6343 18.3739 17.5948 19.5051 16.4594C20.6362 15.3239 20.6689 13.7912 20.7342 10.7256C20.7553 9.7399 20.7553 8.7601 20.7342 7.7744C20.6689 4.70886 20.6362 3.17609 19.5051 2.04066C18.3739 0.905231 16.7997 0.865681 13.6512 0.786571C11.7107 0.737811 9.7893 0.737811 7.84882 0.786561C4.70033 0.865661 3.12608 0.905211 1.99495 2.04065C0.86382 3.17608 0.83114 4.70885 0.76576 7.7744C0.74474 8.7601 0.74475 9.7399 0.76577 10.7256Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

/* 19 + 20 — chat. */
export function IconChatBubble({ size = 24, color = "#A400FF" }: P & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(1.25 1.75)"><path d="M0.75 8.75C0.75 7.97921 0.76346 7.22679 0.78909 6.5003C0.87282 4.12683 0.91469 2.94009 1.88007 1.96745C2.84545 0.99481 4.0657 0.9426 6.5062 0.83819C7.84517 0.7809 9.2709 0.75 10.75 0.75C12.2291 0.75 13.6548 0.7809 14.9938 0.83819C17.4343 0.9426 18.6546 0.99481 19.6199 1.96745C20.5853 2.94009 20.6272 4.12683 20.7109 6.5003C20.7365 7.22679 20.75 7.97921 20.75 8.75C20.75 9.5208 20.7365 10.2732 20.7109 10.9997C20.6272 13.3732 20.5853 14.5599 19.6199 15.5326C18.6546 16.5052 17.4343 16.5574 14.9937 16.6618C14.2598 16.6932 13.4998 16.7167 12.7193 16.7315C11.9782 16.7455 11.6076 16.7526 11.282 16.8766C10.9564 17.0006 10.6825 17.2355 10.1345 17.7053L7.95503 19.5742C7.82273 19.6876 7.65419 19.75 7.47991 19.75C7.07679 19.75 6.75 19.4232 6.75 19.0201V16.6719C6.66842 16.6686 6.58715 16.6653 6.50619 16.6618C4.06569 16.5574 2.84545 16.5052 1.88007 15.5325C0.91469 14.5599 0.87282 13.3732 0.78909 10.9997C0.76346 10.2732 0.75 9.5208 0.75 8.75Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(7 9.5)"><path d="M5.1257 1H5.0007M1.125 1H1M9.125 1H9M5.2507 1C5.2507 1.1381 5.1388 1.25 5.0007 1.25C4.8627 1.25 4.7507 1.1381 4.7507 1C4.7507 0.8619 4.8627 0.75 5.0007 0.75C5.1388 0.75 5.2507 0.8619 5.2507 1ZM1.25 1C1.25 1.1381 1.13807 1.25 1 1.25C0.86193 1.25 0.75 1.1381 0.75 1C0.75 0.8619 0.86193 0.75 1 0.75C1.13807 0.75 1.25 0.8619 1.25 1ZM9.25 1C9.25 1.1381 9.1381 1.25 9 1.25C8.8619 1.25 8.75 1.1381 8.75 1C8.75 0.8619 8.8619 0.75 9 0.75C9.1381 0.75 9.25 0.8619 9.25 1Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

/* 64 + 65 — location-01 at tile scale, for the Store profile row. */
export function IconPinLg({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(2 1)"><path d="M11.3677 20.117C10.9341 20.523 10.3544 20.75 9.7511 20.75C9.1478 20.75 8.5682 20.523 8.1345 20.117C4.16302 16.376 -1.15924 12.1969 1.43627 6.12966C2.83963 2.84916 6.20834 0.75 9.7511 0.75C13.2939 0.75 16.6626 2.84916 18.066 6.12966C20.6582 12.1893 15.349 16.3889 11.3677 20.117Z" stroke="#68262A" strokeWidth="1.5" fill="none" /></g>
      <g transform="translate(7.5 5.5)"><path d="M7.75 4.25C7.75 6.183 6.183 7.75 4.25 7.75C2.317 7.75 0.75 6.183 0.75 4.25C0.75 2.317 2.317 0.75 4.25 0.75C6.183 0.75 7.75 2.317 7.75 4.25Z" stroke="#68262A" strokeWidth="1.5" fill="none" /></g>
    </svg>
  );
}

/* 67–72 — user-group-03, for the Staff & roles row. */
export function IconUsers({ size = 24 }: P) {
  const s = { stroke: "#FFB12C", strokeWidth: "1.5", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(0.5 14)"><path d="M5.75 0.75C4.08756 0.8111 3.25634 0.8416 2.61722 1.2025C1.9154 1.5989 1.36045 2.2629 1.04096 3.0886C0.75001 3.8406 0.75001 4.8104 0.75 6.75" {...s} /></g>
      <g transform="translate(16.5 14)"><path d="M0.75 0.75C2.4252 0.8155 3.2627 0.8482 3.9099 1.2224C4.5901 1.6157 5.1336 2.2679 5.4495 3.0699C5.75 3.8329 5.75 4.8053 5.75 6.75" {...s} /></g>
      <g transform="translate(1 4.5)"><path d="M5.75003 1.51389C5.21925 1.03885 4.51836 0.75 3.75 0.75C2.09315 0.75 0.75 2.09315 0.75 3.75C0.75 4.79349 1.28276 5.71254 2.09111 6.25" {...s} /></g>
      <g transform="translate(16 4.5)"><path d="M0.75 1.51389C1.2808 1.03885 1.9817 0.75 2.75 0.75C4.4069 0.75 5.75 2.09314 5.75 3.75C5.75 4.79348 5.2173 5.71254 4.4089 6.25" {...s} /></g>
      <g transform="translate(4.5 14.5)"><path d="M12.75 6.75C12.75 4.8067 12.75 3.835 12.4446 3.0726C12.1237 2.2711 11.5715 1.6195 10.8803 1.2264C10.2228 0.8525 9.25003 0.75 7.66973 0.7544L5.82963 0.75C4.25 0.75 3.29623 0.8416 2.64694 1.2025C1.93395 1.5989 1.37017 2.2629 1.04559 3.0886C0.75001 3.8406 0.75001 4.8104 0.75 6.75" {...s} /></g>
      <g transform="translate(8.25 4)"><path d="M6.75003 3.75C6.75003 5.4069 5.40683 6.75 3.75003 6.75C2.09313 6.75 0.75 5.4069 0.75 3.75C0.75 2.09315 2.09313 0.75 3.75003 0.75C5.40683 0.75 6.75003 2.09315 6.75003 3.75Z" {...s} /></g>
    </svg>
  );
}

/* 74 + 75 — tablet-01, for the Devices row. */
export function IconTabletRow({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(4.75 1)"><path d="M8.75 0.75H5.75C3.39298 0.75 2.21447 0.75 1.48223 1.48223C0.75 2.21447 0.75 3.39298 0.75 5.75V15.75C0.75 18.107 0.75 19.2855 1.48223 20.0178C2.21447 20.75 3.39298 20.75 5.75 20.75H8.75C11.107 20.75 12.2855 20.75 13.0178 20.0178C13.75 19.2855 13.75 18.107 13.75 15.75V5.75C13.75 3.39298 13.75 2.21447 13.0178 1.48223C12.2855 0.75 11.107 0.75 8.75 0.75Z" stroke="#A400FF" strokeWidth="1.5" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(11 17.25)"><path d="M1.125 1H1M1.25 1C1.25 1.1381 1.1381 1.25 1 1.25C0.8619 1.25 0.75 1.1381 0.75 1C0.75 0.8619 0.8619 0.75 1 0.75C1.1381 0.75 1.25 0.8619 1.25 1Z" stroke="#A400FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

/* 77 + 78 — notification bell, for the Notification row. */
export function IconBellRow({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(2.25 2.5)"><path d="M16.9811 16.25H2.51887C1.54195 16.25 0.75 15.458 0.75 14.4811C0.75 14.012 0.93636 13.5621 1.26809 13.2303L1.87132 12.6271C2.43393 12.0645 2.75 11.3014 2.75 10.5058V7.75C2.75 3.88401 5.88401 0.75 9.75 0.75C13.616 0.75 16.75 3.884 16.75 7.75V10.5058C16.75 11.3014 17.0661 12.0645 17.6287 12.6271L18.2319 13.2303C18.5636 13.5621 18.75 14.012 18.75 14.4811C18.75 15.458 17.958 16.25 16.9811 16.25Z" stroke="#FFA100" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(7.25 17.25)"><path d="M7.75 0.75C7.75 2.683 6.183 4.25 4.25 4.25C2.317 4.25 0.75 2.683 0.75 0.75" stroke="#FFA100" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

/* 80 + 81 — link, for the Connected apps row (disabled, so #141B34). */
export function IconLink({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(11.25 0.75)"><path d="M0.75 9.979C0.8916 10.2109 1.0597 10.4304 1.2542 10.6328C2.4617 11.8895 4.3022 12.086 5.7076 11.2222C5.968 11.0621 6.2134 10.8657 6.4372 10.6328L9.6766 7.2614C11.1078 5.77184 11.1078 3.35676 9.6766 1.86718C8.2453 0.377601 5.9248 0.377611 4.4935 1.86718L3.78 2.60978" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" fill="none" /></g>
      <g transform="translate(0.75 10.25)"><path d="M7.7203 9.89L7.0065 10.6328C5.57526 12.1224 3.25471 12.1224 1.82345 10.6328C0.392182 9.1432 0.392182 6.7282 1.82345 5.2386L5.06287 1.8672C6.49413 0.377606 8.8147 0.377596 10.2459 1.8672C10.4404 2.0695 10.6084 2.289 10.75 2.5208" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" fill="none" /></g>
    </svg>
  );
}

/* customer-support — the export was cut off, so this one is drawn to the
   spec's percentage insets (ears 37.5–70.83%, band 12.5–37.5%, boom to 87.5%)
   at the same 1.5px weight as its neighbours. */
export function IconSupport({ size = 24 }: P) {
  const s = { stroke: "#141B34", strokeWidth: "1.5", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <path d="M5 9a7 7 0 0 1 14 0" {...s} />
      <rect x="2" y="9" width="5" height="8" rx="2.5" {...s} />
      <rect x="17" y="9" width="5" height="8" rx="2.5" {...s} />
      <path d="M19.5 17v1.5a2.5 2.5 0 0 1-2.5 2.5h-3.5" {...s} />
    </svg>
  );
}
