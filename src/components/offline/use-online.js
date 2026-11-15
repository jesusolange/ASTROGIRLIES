// Live network state for the shell. Offline means the app still works from the service worker cache.
import { useEffect, useState } from "preact/hooks";

const current = () => typeof navigator === "undefined" || navigator.onLine !== false;

export function useOnline() {
  const [online, setOnline] = useState(current);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  return online;
}
