import { useEffect, useRef, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import {
  KEY, REQUIRED_ORDER, applyForm, closeDialog, dialog, fieldErrors, formValues, get,
  initialsOf, open, saveProfile
} from "../../scripts/profile.js";
import { personCount } from "../../scripts/people.js";
import { route } from "../../lib/nav.js";
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

const FIELD_TAB = {
  name: "you", age: "you", sex: "you", meno: "you",
  missionType: "mission", crew: "mission", startDate: "mission", total: "mission",
  weight: "body", height: "body"
};

const CLOSE_MS = 240;

function reducedMotion() {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ProfileDialog() {
  const [stored] = useStored(KEY, null);
  const [form, setForm] = useState(() => formValues(null));
  const [errors, setErrors] = useState({});
  const [first, setFirst] = useState(false);
  const [tab, setTab] = useState("you");
  const [pending, setPending] = useState(null);
  const [closing, setClosing] = useState(false);
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
    setClosing(false);
    setForm(formValues(get()));
    setErrors({});
    setFirst(state.first);
    setTab(state.section || "you");
  }, [state.open]);

  useEffect(() => {
    if (state.open && state.section) setTab(state.section);
  }, [state.section]);

  useEffect(() => {
    if (!pending) return;
    const node = fields.current[pending];
    if (!node) return;
    node.focus();
    setPending(null);
  }, [pending, tab]);

  useEffect(() => {
    if (!closing) return undefined;
    const timer = setTimeout(() => {
      setClosing(false);
      closeDialog();
    }, CLOSE_MS);
    return () => clearTimeout(timer);
  }, [closing]);

  useEffect(() => {
    const profile = get();
    if ((profile && profile.name) || personCount() > 0) return undefined;
    let cancelled = false;
    let timer = null;
    let poll = null;
    const request = () => {
      if (cancelled || get() || personCount() > 0) return;
      if (route.value.area === "emergency") return;
      open(true);
    };
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

  function requestClose() {
    if (first || !state.open || closing) return;
    if (reducedMotion()) closeDialog();
    else setClosing(true);
  }

  function submit(event) {
    event.preventDefault();
    const found = fieldErrors(form);
    setErrors(found);
    const firstInvalid = REQUIRED_ORDER.find((key) => found[key]);
    if (firstInvalid) {
      setTab(FIELD_TAB[firstInvalid] || "you");
      setPending(firstInvalid);
      return;
    }
    saveProfile(applyForm(form, stored || {}));
  }

  const tabs = first ? FORM_TABS : ALL_TABS;
  const onForm = FORM_TABS.some((item) => item.id === tab);
  const title = first ? "Welcome, astronaut" : "Astronaut profile";
  const classes = ["pf-dialog"];
  if (first) classes.push("pf-first");
  if (state.open && !closing) classes.push("is-open");
  if (closing) classes.push("is-closing");
  const footer = (
    <>
      {onForm
        ? <Button type="submit" form="pf-form">Save profile</Button>
        : <Button variant="soft" onClick={requestClose}>Done</Button>}
      {first || !onForm ? null : <Button variant="soft" onClick={requestClose}>Cancel</Button>}
    </>
  );

  return (
    <>
      <Dialog
        open={state.open}
        onClose={requestClose}
        title={title}
        className={classes.join(" ")}
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
              <ProfileFields form={form} errors={errors} update={update} bind={bind} tab={tab} />
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
