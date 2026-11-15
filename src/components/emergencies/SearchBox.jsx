import Icon from "../ui/Icon.jsx";

export default function SearchBox({ value, onInput, onKeyDown, inputRef, results }) {
  return (
    <div class="emg-search">
      <label class="emg-search-label" for="emg-search-input">Search emergencies</label>
      <div class="emg-search-field">
        <Icon name="search" size={18} />
        <input
          ref={inputRef}
          id="emg-search-input"
          type="search"
          value={value}
          placeholder="Name, symptom or term"
          autocomplete="off"
          onInput={(event) => onInput(event.currentTarget.value)}
          onKeyDown={onKeyDown}
          aria-controls="emg-index"
          aria-describedby={results != null ? "emg-search-count" : undefined}
        />
      </div>
      {results != null ? (
        <p class="emg-search-count" id="emg-search-count" aria-live="polite">
          {results === 0 ? "No matching cards." : `${results} matching ${results === 1 ? "card" : "cards"}.`}
        </p>
      ) : null}
    </div>
  );
}
