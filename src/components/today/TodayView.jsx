import { useEffect, useMemo, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { EMPTY_MISSIONS } from "../../scripts/missions.js";
import { compute } from "../../scripts/readiness.js";
import { buildQueue, exists, openCheck, urgentFindings } from "../../scripts/today.js";
import "./today.css";
import UrgentFindings from "./UrgentFindings.jsx";
import ScoreHero from "./ScoreHero.jsx";
import MissingChecks from "./MissingChecks.jsx";
import QueueList from "./QueueList.jsx";
import PointsStrip from "./PointsStrip.jsx";
import TrainingPanel from "./TrainingPanel.jsx";
import HowScore from "./HowScore.jsx";

function TodayBody() {
  const [missions, saveMissions] = useStored("astromed-missions", EMPTY_MISSIONS);
  const [profile] = useStored("astromed-profile", null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const unsubscribe = window.AstroMedStore.store.subscribe(() => setRevision((value) => value + 1));
    const onNav = () => setRevision((value) => value + 1);
    document.addEventListener("astromed-nav-changed", onNav);
    const late = setTimeout(onNav, 400);
    return () => { unsubscribe(); document.removeEventListener("astromed-nav-changed", onNav); clearTimeout(late); };
  }, []);

  const readiness = useMemo(() => compute(), [revision, missions, profile]);
  const queue = useMemo(() => buildQueue(readiness), [revision, readiness]);
  const urgent = useMemo(() => urgentFindings(), [revision, readiness]);
  const emergencies = exists("emergencies");

  return (
    <div>
      <div class="am-heading">
        <h2>Today</h2>
        <p>Your readiness for this mission, the checks due today and what to do next.</p>
      </div>
      <UrgentFindings findings={urgent} emergencies={emergencies} />
      <ScoreHero readiness={readiness} />
      <MissingChecks readiness={readiness} onOpen={openCheck} />
      <QueueList queue={queue} onOpen={openCheck} />
      <TrainingPanel missions={missions} save={saveMissions} />
      <HowScore readiness={readiness} onOpen={openCheck} />
      <PointsStrip missions={missions} save={saveMissions} />
    </div>
  );
}

export default function TodayView() {
  return <TodayBody />;
}
