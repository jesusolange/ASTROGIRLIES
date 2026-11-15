import { UserRound } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { KEY, barState, open } from "../../scripts/profile.js";
import { subscribeAccount } from "../../scripts/sync.js";
import "./shell.css";

export default function ProfileButton() {
  useStored(KEY, null);
  const [, refresh] = useState(0);
  useEffect(() => subscribeAccount(() => refresh((value) => value + 1)), []);
  const state = barState();
  const sync = state.sync || {};
  const displayName = state.demo ? `${state.name || "Solange"} · Demo Astronaut` : (state.name || "Set up profile");
  const syncText = state.demo
    ? "Demo data"
    : sync.signedIn ? (sync.status || "Signed in") : (sync.status || "Not signed in · saved here");
  const label = `${displayName} · ${syncText} · open profile`;

  return (
    <button type="button" class="tb-control tb-profile" aria-label={label} title={label} onClick={() => open(false)}>
      <span class="tb-avatar" aria-hidden="true">
        {state.initials || <UserRound size={16} />}
      </span>
      <span class="tb-profile-copy">
        <strong>{displayName}</strong>
        <small class={state.demo ? "is-demo" : ""}>{syncText}</small>
      </span>
    </button>
  );
}
