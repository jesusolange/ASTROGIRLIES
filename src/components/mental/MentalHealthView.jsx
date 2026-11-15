// The Mental Health section: mood check-in, the two questionnaires, their results and the history.
import "../../scripts/storage.js";
import { useRef, useState } from "preact/hooks";
import {
  CATS,
  DEP_OPTS,
  DEP_Q,
  MOOD_REPLIES,
  STRESS_OPTS,
  STRESS_Q,
  history,
  saveMood,
  saveResult,
} from "../../scripts/mental.js";
import Panel from "../ui/Panel.jsx";
import Tabs from "../ui/Tabs.jsx";
import MoodCheckIn from "./MoodCheckIn.jsx";
import Questionnaire from "./Questionnaire.jsx";
import Result from "./Result.jsx";
import History from "./History.jsx";
import "../ui/ui.css";
import "../../styles/mental.css";

const TAB_LIST = [
  { id: "dep", label: "Isolation & depression" },
  { id: "stress", label: "Stress & burn-out" },
  { id: "history", label: "History" },
];

const DEP_GROUPS = [{ items: DEP_Q.map((text, index) => ({ index, text })) }];

const STRESS_GROUPS = Object.keys(CATS).map((cat) => ({
  label: CATS[cat],
  items: STRESS_Q.map((question, index) => ({ question, index }))
    .filter((item) => item.question[1] === cat)
    .map((item) => ({ index: item.index, text: item.question[0] })),
}));

const latestByType = () => {
  const rows = history();
  return {
    depression: rows.find((entry) => entry.type === "depression") || null,
    stress: rows.find((entry) => entry.type === "stress") || null,
  };
};

export default function MentalHealthView() {
  const [tab, setTab] = useState("dep");
  const [mood, setMood] = useState(null);
  const [reply, setReply] = useState("");
  const [depAnswers, setDepAnswers] = useState(() => DEP_Q.map(() => null));
  const [stressAnswers, setStressAnswers] = useState(() => STRESS_Q.map(() => null));
  const [entries, setEntries] = useState(latestByType);
  const [rows, setRows] = useState(history);
  const depResult = useRef(null);
  const stressResult = useRef(null);

  function pickMood(id) {
    setMood(id);
    const [nextTab, nextReply] = MOOD_REPLIES[id];
    setReply(nextReply);
    setTab(nextTab);
    saveMood(id);
  }

  function changeTab(id) {
    setTab(id);
    if (id === "history") setRows(history());
  }

  function save(type, answers, target) {
    saveResult(type, answers);
    setEntries(latestByType());
    setRows(history());
    setTab(type === "depression" ? "dep" : "stress");
    requestAnimationFrame(() => target.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function answerDepression(index, value) {
    setDepAnswers((current) => current.map((answer, i) => (i === index ? value : answer)));
  }

  function answerStress(index, value) {
    setStressAnswers((current) => current.map((answer, i) => (i === index ? value : answer)));
  }

  return (
    <>
      <div class="am-heading">
        <h2>Mental Health</h2>
        <p>
          Isolation and confinement are one of the five NASA human-spaceflight hazards. A quick check-in helps you
          spot changes early.
        </p>
      </div>

      <MoodCheckIn value={mood} reply={reply} onPick={pickMood} />

      <Tabs tabs={TAB_LIST} value={tab} onChange={changeTab} label="Mental health views" idBase="mh" />

      <Panel
        id="mh-panel-dep"
        role="tabpanel"
        aria-labelledby="mh-tab-dep"
        hidden={tab !== "dep"}
        title="How often have you experienced any of the following symptoms?"
      >
        <Questionnaire
          id="mhDepForm"
          groups={DEP_GROUPS}
          options={DEP_OPTS}
          columns={4}
          values={depAnswers}
          onAnswer={answerDepression}
          required
          onSubmit={() => save("depression", depAnswers.map(Number), depResult)}
        />
        {entries.depression ? (
          <div ref={depResult}>
            <Result entry={entries.depression} onOpenEmergencies={() => window.AstroMedNav.show("emergencies")} />
          </div>
        ) : null}
      </Panel>

      <Panel
        id="mh-panel-stress"
        role="tabpanel"
        aria-labelledby="mh-tab-stress"
        hidden={tab !== "stress"}
        title="How strongly do you notice these signs?"
      >
        <Questionnaire
          id="mhStressForm"
          groups={STRESS_GROUPS}
          options={STRESS_OPTS}
          columns={3}
          values={stressAnswers}
          onAnswer={answerStress}
          required
          onSubmit={() => save("stress", stressAnswers.map(Number), stressResult)}
        />
        {entries.stress ? (
          <div ref={stressResult}>
            <Result entry={entries.stress} onOpenEmergencies={() => window.AstroMedNav.show("emergencies")} />
          </div>
        ) : null}
      </Panel>

      <Panel id="mh-panel-history" role="tabpanel" aria-labelledby="mh-tab-history" hidden={tab !== "history"} title="History">
        <p>
          Every saved check-in, newest first. The change compares the score with the previous result of the same
          questionnaire.
        </p>
        <History entries={rows} />
      </Panel>
    </>
  );
}
