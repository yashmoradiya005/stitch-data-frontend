export function StitchIcon({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Needle — tapered body pointing right, tip meeting the thread */}
      <path
        d="M2 13 L2 19 L8 17.2 L8 14.8 Z"
        fill="currentColor"
      />
      {/* Needle tip point */}
      <path
        d="M8 14.8 L8 17.2 L10 16 Z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Needle eye — subtle oval */}
      <ellipse
        cx="4.5" cy="16"
        rx="0.9" ry="1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.35"
      />

      {/* Thread — infinity (∞) loop starting from needle tip */}
      <path
        d="M10 16
           C 12 10, 18 10, 20 16
           C 22 22, 28 22, 30 16
           C 28 10, 22 10, 20 16
           C 18 22, 12 22, 10 16
           Z"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Small thread tail exiting needle — hints it's threaded */}
      <path
        d="M2 19 C2 21.5 4 22 4 24"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}
