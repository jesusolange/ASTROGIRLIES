// The medic's screening questions, answer scales and the short mood replies.
// The wording is kept as written; the components render it.

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

export const ALCOHOL_IDX = STRESS_Q.findIndex((q) => q[0].startsWith("Consuming alcohol"));

export const MOODS = [["Great", "great"], ["Okay", "okay"], ["Stressed", "stressed"], ["Down", "down"], ["Not sure", "unsure"]];

export const MOOD_REPLIES = {
  great: ["dep", "A short check-in now and then still helps you notice trends. Choose either test."],
  okay: ["dep", "Take the depression and isolation check-in, or switch to the stress test."],
  stressed: ["stress", "That sounds heavy. The stress and burn-out test is open."],
  down: ["dep", "That sounds difficult, and checking in is a good step. The isolation and depression test is open."],
  unsure: ["dep", "That is fine. Start with this test, and try the stress one afterwards. Together they give a clearer picture."]
};
