#!/usr/bin/env bash
# deploy-zo.sh — build this repo's Vite site and sync dist/ to the Zo site
# "footprint" (https://footprint-jlong.zocomputer.io).
#
# The Zo site's production server (server.ts) statically serves its dist/
# folder with SPA fallback, so uploading our built files makes this repo the
# single source of truth; the Zo scaffold is just the host.
#
# Requires: mcporter (npm i -g mcporter) and a Zo API token.
#   ZO_TOKEN_FILE  path to token file (default: ~/.config/ai-cost-tracker/zo_token)
set -euo pipefail

SITE_PATH="/home/workspace/footprint"
MCP_URL="https://api.zo.computer/mcp"
TOKEN_FILE="${ZO_TOKEN_FILE:-$HOME/.config/ai-cost-tracker/zo_token}"
TOKEN="$(cat "$TOKEN_FILE")"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "▶ Building…"
npm run --prefix "$ROOT" build >/dev/null

echo "▶ Syncing dist/ to zo:$SITE_PATH/dist…"
cd "$ROOT/dist"
find . -type f | while read -r file; do
  target="$SITE_PATH/dist/${file#./}"
  echo "  ${file#./}"
  node -e '
    const fs = require("fs");
    const args = { target_file: process.argv[1], content: fs.readFileSync(process.argv[2], "utf8") };
    fs.writeFileSync(process.argv[3], JSON.stringify(args));
  ' "$target" "$file" /tmp/zo-deploy-args.json
  mcporter call "$MCP_URL.write_file" \
    --header "Authorization=Bearer $TOKEN" \
    --args "$(cat /tmp/zo-deploy-args.json)" >/dev/null
done
rm -f /tmp/zo-deploy-args.json

echo "✔ Deployed: https://footprint-jlong.zocomputer.io"
