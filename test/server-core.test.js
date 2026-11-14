"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../functions/_lib/core.js");

// In-memory repository with the same interface the D1 repository implements.
function memRepo() {
  const users = new Map(), logins = [], sessions = new Map(), snaps = new Map();
  let id = 0;
  return {
    users, logins, sessions, snaps,
    async upsertUser(email) { if (!users.has(email)) users.set(email, ++id); return users.get(email); },
    async countRecentLogins(email, since) { return logins.filter((l) => l.email === email && l.createdAt >= since).length; },
    async insertLogin(l) { logins.push({ ...l, used: false }); },
    async consumeLogin(hash, now) {
      const l = logins.find((x) => x.hash === hash && !x.used && x.expiresAt > now);
      if (!l) return null; l.used = true; return l.email;
    },
    async insertSession(s) { sessions.set(s.hash, s); },
    async findSession(hash, now) { const s = sessions.get(hash); return s && s.expiresAt > now ? s : null; },
    async deleteSession(hash) { sessions.delete(hash); },
    async getSnapshot(userId) { return snaps.get(userId) || null; },
    async putSnapshot(userId, data, updatedAt, base) {
      const cur = snaps.get(userId);
      if ((cur ? cur.updatedAt : null) !== base) return false;
      snaps.set(userId, { data, updatedAt }); return true;
    },
  };
}
let n = 0;
const rand = () => "tok" + ++n;
const mailer = () => { const sent = []; return { sent, send: async (m) => sent.push(m) }; };

test("isValidEmail", () => {
  assert.ok(Core.isValidEmail("a@b.co"));
  assert.ok(!Core.isValidEmail("nope"));
  assert.ok(!Core.isValidEmail("a@b"));
  assert.ok(!Core.isValidEmail("a".repeat(300) + "@b.co"));
});

test("hash is stable and does not equal input", async () => {
  const h = await Core.sha256("abc");
  assert.equal(h, await Core.sha256("abc"));
  assert.notEqual(h, "abc");
  assert.equal(h.length, 64);
});

test("requestLogin emails a link and stores only a hash", async () => {
  const repo = memRepo(), m = mailer();
  await Core.requestLogin(repo, m, { email: " A@B.co ", now: 1000, siteUrl: "https://x.pages.dev", rand });
  assert.equal(m.sent.length, 1);
  assert.equal(m.sent[0].to, "a@b.co");
  const token = /login=([A-Za-z0-9_-]+)/.exec(m.sent[0].text)[1];
  assert.ok(m.sent[0].text.includes("https://x.pages.dev/?login="));
  assert.ok(!repo.logins.some((l) => l.hash === token));
});

test("requestLogin rejects invalid email and rate limits", async () => {
  const repo = memRepo(), m = mailer();
  await assert.rejects(Core.requestLogin(repo, m, { email: "bad", now: 1, siteUrl: "https://x", rand }), /email/i);
  for (let i = 0; i < 3; i++) await Core.requestLogin(repo, m, { email: "a@b.co", now: 1000 + i, siteUrl: "https://x", rand });
  await assert.rejects(Core.requestLogin(repo, m, { email: "a@b.co", now: 1010, siteUrl: "https://x", rand }), /too many/i);
  assert.equal(m.sent.length, 3);
});

test("verifyLogin works once, then fails; expired fails", async () => {
  const repo = memRepo(), m = mailer();
  await Core.requestLogin(repo, m, { email: "a@b.co", now: 1000, siteUrl: "https://x", rand });
  const token = /login=([A-Za-z0-9_-]+)/.exec(m.sent[0].text)[1];
  const r = await Core.verifyLogin(repo, { token, now: 2000, rand });
  assert.equal(r.email, "a@b.co");
  assert.ok(r.session);
  await assert.rejects(Core.verifyLogin(repo, { token, now: 2001, rand }), /invalid|expired/i);
  await Core.requestLogin(repo, m, { email: "c@d.co", now: 1000, siteUrl: "https://x", rand });
  const t2 = /login=([A-Za-z0-9_-]+)/.exec(m.sent[1].text)[1];
  await assert.rejects(Core.verifyLogin(repo, { token: t2, now: 1000 + Core.LOGIN_TTL_MS + 1, rand }), /invalid|expired/i);
});

test("authenticate accepts a valid bearer and rejects others", async () => {
  const repo = memRepo(), m = mailer();
  await Core.requestLogin(repo, m, { email: "a@b.co", now: 1000, siteUrl: "https://x", rand });
  const token = /login=([A-Za-z0-9_-]+)/.exec(m.sent[0].text)[1];
  const { session } = await Core.verifyLogin(repo, { token, now: 2000, rand });
  const u = await Core.authenticate(repo, "Bearer " + session, 3000);
  assert.equal(u.email, "a@b.co");
  assert.equal(await Core.authenticate(repo, "Bearer nope", 3000), null);
  assert.equal(await Core.authenticate(repo, "", 3000), null);
  assert.equal(await Core.authenticate(repo, "Bearer " + session, 2000 + Core.SESSION_TTL_MS + 1), null);
});

test("snapshots: first put, conflict on stale base, size limit", async () => {
  const repo = memRepo();
  assert.equal((await Core.getSnapshot(repo, 1)), null);
  const a = await Core.putSnapshot(repo, 1, { app: "astromed", data: {} }, null, 100);
  assert.deepEqual(a, { ok: true, updatedAt: 100 });
  const stale = await Core.putSnapshot(repo, 1, { app: "astromed", data: { x: 1 } }, null, 200);
  assert.equal(stale.ok, false);
  assert.equal(stale.remote.updatedAt, 100);
  const ok = await Core.putSnapshot(repo, 1, { app: "astromed", data: { x: 1 } }, 100, 200);
  assert.equal(ok.ok, true);
  await assert.rejects(Core.putSnapshot(repo, 1, { app: "astromed", data: { big: "x".repeat(Core.MAX_BYTES) } }, 200, 300), /large/i);
  await assert.rejects(Core.putSnapshot(repo, 1, { nope: 1 }, 200, 300), /snapshot/i);
});
