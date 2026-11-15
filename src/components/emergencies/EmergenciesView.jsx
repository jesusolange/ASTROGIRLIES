import "./emergencies.css";
import { route } from "../../lib/nav.js";
import { CARD_BY_ID, resolveCardId } from "../../data/emergencies.js";
import EmergencyCard from "./EmergencyCard.jsx";
import EmergencyIndex from "./EmergencyIndex.jsx";

export default function EmergenciesView() {
  const { id } = route.value;
  const resolved = id ? resolveCardId(id) : null;
  const card = resolved ? CARD_BY_ID.get(resolved) : null;
  return card ? <EmergencyCard card={card} /> : <EmergencyIndex />;
}
