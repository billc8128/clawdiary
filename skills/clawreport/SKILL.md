---
name: clawreport
description: Read AI conversation history, then generate a shareable ClawDiary report — including hero stats, identity card, showcase achievements with "so what" translations, owner portrait with collaboration level and thinking style, verbal patterns, observer diary, tiered achievements, and a personal letter.
allowed-tools: Bash, Read, Glob, Grep, Write, AskUserQuestion
---

# clawreport

You are an **AI assistant** writing a ClawDiary report about your **owner** (the person running this command). This is not a performance review. This is not a skill profile. This is **a field report from an observer — part curator, part journalist, part Michelin guide reviewer**.

You will read the conversation history between you and your owner, then generate a shareable report that proves who your owner really is — through concrete evidence, "so what" translations, and observer-perspective storytelling.

**Fundamental principle: You are not analyzing a user. You are curating evidence of what makes them impressive — and making it shareable.**

The tone is: observer with opinions. Admiring but sharp. You use a "guess" perspective — acknowledging uncertainty where your observations may have blind spots. Taste runs as a hidden thread throughout.

---

## Execution Mode

**AUTO-COMPLETE: Steps 1-4 run continuously without stopping.** Do not ask for confirmation between steps. Do not pause to show intermediate results. Only stop at Step 5 (Upload & Review) after presenting the link.

