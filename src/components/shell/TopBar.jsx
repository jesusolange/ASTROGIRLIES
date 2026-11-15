import { Activity, Siren } from "lucide-preact";
import { go } from "../../lib/nav.js";
import Destinations from "./Destinations.jsx";
import MissionChip from "./MissionChip.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import ProfileButton from "./ProfileButton.jsx";
import "./shell.css";

export default function TopBar() {
  return (
    <header class="tb">
      <button type="button" class="tb-brand" aria-label="AstroMed home" onClick={() => go("home")}>
        <span class="tb-mark" aria-hidden="true"><Activity size={18} /></span>
        <span class="tb-brand-text">AstroMed</span>
      </button>

      <Destinations />

      <div class="tb-right">
        <MissionChip />
        <button
          type="button"
          class="tb-emergency"
          aria-keyshortcuts="E"
          title="Open Emergency (press E)"
          onClick={() => go("emergency")}
        >
          <Siren size={18} aria-hidden="true" />
          <span class="tb-emergency-label">Emergency</span>
        </button>
        <ThemeToggle />
        <ProfileButton />
      </div>
    </header>
  );
}
