import Block from "./Block.jsx";
import Panel from "./Panel.jsx";
import Stage from "./Stage.jsx";

export default function Blocks({ blocks }) {
  return blocks.map((block, index) => {
    if (block.type === "panel") return <Panel block={block} key={index} />;
    if (block.type === "stage") return <Stage block={block} key={index} />;
    return <Block block={block} key={index} />;
  });
}
