import { sourcesDialog, closeSources } from "./open.js";
import SourcesList from "./SourcesList.jsx";
import Dialog from "../ui/Dialog.jsx";
import "./sources.css";

export default function SourcesDialog() {
  const state = sourcesDialog.value;
  return (
    <Dialog
      open={state.open}
      onClose={closeSources}
      title="Sources and credits"
      className="sources-dialog"
      label="Sources and credits"
    >
      <p class="sources-intro">
        Every source, figure, reference table and model credit used in AstroMed. Links open in a new tab.
      </p>
      <SourcesList focusId={state.id} />
    </Dialog>
  );
}
