import { route } from "../../lib/nav.js";
import HomeView from "../home/HomeView.jsx";
import CheckDeck from "../check/CheckView.jsx";
import ProgressView from "../progress/ProgressView.jsx";
import ProtocolsView from "../protocols/ProtocolsView.jsx";
import EmergenciesView from "../emergencies/EmergenciesView.jsx";
import "./shell.css";

const AREA_LABEL = { home: "Home", check: "Check", progress: "Progress", emergency: "Emergency" };

export default function AreaView() {
  const { area } = route.value;

  let content;
  if (area === "home") content = <HomeView />;
  else if (area === "check") content = <CheckDeck />;
  else if (area === "progress") content = <><ProgressView /><ProtocolsView /></>;
  else content = <EmergenciesView />;

  return (
    <div class="tb-page" key={area}>
      <h1 class="tb-sr-only">{AREA_LABEL[area] || "Home"}</h1>
      {content}
    </div>
  );
}
