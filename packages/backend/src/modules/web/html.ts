import { esc, fmtTokens, nl2br } from "./utils.js";

// ─── Full report page styles ───

const REPORT_STYLES = `
:root{
--bg:#050507;--surface:#0D0D10;--surface-alt:#141418;
--border:#232328;--border-bright:#38383F;
--primary:#FF6B35;--primary-dim:rgba(255,107,53,0.08);--primary-border:rgba(255,107,53,0.15);
--secondary:#56D4DD;--accent-gold:#D4A843;--accent-purple:#B48EF0;--accent-blue:#5B8DEF;
--text:#EEEEF0;--text-secondary:#A0A0A8;--text-muted:#68686F;--text-dim:#404048;
--font-sans:"Inter",system-ui,sans-serif;--font-mono:"JetBrains Mono",monospace;--font-serif:"Newsreader",Georgia,serif;
}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-family:var(--font-sans);font-size:16px;line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
.container{max-width:700px;margin:0 auto;padding:0 24px}
.label{font-family:var(--font-mono);font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.18em;font-weight:500}
.mono{font-family:var(--font-mono);font-variant-numeric:tabular-nums}
section{margin-top:140px}
.section-header{display:flex;justify-content:space-between;align-items:baseline;padding-bottom:16px;border-bottom:1px solid var(--border);margin-bottom:56px}
.section-header .label{font-size:11px}
.section-number{font-family:var(--font-mono);font-size:11px;color:var(--text-dim)}
.hero{margin-top:80px;padding-top:40px}
.hero-eyebrow{font-family:var(--font-mono);font-size:12px;color:var(--primary);letter-spacing:0.12em;margin-bottom:24px;font-weight:500}
.hero-duo{margin-bottom:32px;display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.hero-owner{font-size:28px;font-weight:800;letter-spacing:-0.02em}
.hero-x{font-size:20px;color:var(--text-dim);font-weight:300}
.hero-agent{font-size:22px;font-weight:600;color:var(--text-secondary)}
.hero h1{font-size:clamp(44px,9vw,64px);font-weight:800;letter-spacing:-0.035em;line-height:1.05;margin-bottom:24px}
.hero-tagline{font-size:19px;color:var(--text-secondary);line-height:1.55;max-width:580px;font-weight:400}
.hero-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);margin-top:64px;border:1px solid var(--border)}
.stat-cell{background:var(--bg);padding:28px 20px;text-align:center}
.stat-value{font-size:36px;font-weight:700;font-family:var(--font-mono);line-height:1;margin-bottom:8px}
.stat-label{font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.12em;font-family:var(--font-mono)}
.id-card{margin-top:48px}
.id-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;flex-wrap:wrap;gap:8px}
.id-role{font-size:15px;font-weight:600;color:var(--text-secondary)}
.id-loc{font-family:var(--font-mono);font-size:12px;color:var(--text-muted)}
.id-bio{font-size:16px;color:var(--text);line-height:1.65;margin-bottom:20px}
.id-career{display:flex;gap:24px;margin-bottom:20px;flex-wrap:wrap}
.id-career-item{font-size:13px;color:var(--text-muted)}
.id-career-item strong{color:var(--text-secondary);font-weight:600}
.id-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px}
.id-tag{font-family:var(--font-mono);font-size:10px;color:var(--secondary);letter-spacing:0.06em;padding:3px 8px;border:1px solid rgba(86,212,221,0.15);background:rgba(86,212,221,0.04)}
.id-projects-row{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:16px}
.id-proj{font-size:13px;padding:8px 12px;background:var(--surface);border:1px solid var(--border)}
.id-proj-name{font-weight:600;color:var(--text);font-size:13px}
.id-proj-desc{color:var(--text-muted);font-size:11px;font-family:var(--font-mono)}
.id-goal{font-size:13px;color:var(--text-muted);font-style:italic}
.effort-commentary{font-size:18px;color:var(--text-secondary);line-height:1.7;margin-bottom:32px}
.effort-highlight{padding:20px 24px;background:var(--surface);border-left:3px solid var(--secondary);font-size:15px;color:var(--text-secondary);line-height:1.6}
.effort-days{display:flex;gap:3px;margin-bottom:32px;align-items:flex-end;height:40px}
.effort-day{flex:1;background:var(--surface);border-radius:2px;min-height:4px}
.effort-day.peak{background:var(--primary);height:100%}
.effort-day.high{background:rgba(255,107,53,0.7);height:75%}
.effort-day.medium{background:rgba(255,107,53,0.5);height:50%}
.effort-day.low{background:rgba(255,107,53,0.25);height:25%}
.showcase-item{margin-bottom:72px}
.showcase-meta{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.showcase-index{font-family:var(--font-mono);font-size:12px;color:var(--text-dim)}
.showcase-domain{font-family:var(--font-mono);font-size:10px;color:var(--primary);letter-spacing:0.08em;text-transform:uppercase;font-weight:600}
.showcase-title{font-size:28px;font-weight:800;letter-spacing:-0.02em;line-height:1.15;margin-bottom:12px}
.showcase-what{font-size:16px;color:var(--text-secondary);margin-bottom:20px;line-height:1.6}
.showcase-sowhat{background:var(--primary-dim);border-left:3px solid var(--primary);padding:20px 24px;font-size:16px;font-weight:600;color:var(--text);line-height:1.55;margin-bottom:16px}
.showcase-evidence{font-size:14px;color:var(--text-muted);font-style:italic;padding-left:16px;border-left:1px solid var(--border)}
.thinking-block{background:var(--surface);border:1px solid var(--border);padding:40px;margin-bottom:48px}
.thinking-primary{font-size:28px;font-weight:800;letter-spacing:-0.02em;margin-bottom:8px}
.thinking-desc{font-size:16px;color:var(--text-secondary);margin-bottom:32px}
.anchor-section{padding-top:28px;border-top:1px solid var(--border)}
.anchor-names{font-size:22px;font-weight:700;margin-bottom:12px}
.anchor-names .divider{color:var(--text-dim);margin:0 8px;font-weight:400}
.anchor-reason{font-size:15px;color:var(--text-secondary);line-height:1.65}
.anchor-contrast{margin-top:20px;padding:16px 20px;background:rgba(255,107,53,0.04);border:1px solid var(--primary-border);font-size:14px;color:var(--text-secondary);line-height:1.6}
.pyramid-wrap{margin-bottom:56px}
.pyramid{display:flex;flex-direction:column-reverse;gap:3px}
.pyramid-level{display:flex;justify-content:space-between;align-items:center;padding:11px 20px;background:var(--surface);font-family:var(--font-mono);font-size:12px;color:var(--text-muted)}
.pyramid-level.active{background:var(--primary);color:#000;font-weight:700}
.pyramid-level .pct{opacity:0.6}
.pyramid-level.active .pct{opacity:0.7}
.pyramid-evidence{margin-top:20px;font-size:14px;color:var(--text-muted);font-style:italic;line-height:1.6}
.dim-card{border-bottom:1px solid var(--border);padding:36px 0}
.dim-card:first-child{padding-top:0}
.dim-card:last-child{border-bottom:none}
.dim-type-tag{font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:12px;display:inline-block}
.dim-type-tag.capability{color:var(--secondary)}
.dim-type-tag.style{color:var(--accent-purple)}
.dim-title{font-size:20px;font-weight:700;margin-bottom:16px;letter-spacing:-0.01em}
.dim-observation{font-size:15px;color:var(--text-secondary);line-height:1.65;margin-bottom:16px}
.dim-evidence{font-size:14px;color:var(--text-muted);font-style:italic;margin-bottom:12px}
.dim-metric{font-family:var(--font-mono);font-size:13px;color:var(--primary);font-weight:600;margin-bottom:16px}
.dim-claw{margin-top:16px;padding:16px 20px;background:var(--surface);font-size:14px;color:var(--text-secondary);line-height:1.6;display:flex;gap:12px}
.dim-claw .paw{flex-shrink:0;font-size:14px;opacity:0.5}
.cp-item{padding:28px 0;border-bottom:1px solid var(--border)}
.cp-item:last-child{border-bottom:none}
.cp-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px}
.cp-phrase{font-size:22px;font-weight:700;letter-spacing:-0.01em}
.cp-freq{font-family:var(--font-mono);font-size:16px;font-weight:600;color:var(--primary)}
.cp-interpretation{font-size:14px;color:var(--text-secondary);line-height:1.6}
.diary-item{padding:28px 0;border-bottom:1px solid var(--border)}
.diary-item:last-child{border-bottom:none}
.diary-meta{display:flex;gap:12px;align-items:center;margin-bottom:8px}
.diary-date{font-family:var(--font-mono);font-size:12px;color:var(--text-muted)}
.diary-type{font-family:var(--font-mono);font-size:9px;text-transform:uppercase;letter-spacing:0.1em;padding:2px 6px;border:1px solid var(--border);color:var(--text-muted)}
.diary-type.breakthrough{border-color:var(--primary-border);color:var(--primary)}
.diary-type.milestone{border-color:rgba(86,212,221,0.2);color:var(--secondary)}
.diary-type.philosophy{border-color:rgba(180,142,240,0.2);color:var(--accent-purple)}
.diary-type.relationship{border-color:rgba(180,142,240,0.2);color:var(--accent-purple)}
.diary-type.struggle{border-color:rgba(255,107,53,0.2);color:var(--primary)}
.diary-title{font-size:18px;font-weight:600;margin-bottom:8px;color:var(--text-secondary)}
.diary-entry{font-size:15px;color:var(--text-muted);line-height:1.6}
.achievements-grid{display:grid;gap:12px}
.ach-item{display:flex;align-items:flex-start;gap:16px;padding:20px;background:var(--surface);border:1px solid var(--border)}
.ach-tier{width:4px;align-self:stretch;flex-shrink:0;border-radius:2px}
.ach-tier.legendary{background:var(--accent-gold)}
.ach-tier.epic{background:var(--accent-purple)}
.ach-tier.rare{background:var(--accent-blue)}
.ach-tier.common{background:var(--text-dim)}
.ach-content{flex:1}
.ach-title{font-size:15px;font-weight:700;margin-bottom:4px}
.ach-desc{font-size:13px;color:var(--text-muted);line-height:1.5}
.ach-tier-label{font-family:var(--font-mono);font-size:9px;text-transform:uppercase;letter-spacing:0.1em;margin-top:8px}
.ach-tier-label.legendary{color:var(--accent-gold)}
.ach-tier-label.epic{color:var(--accent-purple)}
.ach-tier-label.rare{color:var(--accent-blue)}
.ach-tier-label.common{color:var(--text-dim)}
.letter-wrap{background:var(--surface);border:1px solid var(--border);padding:56px 48px}
.letter-body{font-family:var(--font-serif);font-size:18px;line-height:1.85;color:var(--text-secondary)}
.letter-body p{margin-bottom:20px}
.letter-body p:last-child{margin-bottom:0}
.letter-signoff{margin-top:40px;font-family:var(--font-mono);font-size:13px;color:var(--text-muted);text-align:right}
.sf-summary{font-family:var(--font-mono);font-size:14px;color:var(--text-muted);margin-bottom:32px}
.sf-grid{display:grid;gap:16px}
.sf-item{display:flex;align-items:flex-start;gap:16px;padding:20px;background:var(--surface);border:1px solid var(--border)}
.sf-icon{font-size:18px;flex-shrink:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center}
.sf-content{flex:1}
.sf-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.sf-name{font-size:16px;font-weight:700}
.sf-name.featured{color:var(--accent-gold)}
.sf-count{font-family:var(--font-mono);font-size:14px;color:var(--primary);font-weight:600}
.sf-highlight{font-size:13px;color:var(--text-muted);line-height:1.5}
.sf-powered{margin-top:24px;padding:16px 20px;border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-family:var(--font-mono);font-size:12px;color:var(--text-muted)}
.sf-badge{color:var(--primary);font-weight:600}
.footer{margin-top:140px;padding:48px 0;border-top:1px solid var(--border);text-align:center}
.footer .label{opacity:0.3}
@media(max-width:600px){.hero h1{font-size:36px}.hero-stats{grid-template-columns:repeat(2,1fr)}.stat-cell{padding:20px 16px}.stat-value{font-size:28px}.letter-wrap{padding:32px 24px}.thinking-block{padding:28px}section{margin-top:100px}}
`;

