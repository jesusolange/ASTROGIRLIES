import Steps from "../ui/Steps.jsx";
import Block from "./Block.jsx";
import CheckNote from "./CheckNote.jsx";
import RichText from "./RichText.jsx";

export default function Stage({ block }) {
  return (
    <section class="am-panel emg-panel emg-stage">
      <div class="emg-sh"><i>{block.n}</i><h4><RichText text={block.title} /></h4></div>
      {block.ask ? <p class="emg-ask"><RichText text={block.ask} /></p> : null}
      <div class={`emg-stage-body${block.diagram ? "" : " one"}`}>
        {block.diagram ? (
          <div class="emg-stage-figure">
            {block.diagram.map((child, index) => <Block block={child} key={index} />)}
          </div>
        ) : null}
        <div class="emg-stage-main">
          <div class="emg-look">
            <h5>Look for</h5>
            <ul>{block.look.map((item) => <li key={item}><RichText text={item} /></li>)}</ul>
          </div>
          <div class="emg-do">
            <h5>If yes, do this</h5>
            <Steps items={block.todo} />
          </div>
        </div>
      </div>
      {block.note ? <p class="emg-note"><RichText text={block.note} /></p> : null}
      {block.no ? (
        <div class="emg-else"><span class="emg-else-label">If not:</span> <RichText text={block.no} /></div>
      ) : null}
      {block.check ? <CheckNote text={block.check} /> : null}
    </section>
  );
}
