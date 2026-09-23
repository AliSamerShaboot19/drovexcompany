const Svg = ({ size = 20, fill = 'none', children, ...rest }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={fill}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
);

export const IconArrow = (p) => (
  <Svg {...p} className={`flip-rtl ${p.className || ''}`}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Svg>
);
export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
export const IconAlert = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 7.5v5.5" />
    <circle cx="12" cy="16.5" r=".6" fill="currentColor" />
  </Svg>
);
export const IconInfo = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="7.8" r=".6" fill="currentColor" />
  </Svg>
);
export const IconGlobe = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
);
export const IconStar = (p) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" />
  </Svg>
);
export const IconExternal = (p) => (
  <Svg {...p} className={`flip-rtl ${p.className || ''}`}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Svg>
);
export const IconLock = (p) => (
  <Svg {...p}>
    <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Svg>
);
export const IconEdit = (p) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
  </Svg>
);
export const IconTrash = (p) => (
  <Svg {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V4.5h6V7" />
    <path d="M6.5 7l.8 12.5h9.4L17.5 7" />
  </Svg>
);
export const IconPlus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconLogout = (p) => (
  <Svg {...p}>
    <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" />
    <path d="M15 8l4 4-4 4M19 12H9" />
  </Svg>
);
export const IconSpinner = ({ size = 18, ...p }) => (
  <svg className="spinner" viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" {...p}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* Services */
export const IconWeb = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M3 9h18" />
    <path d="M7 6.5h.01M10 6.5h.01" />
    <path d="M9 14.5l-2 1.5 2 1.5M15 14.5l2 1.5-2 1.5M13 13.5l-2 5" />
  </Svg>
);
export const IconDesktop = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="3.5" width="19" height="13" rx="2.5" />
    <path d="M8 20.5h8M12 16.5v4" />
  </Svg>
);
export const IconBot = (p) => (
  <Svg {...p}>
    <path d="M21 15a2.5 2.5 0 0 1-2.5 2.5H8l-4.5 3.5V6A2.5 2.5 0 0 1 6 3.5h12.5A2.5 2.5 0 0 1 21 6z" />
    <path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" strokeWidth="2.4" />
  </Svg>
);
export const IconPipeline = (p) => (
  <Svg {...p}>
    <path d="M12 2.5 2.5 7.5 12 12.5l9.5-5z" />
    <path d="m2.5 12 9.5 5 9.5-5" />
    <path d="m2.5 16.5 9.5 5 9.5-5" />
  </Svg>
);

/* Social platforms */
export const IconFacebook = (p) => (
  <Svg {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Svg>
);
export const IconInstagram = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r=".7" fill="currentColor" />
  </Svg>
);
export const IconTelegram = (p) => (
  <Svg {...p}>
    <path d="M21.5 3 2.8 10.4c-.8.3-.8 1.4 0 1.7l4.6 1.6 1.8 5.6c.2.7 1.1.9 1.6.4l2.6-2.5 4.6 3.4c.6.4 1.4.1 1.6-.6L22.9 4.4c.2-.8-.6-1.7-1.4-1.4z" />
    <path d="m7.4 13.7 10.2-6.4-7.4 8.3" />
  </Svg>
);
export const IconWhatsApp = (p) => (
  <Svg {...p}>
    <path d="M3.5 20.5 5 16A8.5 8.5 0 1 1 8.2 19z" />
    <path d="M9 8.6c-.3.6-.2 1.6.7 2.9 1 1.5 2.3 2.5 3.6 2.9.8.2 1.4-.1 1.8-.7l-1.6-1.1-.8.6c-.8-.3-1.7-1.2-2.1-2l.6-.8L10 8.6z" />
  </Svg>
);
export const IconLinkedIn = (p) => (
  <Svg {...p}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </Svg>
);
export const IconLink = (p) => (
  <Svg {...p}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
  </Svg>
);

export const PLATFORM_ICONS = {
  facebook: IconFacebook,
  instagram: IconInstagram,
  telegram: IconTelegram,
  whatsapp: IconWhatsApp,
  linkedin: IconLinkedIn,
};
