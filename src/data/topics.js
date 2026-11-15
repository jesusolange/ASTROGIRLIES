// One row per topic: which NASA risks it covers and which emergency card belongs to it.
// The mapping is our design choice, not NASA's. Cards name their own topic; the deck groups them.
export const TOPICS = [
  { id: "heart", label: "Heart", riskIds: [179], emergency: "breath" },
  { id: "bones", label: "Bones", riskIds: [77], emergency: null },
  { id: "kidneys", label: "Kidneys", riskIds: [81], emergency: null },
  { id: "immune", label: "Immune", riskIds: [80, 85], emergency: "fever" },
  { id: "radiation", label: "Radiation", riskIds: [96], emergency: "storm" },
  { id: "mental", label: "Mental health", riskIds: [99], emergency: null },
  { id: "sleep", label: "Sleep", riskIds: [100], emergency: null },
  { id: "vision", label: "Vision", riskIds: [105], emergency: "vision-change" },
  { id: "environment", label: "Cabin conditions", riskIds: [173], emergency: "cabin-air" },
  { id: "nutrition", label: "Nutrition", riskIds: [176], emergency: null },
  { id: "exercise", label: "Exercise", riskIds: [180], emergency: null },
];

export const TOPIC_BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));

export function topicFor(riskId) {
  return TOPICS.find((topic) => topic.riskIds.includes(Number(riskId))) || null;
}

export function emergencyFor(topicId) {
  const topic = TOPIC_BY_ID.get(topicId);
  return topic ? topic.emergency : null;
}

export function topicsFor(emergencyId) {
  return TOPICS.filter((topic) => topic.emergency === emergencyId);
}
