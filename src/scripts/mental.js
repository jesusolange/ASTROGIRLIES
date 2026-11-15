/* Mental health self-check: scoring, the urgent response and the stored results.
   Screening aid, not a medical device and not a diagnosis.
   The score bands and the return interval are our design choices. */

import { alsoTell, hasCrew, link } from "./mission.js";
import { daysSince, intervalFor } from "./home.js";
import { currentMission, rankedRisks } from "./risks.js";
import { TOPIC_BY_ID } from "../data/topics.js";
import { CARD_BY_ID } from "../data/emergencies.js";
import { ALCOHOL_IDX, CATS, STRESS_Q } from "../components/mental/questions.js";
import { depTip, stressCatTip } from "../components/mental/guidance.js";

export const KEYS = { mental: "astromed-mental", history: "astromed-mental-history" };

const context = (options = {}) => {
  const crew = options.crew != null ? Boolean(options.crew) : hasCrew();
  const value = "link" in options ? options.link : link();
  const tell = (who = "the flight surgeon") => (options.tell != null && who === "the flight surgeon" ? options.tell : alsoTell(who, value));
  return { crew, tell };
};

const join = (...parts) => parts.filter(Boolean).join(" ");

const SOLO_SAFE = "Move away from airlock controls, tools, medicines and anything else you could use to hurt yourself.";
const CREW_NEAR = "Do not stay alone: stay with a crewmate until you have spoken to them.";

// Wording for the answer about thoughts of being better off dead or of hurting yourself.
export function suicidalResponse(options = {}) {
  const { crew, tell } = context(options);
  const second = tell();
  const actions = [SOLO_SAFE];
  if (crew) actions.push(CREW_NEAR);
  if (second) actions.push(second);
  return {
    title: "Please get help now",
    text: join("You answered that you have had thoughts of being better off dead or of hurting yourself.", SOLO_SAFE, crew ? CREW_NEAR : "", second),
    actions,
    button: "Open the full card"
  };
}

// The medic's self-harm card content, addressed by crew and link. The solo step always comes first.
export function selfHarmContent(options = {}) {
  const card = CARD_BY_ID.get("self-harm");
  const response = suicidalResponse(options);
  const crew = options.crew != null ? Boolean(options.crew) : hasCrew();
  const escalate = card && Array.isArray(card.escalate) ? card.escalate : [];
  return {
    title: card ? card.title : response.title,
    sign: card ? card.sign : "Thoughts of suicide or of hurting yourself",
    steps: response.actions,
    escalate: crew ? escalate : escalate.filter((line) => !/crewmate/i.test(line))
  };
}

const NAMES = { depression: "Isolation & depression", stress: "Stress & burn-out" };
const TYPES = ["depression", "stress"];

const FLAGGED_LABEL = "Needs attention";
const FLAGGED_MEANING = "This answer needs attention whatever the total score is.";

const DEP_MEANING = {
  "Healthy": "Your answers do not point to depression symptoms on this check-in.",
  "No suspicion": "You reported some symptoms, but the score stays below the screening range for depression.",
  "Mild depression symptoms": "Your answers are in the mild range for depression symptoms.",
  "Moderate depression symptoms": "Your answers are in the moderate range for depression symptoms.",
  "Severe depression symptoms": "Your answers are in the severe range for depression symptoms." };

