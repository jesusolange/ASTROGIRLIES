import { House, ClipboardCheck, ChartLine } from "lucide-preact";
import { go, route } from "../../lib/nav.js";
import "./shell.css";

const DESTINATIONS = [
  { area: "home", label: "Home", Icon: House },
  { area: "check", label: "Check", Icon: ClipboardCheck },
  { area: "progress", label: "Progress", Icon: ChartLine },
];

export default function Destinations({ variant = "bar" }) {
  const current = route.value.area;
  const tabs = variant === "tabs";

  return (
    <nav class={tabs ? "tb-tabs" : "tb-dest"} aria-label={tabs ? "Main destinations" : "Destinations"}>
      {DESTINATIONS.map(({ area, label, Icon }) => {
        const active = current === area;
        return (
          <button
            type="button"
            key={area}
            class={active ? "is-active" : ""}
            aria-current={active ? "page" : undefined}
            onClick={() => go(area)}
          >
            <Icon size={tabs ? 22 : 18} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
