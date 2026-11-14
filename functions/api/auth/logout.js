import { logout } from "../../_lib/core.js";
import { endpoint, json } from "../../_lib/http.js";

export const onRequestPost = endpoint(async ({ request, repo }) => {
  await logout(repo, request.headers.get("authorization"));
  return json({ ok: true });
});
