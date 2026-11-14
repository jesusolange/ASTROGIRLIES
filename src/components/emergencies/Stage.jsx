import Block from "./Block.jsx";
import CheckNote from "./CheckNote.jsx";

export default function Stage({ block }) {
  return (
    <div class="am-panel emg-panel emg-stage">
      <div class="emg-sh"><i>{block.n}</i><h4>{block.title}</h4></div>
      {block.ask && <p class="emg-ask">{block.ask}</p>}
      {block.diagram && block.diagram.map((child, index) => <Block block={child} key={index} />)}
      <div class="emg-two">
        <div class="emg-look">
          <h5>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            Look for
          </h5>
          <ul>{block.look.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div class="emg-do">
          <h5>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 5 5L20 6" /></svg>
            If yes, do this
          </h5>
          <ol>{block.todo.map((item) => <li key={item}>{item}</li>)}</ol>
        </div>
      </div>
      {block.note && <p class="emg-note">{block.note}</p>}
      {block.no && <div class="emg-else"><span class="emg-else-label">If not:</span> {block.no}</div>}
      {block.check && <CheckNote text={block.check} />}
    </div>
  );
}
