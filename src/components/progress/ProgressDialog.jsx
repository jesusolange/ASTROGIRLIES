import Dialog from "../ui/Dialog.jsx";
import "./progress.css";

export default function ProgressDialog({ open, onClose, title, children }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} className="pg-dialog-lg ui-dialog-lg">
      {children}
    </Dialog>
  );
}
