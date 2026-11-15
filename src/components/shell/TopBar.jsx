import { Siren } from "lucide-preact";
import { go } from "../../lib/nav.js";
import Destinations from "./Destinations.jsx";
import MissionChip from "./MissionChip.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import ProfileButton from "./ProfileButton.jsx";
import OfflineIndicator from "../offline/OfflineIndicator.jsx";
import "./shell.css";

function skipToContent(event) {
  event.preventDefault();
  const heading = document.getElementById("tb-page-title");
  if (heading && typeof heading.focus === "function") heading.focus();
}

export default function TopBar() {
  return (
    <header class="tb">
      <a class="tb-skip" href="#tb-page-title" onClick={skipToContent}>Skip to content</a>

      <button type="button" class="tb-brand" aria-label="AstroMed home" onClick={() => go("home")}>
        <img class="tb-mark" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="32" height="32" />
        <span class="tb-brand-text">AstroMed</span>
      </button>

      <Destinations />

      <div class="tb-right">
        <MissionChip />
        <OfflineIndicator />
        <button
          type="button"
          class="tb-emergency"
          aria-label="Emergency"
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
