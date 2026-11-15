import { useEffect, useRef } from "preact/hooks";
import { route } from "../../lib/nav.js";
import HomeView from "../home/HomeView.jsx";
import CheckDeck from "../check/CheckView.jsx";
import ProgressView from "../progress/ProgressView.jsx";
import EmergenciesView from "../emergencies/EmergenciesView.jsx";
import "./shell.css";

const AREA_LABEL = { home: "Home", check: "Check", progress: "Progress", emergency: "Emergency" };

export default function AreaView() {
  const { area, id } = route.value;
  const heading = useRef(null);

  useEffect(() => {
    if (window.__amCoverOpen) return;
    if (document.querySelector("dialog[open]")) return;
    const node = heading.current;
    if (node && typeof node.focus === "function") node.focus();
  }, [area, id]);

  let content;
  if (area === "home") content = <HomeView />;
  else if (area === "check") content = <CheckDeck />;
  else if (area === "progress") content = <ProgressView />;
  else content = <EmergenciesView />;

  return (
    <div class="tb-page" key={area}>
      <h1 class="tb-sr-only" id="tb-page-title" tabIndex={-1} ref={heading}>{AREA_LABEL[area] || "Home"}</h1>
      {content}
    </div>
  );
}
