#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."

echo "Dashboard: http://127.0.0.1:4173"
echo "API docs: http://127.0.0.1:4173/api-docs.html"
exec node dist/server.js
