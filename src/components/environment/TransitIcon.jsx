export default function TransitIcon({ className = "env-place-icon" }) {
  return (
    <svg class={className} viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="31" cy="35" r="6" />
      <ellipse cx="31" cy="35" rx="24" ry="9" transform="rotate(-28 31 35)" />
      <circle cx="54" cy="17" r="3" />
      <path d="M8 52l6-11 11-6" />
    </svg>
  );
}
