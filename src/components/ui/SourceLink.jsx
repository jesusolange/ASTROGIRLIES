// A short source link on a card. It opens the Sources dialog at the source id when that module is
// present; until then it links to the source URL.
// Props: id (source id), url (fallback URL), children, className.
const sourcesModule = import.meta.glob("../sources/open.js", { eager: true })["../sources/open.js"] || null;

export default function SourceLink({ id, url, href, children, className = "" }) {
  const target = href || url;
  const openSources = sourcesModule && typeof sourcesModule.openSources === "function" ? sourcesModule.openSources : null;

  if (id && openSources) {
    return (
      <button type="button" class={`ui-source ${className}`.trim()} onClick={() => openSources(id)}>
        {children}
      </button>
    );
  }
  if (target) {
    return (
      <a class={`ui-source ${className}`.trim()} href={target} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <span class={`ui-source ${className}`.trim()}>{children}</span>;
}
