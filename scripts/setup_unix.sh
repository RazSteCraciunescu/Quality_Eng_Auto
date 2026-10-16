#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."

npm install --no-audit --no-fund
npm run build

if command -v python3 >/dev/null 2>&1; then
  python3 -m venv .venv
  .venv/bin/python -m pip install --upgrade pip
  .venv/bin/python -m pip install -r requirements-dev.txt
fi

npm run validate
npm test
printf '\nSetup complete. Run: ./scripts/run_unix.sh\n'
