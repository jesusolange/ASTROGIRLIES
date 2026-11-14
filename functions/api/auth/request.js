import { requestLogin, HttpError } from "../../_lib/core.js";
import { endpoint, json, readJson, resendMailer } from "../../_lib/http.js";

export const onRequestPost = endpoint(async ({ request, env, repo, now }) => {
  if (!env.SITE_URL) throw new HttpError(503, "The sync service is not configured.");
  const { email } = await readJson(request);
  await requestLogin(repo, resendMailer(env), { email, now, siteUrl: env.SITE_URL.replace(/\/+$/, "") });
  // Same answer whether or not the address already has an account.
  return json({ ok: true });
});
