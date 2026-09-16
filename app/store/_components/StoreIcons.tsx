/* Chrome + dashboard icons for the store module.
 *
 * Every glyph below is reassembled from the handoff's own exports in
 * public/store/home/ — the design ships each icon as a pile of one-path SVGs,
 * so the shapes here are verbatim and only the placement is reconstructed
 * (from the spec's percentage insets where it gives them, from the fragment
 * geometry where the spec was cut off). Colours are swapped to currentColor so
 * one component serves white-on-maroon and maroon-on-white.
 *
 * The one exception: the handoff exported no glyph for the "Add item" quick
 * action, so it reuses the plus from the Add Items button (8_vector).
 */

type P = { size?: number };

const meta = { "aria-hidden": true, focusable: false as const };

export function IconPlus({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...meta}>
      <g transform="translate(1.91 1.92)"><path d="M6.08332 0.75V11.4167M11.4167 6.08332H0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconBell({ size = 21 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 21 21" fill="none" {...meta}>
      <g transform="translate(0.5 0.5)"><path d="M16.9811 16.7458H2.51887C1.54195 16.7458 0.75 15.9284 0.75 14.9203C0.75 14.4362 0.93636 13.9719 1.26809 13.6295L1.87132 13.007C2.43393 12.4264 2.75 11.6389 2.75 10.8178V7.97389C2.75 3.98425 5.88401 0.75 9.75 0.75C13.616 0.75 16.75 3.98424 16.75 7.97389V10.8178C16.75 11.6389 17.0661 12.4264 17.6287 13.007L18.2319 13.6295C18.5636 13.9719 18.75 14.4362 18.75 14.9203C18.75 15.9284 17.958 16.7458 16.9811 16.7458Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(6.0 15.6)"><path d="M7.75 0.75C7.75 2.74483 6.183 4.36195 4.25 4.36195C2.317 4.36195 0.75 2.74483 0.75 0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconChevronDown({ size = 9 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 9 9" fill="none" {...meta}>
      <g transform="translate(0.0 2.0)"><path d="M8.16939 0.607666L4.38853 4.38853L0.607666 0.607666" stroke="currentColor" strokeWidth="1.21528" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconChipChevron({ size = 9 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 9 9" fill="none" {...meta}>
      <g transform="translate(0.0 2.0)"><path d="M8.5 0.500033C8.5 0.500033 5.55407 4.5 4.5 4.5C3.44587 4.5 0.5 0.5 0.5 0.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconReset({ size = 19 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 19.44 19.44" fill="none" {...meta}>
      <g transform="translate(2.64 2.98)"><path d="M11.55 0.5V2.35807C10.3775 1.20871 8.77157 0.5 7 0.5C3.41015 0.5 0.5 3.41015 0.5 7C0.5 7.92443 0.692978 8.80381 1.04086 9.6M2.45 13.5V11.6419C3.62244 12.7913 5.22846 13.5 7 13.5C10.5898 13.5 13.5 10.5898 13.5 7C13.5 6.07557 13.307 5.1962 12.9591 4.4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconMoney({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(2.25 1.25)"><path d="M18.75 9.9333V7.03029C18.75 5.39029 18.75 4.57028 18.3459 4.03529C17.9418 3.50029 17.0281 3.24056 15.2007 2.7211C13.9522 2.3662 12.8516 1.93863 11.9723 1.54829C10.7734 1.0161 10.174 0.75 9.75 0.75C9.326 0.75 8.7266 1.0161 7.52771 1.54829C6.64839 1.93863 5.54784 2.36619 4.29933 2.7211C2.47193 3.24056 1.55822 3.50029 1.15411 4.03529C0.75 4.57028 0.75 5.39029 0.75 7.03029V9.9333C0.75 15.5585 5.81277 18.9335 8.344 20.2694C8.9511 20.5898 9.2546 20.75 9.75 20.75C10.2454 20.75 10.5489 20.5898 11.156 20.2694C13.6872 18.9335 18.75 15.5585 18.75 9.9333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" /></g>
      <g transform="translate(9.25 7.25)"><path d="M2.75 1.75C1.6454 1.75 0.75 2.42157 0.75 3.25C0.75 4.0784 1.6454 4.75 2.75 4.75C3.8546 4.75 4.75 5.4216 4.75 6.25C4.75 7.0784 3.8546 7.75 2.75 7.75M2.75 1.75C3.6208 1.75 4.3616 2.1674 4.6362 2.75M2.75 1.75V0.75M2.75 7.75C1.8792 7.75 1.1384 7.3326 0.8638 6.75M2.75 7.75V8.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" /></g>
    </svg>
  );
}

export function IconUserGroup({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(5.25 14.25)"><path d="M12.75 6.75C12.75 4.8067 12.75 3.835 12.4446 3.0726C12.1237 2.2711 11.5715 1.6195 10.8803 1.2264C10.2228 0.8525 9.25003 0.75 7.66973 0.7544L5.82963 0.75C4.25 0.75 3.29623 0.8416 2.64694 1.2025C1.93395 1.5989 1.37017 2.2629 1.04559 3.0886C0.75001 3.8406 0.75001 4.8104 0.75 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(1.25 11.25)"><path d="M5.75 0.75C4.08756 0.8111 3.25634 0.8416 2.61722 1.2025C1.9154 1.5989 1.36045 2.2629 1.04096 3.0886C0.75001 3.8406 0.75001 4.8104 0.75 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(16.25 11.25)"><path d="M0.75 0.75C2.4252 0.8155 3.2627 0.8482 3.9099 1.2224C4.5901 1.6157 5.1336 2.2679 5.4495 3.0699C5.75 3.8329 5.75 4.8053 5.75 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(8.25 5.25)"><path d="M6.75003 3.75C6.75003 5.4069 5.40683 6.75 3.75003 6.75C2.09313 6.75 0.75 5.4069 0.75 3.75C0.75 2.09315 2.09313 0.75 3.75003 0.75C5.40683 0.75 6.75003 2.09315 6.75003 3.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(4.25 2.25)"><path d="M5.75003 1.51389C5.21925 1.03885 4.51836 0.75 3.75 0.75C2.09315 0.75 0.75 2.09315 0.75 3.75C0.75 4.79349 1.28276 5.71254 2.09111 6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(13.25 2.25)"><path d="M0.75 1.51389C1.2808 1.03885 1.9817 0.75 2.75 0.75C4.4069 0.75 5.75 2.09314 5.75 3.75C5.75 4.79348 5.2173 5.71254 4.4089 6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconChartUp({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(1.25 2.25)"><path d="M14.75 0.75H6.75C3.92157 0.75 2.50736 0.75 1.62868 1.62868C0.75 2.50736 0.75 3.92157 0.75 6.75V8.75C0.75 11.5784 0.75 12.9926 1.62868 13.8713C2.50736 14.75 3.92157 14.75 6.75 14.75H14.75C17.5784 14.75 18.9926 14.75 19.8713 13.8713C20.75 12.9926 20.75 11.5784 20.75 8.75V6.75C20.75 3.92157 20.75 2.50736 19.8713 1.62868C18.9926 0.75 17.5784 0.75 14.75 0.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(6.25 6.25)"><path d="M9.75 1.75L7.25 4.25C6.9774 4.5226 6.8411 4.6589 6.694 4.7318C6.4142 4.8704 6.0858 4.8704 5.806 4.7318C5.6589 4.6589 5.5226 4.5226 5.25 4.25C4.9774 3.9774 4.8411 3.8411 4.694 3.7682C4.4142 3.62955 4.0858 3.62955 3.806 3.7682C3.65894 3.8411 3.52262 3.9774 3.25 4.25L0.75 6.75M7.75 0.75H9.4643C10.0704 0.75 10.3734 0.75 10.5617 0.93829C10.75 1.12658 10.75 1.42962 10.75 2.03571V3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(7.25 16.25)"><path d="M6.75 4.75H8.75M6.75 4.75C5.9216 4.75 5.25 4.0784 5.25 3.25V0.75H4.75M6.75 4.75H2.75M4.75 0.75H4.25V3.25C4.25 4.0784 3.5784 4.75 2.75 4.75M4.75 0.75V4.75M2.75 4.75H0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconTv({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(1.25 2.25)"><path d="M14.75 0.75H6.75C3.92157 0.75 2.50736 0.75 1.62868 1.62868C0.75 2.50736 0.75 3.92157 0.75 6.75V8.75C0.75 11.5784 0.75 12.9926 1.62868 13.8713C2.50736 14.75 3.92157 14.75 6.75 14.75H14.75C17.5784 14.75 18.9926 14.75 19.8713 13.8713C20.75 12.9926 20.75 11.5784 20.75 8.75V6.75C20.75 3.92157 20.75 2.50736 19.8713 1.62868C18.9926 0.75 17.5784 0.75 14.75 0.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(7.25 19.25)"><path d="M8.75024 1.75C7.57354 1.114 6.20734 0.75 4.75024 0.75C3.29314 0.75 1.92693 1.114 0.750244 1.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconAddItem({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" {...meta}>
      <g transform="translate(2.5 2.5)"><path d="M6.08332 0.75V11.4167M11.4167 6.08332H0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconCustomersQa({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" {...meta}>
      <g transform="translate(3.0 10.0)"><path d="M11.3333 5.5V2.98767C11.3333 2.47 11.0987 1.9715 10.6532 1.70783C9.38117 0.955 7.72617 0.5 5.91667 0.5C4.10719 0.5 2.45218 0.955 1.18015 1.70783C0.734683 1.9715 0.5 2.47 0.5 2.98767V5.5" stroke="#FAF7F4" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(5.5 2.5)"><path d="M3.41667 6.33333C5.0275 6.33333 6.33333 5.0275 6.33333 3.41667C6.33333 1.80584 5.0275 0.5 3.41667 0.5C1.80584 0.5 0.5 1.80584 0.5 3.41667C0.5 5.0275 1.80584 6.33333 3.41667 6.33333Z" stroke="#FAF7F4" fill="none" /></g>
      <g transform="translate(13.0 10.5)"><path d="M2.58346 4.94429V2.43196C2.58346 1.91429 2.34879 1.41571 1.90329 1.15212C1.47596 0.899122 1.00529 0.679872 0.500122 0.500122" stroke="#FAF7F4" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(12.5 2.5)"><path d="M0.500122 0.500122C1.70487 0.858689 2.58346 1.97475 2.58346 3.29601C2.58346 4.61726 1.70487 5.73335 0.500122 6.09193" stroke="#FAF7F4" strokeLinecap="round" fill="none" /></g>
    </svg>
  );
}

export function IconStaffQa({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" {...meta}>
      <g transform="translate(1.5 9.5)"><path d="M13.8333 6.33333C13.8333 4.444 13.8333 3.49933 13.4941 2.75808C13.1374 1.97883 12.5239 1.34533 11.7559 0.963167C11.0254 0.599667 10.0833 0.5 8.18858 0.50425L6.144 0.5C4.24999 0.5 3.32913 0.589083 2.6077 0.94C1.81549 1.32533 1.18907 1.97092 0.828434 2.77367C0.500009 3.50475 0.500008 4.44758 0.5 6.33333" stroke="#FAF7F4" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(5.0 1.5)"><path d="M7.16667 3.83333C7.16667 5.67428 5.67425 7.16667 3.83333 7.16667C1.99238 7.16667 0.5 5.67428 0.5 3.83333C0.5 1.99238 1.99238 0.5 3.83333 0.5C5.67425 0.5 7.16667 1.99238 7.16667 3.83333Z" stroke="#FAF7F4" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconCampaignsQa({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" {...meta}>
      <g transform="translate(0.5 0.5)"><path d="M15.9564 0.960774C14.1414 -0.993866 0.488732 3.79433 0.500007 5.5425C0.51279 7.52491 5.83174 8.13475 7.306 8.54841C8.19258 8.79708 8.43 9.05208 8.63441 9.98175C9.56025 14.1921 10.0251 16.2862 11.0845 16.333C12.7732 16.4077 17.7277 2.86833 15.9564 0.960774Z" stroke="#FAF7F4" fill="none" /></g>
      <g transform="translate(5.6 7.4)"><path d="M0.5 3.41667L3.41667 0.5" stroke="#FAF7F4" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconAnalyticsQa({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" {...meta}>
      <g transform="translate(0.5 0.5)"><path d="M0.5 8.41667C0.5 4.68472 0.5 2.81874 1.65937 1.65937C2.81874 0.5 4.68472 0.5 8.41667 0.5C12.1486 0.5 14.0146 0.5 15.174 1.65937C16.3333 2.81874 16.3333 4.68472 16.3333 8.41667C16.3333 12.1486 16.3333 14.0146 15.174 15.174C14.0146 16.3333 12.1486 16.3333 8.41667 16.3333C4.68472 16.3333 2.81874 16.3333 1.65937 15.174C0.5 14.0146 0.5 12.1486 0.5 8.41667Z" stroke="#FAF7F4" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(5.0 8.5)"><path d="M0.5 3.83333V0.5" stroke="#FAF7F4" strokeLinecap="round" fill="none" /></g>
      <g transform="translate(8.5 4.0)"><path d="M0.5 8.83333V0.5" stroke="#FAF7F4" strokeLinecap="round" fill="none" /></g>
      <g transform="translate(12.0 7.5)"><path d="M0.5 5.5V0.5" stroke="#FAF7F4" strokeLinecap="round" fill="none" /></g>
    </svg>
  );
}

export function IconSettingQa({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" {...meta}>
      <g transform="translate(0.0 0.0)"><path d="M12.4236 2.48662C11.9311 2.48662 11.6847 2.48662 11.4604 2.40337C11.4292 2.39181 11.3986 2.37909 11.3683 2.36523C11.1508 2.26546 10.9768 2.09132 10.6284 1.74306C9.82683 0.941475 9.42608 0.540683 8.93292 0.503725C8.86667 0.498758 8.8 0.498758 8.73375 0.503725C8.24058 0.540683 7.83975 0.941475 7.03821 1.74305C6.68994 2.09132 6.51581 2.26546 6.29831 2.36523C6.2681 2.37909 6.23738 2.39181 6.20623 2.40337C5.98188 2.48662 5.73561 2.48662 5.24309 2.48662H5.15224C3.89565 2.48662 3.26736 2.48662 2.87699 2.87699C2.48662 3.26736 2.48662 3.89565 2.48662 5.15224V5.24309C2.48662 5.73561 2.48662 5.98188 2.40337 6.20623C2.39181 6.23738 2.37909 6.2681 2.36523 6.29831C2.26546 6.51581 2.09132 6.68994 1.74305 7.03821C0.941475 7.83975 0.540683 8.24058 0.503725 8.73375C0.498758 8.8 0.498758 8.86667 0.503725 8.93292C0.540683 9.42608 0.941475 9.82683 1.74305 10.6284C2.09132 10.9768 2.26546 11.1508 2.36523 11.3683C2.37909 11.3986 2.39181 11.4292 2.40337 11.4604C2.48662 11.6847 2.48662 11.9311 2.48662 12.4236V12.5144C2.48662 13.771 2.48662 14.3993 2.87699 14.7897C3.26736 15.1801 3.89565 15.1801 5.15224 15.1801H5.24309C5.73561 15.1801 5.98188 15.1801 6.20623 15.2633C6.23738 15.2748 6.2681 15.2876 6.29831 15.3014C6.51581 15.4012 6.68994 15.5753 7.03821 15.9236C7.83975 16.7252 8.24058 17.126 8.73375 17.1629C8.8 17.1679 8.86658 17.1679 8.93292 17.1629C9.42608 17.126 9.82683 16.7252 10.6284 15.9236C10.9768 15.5753 11.1508 15.4012 11.3683 15.3014C11.3986 15.2876 11.4292 15.2748 11.4604 15.2633C11.6847 15.1801 11.9311 15.1801 12.4236 15.1801H12.5144C13.771 15.1801 14.3993 15.1801 14.7897 14.7897C15.1801 14.3993 15.1801 13.771 15.1801 12.5144V12.4236C15.1801 11.9311 15.1801 11.6847 15.2633 11.4604C15.2748 11.4292 15.2876 11.3986 15.3014 11.3683C15.4012 11.1508 15.5753 10.9768 15.9236 10.6284C16.7252 9.82683 17.126 9.42608 17.1629 8.93292C17.1679 8.86658 17.1679 8.8 17.1629 8.73375C17.126 8.24058 16.7252 7.83975 15.9236 7.03821C15.5753 6.68994 15.4012 6.51581 15.3014 6.29831C15.2876 6.2681 15.2748 6.23738 15.2633 6.20623C15.1801 5.98188 15.1801 5.73561 15.1801 5.24309V5.15224C15.1801 3.89565 15.1801 3.26736 14.7897 2.87699C14.3993 2.48662 13.771 2.48662 12.5144 2.48662H12.4236Z" stroke="#FAF7F4" fill="none" /></g>
      <g transform="translate(5.5 5.5)"><path d="M6.33333 3.41667C6.33333 5.0275 5.0275 6.33333 3.41667 6.33333C1.80583 6.33333 0.5 5.0275 0.5 3.41667C0.5 1.80583 1.80583 0.5 3.41667 0.5C5.0275 0.5 6.33333 1.80583 6.33333 3.41667Z" stroke="#FAF7F4" fill="none" /></g>
    </svg>
  );
}

/* Search — the handoff draws it as a 2px-stroke magnifier on a 20px box. */
export function IconSearch({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" {...meta}>
      <circle cx="8.75" cy="8.75" r="6.25" stroke="currentColor" strokeWidth="2" />
      <path d="M13.17 13.17 17.5 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* Filter — the funnel in the customers handoff's maroon 42.78x44 button:
   a single 1.5px-stroke path inset 12.5% on all four sides of a 24px box. */
export function IconFilter({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <path
        d="M3 4.6h18l-6.9 8.1v5.9l-4.2 2.8v-8.7L3 4.6Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}

/* Row chevron — the handoff draws it as a bare 4x8 vector, 1px, #141B34. */
export function IconChevronRight({ size = 8 }: P) {
  return (
    <svg width={size / 2} height={size} viewBox="0 0 4 8" fill="none" {...meta}>
      <path d="M0.5 0.5 3.5 4 0.5 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* Profile — the solid bust inside the customer detail's 70px maroon disc.
   Verbatim from public/store/customer.svg (the handoff's "iconamoon:profile-fill"
   at 32px); only the hard-coded white is swapped for currentColor. */
export function IconProfileFill({ size = 32 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...meta}>
      <path fillRule="evenodd" clipRule="evenodd" d="M10.6667 9.33333C10.6667 7.91885 11.2286 6.56229 12.2288 5.5621C13.229 4.5619 14.5855 4 16 4C17.4145 4 18.771 4.5619 19.7712 5.5621C20.7714 6.56229 21.3333 7.91885 21.3333 9.33333C21.3333 10.7478 20.7714 12.1044 19.7712 13.1046C18.771 14.1048 17.4145 14.6667 16 14.6667C14.5855 14.6667 13.229 14.1048 12.2288 13.1046C11.2286 12.1044 10.6667 10.7478 10.6667 9.33333ZM10.6667 17.3333C8.89856 17.3333 7.20286 18.0357 5.95262 19.286C4.70238 20.5362 4 22.2319 4 24C4 25.0609 4.42143 26.0783 5.17157 26.8284C5.92172 27.5786 6.93913 28 8 28H24C25.0609 28 26.0783 27.5786 26.8284 26.8284C27.5786 26.0783 28 25.0609 28 24C28 22.2319 27.2976 20.5362 26.0474 19.286C24.7971 18.0357 23.1014 17.3333 21.3333 17.3333H10.6667Z" fill="currentColor" />
    </svg>
  );
}

/* WhatsApp — public/store/whatsapp.svg, verbatim (white swapped for
   currentColor). The handoff drops it in the same folder as the profile glyph
   but doesn't place it on this screen yet. */
export function IconWhatsApp({ size = 32 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...meta}>
      <path d="M16.0003 29.3333C23.3641 29.3333 29.3337 23.3637 29.3337 16C29.3337 8.63616 23.3641 2.66663 16.0003 2.66663C8.63653 2.66663 2.66699 8.63616 2.66699 16C2.66699 17.8385 3.03909 19.5901 3.71209 21.1836C4.08403 22.0641 4.27001 22.5045 4.29303 22.8373C4.31606 23.1701 4.21811 23.5361 4.02222 24.2682L2.66699 29.3333L7.73202 27.9781C8.46417 27.7822 8.83024 27.6842 9.16302 27.7073C9.4958 27.7302 9.93613 27.9162 10.8168 28.2882C12.4103 28.9612 14.1618 29.3333 16.0003 29.3333Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <path d="M11.4505 16.5031L12.6118 15.0608C13.1012 14.453 13.7062 13.8871 13.7537 13.0777C13.7655 12.8733 13.6218 11.9555 13.3341 10.1199C13.221 9.39845 12.5475 9.33337 11.9641 9.33337C11.2039 9.33337 10.8237 9.33337 10.4463 9.50579C9.96919 9.72371 9.47939 10.3365 9.3719 10.8498C9.28686 11.256 9.35006 11.5359 9.47646 12.0956C10.0133 14.4731 11.2728 16.8211 13.2256 18.774C15.1786 20.727 17.5266 21.9864 19.9041 22.5232C20.4638 22.6496 20.7437 22.7128 21.1499 22.6278C21.6633 22.5203 22.2759 22.0306 22.4939 21.5534C22.6663 21.1759 22.6663 20.7959 22.6663 20.0356C22.6663 19.4522 22.6013 18.7787 21.8798 18.6656C20.0442 18.3779 19.1265 18.2342 18.9219 18.246C18.1126 18.2935 17.5467 18.8984 16.9389 19.3879L15.4966 20.5491" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

/* Phone — the small filled handset beside the contact number. */
export function IconPhoneFill({ size = 14 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" {...meta}>
      <path
        d="M4.31 1.4a.9.9 0 0 1 1.26.24l1.06 1.6a.9.9 0 0 1-.15 1.17l-.72.63c.36.9 1.1 1.64 2 2l.63-.72a.9.9 0 0 1 1.17-.15l1.6 1.06a.9.9 0 0 1 .24 1.26l-.7 1.02a1.4 1.4 0 0 1-1.5.54C6.2 10.3 3.7 7.8 2.75 4.8a1.4 1.4 0 0 1 .54-1.5l1.02-.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* delete-02 — the 18px bin at the end of a team row, 1.5px maroon. */
export function IconTrash({ size = 18 }: P) {
  const s = { stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <path d="M4.5 5.5h15v13.5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3V5.5Z" {...s} />
      <path d="M3 5.5h18M9 5.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" {...s} />
      <path d="M9.5 10.5v6M14.5 10.5v6" {...s} />
    </svg>
  );
}

/* ── Devices glyphs ─────────────────────────────────────────────────────
   The two 47.73px tile marks are drawn on a 24-unit box at 1px so they land
   on the handoff's 2px stroke when rendered at 48. */

/* modern-tv — the same shape as IconTv, at device-tile weight. */
export function IconMirrorLg({ size = 48 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <g transform="translate(1.25 2.25)"><path d="M14.75 0.75H6.75C3.92157 0.75 2.50736 0.75 1.62868 1.62868C0.75 2.50736 0.75 3.92157 0.75 6.75V8.75C0.75 11.5784 0.75 12.9926 1.62868 13.8713C2.50736 14.75 3.92157 14.75 6.75 14.75H14.75C17.5784 14.75 18.9926 14.75 19.8713 13.8713C20.75 12.9926 20.75 11.5784 20.75 8.75V6.75C20.75 3.92157 20.75 2.50736 19.8713 1.62868C18.9926 0.75 17.5784 0.75 14.75 0.75Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(7.25 19.25)"><path d="M8.75024 1.75C7.57354 1.114 6.20734 0.75 4.75024 0.75C3.29314 0.75 1.92693 1.114 0.750244 1.75" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

/* tablet-01 — body inset 14.58%/8.33%, home mark at 78% down. */
export function IconTabletLg({ size = 48 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <rect x="3.5" y="2" width="17" height="20" rx="3" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M11.4 19h1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* time-04 — the 16px clock beside "Last Seen", 1px #141B34. */
export function IconClock({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...meta}>
      <circle cx="8" cy="8" r="6.67" stroke="currentColor" fill="none" />
      <path d="M8 5.33V8h2.67" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* The 7x14 back chevron inside the 35px outlined square. */
export function IconChevronLeft({ size = 14 }: P) {
  return (
    <svg width={size / 2} height={size} viewBox="0 0 7 14" fill="none" {...meta}>
      <path d="M6.25 0.75 0.75 7l5.5 6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ── New-campaign dialog glyphs ─────────────────────────────────────────
   All drawn on a 24px box at the handoff's 1.5px stroke. */

export function IconClose({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* mail-01 — envelope with the flap as a separate stroke. */
export function IconMail({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <rect x="2" y="3.5" width="20" height="17" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M2 7 12 13 22 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* chat — rounded speech bubble with a tail. */
export function IconChat({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <path
        d="M21.5 11.4c0 4.6-4.25 8.35-9.5 8.35-.72 0-1.42-.07-2.09-.2l-5.4 1.6 1.35-4.1A7.94 7.94 0 0 1 2.5 11.4c0-4.61 4.25-8.35 9.5-8.35s9.5 3.74 9.5 8.35Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"
      />
      <path d="M8.25 11.4h7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* arrow-down-01 — the select caret, 24px box, chevron inset 25%/37.5%. */
export function IconCaretDown({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <path d="M6 9 12 15 18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* calendar-04 at dialog scale. */
export function IconCalendarLg({ size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...meta}>
      <path d="M8 2v3M16 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/* Calendar — the 12px glyph beside a campaign's scheduled date, 1px #727272. */
export function IconCalendar({ size = 12 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" {...meta}>
      <path d="M4 1v1.5M8 1v1.5" stroke="currentColor" strokeLinecap="round" fill="none" />
      <rect x="1.5" y="2" width="9" height="9" rx="1.5" stroke="currentColor" fill="none" />
      <path d="M1.5 5h9" stroke="currentColor" fill="none" />
    </svg>
  );
}

/* ── Needs Attention shield ─────────────────────────────────────────────
   Verbatim from public/store/home/47..50_vector.svg — two blurred backing
   plates, the solid shield, and the tick. Drawn at the handoff's own scale
   inside a 114x125 box. */
export function ShieldAllClear() {
  return (
    <svg width="114" height="125" viewBox="0 0 114 125" fill="none" aria-hidden focusable="false">
      <g filter="url(#sh-blur)">
        <path d="M92.53 16.75C82.44 11.71 70.09 8.75 56.75 8.75s-25.69 2.96-35.78 8C16.02 19.22 13.55 20.46 11.15 24.34 8.75 28.22 8.75 31.98 8.75 39.5v18.67c0 30.4 24.23 47.31 38.26 54.55 3.91 2.02 5.87 3.03 9.74 3.03s5.83-1.01 9.74-3.03c14.03-7.24 38.26-24.15 38.26-54.55V39.5c0-7.52 0-11.28-2.4-15.16-2.4-3.88-4.87-5.12-9.82-7.59Z" fill="#F3FAF3" stroke="#D9D9D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g filter="url(#sh-blur2)" transform="translate(22 24)">
        <path d="M55.13 12.56C49.45 9.69 42.5 8 35 8s-14.45 1.69-20.13 4.56c-2.78 1.41-4.17 2.11-5.52 4.33C8 19.1 8 21.24 8 25.53v10.64C8 53.51 21.63 63.15 29.52 67.27c2.2 1.15 3.3 1.73 5.48 1.73s3.28-.58 5.48-1.73C48.37 63.15 62 53.51 62 36.17V25.53c0-4.29 0-6.43-1.35-8.64-1.35-2.22-2.74-2.92-5.52-4.33Z" fill="#E6F3E6" />
      </g>
      <g transform="translate(47 51)">
        <path d="M16.46 2.25C14.57 1.3 12.25.75 9.75.75S4.93 1.3 3.04 2.25c-.93.46-1.39.69-1.84 1.41C.75 4.39.75 5.09.75 6.5v3.49c0 5.68 4.54 8.84 7.17 10.2.74.37 1.1.56 1.83.56s1.09-.19 1.83-.56c2.63-1.36 7.17-4.52 7.17-10.2V6.5c0-1.41 0-2.11-.45-2.84-.45-.72-.91-.95-1.84-1.41Z" fill="#CCEBCD" stroke="#27741E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.75 10.25s1.41.25 2 2c0 0 1.5-3 4-4" stroke="#27741E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(0.25 -1.5)" />
      </g>
      <defs>
        <filter id="sh-blur" x="0" y="0" width="113.5" height="124.5" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="sh-blur2" x="0" y="0" width="70" height="77" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
    </svg>
  );
}
