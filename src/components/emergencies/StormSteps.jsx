import { STORM_NOTE, STORM_STEPS } from "../../data/emergencies.js";

export default function StormSteps() {
  return (
    <>
      <div class="rd-cards emg-storm-cards">
        {STORM_STEPS.map((step, index) => (
          <div class="rd-c" key={step.title}>
            <svg viewBox="0 0 160 120" aria-hidden="true">
              {index === 0 && <><circle cx="80" cy="56" r="26" fill="var(--am-warn)" class="rd-pulse" /><g stroke="var(--am-warn)" stroke-width="5" stroke-linecap="round" class="rd-rays"><path d="M80 14v-8M80 106v8M38 56h-8M130 56h-8M50 26l-6-6M116 92l6 6M110 26l6-6M44 92l-6 6" /></g><path d="M118 20l10 18h-20z" fill="var(--am-danger)" /><text x="118" y="35" font-size="12" text-anchor="middle" fill="var(--am-text)" font-weight="700">!</text></>}
              {index === 1 && <><rect x="86" y="46" width="58" height="52" rx="8" fill="var(--am-accent-strong)" opacity=".8" /><rect x="104" y="64" width="22" height="34" rx="4" fill="var(--am-bg)" /><g class="rd-walk"><circle cx="40" cy="62" r="9" fill="var(--am-text)" /><path d="M40 72v22M40 80l-12 12M40 80l12 10M40 94l-10 16M40 94l10 16" stroke="var(--am-text)" stroke-width="6" stroke-linecap="round" fill="none" /></g><path d="M60 100h20" stroke="var(--am-accent)" stroke-width="4" stroke-linecap="round" stroke-dasharray="3 7" class="rd-dash" /></>}
              {index === 2 && <><rect x="22" y="14" width="116" height="92" rx="14" fill="none" stroke="var(--am-accent)" stroke-width="5" class="rd-pulse" /><rect x="38" y="30" width="84" height="60" rx="9" fill="none" stroke="var(--am-accent-strong)" stroke-width="4" /><circle cx="80" cy="56" r="9" fill="var(--am-text)" /><path d="M80 66v14M80 72l-9 8M80 72l9 8" stroke="var(--am-text)" stroke-width="5" stroke-linecap="round" fill="none" /><path d="M110 40l10 10 16-18" stroke="var(--am-ok)" stroke-width="5" fill="none" stroke-linecap="round" transform="translate(-24 6)" /></>}
              {index === 3 && <><path d="M80 100V56M62 100h36" stroke="var(--am-text)" stroke-width="5" stroke-linecap="round" /><circle cx="80" cy="50" r="7" fill="var(--am-warn)" /><g fill="none" stroke="var(--am-accent)" stroke-width="4" stroke-linecap="round"><path d="M64 36a22 22 0 0 1 0 28" class="rd-wave" /><path d="M96 36a22 22 0 0 0 0 28" class="rd-wave" /><path d="M54 28a34 34 0 0 1 0 44" class="rd-wave w2" /><path d="M106 28a34 34 0 0 0 0 44" class="rd-wave w2" /></g></>}
            </svg>
            <b>{step.title}</b><span>{step.sub}</span>
          </div>
        ))}
      </div>
      <p class="mi-note">{STORM_NOTE}</p>
    </>
  );
}
