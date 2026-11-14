import CheckNote from "./CheckNote.jsx";
import DiagramBlock from "./DiagramBlock.jsx";
import GcsPicker from "./GcsPicker.jsx";
import NtxCheck from "./NtxCheck.jsx";
import RangeBar from "./RangeBar.jsx";
import StormSteps from "./StormSteps.jsx";
import TableBlock from "./TableBlock.jsx";
import VitalsCheck from "./VitalsCheck.jsx";

export default function Block({ block }) {
  switch (block.type) {
    case "ranges":
      return <div class="emg-ranges">{block.bars.map((bar) => <RangeBar bar={bar} key={bar.label} />)}</div>;
    case "chips":
      return <div class="emg-chips">{block.chips.map((chip) => <span class={`emg-chip ${chip.tone}`} key={chip.text}>{chip.text}</span>)}</div>;
    case "note":
      return <p class="emg-note">{block.text}</p>;
    case "noteSmall":
      return <p class="am-small emg-disclaimer">{block.text}</p>;
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
      return <ol class="emg-steps">{block.items.map((item) => <li key={item}>{item}</li>)}</ol>;
    case "list":
      return <ul class="emg-list-plain">{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
    case "ntx":
      return <NtxCheck ranges={block.ranges} />;
    case "storm":
      return <StormSteps />;
    default:
      return null;
  }
}
