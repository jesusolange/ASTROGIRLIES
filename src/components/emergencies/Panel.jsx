import Blocks from "./Blocks.jsx";

export default function Panel({ block }) {
  return (
    <div class={`am-panel emg-panel${block.tone ? ` emg-${block.tone}` : ""}`}>
      {block.title && <h4>{block.title}</h4>}
      <Blocks blocks={block.blocks} />
    </div>
  );
}
