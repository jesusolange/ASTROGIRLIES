/* Mental health self-check: scoring, in-section results, history and the urgent response.
   Screening aid, not a medical device and not a diagnosis. */

export const KEYS = {
  mental: "astromed-mental",
  history: "astromed-mental-history"
};

// Wording for the answer about thoughts of being better off dead or of hurting yourself.
// It is pending review by the team's medic.
export const SUICIDAL_RESPONSE = {
  title: "Please tell someone now",
  text: "You answered that you have had thoughts of being better off dead or of hurting yourself. " +
    "Tell the crew medical officer or the commander now. Do not stay alone: stay with a crewmate until you have spoken to them.",
  actions: [
    "Tell the crew medical officer or the commander now.",
    "Do not stay alone: stay with a crewmate until you have spoken to them."
  ],
  button: "Open Emergencies"
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

const DEP_TIPS = {
  0: "Plan one small activity you enjoy every day (music, a hobby, photographing Earth, a call home).",
  1: "Share how you feel with a crewmate or ground support. Feeling helpless is common on long missions and it can be worked on.",
  2: "Keep a fixed sleep schedule, dim the lights and avoid screens and caffeine in the hour before sleep.",
  3: "Review your workload, sleep and nutrition together, and schedule real rest blocks.",
  4: "Keep regular meals, track what you eat and report unintended weight changes.",
  5: "Write down three things you did well today and talk with someone you trust about these thoughts.",
  6: "Work in short, focused blocks with breaks and avoid multitasking.",
  7: "Ask a crewmate if they notice the change too, and mention it at your next medical conference."
};

export const STRESS_OPTS = ["None", "Slight", "Strong"];

export const CATS = {
  body: "Body signs",
  emotional: "Emotional signs",
  cognitive: "Cognitive signals",
  behavioural: "Behavioural signs"
};

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

const STRESS_CAT_TIPS = {
  body: "Try slow breathing (4 seconds in, 6 out) and progressive muscle relaxation for 10 minutes. Exercise sessions also release tension.",
  emotional: "Name the emotion, talk it through with a crewmate or ground support, and protect some private, quiet time.",
  cognitive: "Write your circling thoughts down, then pick one task and finish it. Use short breaks to reset your focus.",
  behavioural: "Pick one habit to adjust this week. Keep contact with family and crew, and keep your exercise routine."
};

export const MOODS = [["Great", "great"], ["Okay", "okay"], ["Stressed", "stressed"], ["Down", "down"], ["Not sure", "unsure"]];

export const MOOD_REPLIES = {
  great: ["dep", "Great to hear! A short check-in now and then still helps you notice trends. Choose either test."],
  okay: ["dep", "Thanks for sharing. Take the depression and isolation check-in, or switch to the stress test."],
  stressed: ["stress", "That sounds heavy. I opened the stress and burn-out test for you."],
  down: ["dep", "I'm sorry you feel that way, and I'm glad you're checking in. I opened the isolation and depression test for you."],
  unsure: ["dep", "That's fine. Start with this test, and try the stress one afterwards. Together they give a clearer picture."]
};

const NAMES = { depression: "Isolation & depression", stress: "Stress & burn-out" };
const TYPES = ["depression", "stress"];

const DEP_MEANING = {
  "Healthy": "Your answers do not point to depression symptoms on this check-in.",
  "No suspicion": "You reported some symptoms, but the score stays below the screening range for depression.",
  "Mild depression symptoms": "Your answers are in the mild range for depression symptoms.",
  "Moderate depression symptoms": "Your answers are in the moderate range for depression symptoms.",
  "Severe depression symptoms": "Your answers are in the severe range for depression symptoms."
};

const DEP_ACTIONS = {
  "Healthy": [
    "Keep your sleep, exercise and crew-contact routine.",
    "Repeat the check-in if your mood changes."
  ],
  "No suspicion": [
    "Plan one small activity you enjoy each day.",
    "Keep a fixed sleep window and stay in contact with crew and family.",
    "Repeat the check-in in a few days."
  ],
  "Mild depression symptoms": [
    "Choose one small daily activity you enjoy and protect the time for it.",
    "Keep a fixed sleep schedule and daily exercise.",
    "Talk with a crewmate or the crew medical officer this week."
  ],
  "Moderate depression symptoms": [
    "Tell the crew medical officer how you feel and ask for a private talk in the next day.",
    "Do not stay alone when you feel low: spend time in the shared module.",
    "Protect sleep, meals and exercise; log one session today."
  ],
  "Severe depression symptoms": [
    "Tell the crew medical officer and the commander today.",
    "Do not stay alone: stay with a crewmate until you have spoken to them.",
    "Keep to your sleep and meal routine and ask the crew to check in on you."
  ]
};

const STRESS_MEANING = {
  "Stable": "Your stress signs are at a level that relaxation can keep in check.",
  "Stress reactions have started": "Stress reactions have started and are already affecting body and mood.",
  "High stress load": "Your stress load is high and is feeding tension, strain and health problems."
};

const STRESS_ACTIONS = {
  "Stable": [
    "Keep your relaxation routine; 10 minutes a day protects sleep and focus.",
    "Repeat the check-in if you notice tension building."
  ],
  "Stress reactions have started": [
    "Start a daily 10-minute relaxation or breathing practice.",
    "Plan one rest block and one short break in each work period.",
    "Talk with a crewmate or the crew medical officer about what is loading you."
  ],
  "High stress load": [
    "Tell the crew medical officer and the commander how you feel.",
    "Reduce non-essential tasks today and protect your sleep.",
    "Use your relaxation practice twice today and ask a crewmate to check in on you."
  ]
};

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

export function guideFor(entry) {
  if (entry.type === "depression") {
    if (entry.flagged) {
      return {
        meaning: FLAGGED_MEANING,
        todo: [...SUICIDAL_RESPONSE.actions, "Repeat the check-in with a crewmate nearby when you are ready."]
      };
    }
    return { meaning: DEP_MEANING[entry.label] || "This screening result needs a closer look.", todo: DEP_ACTIONS[entry.label] || [] };
  }
  return { meaning: STRESS_MEANING[entry.label] || "This screening result needs a closer look.", todo: STRESS_ACTIONS[entry.label] || [] };
}

export function analyzeMental() {
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
      todo: flagged ? SUICIDAL_RESPONSE.actions.join(" ")
        : DEP_ACTIONS[d.label] ? DEP_ACTIONS[d.label].join(" ") : "Keep your routine and repeat the check-in."
    });

    const tips = (Array.isArray(d.answers) ? d.answers : []).slice(0, 8)
      .map((a, i) => Number(a) >= 2 ? DEP_TIPS[i] : null).filter(Boolean);
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
      todo: SUICIDAL_RESPONSE.text
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
      todo: STRESS_ACTIONS[b.label] ? STRESS_ACTIONS[b.label].join(" ") : "Repeat the check-in and protect your rest."
    });

    if (s.sub) Object.keys(CATS).forEach((c) => {
      const x = s.sub[c];
      if (!x || !x.max) return;
      if (x.score / x.max >= 0.4) out.mental.push({
        level: "review",
        title: CATS[c],
        saw: `${x.score}/${x.max} points, so this area carries much of your stress.`,
        todo: STRESS_CAT_TIPS[c]
      });
    });

    if (ALCOHOL_IDX >= 0 && Number((s.answers || [])[ALCOHOL_IDX]) > 0) out.mental.push({
      level: "alert",
      title: "Using alcohol or medication to calm down",
      saw: "You marked using alcohol or medication to calm down.",
      todo: "Please do not self-medicate. Talk with the crew medical officer about safe ways to relax and sleep."
    });
  }

  return out;
}

const stamp = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

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

