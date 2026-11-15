import { useEffect, useMemo, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { EMPTY_MISSIONS } from "../../scripts/rewards.js";
import { compute } from "../../scripts/readiness.js";
import { attentionFindings, buildQueue } from "../../scripts/home.js";
import "./home.css";
import StreakStrip from "./StreakStrip.jsx";
import ScoreHero from "./ScoreHero.jsx";
import ScoreDialog from "./ScoreDialog.jsx";
import AttentionList from "./AttentionList.jsx";
import DueList from "./DueList.jsx";

export default function Home() {
  const [missions] = useStored("astromed-missions", EMPTY_MISSIONS);
  const [profile] = useStored("astromed-profile", null);
  const [revision, setRevision] = useState(0);
  const [explain, setExplain] = useState(false);

  useEffect(() => {
    const unsubscribe = window.AstroMedStore.store.subscribe(() => setRevision((value) => value + 1));
    return () => { unsubscribe(); };
  }, []);

  const readiness = useMemo(() => compute(), [revision, missions, profile]);
  const queue = useMemo(() => buildQueue(readiness), [revision, readiness]);
  const attention = useMemo(() => attentionFindings(), [revision, readiness]);

  return (
    <div class="home">
      <div class="home-heading">
        <h1>Home</h1>
        <p>Your readiness for this mission, the checks due today and what to do next.</p>
      </div>

      <StreakStrip missions={missions} readiness={readiness} />
      <ScoreHero readiness={readiness} onExplain={() => setExplain(true)} />
      <AttentionList findings={attention} />
      <DueList queue={queue} />

      <ScoreDialog open={explain} onClose={() => setExplain(false)} readiness={readiness} />
    </div>
  );
}
