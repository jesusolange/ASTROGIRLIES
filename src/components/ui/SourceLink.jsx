// An external source link that opens in a new tab without a window handle back to the app.
// Props: href, children, className.
export default function SourceLink({ href, children, className = "" }) {
  return (
    <a class={`ui-source ${className}`.trim()} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
