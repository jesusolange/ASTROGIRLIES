import { useEffect, useRef } from "preact/hooks";
import { SOURCES } from "../../data/sources.js";
import { FIGURES } from "../../data/figures.js";
import { REF } from "../../scripts/radiation.js";
import { MODELS, PLACE_IMAGES } from "./models.js";
import SourceEntry from "./SourceEntry.jsx";
import "./sources.css";

function Section({ title, id, children }) {
  return (
    <section class="sources-group" aria-labelledby={`sources-${id}`}>
      <h3 id={`sources-${id}`}>{title}</h3>
      {children}
    </section>
  );
}

export default function SourcesList({ focusId = null }) {
  const refs = useRef({});
  const bind = (id) => (node) => {
    if (node) refs.current[id] = node;
  };

  useEffect(() => {
    const node = focusId ? refs.current[focusId] : null;
    if (node && typeof node.scrollIntoView === "function") node.scrollIntoView({ block: "center" });
  }, [focusId]);

  return (
    <div class="sources-list">
      <Section title="Medical sources" id="medical">
        <ul class="sources-items">
          {SOURCES.map((entry) => (
            <SourceEntry
              key={entry.id}
              entry={entry}
              focused={entry.id === focusId}
              bind={bind(entry.id)}
            />
          ))}
        </ul>
      </Section>

      <Section title="Figures" id="figures">
        <ul class="sources-items">
          {FIGURES.map((figure) => (
            <SourceEntry
              key={figure.id}
              entry={figure}
              focused={figure.id === focusId}
              bind={bind(figure.id)}
            />
          ))}
        </ul>
      </Section>

      <Section title="Radiation reference dose rates" id="radiation">
        <div class="sources-table-wrap">
          <table class="sources-table">
            <thead>
              <tr><th>Place</th><th>mSv per day</th><th>Note</th><th>Source</th></tr>
            </thead>
            <tbody>
              {REF.map((row) => (
                <tr key={row.place}>
                  <td>{row.place}</td>
                  <td>{row.v}</td>
                  <td>{row.note}</td>
                  <td>
                    <a href={row.url} target="_blank" rel="noopener noreferrer">{row.src}</a>
                    {row.src2 ? <>; <a href={row.url2} target="_blank" rel="noopener noreferrer">{row.src2}</a></> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3D models" id="models">
        <ul class="sources-items">
          {MODELS.map((model) => (
            <SourceEntry
              key={model.id}
              entry={model}
              focused={model.id === focusId}
              bind={bind(model.id)}
            />
          ))}
        </ul>
      </Section>

      <Section title="Destination pictures" id="places">
        <ul class="sources-items">
          {PLACE_IMAGES.map((image) => (
            <SourceEntry
              key={image.id}
              entry={image}
              focused={image.id === focusId}
              bind={bind(image.id)}
            />
          ))}
        </ul>
      </Section>
    </div>
  );
}