export function depActions(label, options = {}) {
  const { crew, tell } = context(options);
  const actions = {
    "Healthy": [crew ? "Keep your sleep, exercise and crew-contact routine." : "Keep your sleep and exercise routine.", "Repeat the check-in if your mood changes."],
    "No suspicion": ["Plan one small activity you enjoy each day.", crew ? "Keep a fixed sleep window and stay in contact with crew and family." : "Keep a fixed sleep window and stay in contact with family.", "Repeat the check-in in a few days."],
    "Mild depression symptoms": ["Choose one small daily activity you enjoy and protect the time for it.", "Keep a fixed sleep schedule and daily exercise.", join("Write down how you feel and what you want to say this week.", crew ? "Talk with a crewmate this week." : "", tell())],
    "Moderate depression symptoms": [
      join("Write down how you feel and what you need, and set aside a private talk for tomorrow.", tell()),
      join("Do not stay alone when you feel low: keep the lights on and stay in the main module.", crew ? "Spend time with a crewmate." : ""),
      "Protect sleep, meals and exercise; log one session today."
    ],
    "Severe depression symptoms": [
      join("Write down how you feel and what you need, and keep it with you to read to someone today.", tell()),
      join("Do not stay alone: keep the lights on and stay in the main module.", crew ? CREW_NEAR : ""),
      "Keep to your sleep and meal routine." + (crew ? " Ask a crewmate to check in on you." : "")
    ]
  };
  return actions[label] || [];
}

const STRESS_MEANING = {
  "Stable": "Your stress signs are at a level that relaxation can keep in check.",
  "Stress reactions have started": "Stress reactions have started and are already affecting body and mood.",
  "High stress load": "Your stress load is high and is feeding tension, strain and health problems." };

export function stressActions(label, options = {}) {
  const { crew, tell } = context(options);
  const actions = {
    "Stable": ["Keep your relaxation routine; 10 minutes a day protects sleep and focus.", "Repeat the check-in if you notice tension building."],
    "Stress reactions have started": ["Start a daily 10-minute relaxation or breathing practice.", "Plan one rest block and one short break in each work period.", join("Write down what is loading you and one change you can make this week.", crew ? "Talk with a crewmate about it." : "", tell())],
    "High stress load": [
      join("Write down how you feel and what you need, and read it back to yourself.", tell()),
      "Reduce non-essential tasks today and protect your sleep.",
      join("Use your relaxation practice twice today.", crew ? "Ask a crewmate to check in on you." : "")
    ]
  };
  return actions[label] || [];
}

export function depLevel(score) {
  if (score < 5) return ["Healthy", "ok"];
  if (score < 10) return ["No suspicion", "ok"];
  if (score < 15) return ["Mild depression symptoms", "review"];
  if (score < 20) return ["Moderate depression symptoms", "review"];
  return ["Severe depression symptoms", "alert"];
}

export function stressBand(score) {
  if (score <= 10) return { level: "ok", label: "Stable" };
  if (score <= 20) return { level: "review", label: "Stress reactions have started" };
  return { level: "alert", label: "High stress load" };
}

// Any answer other than "Not at all" (value 0) to the suicidal-thoughts item.
export function suicidalFlag(answers) {
  return Array.isArray(answers) && Number(answers[8]) > 0;
}

export function stressMax() {
  return STRESS_Q.length * 2;
}

export function stressSub(answers) {
  const sub = {};
  Object.keys(CATS).forEach((c) => { sub[c] = { score: 0, max: 0 }; });
  STRESS_Q.forEach((q, i) => { sub[q[1]].score += Number(answers[i]) || 0; sub[q[1]].max += 2; });
  return sub;
}

const store = () => (typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store) || null;
const load = (key, fallback) => { const s = store(); return s ? s.get(key, fallback) : fallback; };
const save = (key, value) => { const s = store(); return s ? s.set(key, value) : false; };

const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function latest() {
  return load(KEYS.mental, {}) || {};
}

function readHistory() {
  const rows = load(KEYS.history, []);
  return Array.isArray(rows) ? rows : [];
}

function entryFromLatest(type, r) {
  return {
    type,
    questionnaire: NAMES[type],
    score: Number(r.score),
    max: type === "depression" ? 27 : stressMax(),
    label: r.label,
    level: r.level,
    answers: Array.isArray(r.answers) ? r.answers : [],
    sub: r.sub,
    date: r.date,
    flagged: type === "depression" ? suicidalFlag(r.answers) : false
  };
}

