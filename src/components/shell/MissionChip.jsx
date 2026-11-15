import { useStored } from "../../lib/use-stored.js";
import { link } from "../../scripts/mission.js";
import { missionType } from "../../scripts/risks.js";
import { KEY, missionDayFor, open, totalFor } from "../../scripts/profile.js";

const DESTINATION = { leo: "Low Earth orbit", lunarOrbit: "Moon", lunarSurface: "Moon", mars: "Mars" };

function delayText(delay) {
  if (!delay || delay.kind === "none") return "No link";
  return `${delay.oneWay} delay`;
}

export default function MissionChip() {
  const [profile] = useStored(KEY, null);

  if (!profile || !profile.missionType) {
    return (
      <button
        type="button"
        class="tb-control tb-chip"
        title="Set your mission in the profile"
        onClick={() => open(false, "mission")}
      >
        <span class="tb-chip-full">Set mission</span>
        <span class="tb-chip-day">Mission</span>
      </button>
    );
  }

  const mission = missionType(profile.missionType);
  const destination = DESTINATION[mission.drm] || mission.label;
  const day = missionDayFor(profile);
  const total = totalFor(profile);
  const full = `${destination} · ${day == null ? "Day not set" : `Day ${day} / ${total}`} · ${delayText(link(null, profile))}`;

  return (
    <button
      type="button"
      class="tb-control tb-chip"
      title="Open your mission profile"
      onClick={() => open(false, "mission")}
    >
      <span class="tb-chip-full">{full}</span>
      <span class="tb-chip-day">{day == null ? "Day —" : `Day ${day}`}</span>
    </button>
  );
}