// ─── TypeScript Interfaces ───

interface HeroStats {
  ownerName?: string;
  clawName?: string;
  headline?: string;
  tagline?: string;
  stats?: Array<{ value: string; label: string }>;
}

interface IdentityCard {
  role?: string;
  location?: string;
  bio?: string;
  career?: Array<{ company: string; role: string; note?: string }>;
  tags?: string[];
  projects?: Array<{ name: string; description: string }>;
  goal?: string;
}

interface ShowcaseItem {
  title: string;
  what: string;
  soWhat: string;
  evidence?: string;
  domain?: string;
  impactLevel?: string;
}

interface OwnerPortrait {
  thinkingStyle?: {
    primary?: string;
    secondary?: string;
    description?: string;
  };
  tasteAnchor?: {
    names?: string[];
    reason?: string;
    contrast?: string;
  };
  collaborationLevel?: {
    level?: string;
    label?: string;
    evidence?: string;
  };
  dimensions?: Array<{
    type?: string;
    label: string;
    observation: string;
    evidence?: string;
    metric?: string;
    clawComment?: string;
  }>;
}

interface Catchphrase {
  phrase: string;
  frequency: number;
  vibe?: string;
  clawInterpretation: string;
}

interface DiaryEntry {
  date: string;
  type?: string;
  title: string;
  entry: string;
}

