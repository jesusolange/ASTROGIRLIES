import { figureById } from "../../data/figures.js";

export default function Figure({ id, caption, className = "" }) {
  const figure = figureById(id);
  if (!figure) return null;
  return (
    <figure class={`am-figure${className ? ` ${className}` : ""}`}>
      <img src={figure.file} alt={figure.alt} loading="lazy" decoding="async" />
      <figcaption>
        <span class="am-figure-caption">{caption || figure.title}</span>
        <a class="am-figure-credit" href={figure.sourceUrl} target="_blank" rel="noopener noreferrer">
          {figure.title}, {figure.author}, {figure.licence}
        </a>
      </figcaption>
    </figure>
  );
}
