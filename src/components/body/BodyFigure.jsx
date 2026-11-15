// The 3D astronaut beside a body card. It mounts while the card is shown, frames the card's part and
// unmounts when the card leaves. With no WebGL, or on a phone, nothing is drawn and the card still works.
import { useEffect, useRef, useState } from "preact/hooks";
import { focus as focusStage, mount, unmount } from "../../scripts/astronaut3d/index.js";

const DESKTOP = "(min-width: 701px)";

function prefersDesktop() {
  return typeof window === "undefined" || !window.matchMedia ? true : window.matchMedia(DESKTOP).matches;
}

let webglSupport = null;

// Check once so a browser without WebGL skips the model instead of logging a renderer error.
function hasWebGL() {
  if (webglSupport != null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch (error) {
    webglSupport = false;
  }
  return webglSupport;
}

export default function BodyFigure({ part }) {
  const host = useRef(null);
  const [desktop, setDesktop] = useState(prefersDesktop);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const query = window.matchMedia(DESKTOP);
    const update = () => setDesktop(query.matches);
    update();
    if (query.addEventListener) query.addEventListener("change", update);
    else if (query.addListener) query.addListener(update);
    return () => {
      if (query.removeEventListener) query.removeEventListener("change", update);
      else if (query.removeListener) query.removeListener(update);
    };
  }, []);

  useEffect(() => {
    if (!desktop) return undefined;
    let shown = false;
    try {
      shown = hasWebGL() && mount(host.current);
    } catch (error) {
      shown = false;
    }
    if (!shown) {
      setFailed(true);
      return () => unmount();
    }
    setFailed(false);
    focusStage(part);
    return () => unmount();
  }, [desktop, part]);

  if (!desktop || failed) return null;
  return <div class="body-figure" ref={host} />;
}
