// Mission risks for the mission chosen in the profile: NASA's ratings, ranked for operations.
import "../../scripts/storage.js";
import { useStored } from "../../lib/use-stored.js";
import { missionType, rankedRisks, SOURCE } from "../../scripts/risks.js";
import Panel from "../ui/Panel.jsx";
import SourceLink from "../ui/SourceLink.jsx";
import MissionPicker from "./MissionPicker.jsx";
import RiskRow from "./RiskRow.jsx";
import "../ui/ui.css";
import "../../styles/riskmap.css";

const PROFILE_KEY = "astromed-profile";

export default function RiskMapView() {
  const [profile, saveProfile] = useStored(PROFILE_KEY, null);
  const mission = missionType(profile && profile.missionType);
  const risks = rankedRisks(mission.id);

  function setMission(id) {
    saveProfile({ ...(profile || {}), missionType: id });
    document.dispatchEvent(new CustomEvent("astromed-profile-changed"));
  }

  return (
    <>
      <div class="am-heading">
        <h2>Mission risks</h2>
        <p>
          NASA's Human Research Roadmap rates 22 human health risks for each mission type. This map shows them for
          the mission you chose, highest in-mission rating first.
        </p>
      </div>

      <Panel className="rk-panel">
        <MissionPicker mission={mission} onChange={setMission} />
      </Panel>

      <Panel className="rk-about">
        <p>
          <SourceLink href={SOURCE}>NASA's Human Research Roadmap</SourceLink> rates each risk on the Human System
          Risk Board's scale. In-mission and long-term ratings are likelihood × consequence. The ratings are NASA's;
          the order of this list and the choice of which app section watches each risk are ours.
        </p>
        <p class="rk-note">
          This is a planning and self-monitoring aid, not a medical device and not a diagnosis. A rating is not a
          prediction for you.
        </p>
      </Panel>

      <div class="rk-list">
        {risks.map((risk, index) => (
          <RiskRow key={risk.id} risk={risk} rank={index + 1} />
        ))}
      </div>
    </>
  );
}
