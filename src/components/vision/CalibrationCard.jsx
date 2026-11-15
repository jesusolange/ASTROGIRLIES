import { useEffect, useState } from "preact/hooks";
import { CALIBRATION, CARD_MM, calibration } from "../../scripts/vision.js";
import Steps from "../ui/Steps.jsx";
import Field from "../ui/Field.jsx";
import Dialog from "../ui/Dialog.jsx";
import Figure from "../ui/Figure.jsx";
import SourceLink from "../ui/SourceLink.jsx";
import Icon from "../ui/Icon.jsx";

export default function CalibrationCard({ form }) {
  const current = calibration();
  const [open, setOpen] = useState(false);
  const width = Number(form.values.cardWidth) || Math.round((current ? current.ppmm : 3.78) * CARD_MM);

  useEffect(() => {
    if (current) form.set("cardWidth", Math.round(current.ppmm * CARD_MM));
  }, []);
  const when = current && current.calibratedAt
    ? new Date(current.calibratedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : "";
  return (
    <div class="vision vs-cal">
      <Steps
        ariaLabel="Calibration steps"
        items={[
          "Hold a bank card (ID-1, 85.6 mm long edge; ISO/IEC 7810) against the bar below.",
          "Move the slider until the bar matches the card's long edge exactly.",
          "Save. The grid and the near chart then use this scale on this device."
        ]}
      />

      <button type="button" class="vs-figure-link" onClick={() => setOpen(true)}>
        <Icon name="vision" size={18} /> How the eye works
      </button>

      <div class="vs-cal-scroll">
        <div class="vs-cal-bar" style={{ width: `${width}px` }} aria-hidden="true" />
      </div>
      <Field
        label="Calibration bar width"
        id="vs-cal-width"
        error={form.errorFor("cardWidth")}
        help="The bar should be exactly one bank-card long edge."
      >
        <input
          ref={form.fieldRef("cardWidth")}
          type="range"
          min={CALIBRATION.minPx}
          max={CALIBRATION.maxPx}
          step="1"
          value={width}
          onInput={(event) => form.set("cardWidth", Number(event.currentTarget.value))}
        />
      </Field>
      <p class="vs-cal-read">{width} px · {(width / CARD_MM).toFixed(2)} px/mm</p>
      {current ? <p class="vs-fine">Saved {when}. The check skips this card until you calibrate again.</p> : null}

      <Dialog open={open} onClose={() => setOpen(false)} title="How the eye works">
        <Figure id="eye-cross-section" caption="The eye in cross-section, showing the retina and optic nerve." />
        <div onClick={() => setOpen(false)}>
          <SourceLink id="eye-cross-section">Source and credit</SourceLink>
        </div>
      </Dialog>
    </div>
  );
}
