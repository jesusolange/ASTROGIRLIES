import { sansRisk } from "../../scripts/vision.js";

export default function VisionHeading() {
  const risk = sansRisk();
  const rating = risk && risk.ops ? `${risk.ops.l} × ${risk.ops.c}` : "";
  return (
    <div class="am-heading">
      <h2>Vision</h2>
      <p>
        For your mission ({risk ? risk.missionLabel : "this mission"}), NASA rates spaceflight-associated
        neuro-ocular syndrome (SANS) {rating} in mission. This self-check looks for changes against your own
        earlier results. It is a screening aid, not a diagnosis.
      </p>
      <p class="vs-src">
        <a href={risk ? risk.url : undefined} target="_blank" rel="noopener">NASA Human Research Roadmap · risk 105 (SANS)</a>.
        A phone or laptop screen is not a calibrated instrument, and the smallest lines may be beyond what your
        screen can show.
      </p>
    </div>
  );
}