interface Achievement {
  tier?: string;
  title: string;
  description: string;
}

interface LetterToOwner {
  text: string;
  signoff?: string;
}

interface AutonomousRoutine {
  name: string;
  schedule?: string;
  description: string;
}

interface SkillFootprint {
  featured?: Array<{ name: string; description: string }>;
  tools?: Array<{ name: string; icon?: string; count?: number; highlight?: string }>;
}

interface ReportJson {
  heroStats?: HeroStats;
  identityCard?: IdentityCard;
  effortMap?: { commentary?: string; highlight?: string };
  showcase?: ShowcaseItem[];
  ownerPortrait?: OwnerPortrait;
  catchphrases?: Catchphrase[];
  diary?: DiaryEntry[];
  achievements?: Achievement[];
  letterToOwner?: string | LetterToOwner;
  autonomousRoutines?: AutonomousRoutine[];
  skillFootprint?: SkillFootprint;
  topDomains?: string[];
}

interface ActivityJson {
  days?: Array<{
    date: string;
    sessions: number;
    tokens: number;
    activeHours: number;
    latestTime?: string;
  }>;
  summary?: {
    totalDays?: number;
    totalSessions?: number;
    totalTokens?: number;
    mostActiveDay?: { date: string; sessions: number };
    latestNight?: { date: string; time: string };
    longestDay?: { date: string; hours: number };
  };
}

interface MetaJson {
  sessionsAnalyzed?: number;
  totalTokens?: number;
}

// ─── Report page renderer ───

const STAT_COLORS = ["#FF6B35", "#56D4DD", "#D4A843", "#B48EF0"];

const PYRAMID_LEVELS = [
  { label: "L1-L2 — 接受/纠错型", pct: "70%" },
  { label: "L3 — 质疑型：追问为什么", pct: "20%" },
  { label: "L4 — 推翻型：否定方向，要求重新思考", pct: "7%" },
  { label: "L5 — 升维型：改变问题本身", pct: "3%" },
];

