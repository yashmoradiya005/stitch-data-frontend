export function StitchIcon({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Needle body */}
      <path
        d="M50 5 L52 45 L48 45 Z"
        fill="#D4AF37"
        stroke="#1F2937"
        strokeWidth="1.5"
      />

      {/* Needle eye */}
      <ellipse cx="50" cy="48" rx="3" ry="5" fill="#1F2937" />

      {/* Thread flowing from needle */}
      <path
        d="M50 53 Q45 60 42 70 Q40 75 45 78"
        stroke="#D4AF37"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Stitch pattern - cross stitch marks */}
      <g stroke="#1F2937" strokeWidth="1.5" fill="none">
        {/* Cross stitch 1 */}
        <line x1="28" y1="65" x2="35" y2="72" />
        <line x1="35" y1="65" x2="28" y2="72" />

        {/* Cross stitch 2 */}
        <line x1="60" y1="65" x2="67" y2="72" />
        <line x1="67" y1="65" x2="60" y2="72" />

        {/* Running stitch line */}
        <circle cx="20" cy="55" r="2" fill="#1F2937" />
        <circle cx="30" cy="55" r="2" fill="#1F2937" />
        <circle cx="40" cy="55" r="2" fill="#1F2937" />
        <circle cx="60" cy="55" r="2" fill="#1F2937" />
        <circle cx="70" cy="55" r="2" fill="#1F2937" />
        <circle cx="80" cy="55" r="2" fill="#1F2937" />
      </g>

      {/* Decorative border circle */}
      <circle cx="50" cy="50" r="42" stroke="#D4AF37" strokeWidth="1.5" fill="none" />

      {/* Fabric base indicator */}
      <rect x="18" y="82" width="64" height="8" rx="2" fill="#E5E7EB" stroke="#1F2937" strokeWidth="1.5" />
    </svg>
  );
}
