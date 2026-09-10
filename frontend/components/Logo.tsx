/** KelanaAI compass-star mark. Colours are fixed brand values (see globals.css). */
export default function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#10253f" />
      <path
        d="M16 3 L21 11 L29 16 L21 21 L16 29 L11 21 L3 16 L11 11 Z"
        fill="#ffb020"
      />
      <circle cx="16" cy="16" r="2.4" fill="#10253f" />
    </svg>
  );
}