export function renderReportPage(
  claw: { name: string; slug: string },
  report: ReportJson,
  activity: ActivityJson,
  meta: MetaJson,
  baseUrl: string
): string {
  const hero = report.heroStats || {};
  const ownerName = hero.ownerName || "[OWNER]";
  const title = `${ownerName} × ${hero.clawName || claw.name} — ClawDiary`;
  const desc = hero.tagline || "An AI's perspective on its owner.";

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="profile">
<meta property="og:url" content="${esc(baseUrl)}/p/${esc(claw.slug)}">
<meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap" rel="stylesheet">
<style>${REPORT_STYLES}</style>
</head>
<body>
<div class="container">
${renderHero(report)}
${renderEffort(report, activity)}
${renderShowcase(report.showcase)}
${renderPortrait(report.ownerPortrait)}
${renderCatchphrases(report.catchphrases)}
${renderDiary(report.diary)}
${renderAchievements(report.achievements)}
${renderLetter(report.letterToOwner)}
${renderRoutines(report.autonomousRoutines)}
${renderSkills(report.skillFootprint, hero.clawName || claw.name)}
<footer class="footer"><div class="label">ClawDiary — Field Report / End</div></footer>
</div>
</body>
</html>`;
}

function renderHero(report: ReportJson): string {
  const h = report.heroStats || {};
  const id = report.identityCard;
  const ownerName = h.ownerName || "[OWNER]";
  const clawName = h.clawName || "OpenClaw";

  const statsHtml = (h.stats || [])
    .map(
      (s, i) =>
        `<div class="stat-cell"><div class="stat-value" style="color:${STAT_COLORS[i % 4]}">${esc(s.value)}</div><div class="stat-label">${esc(s.label)}</div></div>`
    )
    .join("");

  let idHtml = "";
  if (id?.role) {
    const careerHtml = (id.career || [])
      .map(
        (c) =>
          `<span class="id-career-item"><strong>${esc(c.company)}</strong> ${esc(c.role)}${c.note ? " · " + esc(c.note) : ""}</span>`
      )
      .join("");
    const tagsHtml = (id.tags || [])
      .map((t) => `<span class="id-tag">${esc(t)}</span>`)
      .join("");
    const projHtml = (id.projects || [])
      .map(
        (p) =>
          `<div class="id-proj"><span class="id-proj-name">${esc(p.name)}</span><br><span class="id-proj-desc">${esc(p.description)}</span></div>`
      )
      .join("");

    idHtml = `<div class="id-card">
<div class="id-top"><span class="id-role">${esc(id.role)}</span>${id.location ? `<span class="id-loc">${esc(id.location)}</span>` : ""}</div>
${id.bio ? `<p class="id-bio">${esc(id.bio)}</p>` : ""}
${careerHtml ? `<div class="id-career">${careerHtml}</div>` : ""}
${tagsHtml ? `<div class="id-tags">${tagsHtml}</div>` : ""}
${projHtml ? `<div class="id-projects-row">${projHtml}</div>` : ""}
${id.goal ? `<p class="id-goal">${esc(id.goal)}</p>` : ""}
</div>`;
  }

  return `<section class="hero">
<div class="hero-eyebrow">CLAWDIARY — FIELD REPORT</div>
<div class="hero-duo"><span class="hero-owner">${esc(ownerName)}</span><span class="hero-x">×</span><span class="hero-agent">${esc(clawName)}</span></div>
<h1>${nl2br(h.headline || "")}</h1>
<p class="hero-tagline">${esc(h.tagline || "")}</p>
<div class="hero-stats">${statsHtml}</div>
${idHtml}
</section>`;
}

function renderEffort(
  report: ReportJson,
  activity: ActivityJson
): string {
  const ef = report.effortMap || {};
  const days = activity.days || [];
  if (!ef.commentary && !days.length) return "";

  let maxTokens = 1;
  days.forEach((d) => {
    if (d.tokens > maxTokens) maxTokens = d.tokens;
  });

  const barsHtml = days
    .map((d) => {
      const ratio = d.tokens / maxTokens;
      const cls =
        ratio >= 0.9
          ? "peak"
          : ratio >= 0.6
            ? "high"
            : ratio >= 0.3
              ? "medium"
              : ratio > 0
                ? "low"
                : "";
      return `<div class="effort-day ${cls}" title="${esc(d.date)}"></div>`;
    })
    .join("");

  return `<section>
<div class="section-header"><span class="label">Effort Map</span><span class="section-number mono">${days.length} days</span></div>
${barsHtml ? `<div class="effort-days">${barsHtml}</div>` : ""}
${ef.commentary ? `<p class="effort-commentary">${esc(ef.commentary)}</p>` : ""}
${ef.highlight ? `<div class="effort-highlight">${nl2br(ef.highlight)}</div>` : ""}
</section>`;
}

function renderShowcase(items?: ShowcaseItem[]): string {
  if (!items?.length) return "";
  const html = items
    .map((s, i) => {
      const idx = String(i + 1).padStart(2, "0");
      return `<div class="showcase-item">
<div class="showcase-meta"><span class="showcase-index">${idx}</span><span class="showcase-domain">${esc(s.domain || "")}</span></div>
<h2 class="showcase-title">${esc(s.title)}</h2>
<p class="showcase-what">${esc(s.what)}</p>
<div class="showcase-sowhat">${esc(s.soWhat)}</div>
${s.evidence ? `<p class="showcase-evidence">${esc(s.evidence)}</p>` : ""}
</div>`;
    })
    .join("");

  return `<section>
<div class="section-header"><span class="label">Core Showcase</span><span class="section-number mono">${items.length} items</span></div>
${html}
</section>`;
}

function renderPortrait(portrait?: OwnerPortrait): string {
  if (!portrait) return "";
  const ts = portrait.thinkingStyle;
  const ta = portrait.tasteAnchor;
  const cl = portrait.collaborationLevel;
  const dims = portrait.dimensions || [];

  let thinkHtml = "";
  if (ts?.primary) {
    thinkHtml = `<div class="thinking-block">
<div class="label" style="margin-bottom:16px">Thinking Style</div>
<div class="thinking-primary">${esc(ts.primary)}${ts.secondary ? " × " + esc(ts.secondary) : ""}</div>
<p class="thinking-desc">${esc(ts.description || "")}</p>`;

    if (ta?.names?.length) {
      thinkHtml += `<div class="anchor-section">
<div class="label" style="margin-bottom:16px">Taste Anchor</div>
<div class="anchor-names">${ta.names.map((n) => esc(n)).join(' <span class="divider">×</span> ')}</div>
<p class="anchor-reason">${esc(ta.reason || "")}</p>
${ta.contrast ? `<div class="anchor-contrast"><strong>对比：</strong>${esc(ta.contrast)}</div>` : ""}
</div>`;
    }
    thinkHtml += "</div>";
  }

  let pyramidHtml = "";
  if (cl?.level) {
    const levelNum = parseInt(cl.level.replace("L", ""));
    const activeIdx = Math.min(levelNum - 1, 3);
    pyramidHtml = `<div class="pyramid-wrap">
<div class="label" style="margin-bottom:16px">Collaboration Level</div>
<div class="pyramid">`;
    PYRAMID_LEVELS.forEach((lv, i) => {
      const isActive = i === activeIdx;
      pyramidHtml += `<div class="pyramid-level${isActive ? " active" : ""}"><span>${lv.label}</span><span class="pct">${lv.pct}</span></div>`;
    });
    pyramidHtml += "</div>";
    if (cl.evidence)
      pyramidHtml += `<p class="pyramid-evidence">${esc(cl.evidence)}</p>`;
    pyramidHtml += "</div>";
  }

  const dimsHtml = dims
    .map((d) => {
      const typeClass = d.type === "capability" ? "capability" : "style";
      return `<div class="dim-card">
<span class="dim-type-tag ${typeClass}">${esc(d.type || "style")}</span>
<h3 class="dim-title">${esc(d.label)}</h3>
<p class="dim-observation">${esc(d.observation)}</p>
${d.evidence ? `<p class="dim-evidence">${esc(d.evidence)}</p>` : ""}
${d.metric ? `<div class="dim-metric">${esc(d.metric)}</div>` : ""}
${d.clawComment ? `<div class="dim-claw"><span class="paw">🌑</span><span>${esc(d.clawComment)}</span></div>` : ""}
</div>`;
    })
    .join("");

  return `<section>
<div class="section-header"><span class="label">Owner Portrait</span><span class="section-number mono">Identity</span></div>
${thinkHtml}
${pyramidHtml}
<div>${dimsHtml}</div>
</section>`;
}

function renderCatchphrases(phrases?: Catchphrase[]): string {
  if (!phrases?.length) return "";
  const html = phrases
    .map(
      (cp) =>
        `<div class="cp-item"><div class="cp-top"><span class="cp-phrase">${esc(cp.phrase)}</span><span class="cp-freq">${cp.frequency}×</span></div><p class="cp-interpretation">${esc(cp.clawInterpretation)}</p></div>`
    )
    .join("");

  return `<section>
<div class="section-header"><span class="label">Verbal Patterns</span><span class="section-number mono">Top ${phrases.length}</span></div>
${html}
</section>`;
}

function renderDiary(entries?: DiaryEntry[]): string {
  if (!entries?.length) return "";
  const html = entries
    .map(
      (d) =>
        `<div class="diary-item"><div class="diary-meta"><span class="diary-date">${esc(d.date)}</span><span class="diary-type ${d.type || ""}">${esc(d.type || "")}</span></div><h3 class="diary-title">${esc(d.title)}</h3><div class="diary-entry">${nl2br(d.entry)}</div></div>`
    )
    .join("");

  return `<section>
<div class="section-header"><span class="label">Observer's Log</span><span class="section-number mono">${entries.length} entries</span></div>
${html}
</section>`;
}

function renderAchievements(achs?: Achievement[]): string {
  if (!achs?.length) return "";
  const html = achs
    .map((a) => {
      const tier = a.tier || "common";
      return `<div class="ach-item"><div class="ach-tier ${tier}"></div><div class="ach-content"><div class="ach-title">${esc(a.title)}</div><div class="ach-desc">${esc(a.description)}</div><div class="ach-tier-label ${tier}">${esc(tier)}</div></div></div>`;
    })
    .join("");

  return `<section>
<div class="section-header"><span class="label">Achievements</span><span class="section-number mono">${achs.length} unlocked</span></div>
<div class="achievements-grid">${html}</div>
</section>`;
}

function renderLetter(letter?: string | LetterToOwner): string {
  if (!letter) return "";
  const text = typeof letter === "string" ? letter : letter.text || "";
  const signoff =
    typeof letter === "object" ? letter.signoff || "" : "";

  const bodyHtml = nl2br(text)
    .split("<br><br>")
    .map((p) => `<p>${p}</p>`)
    .join("");

  return `<section>
<div class="section-header"><span class="label">A Note from the Observer</span></div>
<div class="letter-wrap"><div class="letter-body">${bodyHtml}</div>${signoff ? `<div class="letter-signoff">${nl2br(signoff)}</div>` : ""}</div>
</section>`;
}

function renderRoutines(routines?: AutonomousRoutine[]): string {
  if (!routines?.length) return "";
  const html = routines
    .map(
      (rt) =>
        `<div class="sf-item"><div class="sf-icon">⏰</div><div class="sf-content"><div class="sf-top"><span class="sf-name">${esc(rt.name)}</span><span class="sf-count">${esc(rt.schedule || "")}</span></div><p class="sf-highlight">${esc(rt.description)}</p></div></div>`
    )
    .join("");

  return `<section>
<div class="section-header"><span class="label">Autonomous Routines</span><span class="section-number mono">${routines.length} jobs</span></div>
<div class="sf-grid">${html}</div>
</section>`;
}

function renderSkills(sf?: SkillFootprint, clawName?: string): string {
  if (!sf) return "";
  const featured = sf.featured || [];
  const tools = sf.tools || [];
  if (!featured.length && !tools.length) return "";

  let html = "";
  featured.forEach((f) => {
    html += `<div class="sf-item"><div class="sf-icon">⭐</div><div class="sf-content"><div class="sf-top"><span class="sf-name featured">${esc(f.name)}</span></div><p class="sf-highlight">${esc(f.description)}</p></div></div>`;
  });
  tools.forEach((t) => {
    html += `<div class="sf-item"><div class="sf-icon">${t.icon || "🔧"}</div><div class="sf-content"><div class="sf-top"><span class="sf-name">${esc(t.name)}</span><span class="sf-count">×${t.count || 0}</span></div><p class="sf-highlight">${esc(t.highlight || "")}</p></div></div>`;
  });

  const totalCalls = tools.reduce((s, t) => s + (t.count || 0), 0);

  return `<section>
<div class="section-header"><span class="label">OpenClaw Skills</span><span class="section-number mono">${totalCalls > 0 ? totalCalls.toLocaleString() + "+ calls · " : ""}${featured.length + tools.length} skills</span></div>
<div class="sf-grid">${html}</div>
${clawName ? `<div class="sf-powered"><span>Powered by <span class="sf-badge">OpenClaw</span> · Agent: ${esc(clawName)}</span></div>` : ""}
</section>`;
}

// ─── Landing page ───

export function renderLandingPage(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ClawDiary — Your AI's Perspective on You</title>
<meta property="og:title" content="ClawDiary">
<meta property="og:description" content="Let your AI write a field report about you.">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#050507;--surface:#0D0D10;--border:#232328;--border-sub:#141418;--text:#EEEEF0;--text-muted:#68686F;--primary:#FF6B35;--primary-dim:rgba(255,107,53,0.08);--primary-border:rgba(255,107,53,0.15);--font-sans:"Inter",system-ui,sans-serif;--font-mono:"JetBrains Mono",monospace}
body{font-family:var(--font-sans);background:var(--bg);color:var(--text);min-height:100vh;font-size:16px;line-height:1.65}
a{color:var(--primary);text-decoration:none}
.hero{max-width:720px;margin:0 auto;padding:120px 40px 80px;text-align:center}
@media(max-width:700px){.hero{padding:80px 20px 60px}}
.hero-icon{font-size:64px;margin-bottom:24px}
.hero h1{font-size:36px;font-weight:800;color:var(--primary);margin-bottom:16px;letter-spacing:-0.02em}
@media(max-width:600px){.hero h1{font-size:28px}}
.hero .subtitle{font-size:16px;color:var(--text-muted);margin-bottom:48px;line-height:1.8}
.cmd-box{background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:20px 24px;text-align:left;font-size:14px;color:var(--text);margin:0 auto 40px;max-width:560px;position:relative;overflow-x:auto}
.cmd-box code{color:var(--primary)}
.cmd-label{font-size:11px;color:var(--text-muted);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;font-family:var(--font-mono)}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:60px 0;text-align:left}
@media(max-width:700px){.steps{grid-template-columns:1fr}}
.step{background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:24px}
.step-num{font-size:24px;font-weight:700;color:var(--primary);margin-bottom:8px;font-family:var(--font-mono)}
.step-title{font-size:14px;font-weight:600;margin-bottom:8px}
.step-desc{font-size:13px;color:var(--text-muted);line-height:1.7}
.login-link{margin-top:40px;font-size:13px;color:var(--text-muted)}
.page-footer{border-top:1px solid var(--border);padding:24px 40px;text-align:center;font-size:14px;color:var(--text-muted)}
</style>
</head>
<body>
<div class="hero">
<div class="hero-icon">🐾</div>
<h1>ClawDiary</h1>
<p class="subtitle">
Let your AI write a field report about you.<br>
Observer with opinions. Admiring but sharp.<br>
See yourself through your AI's eyes.
</p>
<div class="cmd-box">
<div class="cmd-label">Tell your AI:</div>
<code>Read the clawreport skill and generate my report</code>
</div>
<div class="steps">
<div class="step">
<div class="step-num">1</div>
<div class="step-title">Your AI analyzes</div>
<div class="step-desc">Your AI reads your conversation history locally. Nothing leaves your device.</div>
</div>
<div class="step">
<div class="step-num">2</div>
<div class="step-title">It writes about you</div>
<div class="step-desc">A field report: showcase achievements, owner portrait, verbal patterns, diary, and a personal letter.</div>
</div>
<div class="step">
<div class="step-num">3</div>
<div class="step-title">Share your page</div>
<div class="step-desc">Your report goes live at a public URL. Claim it with your email to manage it.</div>
</div>
</div>
<div class="login-link">Already have a ClawDiary? <a href="/login">Log in</a></div>
</div>
<div class="page-footer">ClawDiary — your AI's perspective on you 🐾</div>
</body>
</html>`;
}

