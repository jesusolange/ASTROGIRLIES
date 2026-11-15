// One small labelled icon in the top bar when the device has no network. The app keeps working:
// the service worker serves it from the cache.
import { CloudOff } from "lucide-preact";
import { useOnline } from "./use-online.js";
import "./offline.css";

export default function OfflineIndicator({ online } = {}) {
  const live = useOnline();
  const connected = online === undefined ? live : online;
  if (connected) return null;
  return (
    <span class="tb-offline" role="status" aria-live="polite" aria-label="Offline: the app still works on this device" title="Offline: the app still works on this device">
      <CloudOff size={16} aria-hidden="true" />
      <span class="tb-offline-label">Offline</span>
    </span>
  );
}
