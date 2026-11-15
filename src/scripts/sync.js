/* ==============================================
   ASTROMED — OPTIONAL ACCOUNT + SYNC
   The app is local-first: it works offline and without signing in.
   Signing in (email magic link) only adds a server copy of your data.
============================================== */
const account = (function (root) {

  // Decide what to do with one local copy and one server copy.
  // local: { dirty, modifiedAt }; remote: { updatedAt } | null; lastRemote: server stamp seen at last sync (null = never).
  function decide(local, remote, lastRemote) {
    if (!remote) return local.dirty || local.modifiedAt > 0 ? "push" : "none";
    const remoteChanged = remote.updatedAt !== lastRemote;
    const localChanged = local.dirty || (lastRemote === null && local.modifiedAt > 0);
    if (!localChanged && !remoteChanged) return "none";
    if (localChanged && !remoteChanged) return "push";
    if (!localChanged && remoteChanged) return "pull";
    return local.modifiedAt > remote.updatedAt ? "push" : "pull";
  }

  const api = { decide };
  api.requestLink = async () => { throw new Error("Sign-in needs the web app."); };
  api.accountStatus = () => ({ signedIn: false, email: null, status: "" });
  api.subscribeAccount = () => () => {};
  api.syncNow = async () => {};
  api.signOutNow = async () => {};
  if (typeof window === "undefined") return api;

  const store = root.AstroMedStore && root.AstroMedStore.store;
  // Each bookkeeping key belongs to the active person, so a shared device never mixes accounts.
  const LS = { session: "am-session", lastRemote: "am-last-remote", dirty: "am-dirty", pending: "am-session-pending" };
  const lsGet = (k) => { try { return root.localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { root.localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } };
  const lsDel = (k) => { try { root.localStorage.removeItem(k); } catch (e) { /* storage blocked */ } };

  let status = "";
  let running = false;
  let applying = false;
  let timer = 0;
  const listeners = [];
  const setStatus = (s) => { status = s; listeners.forEach((fn) => fn()); };
  const activeId = () => (store && typeof store.active === "function" ? store.active() : null);
  const keyFor = (base) => `${base}:${activeId()}`;
  const session = () => {
    if (!activeId()) return null;
    try { return JSON.parse(lsGet(keyFor(LS.session))); } catch (e) { return null; }
  };

  function accountStatus() {
    const s = session();
    return { signedIn: Boolean(s), email: s ? s.email : null, status };
  }

  function subscribeAccount(fn) {
    listeners.push(fn);
    return () => {
      const index = listeners.indexOf(fn);
      if (index >= 0) listeners.splice(index, 1);
    };
  }

  async function call(path, method, body) {
    const s = session();
    const res = await fetch(path, {
      method,
      headers: Object.assign({ "content-type": "application/json" }, s ? { authorization: "Bearer " + s.token } : {}),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    let data = {};
    try { data = await res.json(); } catch (e) { /* empty body */ }
    return { status: res.status, data };
  }

  async function requestLink(email) {
    const r = await call("/api/auth/request", "POST", { email });
    if (r.status !== 200) throw new Error(r.data.error || "Could not send the link.");
  }

  async function finishLogin(token) {
    const r = await call("/api/auth/verify", "POST", { token });
    if (r.status !== 200) throw new Error(r.data.error || "Sign-in failed.");
    const saved = JSON.stringify({ token: r.data.session, email: r.data.email });
    if (activeId()) lsSet(keyFor(LS.session), saved);
    else lsSet(LS.pending, saved);
    if (activeId()) lsDel(keyFor(LS.lastRemote));
    await sync();
  }

  async function signOut() {
    try { await call("/api/auth/logout", "POST"); } catch (e) { /* offline: the session expires on its own */ }
    if (!activeId()) return;
    [keyFor(LS.session), keyFor(LS.lastRemote), keyFor(LS.dirty)].forEach(lsDel);
    setStatus("");
  }

  async function sync() {
    if (!activeId() || !session() || running || !store) return;
    running = true;
    try {
      setStatus("Syncing...");
      for (let attempt = 0; attempt < 3; attempt++) {
        const got = await call("/api/sync", "GET");
        if (got.status === 401) { [keyFor(LS.session), keyFor(LS.lastRemote)].forEach(lsDel); setStatus("Signed out. Sign in again to sync."); return; }
        if (got.status !== 200) throw new Error(got.data.error || "Sync failed.");
        const snap = got.data.snapshot;
        const remote = snap ? { updatedAt: snap.updatedAt } : null;
        const lastRaw = lsGet(keyFor(LS.lastRemote));
        const last = lastRaw === null ? null : Number(lastRaw);
        const action = decide({ dirty: lsGet(keyFor(LS.dirty)) === "1", modifiedAt: store.getModified() }, remote, last);
        if (action === "pull") {
          applying = true;
          try { store.importAll(JSON.stringify(snap.data), { modifiedAt: snap.updatedAt }); } finally { applying = false; }
          lsSet(keyFor(LS.lastRemote), String(snap.updatedAt)); lsDel(keyFor(LS.dirty));
          setStatus("Synced. Reloading..."); setTimeout(() => root.location.reload(), 600);
          return;
        }
        if (action === "push") {
          const put = await call("/api/sync", "PUT", { snapshot: store.exportAll(), baseUpdatedAt: remote ? remote.updatedAt : null });
          if (put.status === 409) continue; // server copy changed meanwhile: decide again
          if (put.status !== 200) throw new Error(put.data.error || "Sync failed.");
          lsSet(keyFor(LS.lastRemote), String(put.data.updatedAt)); lsDel(keyFor(LS.dirty));
        }
        setStatus("Synced " + new Date().toLocaleTimeString());
        return;
      }
      throw new Error("Sync kept conflicting. Try again.");
    } catch (e) {
      setStatus(root.navigator && root.navigator.onLine === false ? "Offline. Your data is safe here and will sync later." : "Sync problem: " + e.message);
    } finally { running = false; }
  }

  let lastActive = activeId();
  if (store) {
    store.subscribe(() => {
      if (applying) return;
      const id = activeId();
      const switched = id !== lastActive;
      lastActive = id;
      if (!id) return;
      if (switched) {
        if (claimPendingSession()) { clearTimeout(timer); timer = setTimeout(sync, 500); }
        return;
      }
      lsSet(keyFor(LS.dirty), "1");
      if (!session()) return;
      clearTimeout(timer); timer = setTimeout(sync, 3000);
    });
  }

  // A magic link can arrive while the device is locked; give the session to the next person who signs in.
  function claimPendingSession() {
    const pending = lsGet(LS.pending);
    if (!pending || !activeId()) return false;
    lsSet(keyFor(LS.session), pending);
    lsDel(LS.pending);
    lsDel(keyFor(LS.lastRemote));
    return true;
  }
  root.addEventListener("online", () => sync());

  // Builds the Account section shown in Settings.
  function renderAccount(host) {
    const box = document.createElement("div");
    box.style.marginTop = "16px";
    host.appendChild(box);
    const draw = () => {
      box.replaceChildren();
      const h = document.createElement("p");
      const s = session();
      if (s) {
        h.textContent = "Signed in as " + s.email + ". " + status;
        const syncBtn = document.createElement("button");
        syncBtn.className = "btn btn-soft"; syncBtn.textContent = "Sync now";
        syncBtn.addEventListener("click", sync);
        const outBtn = document.createElement("button");
        outBtn.className = "btn btn-soft"; outBtn.style.marginLeft = "8px"; outBtn.textContent = "Sign out";
        outBtn.addEventListener("click", signOut);
        box.append(h, syncBtn, outBtn);
      } else {
        h.textContent = "Optional: sign in with your email to keep a copy of your data on a server. The app works without it. " + status;
        const input = document.createElement("input");
        input.type = "email"; input.placeholder = "you@example.com"; input.autocomplete = "email";
        input.setAttribute("aria-label", "Email address");
        const btn = document.createElement("button");
        btn.className = "btn btn-soft"; btn.style.marginLeft = "8px"; btn.textContent = "Email me a sign-in link";
        btn.addEventListener("click", async () => {
          btn.disabled = true;
          try { await requestLink(input.value); setStatus("Check your email for the sign-in link."); }
          catch (e) { setStatus(e.message); }
          finally { btn.disabled = false; }
        });
        box.append(h, input, btn);
      }
    };
    listeners.push(draw);
    draw();
  }

  // Opened from the emailed link: /?login=TOKEN
  try {
    const url = new URL(root.location.href);
    const token = url.searchParams.get("login");
    if (token) {
      url.searchParams.delete("login");
      root.history.replaceState(null, "", url.pathname + url.search + url.hash);
      finishLogin(token).catch((e) => setStatus(e.message));
    } else if (session()) { sync(); }
  } catch (e) { /* ignore */ }

  api.sync = sync; api.signOut = signOut; api.renderAccount = renderAccount; api.session = session;
  api.requestLink = requestLink;
  api.accountStatus = accountStatus;
  api.subscribeAccount = subscribeAccount;
  api.syncNow = sync;
  api.signOutNow = signOut;
  root.AstroMedSync = api;
  return api;
})(typeof window !== "undefined" ? window : globalThis);

export const { decide, requestLink, accountStatus, subscribeAccount, syncNow, signOutNow } = account;