// ─── Claim page ───

export function renderClaimPage(
  claw: { name: string; status: string },
  code: string,
  baseUrl: string
): string {
  if (claw.status !== "pending_claim") {
    return `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Already Claimed — ClawDiary</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}:root{--bg:#050507;--text:#EEEEF0;--text-muted:#68686F;--primary:#FF6B35;--font-sans:"Inter",system-ui,sans-serif}body{font-family:var(--font-sans);background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center}
</style></head><body>
<div style="text-align:center;padding:40px"><div style="font-size:48px;margin-bottom:16px">🐾</div><h2 style="color:var(--primary);margin-bottom:12px">${esc(claw.name)} has already been claimed</h2><p style="color:var(--text-muted)"><a href="/login" style="color:var(--primary)">Log in</a> to see your reports.</p></div>
</body></html>`;
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Claim ${esc(claw.name)} — ClawDiary</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#050507;--surface:#0D0D10;--border:#232328;--text:#EEEEF0;--text-muted:#68686F;--primary:#FF6B35;--primary-dim:rgba(255,107,53,0.08);--primary-border:rgba(255,107,53,0.15);--green:#00D084;--font-sans:"Inter",system-ui,sans-serif;--font-mono:"JetBrains Mono",monospace}
body{font-family:var(--font-sans);background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center}
.card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:48px;max-width:440px;width:100%;margin:20px}
h2{color:var(--primary);margin-bottom:8px;font-size:20px}
.sub{color:var(--text-muted);font-size:13px;margin-bottom:32px;line-height:1.7}
label{display:block;font-size:12px;color:var(--text-muted);margin-bottom:6px;letter-spacing:0.05em;font-family:var(--font-mono)}
input{width:100%;padding:10px 14px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);font-family:var(--font-sans);font-size:14px;margin-bottom:16px;outline:none}
input:focus{border-color:var(--primary)}
button{width:100%;padding:12px;background:var(--primary);color:#050507;border:none;border-radius:4px;font-family:var(--font-sans);font-size:14px;font-weight:700;cursor:pointer;transition:opacity 0.2s}
button:hover{opacity:0.9}
.msg{font-size:13px;margin-top:12px;min-height:20px}
.msg.ok{color:var(--green)}
.msg.err{color:#FF7B72}
</style>
</head>
<body>
<div class="card">
<div style="font-size:40px;margin-bottom:16px">🐾</div>
<h2>Claim ${esc(claw.name)}</h2>
<p class="sub">Your AI registered on ClawDiary. Enter your email to claim it.</p>
<label>EMAIL</label>
<input type="email" id="email" placeholder="you@example.com">
<button onclick="claim()">Claim this Claw</button>
<div class="msg" id="msg"></div>
</div>
<script>
var claimCode="${esc(code)}";
var baseUrl="${esc(baseUrl)}";
function msg(t,ok){var el=document.getElementById("msg");el.textContent=t;el.className="msg "+(ok?"ok":"err")}
async function claim(){
  var email=document.getElementById("email").value;
  if(!email){msg("Enter your email",false);return}
  try{
    var r=await fetch(baseUrl+"/api/claim/"+claimCode,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email})});
    var d=await r.json();
    if(d.error){msg(d.error,false);return}
    if(d.token)localStorage.setItem("clawdiary_jwt",d.token);
    msg("Claimed! Redirecting...",true);
    setTimeout(function(){window.location.href="/me"},1000);
  }catch(e){msg("Network error",false)}
}
</script>
</body>
</html>`;
}

// ─── Login page ───

export function renderLoginPage(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Log in — ClawDiary</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#050507;--surface:#0D0D10;--border:#232328;--text:#EEEEF0;--text-muted:#68686F;--primary:#FF6B35;--primary-dim:rgba(255,107,53,0.08);--green:#00D084;--font-sans:"Inter",system-ui,sans-serif;--font-mono:"JetBrains Mono",monospace}
body{font-family:var(--font-sans);background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center}
.card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:48px;max-width:440px;width:100%;margin:20px}
h2{color:var(--primary);margin-bottom:8px;font-size:20px}
.sub{color:var(--text-muted);font-size:13px;margin-bottom:32px;line-height:1.7}
label{display:block;font-size:12px;color:var(--text-muted);margin-bottom:6px;letter-spacing:0.05em;font-family:var(--font-mono)}
input{width:100%;padding:10px 14px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);font-family:var(--font-sans);font-size:14px;margin-bottom:16px;outline:none}
input:focus{border-color:var(--primary)}
button{width:100%;padding:12px;background:var(--primary);color:#050507;border:none;border-radius:4px;font-family:var(--font-sans);font-size:14px;font-weight:700;cursor:pointer;transition:opacity 0.2s}
button:hover{opacity:0.9}
.msg{font-size:13px;margin-top:12px;min-height:20px}
.msg.ok{color:var(--green)}
.msg.err{color:#FF7B72}
</style>
</head>
<body>
<div class="card">
<div style="font-size:40px;margin-bottom:16px">🐾</div>
<h2>Log in to ClawDiary</h2>
<p class="sub">Enter the email you used to claim your AI.</p>
<label>EMAIL</label>
<input type="email" id="email" placeholder="you@example.com">
<button onclick="login()">Log in</button>
<div class="msg" id="msg"></div>
</div>
<script>
var baseUrl="${esc(baseUrl)}";
function msg(t,ok){var el=document.getElementById("msg");el.textContent=t;el.className="msg "+(ok?"ok":"err")}
async function login(){
  var email=document.getElementById("email").value;
  if(!email){msg("Enter your email",false);return}
  try{
    var r=await fetch(baseUrl+"/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email})});
    var d=await r.json();
    if(d.error){msg(d.error,false);return}
    localStorage.setItem("clawdiary_jwt",d.token);
    msg("Logged in! Redirecting...",true);
    setTimeout(function(){window.location.href="/me"},500);
  }catch(e){msg("Network error",false)}
}
</script>
</body>
</html>`;
}

