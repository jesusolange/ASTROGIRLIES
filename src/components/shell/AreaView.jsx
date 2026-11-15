import { useEffect } from "preact/hooks";
import { route } from "../../lib/nav.js";
import HomeView from "../home/HomeView.jsx";
import CheckDeck from "../check/CheckView.jsx";
import ProgressView from "../progress/ProgressView.jsx";
import ProtocolsView from "../protocols/ProtocolsView.jsx";
import EmergenciesView from "../emergencies/EmergenciesView.jsx";
import { openCard as emergencyCard } from "../../scripts/emergencies.js";
import { resolveCardId } from "../../data/emergencies.js";
import "./shell.css";

const AREA_LABEL = { home: "Home", check: "Check", progress: "Progress", emergency: "Emergency" };

export default function AreaView() {
  const { area, id } = route.value;
  useEffect(() => {
    if (area !== "emergency") return;
    emergencyCard.value = id ? resolveCardId(id) : null;
  }, [area, id]);

  let content;
  if (area === "home") content = <HomeView />;
  else if (area === "check") content = <CheckDeck />;
  else if (area === "progress") content = <><ProgressView /><ProtocolsView /></>;
  else content = <EmergenciesView />;

  return (
    <div class="tb-page">
      <h1 class="tb-eyebrow">{AREA_LABEL[area] || "Home"}</h1>
      {content}
    </div>
  );
}
