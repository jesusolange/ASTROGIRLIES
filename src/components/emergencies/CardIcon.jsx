export default function CardIcon({ name }) {
  return (
    <svg class="emg-card-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      {name === "vitals" && <><path d="M3 12h4l2-5 4 10 2-5h6" /><circle cx="12" cy="12" r="9" /></>}
      {name === "gcs" && <><path d="M12 3a6 6 0 0 0-4 10.5V18h8v-4.5A6 6 0 0 0 12 3Z" /><path d="M9 21h6M9 10h.01M15 10h.01" /></>}
      {name === "breath" && <><path d="M12 3v8" /><path d="M9 11c-3 .5-4.5 3-3.5 6.5.7 2.3 3.5 2.3 4.3.3L12 12" /><path d="M15 11c3 .5 4.5 3 3.5 6.5-.7 2.3-3.5 2.3-4.3.3L12 12" /></>}
      {name === "belly" && <><circle cx="12" cy="12" r="8" /><path d="M12 8v8M8 12h8" /></>}
      {name === "back" && <><path d="M12 3v18" /><path d="M9 6h6M9 10h6M9 14h6M9 18h6" /></>}
      {name === "calf" && <><path d="M10 3h4l-1 9 3 9H9l2-9-1-9Z" /><path d="M9 21h7" /></>}
      {name === "fever" && <><path d="M10 4a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0Z" /><path d="M12 8v7" /></>}
      {name === "storm" && <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></>}
      {name === "bone" && <><path d="M7 8a2 2 0 1 1-1 3l5 5a2 2 0 1 1 3 3l4-4a2 2 0 1 1-3-3l-5-5a2 2 0 1 1-3-3l4-4" /><path d="M4 4l3 3" /></>}
      {name === "anemia" && <><path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11Z" /><path d="M9 14h6" /></>}
      {name === "vision" && <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>}
      {name === "bleeding" && <><path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11Z" /><path d="M8 15h8" /></>}
      {name === "fracture" && <><path d="M6 6l12 12" /><path d="M11 6l3 3M6 11l3 3M13 18l3-3M18 13l-3-3" /></>}
      {name === "self-harm" && <><path d="M12 21s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9Z" /></>}
      {name === "cabin-air" && <><path d="M3 8h10a3 3 0 1 0-3-3" /><path d="M3 12h14a3 3 0 1 1-3 3" /><path d="M3 16h8" /></>}
    </svg>
  );
}
