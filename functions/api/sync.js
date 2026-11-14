import { getSnapshot, putSnapshot } from "../_lib/core.js";
import { endpoint, json, readJson } from "../_lib/http.js";

export const onRequestGet = endpoint(async ({ repo, user }) => {
  return json({ email: user.email, snapshot: await getSnapshot(repo, user.userId) });
}, { auth: true });

export const onRequestPut = endpoint(async ({ request, repo, user, now }) => {
  const { snapshot, baseUpdatedAt } = await readJson(request);
  const r = await putSnapshot(repo, user.userId, snapshot, baseUpdatedAt, now);
  return json(r, r.ok ? 200 : 409);
}, { auth: true });
