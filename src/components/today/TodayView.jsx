import { useEffect, useMemo, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { currentSection } from "../../lib/nav.js";
import { EMPTY_MISSIONS } from "../../scripts/missions.js";
import { compute } from "../../scripts/readiness.js";
import { buildQueue, exists, openCheck, urgentFindings } from "../../scripts/today.js";
import "./today.css";
import UrgentFindings from "./UrgentFindings.jsx";
import ScoreHero from "./ScoreHero.jsx";
import QueueList from "./QueueList.jsx";
import StreakStrip from "./StreakStrip.jsx";
import HowScore from "./HowScore.jsx";

function TodayBody() {
  const [missions] = useStored("astromed-missions", EMPTY_MISSIONS);
  const [profile] = useStored("astromed-profile", null);
  const [revision, setRevision] = useState(0);
  const section = currentSection.value;

  useEffect(() => {
    const unsubscribe = window.AstroMedStore.store.subscribe(() => setRevision((value) => value + 1));
    return () => { unsubscribe(); };
  }, []);

  const readiness = useMemo(() => compute(), [revision, missions, profile, section]);
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
      <QueueList queue={queue} onOpen={openCheck} />
      <StreakStrip missions={missions} readiness={readiness} />
      <HowScore readiness={readiness} onOpen={openCheck} />
    </div>
  );
}

export default function TodayView() {
  return <TodayBody />;
}
