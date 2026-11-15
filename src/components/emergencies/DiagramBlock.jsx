import { Fragment } from "preact";

function Images({ block }) {
  return (
    <>
      <div class={`emg-dg${block.one ? " one" : ""}`}>
        {block.images.map((image) => (
          <img class="emg-img" src={image.src} alt={image.alt} loading="lazy" key={image.src} />
        ))}
      </div>
      {block.legend && (
        <div class="emg-legend">
          {block.legend.map((item) => <span key={item.text}><i class={`emg-dot ${item.tone}`}></i>{item.text}</span>)}
        </div>
      )}
    </>
  );
}

function ImageList({ block }) {
  return (
    <>
      <div class="emg-dg">
        <img class="emg-img" src={block.image.src} alt={block.image.alt} loading="lazy" />
        <div><ul class="emg-list-plain">{block.items.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </div>
      {block.note && <p class="emg-note">{block.note}</p>}
    </>
  );
}

function Flow({ block }) {
  return (
    <div class="emg-flow">
      {block.nodes.map((node, i) => (
        <Fragment key={node.text}>
          {i > 0 && <span class="emg-arrow">➜</span>}
          <div class={`emg-node ${node.tone || ""}`}><span>{node.text}</span></div>
        </Fragment>
      ))}
    </div>
  );
}

function SplitFlow({ block }) {
  return (
    <div class="emg-flow col">
      <div class="emg-node info"><span>{block.node}</span></div>
      <div class="emg-split">
        {block.options.map((option) => (
          <div key={option.title}>
            <div class={`emg-tag ${option.tone}`}>{option.title}</div>
            <div class={`emg-mini${option.one ? " one" : ""}`}>
              {option.items.map((item) => {
                const text = typeof item === "string" ? item : item.text;
                return <span key={text}>{text}</span>;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bars({ block }) {
  return (
    <div class="emg-bars">
      {block.items.map((item) => (
        <div key={item.label}>
          <small>{item.label}</small>
          <div class="emg-bt"><i class={item.tone} style={`width:${item.width}%`}></i></div>
          <b>{item.text}</b>
        </div>
      ))}
    </div>
  );
}

function Gauge({ block }) {
  return (
    <div class="emg-gauge">
      <div class="emg-gr">
        <i style="left:0;width:90%"></i>
        <u style="left:90%"><em>90%</em><small>femoral neck min.</small></u>
        <u style="left:95%"><em>95%</em><small>hip &amp; spine min.</small></u>
      </div>
      <p>{block.text}</p>
    </div>
  );
}

export default function DiagramBlock({ block }) {
  if (block.type === "images") return <Images block={block} />;
  if (block.type === "imageList") return <ImageList block={block} />;
  if (block.type === "flow") return <Flow block={block} />;
  if (block.type === "splitFlow") return <SplitFlow block={block} />;
  if (block.type === "bars") return <Bars block={block} />;
  return <Gauge block={block} />;
}