// Every saved result, newest first. Results stored before history existed are included from the latest keys.
export function history() {
  const rows = readHistory().filter((e) => e && e.type && e.date && Number.isFinite(Number(e.score)));
  const m = latest();
  TYPES.forEach((type) => {
    const r = m[type];
    if (!r || !r.date || !Number.isFinite(Number(r.score))) return;
    if (rows.some((e) => e.type === type && e.date === r.date)) return;
    rows.push(entryFromLatest(type, r));
  });
  rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  return withChanges(rows);
}

// Adds the previous result of the same questionnaire and the score change to each row.
export function withChanges(rows) {
  return rows.map((e, i) => {
    const previous = rows.slice(i + 1).find((x) => x.type === e.type) || null;
    return { ...e, previous, delta: previous ? e.score - previous.score : null };
  });
}

export function saveResult(type, answers) {
  const date = new Date().toISOString();
  const values = answers.map(Number);
  const score = values.reduce((a, b) => a + b, 0);
  let entry;
  if (type === "depression") {
    const [label, level] = depLevel(score);
    entry = { type, questionnaire: NAMES[type], score, max: 27, label, level, answers: values, date, flagged: suicidalFlag(values) };
  } else {
    const band = stressBand(score);
    entry = {
      type, questionnaire: NAMES[type], score, max: stressMax(), label: band.label, level: band.level,
      answers: values, sub: stressSub(values), date, flagged: false
    };
  }
  const m = latest();
  m[type] = {
    score: entry.score, label: entry.label, level: entry.level, answers: entry.answers,
    sub: entry.sub, date: entry.date, flagged: entry.flagged
  };
  save(KEYS.mental, m);
  const rows = readHistory();
  rows.push(entry);
  save(KEYS.history, rows);
  return entry;
}

// Takes the just-saved result back out and restores the previous one of the same type.
export function removeResult(type, date) {
  const rows = readHistory().filter((entry) => !(entry && entry.type === type && entry.date === date));
  save(KEYS.history, rows);
  const m = latest();
  const previous = rows.filter((entry) => entry.type === type).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  if (previous) {
    m[type] = {
      score: previous.score, label: previous.label, level: previous.level, answers: previous.answers,
      sub: previous.sub, date: previous.date, flagged: previous.flagged
    };
  } else {
    delete m[type];
  }
  save(KEYS.mental, m);
}

export function saveMood(value, note = "") {
  const m = latest();
  const before = m.mood ? { ...m.mood } : null;
  m.mood = { value, note: String(note || ""), date: new Date().toISOString() };
  save(KEYS.mental, m);
  return () => {
    const next = latest();
    if (before) next.mood = before;
    else delete next.mood;
    save(KEYS.mental, next);
  };
}

export function moodToday(now = new Date()) {
  const mood = latest().mood;
  return Boolean(mood && mood.date && isoDay(new Date(mood.date)) === isoDay(now));
}

// The topic's return interval, from the NASA rating of the mission (our design choice).
export function topicIntervalDays(topicId = "mental") {
  const topic = TOPIC_BY_ID.get(topicId);
  if (!topic) return 7;
  const score = rankedRisks(currentMission().id)
    .reduce((max, risk) => (topic.riskIds.includes(risk.id) ? Math.max(max, risk.score || 0) : max), 0);
  return intervalFor(score).days;
}

export function questionnaireDue(type, now = new Date()) {
  const result = latest()[type];
  if (!result || !result.date) return true;
  return daysSince(isoDay(new Date(result.date)), now) >= topicIntervalDays("mental");
}

export function resultLabel(entry) {
  return entry.flagged && entry.type === "depression" ? FLAGGED_LABEL : entry.label;
}

export function resultLevel(entry) {
  return entry.flagged && entry.type === "depression" ? "alert" : entry.level;
}

