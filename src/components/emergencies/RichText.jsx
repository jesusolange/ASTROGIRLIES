import { Fragment } from "preact";
import Term from "../ui/Term.jsx";
import { TERMS } from "../../data/terms.js";

const NAMES = Object.keys(TERMS).sort((a, b) => b.length - a.length);
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PATTERN = new RegExp(`\\b(${NAMES.map(escape).join("|")})\\b`, "gi");

export default function RichText({ text }) {
  if (text == null) return null;
  const parts = String(text).split(PATTERN);
  return (
    <>
      {parts.map((part, index) => (index % 2
        ? <Term key={index} term={part}>{part}</Term>
        : <Fragment key={index}>{part}</Fragment>))}
    </>
  );
}
