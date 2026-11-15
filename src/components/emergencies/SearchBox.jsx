// The Emergency search, built on the shared search overlay. The groups are the urgency sections and
// the items are the cards; a choice opens that card.
import SearchOverlay from "../ui/SearchOverlay.jsx";

export default function SearchBox({ groups, onSelect }) {
  return (
    <SearchOverlay
      className="emg-search"
      groups={groups}
      label="Search emergencies"
      placeholder="Name, symptom or term"
      emptyText="No emergency card matches that search."
      onSelect={onSelect}
    />
  );
}
