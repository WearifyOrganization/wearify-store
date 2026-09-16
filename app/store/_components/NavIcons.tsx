/* Store rail icons.
 *
 * The handoff exported each icon as a pile of separate one-path SVGs with no
 * placement data inside the files — the positions come from the spec's
 * percentage insets, resolved against the 18px icon box (24px for sign-out):
 *     translate = left% x box - 0.5
 * the 0.5 being the stroke padding every fragment carries in its own viewBox.
 * Shapes are verbatim from public/store/navbar/*.svg; only the colours are
 * swapped to currentColor so one icon serves the white (idle) and maroon
 * (active) states.
 *
 */

export function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden focusable="false">
      <g transform="translate(1.375 1.375)"><path d="M0.5 7.6172V9.5C0.5 11.9748 0.5 13.2123 1.26885 13.9812C2.03769 14.75 3.27513 14.75 5.75 14.75H8.75C11.2248 14.75 12.4623 14.75 13.2312 13.9812C14 13.2123 14 11.9748 14 9.5V7.6172C14 6.35623 14 5.7258 13.7331 5.18004C13.4662 4.63428 12.9685 4.24721 11.9732 3.47308L10.4732 2.30641C8.92482 1.10214 8.15067 0.5 7.25 0.5C6.34933 0.5 5.57517 1.10214 4.02682 2.30641L2.52681 3.47308C1.5315 4.24721 1.03384 4.63428 0.766925 5.18004C0.5 5.7258 0.5 6.35623 0.5 7.6172Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(6.25 12.25)"><path d="M5.00002 0.5C4.40039 0.9668 3.61267 1.25 2.75002 1.25C1.88729 1.25 1.09965 0.9668 0.5 0.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconCatalogue() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden focusable="false">
      <g transform="translate(1.375 5.125)"><path d="M9.49455 7.9955V0.5H4.24778C2.48109 0.5 1.59775 0.5 1.0489 1.04883C0.500052 1.59768 0.500045 2.48098 0.50003 4.24775L0.5 7.24595C0.499985 9.01263 0.499978 9.89598 1.04882 10.4449C1.59767 10.9937 2.48103 10.9937 4.24775 10.9937H6.49635C7.9097 10.9937 8.61638 10.9937 9.05546 10.5546C9.49455 10.1155 9.49455 9.40885 9.49455 7.9955Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(6.625 1.375)"><path d="M4.24763 10.9937H5.74673C7.51342 10.9937 8.39683 10.9937 8.94565 10.4449C9.49447 9.89598 9.49448 9.01263 9.49448 7.24595V4.24775C9.49448 2.48104 9.49447 1.59769 8.94565 1.04884C8.39683 0.5 7.51342 0.5 5.74673 0.5H0.5L0.500105 4.24775" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(3.625 8.875)"><path d="M0.5 0.5H3.12342M0.5 3.4982H4.99733" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(6.625 1.375)"><path d="M0.5 0.5L4.24778 4.24775" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconOrder() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden focusable="false">
      <g transform="translate(1.375 1.375)"><path d="M13.7573 8.0086C13.4945 5.75686 13.1105 4.0685 12.7544 2.869C12.4625 1.88545 12.3164 1.39368 11.7178 0.946897C11.1191 0.500122 10.5072 0.500122 9.28335 0.500122H5.21645C3.99261 0.500122 3.38068 0.500122 2.782 0.946897C2.18332 1.39368 2.03733 1.88545 1.74535 2.869C1.38927 4.0685 1.0053 5.75686 0.742519 8.0086C0.432814 10.6624 0.277962 11.9893 1.17286 12.9947C2.06777 14.0001 3.51804 14.0001 6.41858 14.0001H7.33118" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(5.875 4.375)"><path d="M0.5 0.5C0.5 1.74264 1.50736 2.75 2.75 2.75C3.99268 2.75 5 1.74264 5 0.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(10.375 11.125)"><path d="M0.5 3.50012C0.5 3.50012 1.25 3.50012 2 5.00012C2 5.00012 3.63238 1.25012 5.75 0.500122" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconCustomers() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden focusable="false">
      <g transform="translate(2.125 10.0)"><path d="M10.7917 5.25V2.86328C10.7917 2.3715 10.5687 1.89792 10.1455 1.64744C8.93711 0.93225 7.36486 0.5 5.64583 0.5C3.92683 0.5 2.35457 0.93225 1.14614 1.64744C0.722949 1.89792 0.5 2.3715 0.5 2.86328V5.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(4.375 2.5)"><path d="M3.27083 6.04167C4.80112 6.04167 6.04167 4.80112 6.04167 3.27083C6.04167 1.74054 4.80112 0.5 3.27083 0.5C1.74054 0.5 0.5 1.74054 0.5 3.27083C0.5 4.80112 1.74054 6.04167 3.27083 6.04167Z" stroke="currentColor" fill="none" /></g>
      <g transform="translate(13.0 10.5)"><path d="M2.47929 4.72208V2.33536C2.47929 1.84358 2.25636 1.36993 1.83313 1.11952C1.42716 0.879172 0.98003 0.670885 0.500122 0.500122" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(10.75 2.609)"><path d="M0.500122 0.500122C1.64463 0.84076 2.47929 1.90102 2.47929 3.15621C2.47929 4.41141 1.64463 5.47169 0.500122 5.81234" stroke="currentColor" strokeLinecap="round" fill="none" /></g>
    </svg>
  );
}

