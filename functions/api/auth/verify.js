import { verifyLogin } from "../../_lib/core.js";
import { endpoint, json, readJson } from "../../_lib/http.js";

export const onRequestPost = endpoint(async ({ request, repo, now }) => {
  const { token } = await readJson(request);
  return json(await verifyLogin(repo, { token, now }));
});
