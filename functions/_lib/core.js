// Server logic for magic-link sign-in and the per-user data snapshot.
// Pure functions over a `repo` object (see d1-repo.js) so they can be tested without a database.

export const LOGIN_TTL_MS = 15 * 60 * 1000;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const RATE_WINDOW_MS = 10 * 60 * 1000;
export const RATE_MAX = 3;
export const MAX_BYTES = 1024 * 1024;

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export const isValidEmail = (e) =>
  typeof e === "string" && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function sha256(text) {
  const buf = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomToken() {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function requestLogin(repo, mailer, { email, now, siteUrl, rand = randomToken }) {
  const clean = String(email || "").trim().toLowerCase();
  if (!isValidEmail(clean)) throw new HttpError(400, "Enter a valid email address.");
  if ((await repo.countRecentLogins(clean, now - RATE_WINDOW_MS)) >= RATE_MAX) {
    throw new HttpError(429, "Too many requests. Try again in a few minutes.");
  }
  const token = rand();
  await repo.insertLogin({ hash: await sha256(token), email: clean, createdAt: now, expiresAt: now + LOGIN_TTL_MS });
  await mailer.send({
    to: clean,
    subject: "Your AstroMed sign-in link",
    text: `Open this link to sign in to AstroMed (valid for 15 minutes, works once):\n\n${siteUrl}/?login=${token}\n\nIf you did not ask for this, ignore this email.`,
  });
}

export async function verifyLogin(repo, { token, now, rand = randomToken }) {
  const email = typeof token === "string" && token ? await repo.consumeLogin(await sha256(token), now) : null;
  if (!email) throw new HttpError(401, "This sign-in link is invalid or expired.");
  const userId = await repo.upsertUser(email);
  const session = rand();
  await repo.insertSession({ hash: await sha256(session), userId, email, expiresAt: now + SESSION_TTL_MS });
  return { session, email };
}

export async function authenticate(repo, authHeader, now) {
  const m = /^Bearer (.+)$/.exec(authHeader || "");
  if (!m) return null;
  const s = await repo.findSession(await sha256(m[1]), now);
  return s ? { userId: s.userId, email: s.email } : null;
}

export async function logout(repo, authHeader) {
  const m = /^Bearer (.+)$/.exec(authHeader || "");
  if (m) await repo.deleteSession(await sha256(m[1]));
}

export const getSnapshot = (repo, userId) => repo.getSnapshot(userId);

export async function putSnapshot(repo, userId, snapshot, baseUpdatedAt, now) {
  if (!snapshot || snapshot.app !== "astromed" || typeof snapshot.data !== "object" || snapshot.data === null) {
    throw new HttpError(400, "Invalid snapshot.");
  }
  if (JSON.stringify(snapshot).length > MAX_BYTES) throw new HttpError(413, "Data is too large to sync.");
  const ok = await repo.putSnapshot(userId, snapshot, now, baseUpdatedAt ?? null);
  if (ok) return { ok: true, updatedAt: now };
  return { ok: false, remote: await repo.getSnapshot(userId) };
}
