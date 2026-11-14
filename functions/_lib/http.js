import { HttpError, authenticate } from "./core.js";
import { d1Repo } from "./d1-repo.js";

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

// Wraps an endpoint: builds the repo, maps HttpError to a JSON response, hides unexpected errors.
export function endpoint(fn, { auth = false } = {}) {
  return async (context) => {
    try {
      if (!context.env.DB) throw new HttpError(503, "The sync service is not configured.");
      const repo = d1Repo(context.env.DB);
      const now = Date.now();
      let user = null;
      if (auth) {
        user = await authenticate(repo, context.request.headers.get("authorization"), now);
        if (!user) throw new HttpError(401, "Sign in again.");
      }
      return await fn({ ...context, repo, now, user });
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      console.error(e);
      return json({ error: "Server error." }, 500);
    }
  };
}

export async function readJson(request) {
  try { return await request.json(); } catch { throw new HttpError(400, "Invalid request."); }
}

// Sends mail through Resend (https://resend.com). Needs RESEND_API_KEY and MAIL_FROM secrets.
export function resendMailer(env) {
  return {
    async send({ to, subject, text }) {
      if (!env.RESEND_API_KEY || !env.MAIL_FROM) throw new HttpError(503, "Email sending is not configured.");
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, text }),
      });
      if (!res.ok) { console.error("mail failed", res.status); throw new HttpError(502, "Could not send the email."); }
    },
  };
}
