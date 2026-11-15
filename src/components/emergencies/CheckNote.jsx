import RichText from "./RichText.jsx";

export default function CheckNote({ text }) {
  return (
    <div class="emg-check">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3 2 21h20L12 3Z" /><path d="M12 9v5M12 17h.01" />
      </svg>
      <span><RichText text={text} /></span>
    </div>
  );
}
