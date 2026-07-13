#!/usr/bin/env bash
# Mock curl for dry-run tests (INGEST_MOCK=1)
set -euo pipefail

url=""
method="GET"
upload_file=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    -X) method="$2"; shift 2 ;;
    -sS|-s|-S) shift ;;
    -w) shift ;;
    --progress-bar) shift ;;
    -H) shift 2 ;;
    -d) shift 2 ;;
    --upload-file) upload_file="$2"; shift 2 ;;
    --retry|--retry-delay) shift 2 ;;
    http*) url="$1"; shift ;;
    *) shift ;;
  esac
done

body=""
code="200"

case "$method" in
  POST)
    if [[ "$url" == *"/uploads" ]]; then
      body="$(cat "${INGEST_ROOT}/test/fixtures/mux-upload-create.json")"
      code="201"
    fi
    ;;
  PUT)
    body=""
    code="200"
    ;;
  GET)
    if [[ "$url" == *"/uploads/"* ]]; then
      body="$(cat "${INGEST_ROOT}/test/fixtures/mux-upload-status.json")"
      code="200"
    elif [[ "$url" == *"/assets/"* ]]; then
      body="$(cat "${INGEST_ROOT}/test/fixtures/mux-asset-ready.json")"
      code="200"
    elif [[ "$url" == *"/assets?limit=1" ]]; then
      body='{"data":[]}'
      code="200"
    fi
    ;;
esac

printf '%s\n%s' "$body" "$code"