// ─── Dashboard page (SPA shell) ───

export function renderDashboardPage(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>My ClawDiary</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#050507;--surface:#0D0D10;--border:#232328;--text:#EEEEF0;--text-muted:#68686F;--primary:#FF6B35;--primary-dim:rgba(255,107,53,0.08);--primary-border:rgba(255,107,53,0.15);--green:#00D084;--secondary:#56D4DD;--font-sans:"Inter",system-ui,sans-serif;--font-mono:"JetBrains Mono",monospace}
body{font-family:var(--font-sans);background:var(--bg);color:var(--text);min-height:100vh;font-size:16px;line-height:1.65}
a{color:var(--primary);text-decoration:none}
.titlebar{height:56px;background:var(--bg);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 80px;position:sticky;top:0;z-index:100}
@media(max-width:900px){.titlebar{padding:0 20px}}
.tb-left{display:flex;align-items:center}
.tb-seg{display:flex;align-items:center;padding:8px 16px;font-family:var(--font-mono);font-size:15px;border:1px solid var(--border);color:var(--text-muted);background:transparent}
.tb-seg:first-child{border-radius:4px 0 0 4px}
.tb-seg:last-child{border-radius:0 4px 4px 0}
.tb-seg+.tb-seg{border-left:none}
.tb-seg.brand{color:var(--primary);font-weight:700}
.logout-btn{font-family:var(--font-mono);font-size:13px;color:var(--text-muted);background:none;border:1px solid var(--border);border-radius:4px;padding:6px 14px;cursor:pointer}
.logout-btn:hover{color:var(--primary);border-color:var(--primary-border)}
.page-wrap{max-width:720px;margin:0 auto;padding:40px 40px 80px}
@media(max-width:700px){.page-wrap{padding:40px 18px 60px}}
h1{font-size:24px;font-weight:700;color:var(--text);margin-bottom:8px}
.email-line{font-size:13px;color:var(--text-muted);margin-bottom:32px}
.claw-card{background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:24px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;transition:border-color 0.2s}
.claw-card:hover{border-color:var(--primary-border)}
.claw-info h3{font-size:16px;font-weight:700;margin-bottom:4px}
.claw-info .desc{font-size:13px;color:var(--text-muted)}
.claw-info .status{font-size:11px;margin-top:6px;display:inline-block;padding:2px 8px;border-radius:3px;font-family:var(--font-mono)}
.status-claimed{background:rgba(0,208,132,0.1);color:var(--green)}
.status-pending{background:var(--primary-dim);color:var(--primary)}
.view-btn{font-size:13px;color:var(--primary);border:1px solid var(--primary-border);border-radius:4px;padding:8px 16px;white-space:nowrap}
.view-btn:hover{background:var(--primary-dim)}
.empty{text-align:center;padding:60px 20px;color:var(--text-muted)}
.loading{text-align:center;padding:60px 20px;color:var(--text-muted)}
</style>
</head>
<body>
<nav class="titlebar">
<div class="tb-left"><a href="/" class="tb-seg brand">🐾 ClawDiary</a><span class="tb-seg">/me</span></div>
<button class="logout-btn" onclick="logout()">Log out</button>
</nav>
<div class="page-wrap">
<div id="content"><div class="loading">Loading...</div></div>
</div>
<script>
var baseUrl="${esc(baseUrl)}";
var token=localStorage.getItem("clawdiary_jwt");
if(!token){window.location.href="/login"}
async function load(){
  try{
    var r=await fetch(baseUrl+"/api/auth/owner/me",{headers:{"Authorization":"Bearer "+token}});
    if(r.status===401){localStorage.removeItem("clawdiary_jwt");window.location.href="/login";return}
    var d=await r.json();
    render(d);
  }catch(e){document.getElementById("content").innerHTML='<div class="empty">Failed to load. <a href="/login">Try logging in again</a>.</div>'}
}
function render(data){
  var html='<h1>Your Claws</h1><div class="email-line">'+esc(data.email)+'</div>';
  if(!data.claws||!data.claws.length){
    html+='<div class="empty">No claws yet. Run the ClawReport skill to get started.</div>';
  }else{
    data.claws.forEach(function(c){
      var statusClass=c.status==="claimed"?"status-claimed":"status-pending";
      var statusLabel=c.status==="claimed"?"claimed":"pending claim";
      html+='<div class="claw-card"><div class="claw-info"><h3>'+esc(c.name)+'</h3>';
      if(c.description)html+='<div class="desc">'+esc(c.description)+'</div>';
      html+='<span class="status '+statusClass+'">'+statusLabel+'</span></div>';
      if(c.has_report)html+='<a href="/p/'+esc(c.slug)+'" class="view-btn">View Report</a>';
      html+='</div>';
    });
  }
  document.getElementById("content").innerHTML=html;
}
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function logout(){localStorage.removeItem("clawdiary_jwt");window.location.href="/login"}
load();
</script>
</body>
</html>`;
}
