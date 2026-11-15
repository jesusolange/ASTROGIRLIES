import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { openCard, openEmergency } from "../../lib/nav.js";
import { ANEMIA, BONE_LOSS } from "../../data/slow-risks.js";
import { CARDS, indexCards } from "../../data/emergencies.js";
import { crewSize } from "../../scripts/mission.js";
import {
  SECTIONS, groupEmergencies, matchesQuery, searchTerm
} from "../../scripts/emergencies.js";
import Banner from "./Banner.jsx";
import IndexSection from "./IndexSection.jsx";
import SearchBox from "./SearchBox.jsx";
import VitalEntry from "./VitalEntry.jsx";

const VITAL = {
  id: "vitals",
  title: "Check vital signs",
  sign: "Pulse, breathing, oxygen and temperature, judged as you type.",
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
  if (entry.kind === "emergency") openEmergency(entry.id);
  else openCard(entry.id);
}

export default function EmergencyIndex() {
  const [profile] = useStored("astromed-profile", null);
  const [activeKey, setActiveKey] = useState(null);
  const inputRef = useRef(null);
  const query = searchTerm.value;

  useEffect(() => {
    if (inputRef.current && typeof inputRef.current.focus === "function") inputRef.current.focus();
  }, []);

  const crew = crewSize(profile || undefined);
  const guides = useMemo(() => [BONE_LOSS, ANEMIA].map((card) => toEntry(card, "guide")), []);
  const shared = useMemo(() => CARDS.filter((card) => card.sharedWith).map((card) => toEntry(card, "emergency")), []);

  const keep = (entry) => matchesQuery(entry.card, query);
  const vitalEntry = { ...toEntry(VITAL, "vital"), key: "vital:vitals" };
  const vitalInList = !query.trim() || keep(vitalEntry);
  const sections = groupEmergencies(indexCards(crew)).map((section) => ({
    ...section,
    entries: section.cards.map((card) => toEntry(card, "emergency")).filter(keep),
  }));
  const slow = {
    ...SECTIONS.find((section) => section.id === "slow"),
    entries: guides.filter(keep),
  };
  const extra = query.trim() ? shared.filter(keep) : [];

  const flat = useMemo(() => {
    const list = [];
    if (vitalInList) list.push(vitalEntry);
    for (const section of [...sections, slow]) list.push(...section.entries);
    list.push(...extra);
    return list;
  }, [vitalInList, query, crew]);

  useEffect(() => {
    setActiveKey(flat.length ? flat[0].key : null);
  }, [flat]);

  function onKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!flat.length) return;
      event.preventDefault();
      const current = Math.max(0, flat.findIndex((entry) => entry.key === activeKey));
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveKey(flat[(current + step + flat.length) % flat.length].key);
      return;
    }
    if (event.key === "Enter") {
      const entry = flat.find((item) => item.key === activeKey) || flat[0];
      if (!entry) return;
      event.preventDefault();
      openEntry(entry);
      return;
    }
    if (event.key === "Escape") searchTerm.value = "";
  }

  return (
    <div class="emg-index" id="emg-index">
      <p class="emg-index-lead">Start with what you see or feel. The steps lead you to what to do.</p>
      <Banner />
      <SearchBox
        value={query}
        inputRef={inputRef}
        results={query.trim() ? flat.length : null}
        onInput={(value) => { searchTerm.value = value; }}
        onKeyDown={onKeyDown}
      />
      <VitalEntry
        active={activeKey === vitalEntry.key}
        onFocus={() => setActiveKey(vitalEntry.key)}
      />
      {sections.map((section) => (
        <IndexSection
          key={section.id}
          title={section.title}
          note={section.note}
          entries={section.entries}
          activeKey={activeKey}
          onOpen={openEntry}
        />
      ))}
      <IndexSection
        title={slow.title}
        note={slow.note}
        entries={slow.entries}
        activeKey={activeKey}
        onOpen={openEntry}
      />
      <IndexSection
        title="Matching cards"
        entries={extra}
        activeKey={activeKey}
        onOpen={openEntry}
      />
    </div>
  );
}
