import { UserRound } from "lucide-preact";
import { useStored } from "../../lib/use-stored.js";
import { KEY, barState, open } from "../../scripts/profile.js";
import "./shell.css";

export default function ProfileButton() {
  useStored(KEY, null);
  const state = barState();
  const label = state.name ? `${state.name} · open profile` : "Open profile";

  return (
    <button type="button" class="tb-control tb-profile" aria-label={label} title={label} onClick={() => open(false)}>
      <span class="tb-avatar" aria-hidden="true">
        {state.initials || <UserRound size={16} />}
      </span>
    </button>
  );
}
