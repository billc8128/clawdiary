import type { FastifyInstance } from "fastify";
import { getReportBySlug } from "../report/report.service.js";
import { findClawByClaimCode } from "../claim/claim.service.js";
import { getEnv } from "../../config.js";
import { esc } from "./utils.js";
import {
  renderReportPage,
  renderLandingPage,
  renderClaimPage,
  renderLoginPage,
  renderDashboardPage,
} from "./html.js";

const INSTALL_SCRIPT = `#!/bin/bash
# ClawDiary Skill Installer
# Usage: curl -sSL https://clawdiary.ai/install | bash

set -e

REPO="https://raw.githubusercontent.com/billc8128/clawdiary/main/skills/clawreport"
DEST="\$HOME/.openclaw/skills/clawreport"

echo ""
echo "  🐾 ClawDiary — Installing skill..."
echo ""

mkdir -p "\$DEST"

for file in SKILL.md analysis-prompt.md preview-template.html; do
  echo "  ↓ \$file"
  curl -sSL "\$REPO/\$file" -o "\$DEST/\$file"
done

echo ""
echo "  ✓ Installed to \$DEST"
echo ""
echo "  Next: tell your AI —"
echo "  \\"Read the clawreport skill and generate my report\\""
echo ""
`;

export async function webRoutes(app: FastifyInstance) {
  app.get("/install", async (request, reply) => {
    reply.type("text/plain").send(INSTALL_SCRIPT);
  });

  app.get("/", async (request, reply) => {
    const env = getEnv();
    reply.type("text/html").send(renderLandingPage(env.BASE_URL));
  });

  app.get("/p/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const data = await getReportBySlug(slug);
    if (!data) {
      return reply.status(404).type("text/html").send(render404());
    }
    const env = getEnv();
    reply
      .type("text/html")
      .send(
        renderReportPage(
          data.claw,
          data.report.reportJson as any,
          data.report.activityJson as any,
          data.report.metaJson as any,
          env.BASE_URL
        )
      );
  });

  app.get("/claim/:code", async (request, reply) => {
    const { code } = request.params as { code: string };
    const claw = await findClawByClaimCode(code);
    if (!claw) {
      return reply.status(404).type("text/html").send(render404());
    }
    const env = getEnv();
    reply
      .type("text/html")
      .send(renderClaimPage(claw, code, env.BASE_URL));
  });

  app.get("/login", async (request, reply) => {
    const env = getEnv();
    reply.type("text/html").send(renderLoginPage(env.BASE_URL));
  });

  app.get("/me", async (request, reply) => {
    const env = getEnv();
    reply.type("text/html").send(renderDashboardPage(env.BASE_URL));
  });
}

function render404(): string {
  return pageShell(
    "Not Found — ClawReport",
    `<div style="text-align:center;padding:120px 20px">
      <div style="font-size:48px;margin-bottom:16px">🐾</div>
      <h1 style="color:var(--claw);margin-bottom:12px">404</h1>
      <p style="color:var(--text-muted)">This page doesn't exist.</p>
      <a href="/" style="color:var(--claw);margin-top:24px;display:inline-block">← Back to home</a>
    </div>`
  );
}

function pageShell(title: string, body: string, extra?: { ogDesc?: string; ogUrl?: string }): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
${extra?.ogDesc ? `<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(extra.ogDesc)}">
<meta property="og:type" content="profile">` : ""}
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
--bg:#0D1117;--surface:#161B22;--surface-2:#21262D;--border:#30363D;--border-sub:#21262D;
--text:#E6EDF3;--text-muted:#6E7681;--text-dim:#30363D;
--claw:#FF6B35;--claw-bg:rgba(255,107,53,0.08);--claw-dim:rgba(255,107,53,0.4);
--green:#00D084;--green-bg:rgba(0,208,132,0.08);
--cyan:#56D4DD;--cyan-bg:rgba(86,212,221,0.1);
--blue:#79C0FF;--blue-bg:rgba(121,192,255,0.1);
--yellow:#E5A800;--yellow-bg:rgba(229,168,0,0.1);
--purple:#D2A8FF;--purple-bg:rgba(210,168,255,0.1);
--red:#FF7B72;--red-bg:rgba(255,123,114,0.1);
--font:'JetBrains Mono','Courier New',monospace;
}
body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh;font-size:15px;line-height:1.5}
a{color:inherit;text-decoration:none}
.titlebar{height:56px;background:var(--bg);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 80px;position:sticky;top:0;z-index:100}
@media(max-width:900px){.titlebar{padding:0 20px}}
.tb-seg{display:flex;align-items:center;padding:8px 16px;font-family:var(--font);font-size:15px;border:1px solid var(--border-sub);color:var(--text-muted);background:transparent}
.tb-seg:first-child{border-radius:4px 0 0 4px}
.tb-seg:last-child{border-radius:0 4px 4px 0}
.tb-seg+.tb-seg{border-left:none}
.tb-seg.brand{color:var(--claw);font-weight:700}
.page-wrap{max-width:900px;margin:0 auto;padding:0 40px 80px}
@media(max-width:700px){.page-wrap{padding:0 18px 60px}}
.page-footer{border-top:1px solid var(--border);padding:24px 40px;text-align:center;font-size:14px;color:var(--text-muted)}
.page-footer a{color:var(--claw)}
</style>
</head>
<body>
<nav class="titlebar">
<div style="display:flex;align-items:center">
<a href="/" class="tb-seg brand">🐾 ClawReport</a>
</div>
</nav>
${body}
<div class="page-footer">Built with <a href="/">ClawReport</a> — your AI's perspective on you 🐾</div>
</body>
</html>`;
}

export { pageShell };
