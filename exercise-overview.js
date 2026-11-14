
/* ==============================================
   ASTROMED — EXERCISE & RECOVERY OVERVIEW

   Reads saved ARED, T2 and CEVIS sessions.
   Does not change exercise.js or stored data.

   Educational prototype.
   Observations are not medical diagnoses.
============================================== */

document.addEventListener("DOMContentLoaded", () => {

    const page = document.getElementById("exercisePage");
  
    if (!page || document.getElementById("exerciseOverview")) {
      return;
    }
  
    const storageKey = "astrotwin-exercise-sessions";
  
    /* ==========================================
       CREATE OVERVIEW PANEL
    ========================================== */
  
    const overview = document.createElement("section");
  
    overview.id = "exerciseOverview";
    overview.className = "exo-overview";
  
    overview.innerHTML = `
      <div class="exo-heading">
        <div>
          <h2>Exercise & Recovery Overview</h2>
          <p>
            Your training and recovery this week.
          </p>
        </div>
  
        <span>Last 7 days</span>
      </div>
  
      <div class="exo-stats">
  
        <article>
          <span>Training time</span>
          <strong id="exoMinutes">0 min</strong>
          <small>Last 7 days</small>
        </article>
  
        <article>
          <span>Sessions</span>
          <strong id="exoSessions">0</strong>
          <small>Last 7 days</small>
        </article>
  
        <article>
          <span>Average effort</span>
          <strong id="exoEffort">—</strong>
          <small>0 = easy, 10 = very hard</small>
        </article>
  
      </div>
  
      <div class="exo-columns">
  
        <!-- LEFT: TRAINING ANALYTICS -->
  
        <section class="exo-panel">
  
          <h3>Training activity</h3>
  
          <p class="exo-sub">
            Minutes each day
          </p>
  
          <div
            id="exoChart"
            class="exo-chart"
            role="img"
            aria-label="Training duration over the last seven days"
          ></div>
  
          <p
            id="exoComparison"
            class="exo-comparison"
          ></p>
  
          <div
            id="exoMachines"
            class="exo-machines"
          ></div>
  
          <h4>Progress</h4>
  
          <div
            id="exoPerformance"
            class="exo-performance"
          ></div>
  
        </section>
  
        <!-- RIGHT: OBSERVATIONS -->
  
        <section class="exo-panel">
  
          <h3>Tips for you</h3>
  
          <p class="exo-sub">
            Tips from your own training
          </p>
  
          <div
            id="exoAdvice"
            class="exo-advice"
          ></div>
  
        </section>
  
      </div>
  
      <p class="exo-disclaimer">
        Research prototype. Uses manually saved
        training records, not sensor-verified data.
        These observations are not diagnoses,
        medical alerts or prescribed training changes.
        Follow approved mission protocols.
      </p>
    `;
  
    // Place the overview below the exercise cards.
  
    page.appendChild(overview);
  
    /* ==========================================
       STYLES
  
       Kept inside this file so we do not need
       to modify the existing style.css.
    ========================================== */
  
    const style = document.createElement("style");
  
    style.textContent = `
      #exerciseOverview {
        margin: 32px 0 28px;
        color: #173057;
      }
  
      #exerciseOverview * {
        box-sizing: border-box;
      }
  
      /* HEADER */
  
      #exerciseOverview .exo-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }
  
      #exerciseOverview .exo-heading h2 {
        margin: 0 0 5px;
        font-size: 25px;
        color: #ffffff;
        letter-spacing: -0.5px;
      }
  
      #exerciseOverview .exo-heading p {
        margin: 0;
        color: #bfd2ec;
        font-size: 12px;
      }
  
      #exerciseOverview .exo-heading > span {
        color: #c4d7f0;
        font-size: 11px;
        white-space: nowrap;
      }
  
      /* SUMMARY CARDS */
  
      #exerciseOverview .exo-stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }
  
      #exerciseOverview .exo-stats article {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 18px 20px;
  
        background: #ffffff;
        border: 1px solid #e0e8f4;
        border-radius: 17px;
      }
  
      #exerciseOverview .exo-stats article > span {
        color: #637d9f;
        font-size: 12px;
        font-weight: 600;
      }
  
      #exerciseOverview .exo-stats strong {
        color: #225da3;
        font-size: 27px;
        line-height: 1.1;
        font-variant-numeric: tabular-nums;
      }
  
      #exerciseOverview .exo-stats small {
        color: #899cb3;
        font-size: 11px;
      }
  
      /* TWO-COLUMN OVERVIEW */
  
      #exerciseOverview .exo-columns {
        display: grid;
        grid-template-columns:
          minmax(0, 1.3fr)
          minmax(0, 1fr);
  
        gap: 16px;
        align-items: start;
      }
  
      #exerciseOverview .exo-panel {
        min-width: 0;
        padding: 22px;
  
        background: #ffffff;
        border: 1px solid #e0e8f4;
        border-radius: 18px;
      }
  
      #exerciseOverview .exo-panel h3 {
        margin: 0 0 5px;
        color: #173c70;
        font-size: 18px;
      }
  
      #exerciseOverview .exo-panel h4 {
        margin: 19px 0 10px;
        color: #294b77;
        font-size: 13px;
      }
  
      #exerciseOverview .exo-sub {
        margin: 0 0 20px;
        color: #8c9bb0;
        font-size: 12px;
      }
  
      /* WEEKLY CHART */
  
      #exerciseOverview .exo-chart {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 8px;
        align-items: end;
        min-height: 183px;
      }
  
      #exerciseOverview .exo-day {
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
  
      #exerciseOverview .exo-bar-track {
        width: min(100%, 44px);
        height: 128px;
  
        display: flex;
        align-items: flex-end;
        justify-content: center;
  
        border-radius: 9px 9px 5px 5px;
        background: #f1f5fb;
        overflow: hidden;
      }
  
      #exerciseOverview .exo-bar {
        width: 100%;
        min-height: 0;
  
        border-radius: 8px 8px 3px 3px;
  
        background: linear-gradient(
          180deg,
          #6aaaf7,
          #2866bf
        );
      }
  
      #exerciseOverview .exo-day-amount {
        color: #355982;
        font-size: 11px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
  
      #exerciseOverview .exo-day-label {
        color: #8295ad;
        font-size: 10px;
        white-space: nowrap;
      }
  
      /* COMPARISONS */
  
      #exerciseOverview .exo-comparison {
        margin: 18px 0 10px;
        color: #58708e;
        font-size: 12px;
        line-height: 1.6;
      }
  
      #exerciseOverview .exo-machines {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }
  
      #exerciseOverview .exo-machines span {
        padding: 6px 9px;
  
        background: #f1f6fd;
        border-radius: 999px;
  
        color: #325e96;
        font-size: 11px;
        font-weight: 650;
      }
  
      #exerciseOverview .exo-performance {
        display: grid;
        gap: 8px;
  
        color: #4c6482;
        font-size: 12px;
        line-height: 1.55;
      }
  
      #exerciseOverview .exo-performance p {
        margin: 0;
      }
  
      /* WHAT TO IMPROVE */
  
      #exerciseOverview .exo-advice {
        display: grid;
        gap: 11px;
      }
  
      #exerciseOverview .exo-insight {
        padding: 13px 14px;
  
        background: #f2f7fd;
        border-left: 3px solid #6097dd;
        border-radius: 10px;
      }
  
      #exerciseOverview .exo-insight.review {
        background: #fffaee;
        border-left-color: #e3b247;
      }
  
      #exerciseOverview .exo-insight strong {
        display: block;
  
        color: #214c84;
        font-size: 12px;
  
        margin-bottom: 5px;
      }
  
      #exerciseOverview .exo-insight.review strong {
        color: #9a6b23;
      }
  
      #exerciseOverview .exo-insight p {
        margin: 0;
        color: #5e7590;
        font-size: 12px;
        line-height: 1.55;
      }
  
      /* DISCLAIMER */
  
      #exerciseOverview .exo-disclaimer {
        margin: 12px 3px 0;
  
        color: #b9cae1;
        font-size: 10px;
        line-height: 1.6;
      }
  
      /* RESPONSIVE */
  
      @media (max-width: 1050px) {
        #exerciseOverview .exo-columns {
          grid-template-columns: 1fr;
        }
      }
  
      @media (max-width: 650px) {
        #exerciseOverview .exo-stats {
          grid-template-columns: 1fr;
        }
  
        #exerciseOverview .exo-heading {
          flex-direction: column;
          align-items: flex-start;
        }
  
        #exerciseOverview .exo-panel {
          padding: 15px;
        }
  
        #exerciseOverview .exo-chart {
          gap: 3px;
        }
      }
    `;
  
    document.head.appendChild(style);
  
    /* ==========================================
       HELPERS
    ========================================== */
  
    const $ = id => overview.querySelector("#" + id);
  
    function asNumber(value) {
  
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return null;
      }
  
      const number = Number(value);
  
      return Number.isFinite(number) ? number : null;
    }
  
    function sum(items) {
      return items.reduce(
        (total, number) => total + number,
        0
      );
    }
  
    function minutes(session) {
      return Math.max(
        0,
        asNumber(session.values?.minutes) ?? 0
      );
    }
  
    function dayStamp(date) {
  
      const result = new Date(date);
  
      if (!Number.isFinite(result.getTime())) {
        return null;
      }
  
      result.setHours(0, 0, 0, 0);
  
      return result.getTime();
    }
  
    /* ==========================================
       LOAD SAVED EXERCISE SESSIONS
    ========================================== */
  
    function loadSessions() {
  
      try {
  
        const data = window.AstroMedStore.store.get(storageKey, []);
  
        if (!Array.isArray(data)) {
          return [];
        }
  
        return data
          .filter(session =>
            session &&
            ["ared", "t2", "cevis"].includes(session.type) &&
            session.values &&
            typeof session.values === "object" &&
            dayStamp(session.date) !== null
          )
          .sort(
            (a, b) =>
              new Date(b.date) - new Date(a.date)
          );
  
      } catch (error) {
  
        console.warn(
          "AstroMed: exercise records unavailable",
          error
        );
  
        return [];
      }
    }
  
    /* ==========================================
       CREATE A WHAT TO IMPROVE MESSAGE
    ========================================== */
  
    function addInsight(title, message, review = false) {
  
      const card = document.createElement("div");
  
      card.className =
        "exo-insight" + (review ? " review" : "");
  
      const heading = document.createElement("strong");
      heading.textContent = title;
  
      const description = document.createElement("p");
      description.textContent = message;
  
      card.append(heading, description);
  
      $("exoAdvice").appendChild(card);
    }
  
    /* ==========================================
       MAIN OVERVIEW RENDER
    ========================================== */
  
    function render() {
  
      const all = loadSessions();
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const dayMs = 86400000;
  
      const distance = session =>
        Math.round(
          (today.getTime() - dayStamp(session.date)) / dayMs
        );
  
      /* Current and previous 7-day periods */
  
      const current = all.filter(
        session =>
          distance(session) >= 0 &&
          distance(session) <= 6
      );
  
      const previous = all.filter(
        session =>
          distance(session) >= 7 &&
          distance(session) <= 13
      );
  
      /* ======================================
         SUMMARY METRICS
      ====================================== */
  
      const totalMinutes = sum(
        current.map(minutes)
      );
  
      const previousMinutes = sum(
        previous.map(minutes)
      );
  
      const efforts = current
        .map(
          session => asNumber(session.values?.effort)
        )
        .filter(
          number =>
            number !== null &&
            number >= 0 &&
            number <= 10
        );
  
      $("exoMinutes").textContent =
        `${Math.round(totalMinutes)} min`;
  
      $("exoSessions").textContent =
        String(current.length);
  
      $("exoEffort").textContent =
        efforts.length
          ? `${(
              sum(efforts) / efforts.length
            ).toFixed(1)} / 10`
          : "—";
  
      /* ======================================
         WEEKLY TRAINING CHART
      ====================================== */
  
      const chart = $("exoChart");
  
      chart.replaceChildren();
  
      const days = Array.from(
        { length: 7 },
        (_, index) => {
  
          const date = new Date(today);
  
          date.setDate(
            date.getDate() - 6 + index
          );
  
          const stamp = dayStamp(date);
  
          const amount = sum(
            current
              .filter(
                session =>
                  dayStamp(session.date) === stamp
              )
              .map(minutes)
          );
  
          return {
            date,
            amount
          };
        }
      );
  
      const peak = Math.max(
        1,
        ...days.map(day => day.amount)
      );
  
      days.forEach(({ date, amount }) => {
  
        const column = document.createElement("div");
        column.className = "exo-day";
  
        const amountLabel = document.createElement("span");
        amountLabel.className = "exo-day-amount";
  
        amountLabel.textContent =
          String(Math.round(amount));
  
        const track = document.createElement("div");
        track.className = "exo-bar-track";
  
        const bar = document.createElement("div");
        bar.className = "exo-bar";
  
        bar.style.height =
          `${(amount / peak) * 100}%`;
  
        track.title =
          `${date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
          })}: ${Math.round(amount)} min`;
  
        track.appendChild(bar);
  
        const dayLabel = document.createElement("span");
        dayLabel.className = "exo-day-label";
  
        dayLabel.textContent =
          date.toLocaleDateString(
            "en-US",
            { weekday: "short" }
          );
  
        column.append(
          amountLabel,
          track,
          dayLabel
        );
  
        chart.appendChild(column);
      });
  
      /* ======================================
         COMPARE WITH PREVIOUS WEEK
      ====================================== */
  
      if (previous.length && previousMinutes > 0) {
  
        const difference =
          totalMinutes - previousMinutes;
  
        const percentage = Math.round(
          Math.abs(difference) /
          previousMinutes * 100
        );
  
        $("exoComparison").textContent =
          `Compared with the previous 7 days: ` +
          `${difference >= 0 ? "+" : "−"}${percentage}% ` +
          `training time ` +
          `(${Math.round(previousMinutes)} → ` +
          `${Math.round(totalMinutes)} min).`;
  
      } else {
  
        $("exoComparison").textContent =
          "No previous-week training data " +
          "available for comparison yet.";
      }
  
      /* ======================================
         ARED / T2 / CEVIS BREAKDOWN
      ====================================== */
  
      const machineBox = $("exoMachines");
  
      machineBox.replaceChildren();
  
      const NAMES = {
        ared: "Strength (ARED)",
        cevis: "Bike (CEVIS)",
        t2: "Treadmill (T2)"
      };

      const perType = ["ared", "cevis", "t2"].map(type => {
        const list = current.filter(
          session => session.type === type
        );
        return {
          type,
          count: list.length,
          mins: Math.round(sum(list.map(minutes)))
        };
      });

      const maxMins = Math.max(1, ...perType.map(x => x.mins));

      perType.forEach(x => {
        const card = document.createElement("div");
        card.className = "exo-mc" + (x.count ? " on" : "");
        card.innerHTML = `
          <img src="assets/exercise/${x.type}.png" alt="" loading="lazy">
          <b>${NAMES[x.type]}</b>
          <small>${x.count} session${x.count === 1 ? "" : "s"} · ${x.mins} min</small>
          <span class="exo-mbar"><i style="width:${(x.mins / maxMins) * 100}%"></i></span>`;
        machineBox.appendChild(card);
      });
  
      /* ======================================
         PERFORMANCE COMPARISONS
      ====================================== */
  
      const performance = $("exoPerformance");
  
      performance.replaceChildren();
  
      const comparisons = [
        {
          type: "t2",
          key: "speed",
          label: "T2 average speed",
          unit: "km/h"
        },
        {
          type: "cevis",
          key: "power",
          label: "CEVIS power",
          unit: "W"
        }
      ];
  
      /* Compare ARED only within same movement */
  
      const ared = all.filter(
        session =>
          session.type === "ared" &&
          typeof session.values.movement === "string"
      );
  
      const repeatedMovement = ared.find(
        session =>
          ared.filter(
            other =>
              other.values.movement ===
                session.values.movement &&
              asNumber(other.values.load) !== null
          ).length >= 2
      );
  
      if (repeatedMovement) {
  
        comparisons.unshift({
          type: "ared",
          key: "load",
          label:
            `ARED ${repeatedMovement.values.movement} resistance`,
          unit: "kg",
          movement: repeatedMovement.values.movement
        });
      }
  
      comparisons.forEach(config => {
  
        const matches = all.filter(
          session =>
            session.type === config.type &&
            (
              !config.movement ||
              session.values.movement === config.movement
            ) &&
            asNumber(
              session.values[config.key]
            ) !== null
        );
  
        if (matches.length < 2) {
          return;
        }
  
        const latest = asNumber(
          matches[0].values[config.key]
        );
  
        const earlier = asNumber(
          matches[1].values[config.key]
        );
  
        const difference = latest - earlier;
  
        const format = number =>
          Number(number.toFixed(2));
  
        const result = document.createElement("p");
  
        result.textContent =
          `${config.label}: ` +
          `${format(earlier)} → ${format(latest)} ` +
          `${config.unit} ` +
          `(${difference >= 0 ? "+" : ""}` +
          `${format(difference)}). ` +
          `Compare duration, effort and conditions too.`;
  
        performance.appendChild(result);
      });
  
      if (!performance.children.length) {
  
        const empty = document.createElement("p");
  
        empty.textContent =
          "Record at least two comparable sessions " +
          "on the same equipment to see " +
          "performance differences.";
  
        performance.appendChild(empty);
      }
  
      /* ======================================
         WHAT TO IMPROVE
      ====================================== */
  
      const advice = $("exoAdvice");
  
      advice.replaceChildren();
  
      if (current.length === 0) {
  
        addInsight(
          "No recent training logs",
          "Record an ARED, T2 or CEVIS session " +
          "to start seeing changes. An empty log " +
          "does not prove training was missed."
        );
  
        return;
      }
  
      /* RECOVERY / SORENESS */
  
      const soreness = current
        .map(
          session => asNumber(
            session.values?.soreness
          )
        )
        .filter(
          number =>
            number !== null &&
            number >= 0 &&
            number <= 10
        );
  
      if (
        soreness.some(number => number >= 7)
      ) {
  
        addInsight(
          "Higher soreness reported",
          "One or more sessions recorded soreness " +
          "of 7/10 or greater. Check associated " +
          "symptoms and recent trends. Persistent, " +
          "unusual or severe discomfort warrants " +
          "medical review.",
          true
        );
      }
  
      /* PERCEIVED EFFORT */
  
      if (
        efforts.length &&
        sum(efforts) / efforts.length >= 7
      ) {
  
        addInsight(
          "Higher perceived effort",
          `Average logged effort was ` +
          `${(
            sum(efforts) / efforts.length
          ).toFixed(1)}/10. ` +
          "Compare this with the prescribed " +
          "exercise plan and recent recovery.",
          true
        );
      }
  
      /* WEEKLY TRAINING DIFFERENCES */
  
      if (
        previous.length &&
        previousMinutes > 0 &&
        Math.abs(
          totalMinutes - previousMinutes
        ) / previousMinutes >= 0.2
      ) {
  
        const percentage = Math.round(
          Math.abs(
            totalMinutes - previousMinutes
          ) / previousMinutes * 100
        );
  
        addInsight(
          "Training duration changed",
          `Recorded training time ` +
          `${totalMinutes < previousMinutes
            ? "decreased"
            : "increased"} ` +
          `${percentage}% compared with ` +
          `the previous 7 days. ` +
          "Verify that all sessions were logged " +
          "and compare against the mission schedule."
        );
      }
  
      /* INSUFFICIENT HISTORY */
  
      if (current.length < 3) {
  
        addInsight(
          "More history is needed",
          "There are fewer than three sessions " +
          "in the last seven days. One workout " +
          "is not enough to assess long-term " +
          "fitness or recovery."
        );
      }
  
      /* MISSING EFFORT SCORES */
  
      if (efforts.length < current.length) {
  
        addInsight(
          "Complete session observations",
          "Some sessions do not contain an " +
          "effort score. Recording effort " +
          "makes future comparisons more useful."
        );
      }
  
      /* MISSING SORENESS SCORES */
  
      if (soreness.length === 0) {
  
        addInsight(
          "Recovery data is limited",
          "No soreness values were recorded " +
          "this week. Training duration alone " +
          "cannot determine whether an " +
          "astronaut has recovered."
        );
      }
  
      /* NO PATTERNS FLAGGED */
  
      if (!advice.children.length) {
  
        addInsight(
          "Continue monitoring",
          "No particular pattern was flagged " +
          "in the available records. Continue " +
          "recording comparable sessions and " +
          "review them against the individual " +
          "mission exercise plan."
        );
      }
    }
  
    /* ==========================================
       UPDATE AUTOMATICALLY AFTER SAVING
    ========================================== */
  
    const saveStatus = document.getElementById(
      "exerciseSaveStatus"
    );
  
    if (saveStatus) {
  
      new MutationObserver(render).observe(
        saveStatus,
        {
          childList: true,
          characterData: true,
          subtree: true
        }
      );
    }
  
    /* Update if storage changes in another tab */
  
    window.addEventListener("storage", event => {
  
      if (event.key === storageKey) {
        render();
      }
    });
  
    /* Initial display */
  
    render();
  
  });
  