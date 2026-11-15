/* Mental health self-check: scoring, in-section results, history and the urgent response.
   Screening aid, not a medical device and not a diagnosis. */

import { alsoTell, hasCrew, link } from "./mission.js";

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
    button: "Open Emergencies"
  };
}

export const SUICIDAL_RESPONSE = {
  get title() { return suicidalResponse().title; },
  get text() { return suicidalResponse().text; },
  get actions() { return suicidalResponse().actions; },
  get button() { return suicidalResponse().button; }
};
const FLAGGED_LABEL = "Needs attention";
const FLAGGED_MEANING = "This answer needs attention whatever the total score is.";

export const DEP_OPTS = ["Not at all", "On certain days", "More than half the time", "Almost every day"];

export const DEP_Q = [
  "Decreased interest in everyday activities and/or no fulfilment",
  "Despondency or helplessness",
  "Problems falling asleep, insufficient sleep or sleeping more",
  "Tiredness or a feeling of fatigue",
  "Loss of appetite or increased need to eat",
  "Negative thoughts about yourself: feeling like a failure or like you disappoint your family",
  "Hard time concentrating, for example when reading or watching TV",
  "Your speech has become slower and others have commented on it, or the opposite: you speak very fast",
  "Have you wished you were dead or had suicidal thoughts"
];

export function depTip(index, options = {}) {
  const { crew, tell } = context(options);
  const tips = [
    "Plan one small activity you enjoy every day (music, a hobby, photographing Earth, a call home).",
    join("Write down how you feel and what you would say out loud.", crew ? "Share how you feel with a crewmate." : "", "Feeling helpless is common on long missions and it can be worked on.", tell()),
    "Keep a fixed sleep schedule, dim the lights and avoid screens and caffeine in the hour before sleep.",
    "Review your workload, sleep and nutrition together, and schedule real rest blocks.",
    "Keep regular meals, track what you eat and report unintended weight changes.",
    join("Write down three things you did well today.", crew ? "Talk with a crewmate about these thoughts." : "Write what you would say to someone you trust about these thoughts.", tell()),
    "Work in short, focused blocks with breaks and avoid multitasking.",
    join("Speak a few sentences aloud and note whether your speech is faster or slower than usual.", crew ? "Ask a crewmate if they notice the same change." : "", tell("the flight surgeon about the speech change"))
  ];
  return tips[index] || null;
}

export const STRESS_OPTS = ["None", "Slight", "Strong"];

export const CATS = { body: "Body signs", emotional: "Emotional signs", cognitive: "Cognitive signals", behavioural: "Behavioural signs" };

export const STRESS_Q = [
  ["Heart pounding", "body"], ["Tightness in the chest", "body"], ["Breathing problems", "body"],
  ["Problems falling asleep", "body"], ["Chronic fatigue", "body"], ["Digestion problems", "body"],
  ["Stomach pain", "body"], ["Loss of appetite", "body"], ["Muscle tightness", "body"],
  ["Back pain", "body"], ["Cold hands/feet", "body"], ["Strong sweating", "body"],

  ["Nervousness", "emotional"], ["Irritability or anger issues", "emotional"], ["Fear", "emotional"],
  ["Dissatisfaction", "emotional"], ["Loss of interest", "emotional"], ["Inner emptiness", "emotional"],
  ["Nightmares", "emotional"],

  ["Constantly circling thoughts", "cognitive"], ["Difficulty concentrating", "cognitive"],
  ["Feeling mentally blank/blackout", "cognitive"], ["Daydreaming", "cognitive"],
  ["Reduced performance/frequent mistakes", "cognitive"],

  ["Aggression towards others", "behavioural"],
  ["Drumming fingers, shuffling feet, trembling, grinding teeth", "behavioural"],
  ["Speaking rapidly or stuttering", "behavioural"],
  ["Interrupting others, inability to listen", "behavioural"],
  ["Eating irregularly", "behavioural"],
  ["Consuming alcohol (or medication) to calm down", "behavioural"],
  ["Neglecting personal relationships", "behavioural"],
  ["Smoking more than desired", "behavioural"],
  ["Getting less exercise or physical activity than desired", "behavioural"]
];
const ALCOHOL_IDX = STRESS_Q.findIndex((q) => q[0].startsWith("Consuming alcohol"));

export function stressCatTip(cat, options = {}) {
  const { crew, tell } = context(options);
  const tips = {
    body: "Try slow breathing (4 seconds in, 6 out) and progressive muscle relaxation for 10 minutes. Exercise sessions also release tension.",
    emotional: join("Name the emotion and write down what is behind it, then protect some private, quiet time.", crew ? "Talk it through with a crewmate." : "", tell()),
    cognitive: "Write your circling thoughts down, then pick one task and finish it. Use short breaks to reset your focus.",
    behavioural: join("Pick one habit to adjust this week.", crew ? "Keep contact with family and crew, and keep your exercise routine." : "Keep contact with family and keep your exercise routine.")
  };
  return tips[cat] || "";
}

export const MOODS = [["Great", "great"], ["Okay", "okay"], ["Stressed", "stressed"], ["Down", "down"], ["Not sure", "unsure"]];

export const MOOD_REPLIES = {
  great: ["dep", "A short check-in now and then still helps you notice trends. Choose either test."],
  okay: ["dep", "Take the depression and isolation check-in, or switch to the stress test."],
  stressed: ["stress", "That sounds heavy. The stress and burn-out test is open."],
  down: ["dep", "That sounds difficult, and checking in is a good step. The isolation and depression test is open."],
  unsure: ["dep", "That is fine. Start with this test, and try the stress one afterwards. Together they give a clearer picture."]};
const NAMES = { depression: "Isolation & depression", stress: "Stress & burn-out" };
const TYPES = ["depression", "stress"];

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
      join("Keep to your sleep and meal routine.", crew ? "Ask a crewmate to check in on you." : "")
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

export function saveMood(value) {
  const m = latest();
  m.mood = { value, date: new Date().toISOString() };
  save(KEYS.mental, m);
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
      title: "Isolation & depression check-in",
      saw: `Score ${d.score}/27: ${flagged ? FLAGGED_LABEL : d.label}.`,
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
      title: "Stress & burn-out check-in",
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
    { name: "Isolation & depression", value: m.depression ? `${m.depression.score}/27 · ${m.depression.label}` : "" },
    { name: "Stress & burn-out", value: m.stress ? `${m.stress.score}/${stressMax()} · ${m.stress.label}` : "" }
  ];
}

export function findings() {
  const a = analyzeMental();
  return [...a.urgent, ...a.mental];
}

if (typeof window !== "undefined") {
  window.AstroMedMental = { findings, history, latest, analyze: analyzeMental, saveResult, protocolRows };
}

