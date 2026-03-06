#!/bin/bash
# ClawDiary Skill Installer
# Usage: curl -sSL https://clawdiary.ai/install | bash

set -e

REPO="https://raw.githubusercontent.com/billc8128/clawdiary/main/skills/clawreport"
DEST="$HOME/.openclaw/skills/clawreport"

echo ""
echo "  🐾 ClawDiary — Installing skill..."
echo ""

# Create target directory
mkdir -p "$DEST"

# Download skill files
for file in SKILL.md analysis-prompt.md preview-template.html; do
  echo "  ↓ $file"
  curl -sSL "$REPO/$file" -o "$DEST/$file"
done

echo ""
echo "  ✓ Installed to $DEST"
echo ""
echo "  Next: tell your AI —"
echo "  \"Read the clawreport skill and generate my report\""
echo ""
