// The app bar: title, theme switch and the account chip.
// The profile chip is left for the profile dialog module to bind; this component only draws it.
import { useStored } from "../../lib/use-stored.js";
import "./shell.css";

function readTheme(stored) {
  if (stored === "light" || stored === "dark") return stored;
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export default function Header() {
  const [storedTheme, saveTheme] = useStored("astromed-theme", null);
  const [profile] = useStored("astromed-profile", null);
  const theme = readTheme(storedTheme);
  const name = (profile && profile.name) || "Guest";

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    if (window.AstroMedTheme) {
      window.AstroMedTheme.set(next);
    } else {
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
      saveTheme(next);
    }
  }

  return (
    <header class="app-header">
      <div class="app-header-title">
        <svg class="icon" aria-hidden="true"><use href="#ic-twin" /></svg>
        <div>
          <strong>AstroMed</strong>
          <small>Health self-monitoring · saved on this device</small>
        </div>
      </div>

      <div class="app-header-actions">
        <button
          type="button"
          class="theme-toggle"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          aria-pressed={theme === "light"}
          onClick={toggleTheme}
        >
          <svg class="icon theme-icon-dark" aria-hidden="true"><use href="#ic-moon" /></svg>
          <svg class="icon theme-icon-light" aria-hidden="true"><use href="#ic-sun" /></svg>
          <span>{theme === "light" ? "Light" : "Dark"}</span>
        </button>

        <button type="button" class="profile-chip" data-profile-open aria-label="Account and sync status">
          <span class="profile-avatar" aria-hidden="true">
            <svg class="icon"><use href="#ic-user" /></svg>
          </span>
          <span class="profile-copy">
            <strong data-profile-name>{name}</strong>
            <small data-profile-state>Not signed in · saved here</small>
          </span>
          <span class="profile-dot" data-profile-state-dot data-state="guest" aria-hidden="true"></span>
        </button>
      </div>
    </header>
  );
}
