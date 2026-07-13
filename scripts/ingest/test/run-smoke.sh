#!/usr/bin/env bash
# Smoke tests: shellcheck + doctor --offline + mock ingest
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> shellcheck"
if command -v shellcheck >/dev/null 2>&1; then
  shellcheck -x ingest.sh lib/*.sh test/fixtures/*.sh
else
  echo "shellcheck not installed — skipping"
fi

echo "==> doctor --offline"
set +e
./ingest.sh doctor --offline
doc_exit=$?
set -e
if [[ "$doc_exit" -ne 0 && "$doc_exit" -ne 2 ]]; then
  exit "$doc_exit"
fi

TMP_CFG="$(mktemp)"
cp config.example.env "$TMP_CFG"
sed -i 's/your_token_id/test_id/; s/your_token_secret/test_secret/' "$TMP_CFG"
trap 'rm -f "$TMP_CFG"' EXIT

rm -f state/jobs.jsonl
mkdir -p tmp output

echo "==> mock scan"
count="$(INGEST_MOCK=1 ./ingest.sh scan --config "$TMP_CFG" --mock --json | jq 'length')"
[[ "$count" -ge 1 ]]

echo "==> mock ingest (fixture APIs, no dry-run)"
INGEST_MOCK=1 ./ingest.sh ingest --file new-wedding.mp4 --yes --config "$TMP_CFG" --mock

status="$(INGEST_MOCK=1 ./ingest.sh status --config "$TMP_CFG" --json | jq -r '.[0].status')"
[[ "$status" == "ready" ]]

echo "==> mock dry-run ingest"
INGEST_MOCK=1 ./ingest.sh ingest --all-new --yes --config "$TMP_CFG" --mock --dry-run

echo "==> All smoke tests passed"
