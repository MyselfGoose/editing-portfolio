#!/usr/bin/env bash
# Mock rclone for dry-run tests (INGEST_MOCK=1)
set -euo pipefail

cmd="${1:-}"
shift || true

case "$cmd" in
  lsjson)
    cat "${INGEST_ROOT}/test/fixtures/drive-list.json"
    ;;
  copyto)
    local_dest=""
    positional=0
    for arg in "$@"; do
      case "$arg" in
        -*) continue ;;
      esac
      positional=$((positional + 1))
      if [[ "$positional" -eq 2 ]]; then
        local_dest="$arg"
        break
      fi
    done
    if [[ -z "$local_dest" ]]; then
      echo "rclone-mock: copyto missing destination" >&2
      exit 1
    fi
    mkdir -p "$(dirname "$local_dest")"
    printf 'mock' >"$local_dest"
    ;;
  listremotes)
    echo "gdrive:"
    ;;
  *)
    echo "rclone-mock: unsupported command $cmd" >&2
    exit 1
    ;;
esac
