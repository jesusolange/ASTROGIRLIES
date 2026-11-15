import { useStored } from "../../lib/use-stored.js";
import { KEYS as ENV_KEYS } from "../../scripts/environment.js";
import { missionDayFor, totalFor } from "../../scripts/profile.js";
import { KEY, PLACE_RATE, calc } from "../../scripts/radiation.js";
import TotalDose from "./TotalDose.jsx";
import ForecastPanel from "./ForecastPanel.jsx";
import DoseEntry from "./DoseEntry.jsx";
import SolarStorm from "./SolarStorm.jsx";
import ReferenceTable from "./ReferenceTable.jsx";
import "../ui/ui.css";
import "./radiation.css";

const PROFILE_KEY = "astromed-profile";
const EMPTY = { prior: 0, entries: [] };

export default function RadiationView() {
  const [saved, save] = useStored(KEY, EMPTY);
  const state = { prior: Number(saved.prior) || 0, entries: Array.isArray(saved.entries) ? saved.entries : [] };
  const [profile] = useStored(PROFILE_KEY, null);
  const [environment] = useStored(ENV_KEYS.state, { place: "" });

  const mission = {
    missionDay: profile && profile.startDate ? missionDayFor(profile) : null,
    total: totalFor(profile)
  };
  const totals = calc(state, mission);
  const typicalRate = PLACE_RATE[environment.place];

  function add(entry) {
    save({ ...state, entries: [...state.entries, { id: Date.now().toString(36), ...entry }] });
    document.dispatchEvent(new CustomEvent("astromed-radiation-changed"));
  }

  function remove(id) {
    save({ ...state, entries: state.entries.filter((entry) => entry.id !== id) });
  }

  return (
    <>
      <div class="am-heading">
        <h2>Radiation</h2>
        <p>Radiation adds up every day away from Earth. Keep your total under the NASA limit.</p>
      </div>
      <TotalDose totals={totals} />
      <ForecastPanel state={state} totals={totals} typicalRate={typicalRate} />
      <DoseEntry state={state} profile={profile} onAdd={add} onDelete={remove} onPrior={(prior) => save({ ...state, prior })} />
      <SolarStorm />
      <ReferenceTable />
    </>
  );
}
