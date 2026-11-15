import { Moon, Sun } from "lucide-preact";
import { theme, toggleTheme } from "../../scripts/theme.js";
import "./shell.css";

export default function ThemeToggle() {
  const light = theme.value === "light";
  const label = `Switch to ${light ? "dark" : "light"} theme`;

  return (
    <button
      type="button"
      class="tb-control tb-theme"
      aria-label={label}
      aria-pressed={light}
      title={label}
      onClick={toggleTheme}
    >
      {light ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      <span class="tb-theme-label">{light ? "Light" : "Dark"}</span>
    </button>
  );
}
