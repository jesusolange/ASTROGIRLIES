#!/usr/bin/env node
// Headless Chrome screenshot and console check, no dependencies.
//
//   pnpm build
//   node tools/shot.mjs --serve dist --out .tmp/home.png
//     --serve <dir>        serve a built site from <dir> for the duration of the shot (no dev server needed)
//     [--path /]           path to open when --serve is used
//     [--url <url>]        open an already running site instead of --serve
//     [--eval "<js>"]...   run in the page after load, in order (each followed by --wait)
//     [--wait 1500]        milliseconds to wait after load and after each --eval
//     [--size 1440x900]
//     [--strict]           exit 1 when the page logged an error or a request failed
//
// Prints console errors, uncaught exceptions and failed requests, then the result of the last --eval.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";

const args = process.argv.slice(2);
const opt = { evals: [], wait: 1500, size: "1440x900", strict: false, path: "/" };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--url") opt.url = args[++i];
  else if (a === "--serve") opt.serve = args[++i];
  else if (a === "--path") opt.path = args[++i];
  else if (a === "--out") opt.out = args[++i];
  else if (a === "--eval") opt.evals.push(args[++i]);
  else if (a === "--wait") opt.wait = Number(args[++i]);
  else if (a === "--size") opt.size = args[++i];
  else if (a === "--strict") opt.strict = true;
  else { console.error(`unknown argument ${a}`); process.exit(2); }
}
if (!opt.url && !opt.serve) { console.error("--serve <dir> or --url <url> is required"); process.exit(2); }

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".glb": "model/gltf-binary", ".woff2": "font/woff2", ".wasm": "application/wasm", ".webmanifest": "application/manifest+json" };
let server = null;
if (opt.serve) {
  const root = resolve(opt.serve);
  if (!existsSync(join(root, "index.html"))) { console.error(`${root} has no index.html; run pnpm build first`); process.exit(2); }
  server = createServer((req, res) => {
    let file = resolve(join(root, decodeURIComponent(new URL(req.url, "http://x").pathname)));
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) { res.writeHead(404).end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(readFileSync(file));
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  opt.url = `http://127.0.0.1:${server.address().port}${opt.path}`;
}

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const chromePath = candidates.find((p) => existsSync(p));
if (!chromePath) { console.error("Chrome not found; set CHROME_PATH"); process.exit(2); }

const [width, height] = opt.size.split("x").map(Number);
const profile = mkdtempSync(join(tmpdir(), "shot-"));
const chrome = spawn(chromePath, [
  "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
  `--window-size=${width},${height}`, "--enable-unsafe-swiftshader", "--hide-scrollbars",
  "--no-first-run", "--no-default-browser-check", "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Never hang the caller: after two minutes stop Chrome and exit with an error.
setTimeout(() => { console.error("timed out after 120 s"); chrome.kill(); process.exit(3); }, 120000).unref();
const problems = [];
let exitCode = 0;

try {
  const wsUrl = await new Promise((ok, fail) => {
    let buf = "";
    const timer = setTimeout(() => fail(new Error("Chrome did not start")), 20000);
    chrome.stderr.on("data", (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { clearTimeout(timer); ok(m[1]); }
    });
  });
  const port = new URL(wsUrl).port;
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = fail; });

  let seq = 0;
  const pending = new Map();
  const requests = new Map();
  let loaded = () => {};
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
    const p = msg.params || {};
    if (msg.method === "Page.loadEventFired") loaded();
    else if (msg.method === "Runtime.exceptionThrown") problems.push(`exception: ${p.exceptionDetails.exception?.description || p.exceptionDetails.text}`);
    else if (msg.method === "Runtime.consoleAPICalled" && p.type === "error") problems.push(`console.error: ${p.args.map((x) => x.value ?? x.description ?? "").join(" ")}`);
    else if (msg.method === "Network.requestWillBeSent") requests.set(p.requestId, p.request.url);
    else if (msg.method === "Network.responseReceived" && p.response.status >= 400) problems.push(`HTTP ${p.response.status}: ${p.response.url}`);
    else if (msg.method === "Network.loadingFailed" && !p.canceled) problems.push(`request failed: ${requests.get(p.requestId) || p.requestId} (${p.errorText})`);
  };
  const send = (method, params = {}) => new Promise((ok) => { const id = ++seq; pending.set(id, ok); ws.send(JSON.stringify({ id, method, params })); });

  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  const onLoad = new Promise((ok) => { loaded = ok; });
  await send("Page.navigate", { url: opt.url });
  await Promise.race([onLoad, sleep(30000)]);
  await sleep(opt.wait);

  let last;
  for (const code of opt.evals) {
    const r = await send("Runtime.evaluate", { expression: code, awaitPromise: true, returnByValue: true, userGesture: true });
    if (r.result?.exceptionDetails) problems.push(`eval failed: ${r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text}`);
    last = r.result?.result?.value;
    await sleep(opt.wait);
  }

  if (opt.out) {
    const shot = await send("Page.captureScreenshot", { format: "png" });
    const file = resolve(opt.out);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, Buffer.from(shot.result.data, "base64"));
    console.log(`saved ${file}`);
  }
  if (last !== undefined) console.log(`eval: ${typeof last === "string" ? last : JSON.stringify(last)}`);
  console.log(problems.length ? `problems (${problems.length}):\n  ${problems.join("\n  ")}` : "no console errors, no failed requests");
  if (opt.strict && problems.length) exitCode = 1;
  ws.close();
} catch (e) {
  console.error(e.message || e);
  exitCode = 2;
} finally {
  chrome.kill();
  if (server) server.close();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still hold the profile */ }
}
process.exit(exitCode);
