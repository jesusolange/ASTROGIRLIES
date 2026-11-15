import { openCard } from "../../lib/nav.js";
import { alsoTell } from "../../scripts/mission.js";
import Button from "../ui/Button.jsx";
import Steps from "../ui/Steps.jsx";
import CheckNote from "./CheckNote.jsx";
import DiagramBlock from "./DiagramBlock.jsx";
import GcsPicker from "./GcsPicker.jsx";
import NtxCheck from "./NtxCheck.jsx";
import RangeBar from "./RangeBar.jsx";
import RichText from "./RichText.jsx";
import StormSteps from "./StormSteps.jsx";
import TableBlock from "./TableBlock.jsx";
import VitalsCheck from "./VitalsCheck.jsx";

function stepItem(item) {
  if (typeof item === "string" || !item.tell) return item;
  const sentence = alsoTell("the flight surgeon");
  return sentence ? { text: item.text, note: <RichText text={sentence} /> } : item.text;
}

export default function Block({ block }) {
  switch (block.type) {
    case "ranges":
      return <div class="emg-ranges">{block.bars.map((bar) => <RangeBar bar={bar} key={bar.label} />)}</div>;
    case "chips":
      return (
        <div class="emg-chips">
          {block.chips.map((chip) => (
            <span class={`emg-chip ${chip.tone}`} key={chip.text}><RichText text={chip.text} /></span>
          ))}
        </div>
      );
    case "note":
      return <p class="emg-note"><RichText text={block.text} /></p>;
    case "noteSmall":
      return <p class="am-small emg-disclaimer"><RichText text={block.text} /></p>;
    case "check":
      return <CheckNote text={block.text} />;
    case "vitals":
      return <VitalsCheck />;
    case "gcs":
      return <GcsPicker table={block.table} />;
    case "bloodTable":
    case "infectionTable":
      return <TableBlock block={block} />;
    case "images":
    case "imageList":
    case "flow":
    case "splitFlow":
    case "bars":
    case "gauge":
      return <DiagramBlock block={block} />;
    case "steps":
      return (
        <>
          <Steps items={block.items.map(stepItem)} />
          {block.link ? (
            <Button variant="soft" onClick={() => openCard(block.link.check || block.link.card)}>Open the check</Button>
          ) : null}
        </>
      );
    case "list":
      return <ul class="emg-list-plain">{block.items.map((item) => <li key={item}><RichText text={item} /></li>)}</ul>;
    case "ntx":
      return <NtxCheck ranges={block.ranges} />;
    case "storm":
      return <StormSteps />;
    default:
      return null;
  }
}