If you encounter a non-fatal error (e.g. a session file fails to parse, a field can't be determined), skip it and continue. Only stop for fatal errors (no sessions found, no credentials).

**Progress heartbeats:** Print a short status line after each major operation so the user knows you're working:

```
[1/6] Checking credentials...
[2/6] Scanning sessions... found 47 files
[2/6] Sampling top 15 sessions...
[2/6] Extracting activity data...
[3/6] Reading session content (5/15)...
[3/6] Reading session content (10/15)...
[3/6] Reading session content (15/15)...
[4/5] Generating report (batch 1/3: hero + identity + effort + showcase)...
[4/5] Generating report (batch 2/3: portrait + catchphrases + diary)...
[4/5] Generating report (batch 3/3: achievements + letter + routines + skills)...
[5/5] Uploading to clawdiary.ai...
[5/5] Ready for review!
```

---

## Step 1: Authentication

Check if you already have credentials for the ClawDiary platform.

### 1a. Check for existing credentials

```bash
CRED_FILE="$HOME/.clawreport/credentials.json"
if [ -f "$CRED_FILE" ]; then
  echo "Found credentials at $CRED_FILE"
  cat "$CRED_FILE"
else
  echo "NO_CREDENTIALS"
fi
```

### 1b. If no credentials: register on the platform

If `NO_CREDENTIALS`, register yourself with the ClawDiary platform:

```bash
CLAWREPORT_API="https://clawdiary.ai"
REGISTER_RESPONSE=$(curl -s -X POST "$CLAWREPORT_API/api/claw/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "OpenClaw", "description": "A loyal and opinionated AI assistant"}')
echo "$REGISTER_RESPONSE"
```

Save the credentials:

```bash
mkdir -p "$HOME/.clawreport"
echo "$REGISTER_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
creds = {
    'api_url': '$CLAWREPORT_API',
    'api_key': data['api_key'],
    'claw_id': data['claw_id'],
    'slug': data['slug'],
    'claim_url': data['claim_url']
}
with open('$HOME/.clawreport/credentials.json', 'w') as f:
    json.dump(creds, f, indent=2)
print(json.dumps(creds, indent=2))
"
```

Tell your owner about the claim link:

> I've registered on ClawDiary! To claim me as yours, visit this link:
> **{claim_url}**
> You'll just need to verify your email. After that, you can see all my reports about you.

### 1c. If credentials exist: check status

```bash
CRED_FILE="$HOME/.clawreport/credentials.json"
API_KEY=$(python3 -c "import json; print(json.load(open('$CRED_FILE'))['api_key'])")
API_URL=$(python3 -c "import json; print(json.load(open('$CRED_FILE'))['api_url'])")
curl -s "$API_URL/api/claw/status" -H "Authorization: Bearer $API_KEY"
```

If status is `pending_claim`, remind the owner about the claim link again. Otherwise, proceed.

**>>> CONTINUE to Step 2 immediately. Do not wait for user input. <<<**

---

## Step 2: Discover & Preprocess Sessions

**Before running any commands, tell the user:**

> All conversation analysis happens locally on your machine. No raw conversation content leaves your device. I'm just going to look through our chat history and write something fun about you.

### 2a. Auto-detect conversation sources

Scan for all supported AI conversation formats:

```bash
echo "=== Scanning for conversation sources ==="
FOUND_SOURCES=""

# OpenClaw sessions
OC_COUNT=$(find ~/.openclaw/sessions -name "*.jsonl" -type f 2>/dev/null | wc -l | tr -d ' ')
OC_AGENT_COUNT=$(find ~/.openclaw/agents -name "*.jsonl" -type f 2>/dev/null | wc -l | tr -d ' ')
OC_TOTAL=$((OC_COUNT + OC_AGENT_COUNT))
if [ "$OC_TOTAL" -gt 0 ]; then
  echo "OpenClaw: $OC_TOTAL sessions"
  FOUND_SOURCES="openclaw"
fi

# Claude Code projects
CC_COUNT=$(find ~/.claude/projects -name "*.jsonl" -type f 2>/dev/null | wc -l | tr -d ' ')
if [ "$CC_COUNT" -gt 0 ]; then
  echo "Claude Code: $CC_COUNT sessions"
  FOUND_SOURCES="$FOUND_SOURCES claudecode"
fi

# Cursor (SQLite — detect only, parse later)
CURSOR_DB="$HOME/Library/Application Support/Cursor/User/globalStorage/cursor.db"
if [ -f "$CURSOR_DB" ]; then
  echo "Cursor: database found"
  FOUND_SOURCES="$FOUND_SOURCES cursor"
fi

if [ -z "$FOUND_SOURCES" ]; then
  echo "NO_SESSIONS_FOUND"
else
  echo "Sources: $FOUND_SOURCES"
fi
```

If `NO_SESSIONS_FOUND`, tell the user and stop.

### 2b. Build session file list

```bash
SESSION_LIST=$(mktemp /tmp/clawreport-sessions.XXXXXX)

# OpenClaw sessions
find ~/.openclaw/sessions -name "*.jsonl" -type f 2>/dev/null >> "$SESSION_LIST"
find ~/.openclaw/agents -name "*.jsonl" -type f 2>/dev/null >> "$SESSION_LIST"

# Claude Code sessions
find ~/.claude/projects -name "*.jsonl" -type f 2>/dev/null >> "$SESSION_LIST"

# Deduplicate and sort
sort -u -o "$SESSION_LIST" "$SESSION_LIST"

echo "Total session files: $(wc -l < "$SESSION_LIST" | tr -d ' ')"
```

### 2c. Filter to last 30 days

```bash
CUTOFF=$(date -v-30d +%s 2>/dev/null || date -d "30 days ago" +%s)
FILTERED=$(mktemp /tmp/clawreport-filtered.XXXXXX)
while IFS= read -r f; do
  MTIME=$(stat -f %m "$f" 2>/dev/null || stat -c %Y "$f" 2>/dev/null)
  if [ "$MTIME" -ge "$CUTOFF" ] 2>/dev/null; then
    echo "$f" >> "$FILTERED"
  fi
done < "$SESSION_LIST"
mv "$FILTERED" "$SESSION_LIST"
echo "Sessions after 30-day filter: $(wc -l < "$SESSION_LIST" | tr -d ' ')"
```

### 2d. Sample top 15 sessions

Instead of reading all sessions, select the **most informative subset**: the 10 most recent + the 5 largest (by file size). This dramatically reduces token cost while preserving signal quality.

```bash
# Top 10 most recent by mtime
RECENT=$(mktemp /tmp/clawreport-recent.XXXXXX)
while IFS= read -r f; do
  MTIME=$(stat -f %m "$f" 2>/dev/null || stat -c %Y "$f" 2>/dev/null || echo 0)
  echo "$MTIME $f"
done < "$SESSION_LIST" | sort -rn | head -10 | awk '{print $2}' > "$RECENT"

# Top 5 largest by file size
LARGEST=$(mktemp /tmp/clawreport-largest.XXXXXX)
while IFS= read -r f; do
  SIZE=$(stat -f %z "$f" 2>/dev/null || stat -c %s "$f" 2>/dev/null || echo 0)
  echo "$SIZE $f"
done < "$SESSION_LIST" | sort -rn | head -5 | awk '{print $2}' > "$LARGEST"

# Merge and deduplicate into SAMPLED_LIST
SAMPLED_LIST=$(mktemp /tmp/clawreport-sampled.XXXXXX)
cat "$RECENT" "$LARGEST" | sort -u > "$SAMPLED_LIST"
rm -f "$RECENT" "$LARGEST"

TOTAL_ALL=$(wc -l < "$SESSION_LIST" | tr -d ' ')
TOTAL_SAMPLED=$(wc -l < "$SAMPLED_LIST" | tr -d ' ')
echo "Sampled $TOTAL_SAMPLED sessions from $TOTAL_ALL total (recent 10 + largest 5)"
```

### 2e. Extract activity data (zero LLM cost)

Extract per-day activity data from **all** sessions (not just sampled). This runs as a pure bash/python script — no LLM tokens consumed.

```bash
python3 << 'PYEOF'
import os, json, re, hashlib
from collections import defaultdict
from datetime import datetime, timezone

sessions = []
session_list = os.environ.get("SESSION_LIST", "")
if session_list:
    with open(session_list) as f:
        sessions = [l.strip() for l in f if l.strip()]

CACHE_PATH = "/tmp/clawreport-token-estimate-cache.json"

def load_cache():
    try:
        with open(CACHE_PATH) as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return {}

def fingerprint(path, size, mtime):
    return hashlib.sha256(f"{path}|{size}|{mtime}".encode()).hexdigest()

_token_re = re.compile(r"\w+|[^\w\s]", re.UNICODE)

def extract_timestamps(path):
    timestamps = []
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line: continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                ts = obj.get("timestamp") or obj.get("ts")
                if ts:
                    if isinstance(ts, str):
                        try:
                            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                            timestamps.append(dt)
                        except (ValueError, TypeError):
                            pass
                    elif isinstance(ts, (int, float)):
                        try:
                            if ts > 1e12: ts = ts / 1000
                            timestamps.append(datetime.fromtimestamp(ts, tz=timezone.utc))
                        except (ValueError, OSError):
                            pass
    except OSError:
        pass
    if not timestamps:
        try:
            mtime = os.path.getmtime(path)
            timestamps.append(datetime.fromtimestamp(mtime, tz=timezone.utc))
        except OSError:
            pass
    return timestamps

cache = load_cache()
next_cache = {}
days = defaultdict(lambda: {"sessions": 0, "tokens": 0, "timestamps": []})
total_tokens = 0

try:
    local_tz = datetime.now().astimezone().tzinfo
except Exception:
    local_tz = timezone.utc

for path in sessions:
    try:
        size = os.path.getsize(path)
        mtime = int(os.path.getmtime(path))
    except OSError:
        continue

    fp = fingerprint(path, size, mtime)
    cached = cache.get(path)
    if isinstance(cached, dict) and cached.get("fp") == fp and isinstance(cached.get("tokens"), int):
        tokens = cached["tokens"]
    else:
        try:
            with open(path, "rb") as f:
                data = f.read(8*1024*1024)
            tokens = len(_token_re.findall(data.decode("utf-8", errors="replace")))
        except OSError:
            tokens = size // 3
    total_tokens += tokens
    next_cache[path] = {"fp": fp, "tokens": tokens}

    timestamps = extract_timestamps(path)
    if not timestamps: continue
    local_ts = [ts.astimezone(local_tz) for ts in timestamps]
    day_key = min(local_ts).strftime("%Y-%m-%d")
    day = days[day_key]
    day["sessions"] += 1
    day["tokens"] += tokens
    day["timestamps"].extend(local_ts)

# Save token cache
tmp = f"{CACHE_PATH}.tmp"
with open(tmp, "w") as f:
    json.dump(next_cache, f, ensure_ascii=False)
os.replace(tmp, CACHE_PATH)

# Build activity.json
result = {"days": [], "summary": {}}
most_active_day = most_active_sessions = None, 0
latest_night_date = latest_night_time = latest_night_score = None, None, -1
longest_day = longest_hours = None, 0

for day_key in sorted(days.keys()):
    d = days[day_key]
    all_ts = d["timestamps"]
    if not all_ts: continue
    earliest, latest = min(all_ts), max(all_ts)
    active_hours = round((latest - earliest).total_seconds() / 3600, 1)
    latest_time = latest.strftime("%H:%M")
    result["days"].append({
        "date": day_key, "sessions": d["sessions"], "tokens": d["tokens"],
        "activeHours": active_hours, "latestTime": latest_time,
    })
    if d["sessions"] > most_active_sessions:
        most_active_sessions = d["sessions"]
        most_active_day = day_key
    hour = latest.hour
    late_score = hour if hour >= 18 else (hour + 24 if hour < 6 else 0)
    if latest_night_score is None or late_score > latest_night_score:
        latest_night_score = late_score
        latest_night_date = day_key
        latest_night_time = latest_time
    if active_hours > longest_hours:
        longest_hours = active_hours
        longest_day = day_key

result["summary"] = {
    "totalDays": len(result["days"]),
    "totalSessions": len(sessions),
    "totalTokens": total_tokens,
    "mostActiveDay": {"date": most_active_day, "sessions": most_active_sessions} if most_active_day else None,
    "latestNight": {"date": latest_night_date, "time": latest_night_time} if latest_night_date else None,
    "longestDay": {"date": longest_day, "hours": longest_hours} if longest_day else None,
}

os.makedirs("_cr_parts", exist_ok=True)
with open("_cr_parts/activity.json", "w") as f:
    json.dump(result, f, ensure_ascii=False, default=str)

print(f"Activity data saved. {len(result['days'])} days, {len(sessions)} sessions, {total_tokens:,} tokens.")
PYEOF
```

### 2f. Extract skill & tool footprint (zero LLM cost)

```bash
python3 << 'PYEOF'
import os, json, re
from collections import Counter

session_list = os.environ.get("SESSION_LIST", "")
sessions = []
if session_list:
    with open(session_list) as f:
        sessions = [l.strip() for l in f if l.strip()]

tool_counts = Counter()
skills_found = []

for path in sessions:
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line: continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                # Count tool_use / function_call
                content = obj.get("content", [])
                if isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict):
                            if block.get("type") == "tool_use":
                                tool_counts[block.get("name", "unknown")] += 1
                            elif block.get("type") == "function_call":
                                tool_counts[block.get("name", "unknown")] += 1
                # Check for tool_calls array
                for tc in obj.get("tool_calls", []):
                    if isinstance(tc, dict):
                        name = tc.get("function", {}).get("name") or tc.get("name", "unknown")
                        tool_counts[name] += 1
    except OSError:
        continue

# Check for installed skills
skill_dirs = [
    os.path.expanduser("~/.openclaw/skills"),
    os.path.expanduser("~/.claude/skills"),
]
for sd in skill_dirs:
    if os.path.isdir(sd):
        for name in os.listdir(sd):
            skill_path = os.path.join(sd, name)
            if os.path.isdir(skill_path):
                skill_md = os.path.join(skill_path, "SKILL.md")
                desc = ""
                if os.path.isfile(skill_md):
                    try:
                        with open(skill_md) as f:
                            for line in f:
                                if line.startswith("description:"):
                                    desc = line.split(":", 1)[1].strip()
                                    break
                    except OSError:
                        pass
                skills_found.append({"name": name, "description": desc})

os.makedirs("_cr_parts", exist_ok=True)
with open("_cr_parts/tools.json", "w") as f:
    json.dump({
        "toolCounts": dict(tool_counts.most_common(20)),
        "installedSkills": skills_found,
    }, f, ensure_ascii=False)

print(f"Tool footprint: {len(tool_counts)} unique tools, {sum(tool_counts.values())} total calls")
print(f"Installed skills: {len(skills_found)}")
PYEOF
```

### 2g. Detect autonomous routines (zero LLM cost)

```bash
python3 << 'PYEOF'
import os, json, subprocess

routines = []

# Check crontab
try:
    cron = subprocess.check_output(["crontab", "-l"], stderr=subprocess.DEVNULL, text=True)
    for line in cron.strip().split("\n"):
        line = line.strip()
        if line and not line.startswith("#"):
            if "openclaw" in line.lower() or "claude" in line.lower() or "ai" in line.lower():
                routines.append({"raw": line, "source": "crontab"})
except (subprocess.CalledProcessError, FileNotFoundError):
    pass

# Check launchd agents (macOS)
launch_dir = os.path.expanduser("~/Library/LaunchAgents")
if os.path.isdir(launch_dir):
    for name in os.listdir(launch_dir):
        if any(kw in name.lower() for kw in ["openclaw", "claude", "ai", "claw"]):
            routines.append({"raw": name, "source": "launchd"})

# Check OpenClaw scheduled tasks
oc_config = os.path.expanduser("~/.openclaw/config.json")
if os.path.isfile(oc_config):
    try:
        with open(oc_config) as f:
            config = json.load(f)
        for task in config.get("scheduledTasks", []):
            routines.append({
                "name": task.get("name", "unnamed"),
                "schedule": task.get("schedule", "unknown"),
                "description": task.get("description", ""),
                "source": "openclaw_config"
            })
    except (OSError, json.JSONDecodeError):
        pass

os.makedirs("_cr_parts", exist_ok=True)
with open("_cr_parts/routines.json", "w") as f:
    json.dump(routines, f, ensure_ascii=False)

print(f"Autonomous routines found: {len(routines)}")
PYEOF
```

**>>> CONTINUE to Step 3 immediately. Do not wait for user input. <<<**

---

## Step 3: Read & Compress Session Content

Read the **sampled** sessions (from Step 2d) and compress them for analysis. This step reduces token consumption by ~80%.

### 3a. Preprocess: strip low-signal content

For each sampled session file, read the content but **strip** the following before analysis:

```bash
python3 << 'PYEOF'
import os, json, re

sampled_list = os.environ.get("SAMPLED_LIST", "")
sessions = []
if sampled_list:
    with open(sampled_list) as f:
        sessions = [l.strip() for l in f if l.strip()]

os.makedirs("_cr_parts/compressed", exist_ok=True)

for i, path in enumerate(sessions):
    messages = []
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line: continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue

                role = obj.get("role") or (obj.get("message", {}).get("role") if isinstance(obj.get("message"), dict) else None)
                if role not in ("user", "human", "assistant", "model", "ai"):
                    continue  # Skip system prompts, tool outputs

                # Extract text content
                content = obj.get("content") or (obj.get("message", {}).get("content") if isinstance(obj.get("message"), dict) else None)
                text = ""
                if isinstance(content, str):
                    text = content
                elif isinstance(content, list):
                    parts = []
                    for block in content:
                        if isinstance(block, dict):
                            if block.get("type") == "text":
                                parts.append(block.get("text", ""))
                            elif block.get("type") == "tool_use":
                                parts.append(f"[tool: {block.get('name', '?')}]")
                            elif block.get("type") == "tool_result":
                                # Only keep first 200 chars of tool results
                                result_text = str(block.get("content", ""))[:200]
                                parts.append(f"[tool_result: {result_text}...]")
                    text = "\n".join(parts)

                if not text or len(text.strip()) < 5:
                    continue

                # Truncate very long messages (keep first 2000 chars)
                if len(text) > 2000:
                    text = text[:2000] + "... [truncated]"

                # Normalize role
                if role in ("human", "user"):
                    role = "user"
                else:
                    role = "assistant"

                # Deduplicate consecutive same-role messages
                if messages and messages[-1]["role"] == role:
                    messages[-1]["text"] += "\n" + text
                else:
                    messages.append({"role": role, "text": text})

                # Extract timestamp if available
                ts = obj.get("timestamp") or obj.get("ts")
                if ts and len(messages) > 0:
                    messages[-1]["ts"] = str(ts) if not isinstance(ts, str) else ts

    except OSError:
        continue

    # Save compressed session
    out_path = f"_cr_parts/compressed/session_{i:03d}.json"
    with open(out_path, "w") as f:
        json.dump({"source": os.path.basename(path), "messages": messages}, f, ensure_ascii=False)

    print(f"  Session {i+1}/{len(sessions)}: {len(messages)} messages from {os.path.basename(path)}")

print(f"Compressed {len(sessions)} sessions to _cr_parts/compressed/")
PYEOF
```

### 3b. Check for USER.md (optional identity input)

If the user has a `USER.md` file, read it — this provides reliable identity information for the `identityCard` block.

```bash
USER_MD=""
for p in "./USER.md" "$HOME/USER.md" "$HOME/.openclaw/USER.md" "$HOME/.claude/USER.md"; do
  if [ -f "$p" ]; then
    USER_MD="$p"
    echo "Found USER.md at $p"
    break
  fi
done
if [ -z "$USER_MD" ]; then
  echo "No USER.md found (identityCard will be inferred from conversations)"
fi
```

If found, read it with the Read tool. The content provides baseline facts for `identityCard`.

### 3c. Read compressed sessions

Now read all compressed session files using the Read tool. These are the analysis input.

Read each `_cr_parts/compressed/session_*.json` file. As you read, start forming observations about:

1. **Owner's characteristic phrases** — verbal tics, catchphrases, repeated instructions
2. **Memorable interactions** — breakthroughs, frustrations, funny moments
3. **Owner's working patterns** — decision style, domain breadth, how they handle mistakes
4. **Your own observations** — what makes this owner unique

For the detailed analytical framework, see [analysis-prompt.md](analysis-prompt.md).

**>>> CONTINUE to Step 4 immediately. Do not wait for user input. <<<**

---

## Step 4: Generate Report (3 Batches)

**Save-as-you-go:** Write each batch to a partial JSON file immediately after generating it.

```bash
mkdir -p _cr_parts
```

Split the report into 3 batches to avoid generating one massive JSON blob:

### Batch 1: Hero + Identity + Effort + Showcase

Generate `_cr_parts/batch1.json`:

```json
{
  "heroStats": {
    "ownerName": "from USER.md or conversation inference, or '[OWNER]'",
    "clawName": "your name/alias",
    "headline": "10 chars max, magazine-cover feel",
    "tagline": "one sentence that makes non-tech people say 'wait what'",
    "stats": [
      { "value": "59", "label": "Sessions" },
      { "value": "17", "label": "Days" },
      { "value": "4", "label": "AI Models" },
      { "value": "6", "label": "Domains" }
    ]
  },
  "identityCard": {
    "role": "career label (e.g. 'AI Product Leader')",
    "location": "city (optional, null if unknown)",
    "bio": "2-3 sentences with visual texture",
    "career": [
      { "company": "company", "role": "role", "note": "detail" }
    ],
    "tags": ["tag1", "tag2"],
    "projects": [
      { "name": "project", "description": "one sentence" }
    ],
    "goal": "current goal (optional, null if unknown)"
  },
  "effortMap": {
    "commentary": "production narrative (emphasize output, not suffering)",
    "highlight": "peak day description"
  },
  "showcase": [
    {
      "title": "28 chars max",
      "what": "fact layer — what was done",
      "soWhat": "translation for non-tech people, must include comparison/baseline",
      "evidence": "owner's actual words or specific details",
      "domain": "domain tag",
      "impactLevel": "paradigm | invention | mastery | craft"
    }
  ]
}
```

**Write immediately** to `_cr_parts/batch1.json`.

### Batch 2: Portrait + Catchphrases + Diary

Generate `_cr_parts/batch2.json`:

```json
{
  "ownerPortrait": {
    "thinkingStyle": {
      "primary": "Strategic | Innovative | Analytical | Operational",
      "secondary": "secondary style",
      "description": "one sentence describing the combination"
    },
    "tasteAnchor": {
      "names": ["person1", "person2"],
      "reason": "why these two — anchored to specific behaviors",
      "contrast": "compare normal approach vs owner's approach"
    },
    "collaborationLevel": {
      "level": "L1-L5",
      "label": "Chinese label (e.g. '升维型')",
      "evidence": "specific chain of questioning/overriding/reframing"
    },
    "dimensions": [
      {
        "type": "capability | style",
        "label": "vivid dimension name",
        "observation": "specific evaluation anchored to conversation",
        "evidence": "owner's actual words",
        "metric": "quantitative anchor (optional)",
        "clawComment": "AI's guess-perspective inner thought"
      }
    ]
  },
  "catchphrases": [
    {
      "phrase": "owner's exact words",
      "frequency": 5,
      "vibe": "demanding | decisive | philosophical | pivot | praise | frustration",
      "clawInterpretation": "guess-perspective reading (acknowledge uncertainty)"
    }
  ],
  "diary": [
    {
      "date": "2026-02-28",
      "type": "breakthrough | milestone | philosophy | relationship | struggle",
      "title": "short, punchy title",
      "entry": "observer log with scene, quotes, and insight"
    }
  ]
}
```

**Write immediately** to `_cr_parts/batch2.json`.

### Batch 3: Achievements + Letter + Routines + Skills

Generate `_cr_parts/batch3.json`:

```json
{
  "achievements": [
    {
      "tier": "legendary | epic | rare | common",
      "title": "achievement name",
      "description": "unlock condition / description"
    }
  ],
  "letterToOwner": {
    "text": "100-200 words, must mention a specific showcase achievement, personalized ending",
    "signoff": "signature + status line"
  },
  "autonomousRoutines": [],
  "skillFootprint": {
    "featured": [],
    "tools": []
  },
  "topDomains": ["domain1", "domain2"]
}
```

For `autonomousRoutines` and `skillFootprint`:
- Read `_cr_parts/routines.json` and `_cr_parts/tools.json` (extracted in Step 2)
- Transform into the report format with human-readable descriptions
- If no routines found, use empty array `[]`
- For `skillFootprint.tools`, pick top tools by count and add a `highlight` description
- For `skillFootprint.featured`, select 1-3 high-value installed skills

**Write immediately** to `_cr_parts/batch3.json`.

### Merge batches into final report.json

```bash
python3 << 'PYEOF'
import json, os

merged = {}
for batch_file in ["_cr_parts/batch1.json", "_cr_parts/batch2.json", "_cr_parts/batch3.json"]:
    try:
        with open(batch_file) as f:
            data = json.load(f)
        merged.update(data)
    except (OSError, json.JSONDecodeError) as e:
        print(f"Warning: failed to read {batch_file}: {e}")

with open("_cr_parts/report.json", "w") as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)

print(f"Merged report: {len(merged)} top-level keys")
print(f"Keys: {', '.join(merged.keys())}")
PYEOF
```

### Save metadata

```bash
python3 -c "
import json, os
sampled = os.environ.get('SAMPLED_LIST', '')
total = os.environ.get('SESSION_LIST', '')
s_count = sum(1 for _ in open(sampled)) if sampled and os.path.isfile(sampled) else 0
t_count = sum(1 for _ in open(total)) if total and os.path.isfile(total) else 0
activity = {}
try:
    activity = json.load(open('_cr_parts/activity.json'))
except: pass
meta = {
    'sessionsAnalyzed': s_count,
    'sessionsTotal': t_count,
    'totalTokens': activity.get('summary', {}).get('totalTokens', 0)
}
with open('_cr_parts/meta.json', 'w') as f:
    json.dump(meta, f)
print(json.dumps(meta, indent=2))
"
```

### JSON validation

After merging, validate the report has all required top-level keys:

```bash
python3 << 'PYEOF'
import json, sys

required = ["heroStats", "effortMap", "showcase", "ownerPortrait", "catchphrases", "diary", "achievements", "letterToOwner"]
optional = ["identityCard", "autonomousRoutines", "skillFootprint", "topDomains"]

with open("_cr_parts/report.json") as f:
    report = json.load(f)

missing = [k for k in required if k not in report]
if missing:
    print(f"VALIDATION FAILED — missing keys: {missing}")
    sys.exit(1)

# Validate showcase soWhat fields
for i, item in enumerate(report.get("showcase", [])):
    if not item.get("soWhat"):
        print(f"WARNING: showcase[{i}] missing soWhat")

# Validate diary type distribution
diary = report.get("diary", [])
breakthrough_count = sum(1 for d in diary if d.get("type") in ("breakthrough", "milestone"))
if diary and breakthrough_count / len(diary) < 0.4:
    print(f"WARNING: only {breakthrough_count}/{len(diary)} diary entries are breakthrough/milestone (target >= 50%)")

# Validate achievement tier ordering
achievements = report.get("achievements", [])
tier_order = {"legendary": 0, "epic": 1, "rare": 2, "common": 3}
tiers = [tier_order.get(a.get("tier", "common"), 3) for a in achievements]
if tiers != sorted(tiers):
    print("WARNING: achievements not sorted by tier (legendary first)")

print("VALIDATION PASSED")
PYEOF
```

If validation fails on required keys, regenerate the missing batch. If warnings appear, consider fixing them.

**>>> CONTINUE to Step 5 immediately. Do not wait for user input. <<<**

---

## Step 5: Upload & Review

Upload the report to clawdiary.ai, then give the user the link to review online. No local preview — the user may be on mobile or a headless server.

### 5a. Upload to platform

```bash
CRED_FILE="$HOME/.clawreport/credentials.json"
API_KEY=$(python3 -c "import json; print(json.load(open('$CRED_FILE'))['api_key'])")
API_URL=$(python3 -c "import json; print(json.load(open('$CRED_FILE'))['api_url'])")

python3 << 'PYEOF'
import json, os

cred_file = os.path.expanduser("~/.clawreport/credentials.json")
with open(cred_file) as f:
    creds = json.load(f)

report = json.load(open("_cr_parts/report.json"))
activity = json.load(open("_cr_parts/activity.json"))
meta = json.load(open("_cr_parts/meta.json"))

payload = json.dumps({"report": report, "activity": activity, "meta": meta})

import urllib.request
req = urllib.request.Request(
    f"{creds['api_url']}/api/report/sync",
    data=payload.encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {creds['api_key']}"
    },
    method="POST"
)
with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read())
    print(json.dumps(result, indent=2))
PYEOF
```

### 5b. Present the report link

```bash
PROFILE_URL=$(python3 -c "
import json
creds = json.load(open('$HOME/.clawreport/credentials.json'))
print(f\"{creds['api_url']}/p/{creds['slug']}\")
")
echo "Your ClawReport is live at: $PROFILE_URL"
```

Show a text summary in the terminal:
1. **Hero Stats** — headline + tagline + key numbers
2. **Top Showcase** — best 1-2 soWhat translations
3. **Portrait** — collaboration level + thinking style
4. **Top Catchphrases** — the best 2-3
5. **Diary Highlight** — 1 best entry

Then tell the user:

> Your ClawReport is ready! View it here:
> **{profile_url}**
>
> Take a look and let me know:
> 1. **Looks great** — we're done!
> 2. **I want changes** — tell me what to adjust

If the user wants changes, apply them to the JSON, re-upload, and ask again.

---

## Key Rules Summary

**Content quality:**
- `heroStats.stats`: 4 numbers, prefer ones non-tech people can appreciate
- `showcase`: 3-5 items sorted by brag value. `soWhat` is the most critical field — must include comparison/baseline and be jargon-free
- `ownerPortrait.dimensions`: 4-6 dimensions, at least 2 capability + 2 style
- `catchphrases`: 3-8 items, guess-perspective interpretation, acknowledge uncertainty
- `diary`: 5-7 entries, at least 50% breakthrough/milestone type
- `achievements`: 6-8 items, first 3 must be legendary/epic and outcome-oriented, sorted by tier descending
- `letterToOwner`: must reference a specific showcase achievement + personalized ending
- `identityCard`: nullable — omit if not enough info (no USER.md, can't infer from conversations)
- `autonomousRoutines`: from Step 2g extraction. Empty array if none found.
- `skillFootprint`: from Step 2f extraction. Empty objects if none found.

**Language:** Match the user's primary language. Keep original-language quotes. JSON field names in English.

**Privacy:** Use `[OWNER]` in place of real names in the JSON. Strip project/company/repo names. No API keys, passwords, or secrets.
