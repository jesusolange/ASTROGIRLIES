// The daily mood check-in: one tap on a choice records it, with an optional note typed first.
// Props: form (CheckCard form state), onSaved(result, undo).
import { openCard } from "../../lib/nav.js";
import { saveMood } from "../../scripts/mental.js";
import Chips from "../ui/Chips.jsx";
import Field from "../ui/Field.jsx";
import { MOODS, MOOD_REPLIES } from "./questions.js";

const OPTIONS = MOODS.map(([label, id]) => ({ id, label }));
const NEXT_LABEL = { dep: "Open the depression check", stress: "Open the stress check" };
const NEXT_CARD = { dep: "depression", stress: "stress" };

export default function MoodCard({ form, onSaved }) {
  function pick(id) {
    const [next, reply = ""] = MOOD_REPLIES[id] || [];
    const undo = saveMood(id, form.values.note || "");
    form.set("mood", id);
    onSaved({
      level: null,
      toast: "Mood recorded.",
      body: <p class="mh-reply">{reply}</p>,
      actions: next ? [{ label: NEXT_LABEL[next], variant: "soft", onClick: () => openCard(NEXT_CARD[next]) }] : []
    }, undo);
  }

  return (
    <div class="mh-mood">
      <p class="mh-lead">Choose the answer that fits today. It is recorded as soon as you tap it.</p>
      <Chips options={OPTIONS} value={form.values.mood} onChange={pick} label="Mood today" idBase="mh-mood" />
      <Field label="Note (optional)" id="mh-mood-note" help="A word about why, if you want to keep it.">
        <input
          id="mh-mood-note"
          type="text"
          maxlength="120"
          value={form.values.note || ""}
          placeholder="For example: slept badly"
          onInput={(event) => form.set("note", event.currentTarget.value)}
        />
      </Field>
    </div>
  );
}
