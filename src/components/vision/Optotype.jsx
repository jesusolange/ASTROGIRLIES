export default function Optotype({ rotation }) {
  return (
    <svg class="vs-opt" viewBox="0 0 5 5" aria-hidden="true">
      <g transform={`rotate(${rotation} 2.5 2.5)`}>
        <rect x="0" y="0" width="5" height="1" />
        <rect x="0" y="0" width="1" height="5" />
        <rect x="0" y="2" width="5" height="1" />
        <rect x="0" y="4" width="5" height="1" />
      </g>
    </svg>
  );
}
