/* Weekly exercise overview: pure aggregation of stored sessions.
   Observations are not diagnoses or medical alerts. */

export const TYPE_NAMES = { ared: "Strength (ARED)", cevis: "Bike (CEVIS)", t2: "Treadmill (T2)" };
const TYPES = ["ared", "t2", "cevis"];
const DAY_MS = 86400000;

const asNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const sum = (items) => items.reduce((total, number) => total + number, 0);
const minutes = (session) => Math.max(0, asNumber(session.values?.minutes) ?? 0);

function dayStamp(date) {
  const result = new Date(date);
  if (!Number.isFinite(result.getTime())) return null;
  result.setHours(0, 0, 0, 0);
  return result.getTime();
}

export function validSessions(data) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((session) => session && TYPES.includes(session.type) && session.values
      && typeof session.values === "object" && dayStamp(session.date) !== null)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function buildOverview(data, now = new Date()) {
  const all = validSessions(data);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const distance = (session) => Math.round((today.getTime() - dayStamp(session.date)) / DAY_MS);

  const current = all.filter((s) => distance(s) >= 0 && distance(s) <= 6);
  const previous = all.filter((s) => distance(s) >= 7 && distance(s) <= 13);

  const totalMinutes = sum(current.map(minutes));
  const previousMinutes = sum(previous.map(minutes));
  const efforts = current.map((s) => asNumber(s.values?.effort)).filter((n) => n !== null && n >= 0 && n <= 10);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - 6 + index);
    const stamp = dayStamp(date);
    const amount = sum(current.filter((s) => dayStamp(s.date) === stamp).map(minutes));
    return { date: date.toISOString(), weekday: date.toLocaleDateString("en-US", { weekday: "short" }), amount };
  });
  const peak = Math.max(1, ...days.map((day) => day.amount));

  const comparison = previous.length && previousMinutes > 0
    ? {
      difference: totalMinutes - previousMinutes,
      percentage: Math.round(Math.abs(totalMinutes - previousMinutes) / previousMinutes * 100),
      previousMinutes,
      totalMinutes
    }
    : null;

  const perType = ["ared", "cevis", "t2"].map((type) => {
    const list = current.filter((session) => session.type === type);
    return { type, name: TYPE_NAMES[type], count: list.length, mins: Math.round(sum(list.map(minutes))) };
  });
  const maxMins = Math.max(1, ...perType.map((x) => x.mins));
  perType.forEach((x) => { x.share = (x.mins / maxMins) * 100; });

  const comparisons = [
    { type: "t2", key: "speed", label: "T2 average speed", unit: "km/h" },
    { type: "cevis", key: "power", label: "CEVIS power", unit: "W" }
  ];
  const ared = all.filter((s) => s.type === "ared" && typeof s.values.movement === "string");
  const repeated = ared.find((session) => ared.filter((other) => other.values.movement === session.values.movement
    && asNumber(other.values.load) !== null).length >= 2);
  if (repeated) {
    comparisons.unshift({
      type: "ared", key: "load", label: `ARED ${repeated.values.movement} resistance`,
      unit: "kg", movement: repeated.values.movement
    });
  }
  const performance = [];
  comparisons.forEach((config) => {
    const matches = all.filter((session) => session.type === config.type
      && (!config.movement || session.values.movement === config.movement)
      && asNumber(session.values[config.key]) !== null);
    if (matches.length < 2) return;
    const latest = asNumber(matches[0].values[config.key]);
    const earlier = asNumber(matches[1].values[config.key]);
    performance.push({ label: config.label, unit: config.unit, from: earlier, to: latest, difference: latest - earlier });
  });

  const insights = [];
  if (current.length === 0) {
    insights.push({
      title: "No recent training logs",
      message: "Record an ARED, T2 or CEVIS session to start seeing changes. An empty log does not prove training was missed."
    });
  } else {
    const soreness = current.map((s) => asNumber(s.values?.soreness)).filter((n) => n !== null && n >= 0 && n <= 10);
    if (soreness.some((n) => n >= 7)) {
      insights.push({
        title: "Higher soreness reported",
        message: "One or more sessions recorded soreness of 7/10 or greater. Reduce the load or skip the affected movement until it settles, and check associated symptoms and recent trends. If Earth contact exists, also tell the flight surgeon about persistent, unusual or severe discomfort.",
        review: true
      });
    }
    const avgEffort = efforts.length ? sum(efforts) / efforts.length : 0;
    if (efforts.length && avgEffort >= 7) {
      insights.push({
        title: "Higher perceived effort",
        message: `Average logged effort was ${avgEffort.toFixed(1)}/10. Compare this with the prescribed exercise plan and recent recovery.`,
        review: true
      });
    }
    if (previous.length && previousMinutes > 0 && Math.abs(totalMinutes - previousMinutes) / previousMinutes >= 0.2) {
      const percentage = Math.round(Math.abs(totalMinutes - previousMinutes) / previousMinutes * 100);
      insights.push({
        title: "Training duration changed",
        message: `Recorded training time ${totalMinutes < previousMinutes ? "decreased" : "increased"} ${percentage}% compared with the previous 7 days. Verify that all sessions were logged and compare against the mission schedule.`
      });
    }
    if (current.length < 3) {
      insights.push({
        title: "More history is needed",
        message: "There are fewer than three sessions in the last seven days. One workout is not enough to assess long-term fitness or recovery."
      });
    }
    if (efforts.length < current.length) {
      insights.push({
        title: "Complete session observations",
        message: "Some sessions do not contain an effort score. Recording effort makes future comparisons more useful."
      });
    }
    if (soreness.length === 0) {
      insights.push({
        title: "Recovery data is limited",
        message: "No soreness values were recorded this week. Training duration alone cannot determine whether an astronaut has recovered."
      });
    }
    if (!insights.length) {
      insights.push({
        title: "Continue monitoring",
        message: "No particular pattern was flagged in the available records. Continue recording comparable sessions and review them against the individual mission exercise plan."
      });
    }
  }

  return {
    sessions: all.length,
    currentCount: current.length,
    totalMinutes,
    previousMinutes,
    effort: efforts.length ? sum(efforts) / efforts.length : null,
    days,
    peak,
    comparison,
    machines: perType,
    performance,
    insights
  };
}
