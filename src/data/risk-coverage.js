// Which part of the app watches each NASA risk. This mapping is our design choice, not NASA's.
// section: the sidebar action that opens the check; part: the body system inside Daily Checkup.
// A risk that is missing here is shown as "not monitored yet".
export default {
  77: { section: "overview", part: "bones", area: "Bones" },
  80: { section: "immune", area: "Immune watch" },
  81: { section: "overview", part: "kidneys", area: "Kidneys" },
  85: { section: "immune", area: "Immune watch" },
  95: { section: "emergencies", area: "Emergencies" },
  96: { section: "radiation", area: "Radiation" },
  99: { section: "mental", area: "Mental health" },
  100: { section: "overview", part: "brain", area: "Sleep" },
  105: { section: "vision", area: "Vision" },
  173: { section: "environment", area: "Environment" },
  176: { section: "nutrition", area: "Nutrition" },
  179: { section: "overview", part: "heart", area: "Heart" },
  180: { section: "twin", area: "Exercise" },
};