export function IconAnalytics() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden focusable="false">
      <g transform="translate(4.75 9.25)"><path d="M0.5 3.5V0.5" stroke="currentColor" strokeLinecap="round" fill="none" /></g>
      <g transform="translate(8.5 4.75)"><path d="M0.5 8V0.5" stroke="currentColor" strokeLinecap="round" fill="none" /></g>
      <g transform="translate(12.25 7.75)"><path d="M0.5 5V0.5" stroke="currentColor" strokeLinecap="round" fill="none" /></g>
      <g transform="translate(1.375 1.375)"><path d="M0.5 7.625C0.5 4.26624 0.5 2.58687 1.54343 1.54343C2.58687 0.5 4.26624 0.5 7.625 0.5C10.9837 0.5 12.6631 0.5 13.7066 1.54343C14.75 2.58687 14.75 4.26624 14.75 7.625C14.75 10.9837 14.75 12.6631 13.7066 13.7066C12.6631 14.75 10.9837 14.75 7.625 14.75C4.26624 14.75 2.58687 14.75 1.54343 13.7066C0.5 12.6631 0.5 10.9837 0.5 7.625Z" stroke="currentColor" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}

export function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden focusable="false">
      <g transform="translate(1.0 1.0)"><path d="M11.2312 2.28796C10.788 2.28796 10.5663 2.28795 10.3644 2.21304C10.3363 2.20263 10.3087 2.19118 10.2815 2.17871C10.0857 2.08891 9.92908 1.93219 9.61558 1.61875C8.89415 0.897327 8.53348 0.536615 8.08963 0.503353C8.03 0.498882 7.97 0.498882 7.91037 0.503353C7.46652 0.536615 7.10577 0.897328 6.38439 1.61874C6.07095 1.93219 5.91423 2.08891 5.71848 2.17871C5.69129 2.19118 5.66365 2.20263 5.6356 2.21304C5.43369 2.28795 5.21205 2.28796 4.76878 2.28796H4.68702C3.55608 2.28796 2.99062 2.28795 2.63929 2.63929C2.28795 2.99062 2.28796 3.55608 2.28796 4.68702V4.76878C2.28796 5.21205 2.28795 5.43369 2.21304 5.6356C2.20263 5.66365 2.19118 5.69129 2.17871 5.71848C2.08891 5.91423 1.93219 6.07095 1.61874 6.38439C0.897328 7.10577 0.536615 7.46652 0.503353 7.91037C0.498882 7.97 0.498882 8.03 0.503353 8.08963C0.536615 8.53348 0.897328 8.89415 1.61874 9.61558C1.93219 9.92908 2.08891 10.0857 2.17871 10.2815C2.19118 10.3087 2.20263 10.3363 2.21304 10.3644C2.28795 10.5663 2.28796 10.788 2.28796 11.2312V11.313C2.28796 12.4439 2.28795 13.0094 2.63929 13.3607C2.99062 13.7121 3.55608 13.7121 4.68702 13.7121H4.76878C5.21205 13.7121 5.43369 13.7121 5.6356 13.787C5.66365 13.7973 5.69129 13.8088 5.71848 13.8213C5.91423 13.9111 6.07095 14.0678 6.38439 14.3812C7.10577 15.1027 7.46652 15.4634 7.91037 15.4966C7.97 15.5011 8.02993 15.5011 8.08963 15.4966C8.53348 15.4634 8.89415 15.1027 9.61558 14.3812C9.92908 14.0678 10.0857 13.9111 10.2815 13.8213C10.3087 13.8088 10.3363 13.7973 10.3644 13.787C10.5663 13.7121 10.788 13.7121 11.2312 13.7121H11.313C12.4439 13.7121 13.0094 13.7121 13.3607 13.3607C13.7121 13.0094 13.7121 12.4439 13.7121 11.313V11.2312C13.7121 10.788 13.7121 10.5663 13.787 10.3644C13.7973 10.3363 13.8088 10.3087 13.8213 10.2815C13.9111 10.0857 14.0678 9.92908 14.3812 9.61558C15.1027 8.89415 15.4634 8.53348 15.4966 8.08963C15.5011 8.02993 15.5011 7.97 15.4966 7.91037C15.4634 7.46652 15.1027 7.10577 14.3812 6.38439C14.0678 6.07095 13.9111 5.91423 13.8213 5.71848C13.8088 5.69129 13.7973 5.66365 13.787 5.6356C13.7121 5.43369 13.7121 5.21205 13.7121 4.76878V4.68702C13.7121 3.55608 13.7121 2.99062 13.3607 2.63929C13.0094 2.28795 12.4439 2.28796 11.313 2.28796H11.2312Z" stroke="currentColor" fill="none" /></g>
      <g transform="translate(5.875 5.875)"><path d="M5.75 3.125C5.75 4.57475 4.57475 5.75 3.125 5.75C1.67525 5.75 0.5 4.57475 0.5 3.125C0.5 1.67525 1.67525 0.5 3.125 0.5C4.57475 0.5 5.75 1.67525 5.75 3.125Z" stroke="currentColor" fill="none" /></g>
    </svg>
  );
}

export function IconSignOut() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <g transform="translate(9.496 11.5)"><path d="M10.75 0.75H0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(2.495 2.0)"><path d="M11.7264 4.25C11.6799 3.15656 11.5415 2.45981 11.1301 1.92372C10.9705 1.71572 10.7843 1.52954 10.5763 1.36994C9.76837 0.75 8.59557 0.75 6.25 0.75C3.90443 0.75 2.73164 0.75 1.92372 1.36994C1.71572 1.52954 1.52954 1.71572 1.36994 1.92372C0.75 2.73164 0.75 3.90442 0.75 6.25V14.25C0.75 16.5956 0.75 17.7684 1.36994 18.5763C1.52954 18.7843 1.71572 18.9705 1.92372 19.1301C2.73164 19.75 3.90443 19.75 6.25 19.75C8.59557 19.75 9.76837 19.75 10.5763 19.1301C10.7843 18.9705 10.9705 18.7843 11.1301 18.5763C11.5415 18.0402 11.6799 17.3434 11.7264 16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
      <g transform="translate(16.996 8.0)"><path d="M0.750099 7.75C0.750099 7.75 4.25 5.1723 4.25 4.25C4.25 3.3277 0.75 0.75 0.75 0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
    </svg>
  );
}
