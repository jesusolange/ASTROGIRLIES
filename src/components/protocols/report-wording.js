// Optional sending step for the astronaut's own mission health report, worded by the mission's
// link to Earth (window.AstroMedEnv.comm()). The self-care framing always comes first.
export const SEND_HINTS = {
  now: "Send it now: near Earth the link is live.",
  moon: "Send it: replies come after a short pause.",
  mars: "Send it as one complete message. A reply takes 6 to 44 minutes or more; do not wait for it before acting.",
  none: "If you have contact with Earth, you can send it."
};

export function linkKind(comm) {
  const place = comm && comm.place;
  if (place === "iss") return "now";
  if (place === "moon") return "moon";
  if (place === "mars" || place === "transit") return "mars";
  return "none";
}

export function sendHint(comm) {
  return SEND_HINTS[linkKind(comm)];
}

export function reportLead(comm) {
  return `Your mission health report. Keep it as your record. ${sendHint(comm)}`;
}
