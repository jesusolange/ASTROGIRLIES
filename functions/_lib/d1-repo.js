// D1 implementation of the repo interface used by core.js.
export function d1Repo(db) {
  return {
    async upsertUser(email) {
      await db.prepare("INSERT OR IGNORE INTO users (email) VALUES (?)").bind(email).run();
      const row = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
      return row.id;
    },
    async countRecentLogins(email, since) {
      const row = await db.prepare("SELECT COUNT(*) AS n FROM login_tokens WHERE email = ? AND created_at >= ?").bind(email, since).first();
      return row.n;
    },
    async insertLogin(l) {
      await db.prepare("INSERT INTO login_tokens (hash, email, created_at, expires_at, used) VALUES (?, ?, ?, ?, 0)")
        .bind(l.hash, l.email, l.createdAt, l.expiresAt).run();
    },
    async consumeLogin(hash, now) {
      const row = await db.prepare("UPDATE login_tokens SET used = 1 WHERE hash = ? AND used = 0 AND expires_at > ? RETURNING email")
        .bind(hash, now).first();
      return row ? row.email : null;
    },
    async insertSession(s) {
      await db.prepare("INSERT INTO sessions (hash, user_id, email, expires_at) VALUES (?, ?, ?, ?)")
        .bind(s.hash, s.userId, s.email, s.expiresAt).run();
    },
    async findSession(hash, now) {
      const r = await db.prepare("SELECT user_id, email, expires_at FROM sessions WHERE hash = ? AND expires_at > ?").bind(hash, now).first();
      return r ? { userId: r.user_id, email: r.email, expiresAt: r.expires_at } : null;
    },
    async deleteSession(hash) {
      await db.prepare("DELETE FROM sessions WHERE hash = ?").bind(hash).run();
    },
    async getSnapshot(userId) {
      const r = await db.prepare("SELECT data, updated_at FROM snapshots WHERE user_id = ?").bind(userId).first();
      return r ? { data: JSON.parse(r.data), updatedAt: r.updated_at } : null;
    },
    async putSnapshot(userId, data, updatedAt, base) {
      const json = JSON.stringify(data);
      const res = base === null
        ? await db.prepare("INSERT INTO snapshots (user_id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO NOTHING").bind(userId, json, updatedAt).run()
        : await db.prepare("UPDATE snapshots SET data = ?, updated_at = ? WHERE user_id = ? AND updated_at = ?").bind(json, updatedAt, userId, base).run();
      return res.meta.changes === 1;
    },
  };
}
