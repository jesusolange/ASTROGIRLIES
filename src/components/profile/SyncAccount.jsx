import { useEffect, useState } from "preact/hooks";
import { accountStatus, requestLink, signOutNow, subscribeAccount, syncNow } from "../../scripts/sync.js";
import Field from "../ui/Field.jsx";
import Button from "../ui/Button.jsx";

export default function SyncAccount() {
  const [state, setState] = useState(accountStatus);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeAccount(() => setState(accountStatus())), []);

  async function signIn(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await requestLink(email.trim());
      setState(accountStatus());
    } catch (problem) {
      setError(problem && problem.message ? problem.message : "Could not send the link. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  if (state.signedIn) {
    return (
      <div class="pf-sync">
        <p>Signed in as <b>{state.email}</b>. A copy of your data is kept on the server after each change.</p>
        {state.status ? <p class="pf-sync-status" role="status">{state.status}</p> : null}
        <div class="pf-actions">
          <Button variant="soft" onClick={() => syncNow()}>Sync now</Button>
          <Button variant="soft" onClick={() => signOutNow()}>Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <form class="pf-sync" onSubmit={signIn}>
      <p>Optional: sign in with your email to keep a copy of your data on a server. The app works without it.</p>
      <Field label="Email address" id="pf-sync-email" error={error || undefined}>
        <input
          id="pf-sync-email" type="email" autocomplete="email" placeholder="you@example.com" required
          value={email} onInput={(event) => setEmail(event.currentTarget.value)}
        />
      </Field>
      <div class="pf-actions">
        <Button type="submit" variant="soft" disabled={busy}>{busy ? "Sending..." : "Email me a sign-in link"}</Button>
      </div>
      {state.status ? <p class="pf-sync-status" role="status">{state.status}</p> : null}
    </form>
  );
}
