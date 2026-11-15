import { UserRound } from "lucide-preact";
import { useStored } from "../../lib/use-stored.js";
import { KEY, barState, open } from "../../scripts/profile.js";
import "./shell.css";

export default function ProfileButton() {
  useStored(KEY, null);
  const state = barState();
  const displayName = state.demo ? `${state.name || "Solange"} · Demo Astronaut` : (state.name || "Set up profile");
  const label = `${displayName} · open profile`;

  return (
    <button type="button" class="tb-control tb-profile" aria-label={label} title={label} onClick={() => open(false)}>
      <span class="tb-avatar" aria-hidden="true">
        {state.initials || <UserRound size={16} />}
      </span>
      <span class="tb-profile-copy">
        <strong>{displayName}</strong>
        {state.demo ? <small class="is-demo">Demo data</small> : null}
      </span>
    </button>
  );
}
