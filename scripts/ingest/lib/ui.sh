#!/usr/bin/env bash
# Terminal UI: colors, banners, prompts, menus.

UI_USE_COLOR=0

ui_init() {
  if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
    UI_USE_COLOR=1
  fi
}

ui_c() {
  if [[ "$UI_USE_COLOR" == "1" ]]; then
    printf '\033[%sm' "$1"
  fi
}

ui_reset() { ui_c 0; printf '\033[0m' 2>/dev/null || true; }
ui_bold() { ui_c "1"; }
ui_dim() {
  if [[ "${INGEST_JSON:-0}" == "1" ]]; then return 0; fi
  ui_c "2"
  printf '%s\n' "$*"
  ui_reset
}
ui_green() { ui_c "32"; }
ui_yellow() { ui_c "33"; }
ui_red() { ui_c "31"; }
ui_cyan() { ui_c "36"; }

ui_err() {
  if [[ "${INGEST_JSON:-0}" == "1" ]]; then return 0; fi
  ui_red
  printf '✗ %s\n' "$*" >&2
  ui_reset
}

ui_warn() {
  if [[ "${INGEST_JSON:-0}" == "1" ]]; then return 0; fi
  ui_yellow
  printf '⚠ %s\n' "$*" >&2
  ui_reset
}

ui_ok() {
  if [[ "${INGEST_JSON:-0}" == "1" ]]; then return 0; fi
  ui_green
  printf '✓ %s\n' "$*"
  ui_reset
}

ui_banner() {
  if [[ "${INGEST_JSON:-0}" == "1" ]]; then return 0; fi
  printf '\n'
  ui_cyan
  printf '╔══════════════════════════════════════════════════╗\n'
  printf '║  Goose Productions — Drive → Mux Ingest          ║\n'
  printf '╚══════════════════════════════════════════════════╝\n'
  ui_reset
  printf '\n'
}

ui_section() {
  if [[ "${INGEST_JSON:-0}" == "1" ]]; then return 0; fi
  printf '\n'
  ui_bold
  printf '── %s ──\n' "$1"
  ui_reset
}

ui_confirm() {
  local prompt="$1"
  local default="${2:-y}"
  if [[ "${INGEST_YES:-0}" == "1" ]]; then
    return 0
  fi
  if [[ ! -t 0 ]]; then
    ui_warn "Non-interactive: defaulting to no for: $prompt"
    return 1
  fi
  local hint="[Y/n]"
  if [[ "$default" == "n" ]]; then hint="[y/N]"; fi
  printf '%s %s ' "$prompt" "$hint" >&2
  local ans=""
  read -r ans
  ans="${ans:-$default}"
  case "${ans,,}" in
    y|yes) return 0 ;;
    *) return 1 ;;
  esac
}

# Prompts write to stderr; only the answer goes to stdout (safe for $(ui_prompt ...)).
ui_prompt() {
  local prompt="$1"
  local default="${2:-}"
  if [[ ! -t 0 ]]; then
    printf '%s' "$default"
    return 0
  fi
  if [[ -n "$default" ]]; then
    printf '%s [%s]: ' "$prompt" "$default" >&2
  else
    printf '%s: ' "$prompt" >&2
  fi
  local ans=""
  read -r ans
  if [[ -z "$ans" ]]; then ans="$default"; fi
  printf '%s' "$ans"
}

ui_prompt_secret() {
  local prompt="$1"
  if [[ ! -t 0 ]]; then
    printf ''
    return 0
  fi
  printf '%s: ' "$prompt" >&2
  local ans=""
  read -rs ans
  printf '\n' >&2
  printf '%s' "$ans"
}

ui_spinner_start() {
  INGEST_SPINNER_PID=""
  if [[ ! -t 1 || "${INGEST_QUIET:-0}" == "1" ]]; then return 0; fi
  local msg="$1"
  (
    local frames='|/-\'
    local i=0
    while true; do
      printf '\r%s %s' "${frames:i%1:1}" "$msg"
      i=$(( (i + 1) % 4 ))
      sleep 0.15
    done
  ) &
  INGEST_SPINNER_PID=$!
}

ui_spinner_stop() {
  local status="${1:-0}"
  if [[ -n "${INGEST_SPINNER_PID:-}" ]]; then
    kill "$INGEST_SPINNER_PID" 2>/dev/null || true
    wait "$INGEST_SPINNER_PID" 2>/dev/null || true
    INGEST_SPINNER_PID=""
    printf '\r\033[K'
  fi
  if [[ "$status" == "0" ]]; then
    ui_ok "Done"
  fi
}

ui_table_header() {
  if [[ "${INGEST_JSON:-0}" == "1" ]]; then return 0; fi
  ui_bold
  printf '%s\n' "$1"
  ui_reset
}

ui_format_bytes() {
  local bytes="$1"
  if [[ "$bytes" -ge 1073741824 ]]; then
    printf '%.1f GB' "$(echo "scale=1; $bytes/1073741824" | bc -l 2>/dev/null || awk "BEGIN{printf \"%.1f\", $bytes/1073741824}")"
  elif [[ "$bytes" -ge 1048576 ]]; then
    printf '%.1f MB' "$(awk "BEGIN{printf \"%.1f\", $bytes/1048576}")"
  elif [[ "$bytes" -ge 1024 ]]; then
    printf '%.1f KB' "$(awk "BEGIN{printf \"%.1f\", $bytes/1024}")"
  else
    printf '%s B' "$bytes"
  fi
}

ui_show_help() {
  cat <<'EOF'
Goose Productions — Drive → Mux Ingest

USAGE:
  ./scripts/ingest/ingest.sh [COMMAND] [OPTIONS]

COMMANDS:
  (none)          Interactive main menu
  setup           Automated first-time setup (install deps + configure)
  doctor          Check prerequisites and configuration
  scan            List videos in configured Drive folder
  ingest          Download and upload videos to Mux
  status          Show job status table
  watch <job-id>  Tail a job until terminal state
  retry-failed    Retry all failed jobs
  map             Generate projects.ts snippets from ready jobs
  apply           Patch projects.ts (guarded, with diff preview)
  configure       Edit configuration interactively
  logs            Show or tail log files
  cleanup         Remove temp downloads

INGEST OPTIONS:
  --all-new       Ingest only new/changed files (default)
  --file NAME     Ingest a specific Drive filename
  --project ID    Ingest by project slug
  --manifest-only Only ingest manifest entries

GLOBAL OPTIONS:
  --config PATH   Config file (default: scripts/ingest/config.env)
  --dry-run       Show actions without API calls or downloads
  --force         Re-ingest even if already complete
  --yes           Skip confirmation prompts
  --json          Machine-readable output
  --verbose       Verbose logging
  --quiet         Errors only
  --offline       Doctor: skip network checks
  --help          Show this help

EXAMPLES:
  ./scripts/ingest/ingest.sh setup
  ./scripts/ingest/ingest.sh doctor
  ./scripts/ingest/ingest.sh scan
  ./scripts/ingest/ingest.sh ingest --all-new --dry-run
  ./scripts/ingest/ingest.sh status --json
  ./scripts/ingest/ingest.sh map
  ./scripts/ingest/ingest.sh apply --project carezza-leanne --dry-run

EOF
}
