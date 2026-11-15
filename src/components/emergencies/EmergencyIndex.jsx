import { useMemo } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { openCard, openEmergency } from "../../lib/nav.js";
import { ANEMIA, BONE_LOSS } from "../../data/slow-risks.js";
import { CARDS, indexCards } from "../../data/emergencies.js";
import { crewSize } from "../../scripts/mission.js";
import { SECTIONS, cardText, groupEmergencies } from "../../scripts/emergencies.js";
import Banner from "./Banner.jsx";
import IndexSection from "./IndexSection.jsx";
import SearchBox from "./SearchBox.jsx";
import VitalEntry from "./VitalEntry.jsx";

const VITAL = {
  id: "vitals",
  title: "Check vital signs",
  sign: "Reference values and a quick check you can do now.",
};

function toEntry(card, kind) {
  return {
    key: `${kind}:${card.id}`,
    kind,
    id: card.id,
    title: card.title,
    sub: card.sign,
    icon: card.icon,
    tag: card.tag,
    card,
  };
}

function openEntry(entry) {
  if (entry.kind === "vital") openEmergency("vitals");
  else if (entry.kind === "emergency") openEmergency(entry.id);
  else openCard(entry.id);
}

function searchItem(card) {
  return { id: card.id, label: card.title, keywords: [cardText(card)] };
}

function searchChoice(item, group) {
  if (group.id === "slow") openCard(item.id);
  else openEmergency(item.id);
}

export default function EmergencyIndex() {
  const [profile] = useStored("astromed-profile", null);
  const crew = crewSize(profile || undefined);
  const guides = useMemo(() => [BONE_LOSS, ANEMIA].map((card) => toEntry(card, "guide")), []);

  const sections = groupEmergencies(indexCards(crew)).map((section) => ({
    ...section,
    entries: section.cards.map((card) => toEntry(card, "emergency")),
  }));
  const slow = {
    ...SECTIONS.find((section) => section.id === "slow"),
    entries: guides,
  };

  const groups = useMemo(() => {
    const searchable = [...indexCards(crew), ...CARDS.filter((card) => card.sharedWith)];
    const list = groupEmergencies(searchable).map((section) => ({
      id: section.id,
      label: section.title,
      items: section.cards.map(searchItem),
    }));
    list.push({
      id: slow.id,
      label: slow.title,
      items: [BONE_LOSS, ANEMIA].map(searchItem),
    });
    return list.filter((group) => group.items.length);
  }, [crew]);

  return (
    <div class="emg-index" id="emg-index">
      <p class="emg-index-lead">Start with what you see or feel. The steps lead you to what to do.</p>
      <Banner />
      <SearchBox groups={groups} onSelect={searchChoice} />
      <VitalEntry />
      {sections.map((section) => (
        <IndexSection
          key={section.id}
          title={section.title}
          note={section.note}
          entries={section.entries}
          onOpen={openEntry}
        />
      ))}
      <IndexSection
        title={slow.title}
        note={slow.note}
        entries={slow.entries}
        onOpen={openEntry}
      />
    </div>
  );
}
