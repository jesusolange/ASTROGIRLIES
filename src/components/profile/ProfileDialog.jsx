import { useEffect, useRef, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import {
  KEY, REQUIRED_ORDER, applyForm, closeDialog, dialog, fieldErrors, formValues, get,
  initialsOf, open, saveProfile
} from "../../scripts/profile.js";
import Tabs from "../ui/Tabs.jsx";
import Button from "../ui/Button.jsx";
import Dialog from "../ui/Dialog.jsx";
import SourcesList from "../sources/SourcesList.jsx";
import SourcesDialog from "../sources/SourcesDialog.jsx";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileFields from "./ProfileFields.jsx";
import DataSection from "./DataSection.jsx";
import "../ui/ui.css";
import "./profile.css";

const FORM_TABS = [
  { id: "you", label: "You" },
  { id: "mission", label: "Mission" },
  { id: "body", label: "Body" }
];

const ALL_TABS = [...FORM_TABS, { id: "data", label: "Data" }, { id: "sources", label: "Sources" }];

export default function ProfileDialog() {
  const [stored] = useStored(KEY, null);
  const [form, setForm] = useState(() => formValues(null));
  const [errors, setErrors] = useState({});
  const [first, setFirst] = useState(false);
  const [tab, setTab] = useState("you");
  const fields = useRef({});
  const state = dialog.value;

  function bind(field) {
    return (node) => { fields.current[field] = node; };
  }

  function update(key) {
    return (event) => {
      const value = event.currentTarget.value;
      setForm((current) => {
        const next = { ...current, [key]: value };
        if (key === "sex" && value !== "f") next.meno = "";
        return next;
      });
      setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
    };
  }

  useEffect(() => {
    if (!state.open) return;
    setForm(formValues(get()));
    setErrors({});
    setFirst(state.first);
    setTab(state.section || "you");
  }, [state.open]);

  useEffect(() => {
    if (state.open && state.section) setTab(state.section);
  }, [state.section]);

  useEffect(() => {
    const profile = get();
    if (profile && profile.name) return undefined;
    let cancelled = false;
    let timer = null;
    let poll = null;
    const request = () => { if (!cancelled) open(true); };
    const onCoverClosed = () => { timer = setTimeout(request, 600); };
    const waitForCover = () => {
      if (cancelled) return;
      if (!window.__amCoverOpen) request();
      else poll = setTimeout(waitForCover, 300);
    };
    if (window.__amCoverOpen) {
      document.addEventListener("astromed-cover-closed", onCoverClosed, { once: true });
      poll = setTimeout(waitForCover, 300);
    } else {
      timer = setTimeout(request, 600);
    }
    return () => {
      cancelled = true;
      document.removeEventListener("astromed-cover-closed", onCoverClosed);
      if (timer) clearTimeout(timer);
      if (poll) clearTimeout(poll);
    };
  }, []);

  function submit(event) {
    event.preventDefault();
    const found = fieldErrors(form);
    setErrors(found);
    const firstInvalid = REQUIRED_ORDER.find((key) => found[key]);
    if (firstInvalid) {
      const node = fields.current[firstInvalid];
      if (node) node.focus();
      return;
    }
    saveProfile(applyForm(form, stored || {}));
  }

  const tabs = first ? FORM_TABS : ALL_TABS;
  const onForm = FORM_TABS.some((item) => item.id === tab);
  const title = first ? "Welcome, astronaut" : "Astronaut profile";
  const footer = (
    <>
      {onForm
        ? <Button type="submit" form="pf-form">Save profile</Button>
        : <Button variant="soft" onClick={closeDialog}>Done</Button>}
      {first || !onForm ? null : <Button variant="soft" onClick={closeDialog}>Cancel</Button>}
    </>
  );

  return (
    <>
      <Dialog
        open={state.open}
        onClose={first ? () => {} : closeDialog}
        title={title}
        className={`pf-dialog${first ? " pf-first" : ""}`}
        footer={footer}
      >
        <div class="pf-summary">
          <ProfileAvatar initials={initialsOf(form.name)} />
          <p>Saved on this device only. Your name and mission show in the app.</p>
        </div>

        <Tabs tabs={tabs} value={tab} onChange={setTab} label="Profile sections" idBase="pf" />

        <div class="pf-body">
          {onForm ? (
            <form id="pf-form" class="pf-form" noValidate onSubmit={submit}>
              <ProfileFields form={form} errors={errors} update={update} bind={bind} />
            </form>
          ) : tab === "data" ? (
            <DataSection />
          ) : (
            <div class="pf-sources"><SourcesList /></div>
          )}
        </div>
      </Dialog>
      <SourcesDialog />
    </>
  );
}
