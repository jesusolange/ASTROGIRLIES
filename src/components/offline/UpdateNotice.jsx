export default function UpdateNotice({ onReload }) {
  return (
    <div class="am-update" role="status" aria-live="polite">
      <span>Update ready</span>
      <button type="button" class="am-update-button" onClick={onReload}>
        Reload
      </button>
    </div>
  );
}
