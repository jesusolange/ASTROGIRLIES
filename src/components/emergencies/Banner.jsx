import { useStored } from "../../lib/use-stored.js";
import { alsoTell } from "../../scripts/mission.js";

export default function Banner() {
  useStored("astromed-profile", null);
  const tell = alsoTell();
  return (
    <p class="emg-banner">
      <b>Life in danger?</b> Open the matching card and do step 1.{tell ? ` ${tell}` : ""}
    </p>
  );
}
