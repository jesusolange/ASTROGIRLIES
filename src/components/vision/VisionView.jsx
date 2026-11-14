import { useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { EMPTY_DATA } from "../../scripts/vision.js";
import "./vision.css";
import VisionHeading from "./VisionHeading.jsx";
import RecordSection from "./RecordSection.jsx";
import HistoryPanel from "./HistoryPanel.jsx";
import TodoPanel from "./TodoPanel.jsx";

const TABS = [["record", "Record"], ["history", "History"], ["todo", "What to do"]];

export default function VisionView() {
  const [data, save] = useStored("astromed-vision", EMPTY_DATA);
  const [tab, setTab] = useState("record");

  return (
    <>
      <VisionHeading />
      <div class="am-tabs" role="tablist" aria-label="Vision views">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            class={`am-tab${tab === id ? " active" : ""}`}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >{label}</button>
        ))}
      </div>
      <div hidden={tab !== "record"}><RecordSection data={data} save={save} /></div>
      <div hidden={tab !== "history"}><HistoryPanel data={data} /></div>
      <div hidden={tab !== "todo"}><TodoPanel /></div>
    </>
  );
}