export function guideFor(entry, options = {}) {
  const { crew } = context(options);
  if (entry.type === "depression") {
    if (entry.flagged) {
      return {
        meaning: FLAGGED_MEANING,
        todo: [
          ...suicidalResponse(options).actions,
          crew ? "Repeat the check-in with a crewmate nearby when you are ready." : "Repeat the check-in when you are ready."
        ]
      };
    }
    return { meaning: DEP_MEANING[entry.label] || "This screening result needs a closer look.", todo: depActions(entry.label, options) };
  }
  return { meaning: STRESS_MEANING[entry.label] || "This screening result needs a closer look.", todo: stressActions(entry.label, options) };
}

export function analyzeMental(options = {}) {
  const m = latest();
  const out = { hasData: false, mental: [], urgent: [] };

  if (m.depression) {
    out.hasData = true;
    const d = m.depression;
    const flagged = suicidalFlag(d.answers);
    out.mental.push({
      level: flagged ? "alert" : d.level,
      title: "Isolation and depression check-in",
      saw: flagged ? "Needs attention whatever the total score is." : `Score ${d.score}/27: ${d.label}.`,
      todo: flagged ? suicidalResponse(options).actions.join(" ")
        : depActions(d.label, options).join(" ") || "Keep your routine and repeat the check-in."
    });

    const tips = (Array.isArray(d.answers) ? d.answers : []).slice(0, 8)
      .map((a, i) => Number(a) >= 2 ? depTip(i, options) : null).filter(Boolean);
    if (tips.length) out.mental.push({
      level: "review",
      title: "Symptoms that appear often",
      saw: "You marked some symptoms for more than half of the days.",
      todo: tips.join(" ")
    });

    if (suicidalFlag(d.answers)) out.urgent.push({
      level: "alert",
      title: "Thoughts of death or suicide",
      saw: "You answered that you wished you were dead or had suicidal thoughts.",
      todo: suicidalResponse(options).text
    });
  }

  if (m.stress) {
    out.hasData = true;
    const s = m.stress;
    const b = stressBand(s.score);
    out.mental.push({
      level: b.level,
      title: "Stress and burn-out check-in",
      saw: `Score ${s.score}/${stressMax()}: ${b.label}.`,
      todo: stressActions(b.label, options).join(" ") || "Repeat the check-in and protect your rest."
    });

    if (s.sub) Object.keys(CATS).forEach((c) => {
      const x = s.sub[c];
      if (!x || !x.max) return;
      if (x.score / x.max >= 0.4) out.mental.push({
        level: "review",
        title: CATS[c],
        saw: `${x.score}/${x.max} points, so this area carries much of your stress.`,
        todo: stressCatTip(c, options)
      });
    });

    if (ALCOHOL_IDX >= 0 && Number((s.answers || [])[ALCOHOL_IDX]) > 0) {
      const { tell } = context(options);
      out.mental.push({
        level: "alert",
        title: "Using alcohol or medication to calm down",
        saw: "You marked using alcohol or medication to calm down.",
        todo: join("Please do not self-medicate. Write down what you use to calm down and what you could try instead.", tell())
      });
    }
  }

  return out;
}

const stamp = (iso) => new Date(iso).toLocaleString("en-GB", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
});

export function protocolRows() {
  const m = latest();
  return [
    { name: "Mood check", value: m.mood ? `${m.mood.value} · ${stamp(m.mood.date)}` : "" },
    { name: "Isolation and depression", value: m.depression ? `${m.depression.score}/27 · ${m.depression.label}` : "" },
    { name: "Stress and burn-out", value: m.stress ? `${m.stress.score}/${stressMax()} · ${m.stress.label}` : "" }
  ];
}

export function findings() {
  const a = analyzeMental();
  return [...a.urgent, ...a.mental];
}

if (typeof window !== "undefined") {
  window.AstroMedMental = { findings, history, latest, analyze: analyzeMental, saveResult, protocolRows };
}
