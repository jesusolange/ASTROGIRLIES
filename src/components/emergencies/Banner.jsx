import { useMemo } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";

export default function Banner() {
  const [env] = useStored("astromed-env", null);
  const comm = useMemo(() => {
    try {
      return window.AstroMedEnv && window.AstroMedEnv.comm ? window.AstroMedEnv.comm() : null;
    } catch {
      return null;
    }
  }, [env]);
  return (
    <div class="emg-banner">
      <b>Life in danger?</b>
      <span>
        Call the flight surgeon now.
        {comm
          ? <> Message delay to Earth here: <u>{comm.one}</u> one way. {comm.place === "mars" ? "You will have to act on your own first." : ""}</>
          : " Set your location in Environment to see the message delay."}
      </span>
    </div>
  );
}
