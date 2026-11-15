import { useEffect } from "preact/hooks";
import { go, route } from "../../lib/nav.js";
import HomeView from "../home/HomeView.jsx";
import CheckupPage from "../checkup/CheckupPage.jsx";
import VisionView from "../vision/VisionView.jsx";
import ExerciseView from "../exercise/ExerciseView.jsx";
import NutritionView from "../nutrition/NutritionView.jsx";
import MentalHealthView from "../mental/MentalHealthView.jsx";
import ImmuneView from "../immune/ImmuneView.jsx";
import RadiationView from "../radiation/RadiationView.jsx";
import ProgressView from "../progress/ProgressView.jsx";
import ProtocolsView from "../protocols/ProtocolsView.jsx";
import EmergenciesView from "../emergencies/EmergenciesView.jsx";
import { openCard as emergencyCard } from "../../scripts/emergencies.js";
import { resolveCardId } from "../../data/emergencies.js";
import CheckIndex from "./CheckIndex.jsx";
import "./shell.css";

const CHECK_VIEWS = [
  { id: "checkup", View: CheckupPage },
  { id: "overview", View: CheckupPage },
  { id: "vision", View: VisionView },
  { id: "exercise", View: ExerciseView },
  { id: "twin", View: ExerciseView },
  { id: "nutrition", View: NutritionView },
  { id: "mental", View: MentalHealthView },
  { id: "immune", View: ImmuneView },
  { id: "radiation", View: RadiationView },
];

const AREA_LABEL = { home: "Home", check: "Check", progress: "Progress", emergency: "Emergency" };

export default function AreaView() {
  const { area, id } = route.value;
  const selected = area === "check" && id ? CHECK_VIEWS.find((entry) => entry.id === id) || null : null;
  const missing = area === "check" && Boolean(id) && !selected;

  useEffect(() => {
    if (missing) go("home");
  }, [missing]);

  useEffect(() => {
    if (area !== "emergency") return;
    emergencyCard.value = id ? resolveCardId(id) : null;
  }, [area, id]);

  const CheckView = selected ? selected.View : null;
  let content;
  if (area === "home") content = <HomeView />;
  else if (area === "check") content = CheckView ? <CheckView /> : <CheckIndex />;
  else if (area === "progress") content = <><ProgressView /><ProtocolsView /></>;
  else content = <EmergenciesView />;

  return (
    <div class="tb-page">
      <h1 class="tb-eyebrow">{AREA_LABEL[area] || "Home"}</h1>
      {content}
    </div>
  );
}
