export default function ProfileAvatar({ initials, size = "large" }) {
  return (
    <span class={`pf-avatar pf-avatar-${size}`} aria-hidden="true">
      {initials || "?"}
    </span>
  );
}
