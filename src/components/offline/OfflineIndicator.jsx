import "./offline.css";

export default function OfflineIndicator({ online }) {
  if (online) return null;
  return (
    <div class="am-offline" role="status" aria-live="polite">
      <span class="am-offline-dot" aria-hidden="true"></span>
      <p>Offline: everything still works on this device</p>
    </div>
  );
}
