// Symptom notes shown under the questionnaire result. Wording follows crew and the link to Earth.
import { alsoTell, hasCrew, link } from "../../scripts/mission.js";

const join = (...parts) => parts.filter(Boolean).join(" ");

function context(options = {}) {
  const crew = options.crew != null ? Boolean(options.crew) : hasCrew();
  const value = "link" in options ? options.link : link();
  const tell = (who = "the flight surgeon") => (options.tell != null && who === "the flight surgeon" ? options.tell : alsoTell(who, value));
  return { crew, tell };
}

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
