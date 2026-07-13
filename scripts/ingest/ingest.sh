#!/usr/bin/env bash
# Goose Productions — Drive → Mux Ingest CLI
set -euo pipefail

INGEST_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export INGEST_ROOT
export INGEST_MOCK INGEST_DRY_RUN INGEST_VERBOSE INGEST_QUIET INGEST_JSON INGEST_YES INGEST_FORCE INGEST_OFFLINE

# Globals set by arg parser
INGEST_COMMAND=""
INGEST_CONFIG_FILE=""
INGEST_VERBOSE=0
INGEST_QUIET=0
INGEST_JSON=0
INGEST_DRY_RUN=0
INGEST_YES=0
INGEST_FORCE=0
INGEST_OFFLINE=0
INGEST_MOCK=0
INGEST_FILE_FILTER=""
INGEST_PROJECT_FILTER=""
INGEST_WATCH_JOB=""
INGEST_LOG_TAIL=50
INGEST_MANIFEST_ONLY=0
DOCTOR_FIX=0

source "${INGEST_ROOT}/lib/ui.sh"
source "${INGEST_ROOT}/lib/config.sh"
source "${INGEST_ROOT}/lib/log.sh"
source "${INGEST_ROOT}/lib/deps.sh"
source "${INGEST_ROOT}/lib/state.sh"
source "${INGEST_ROOT}/lib/projects.sh"
source "${INGEST_ROOT}/lib/probe.sh"
source "${INGEST_ROOT}/lib/drive.sh"
source "${INGEST_ROOT}/lib/mux.sh"
source "${INGEST_ROOT}/lib/pipeline.sh"
source "${INGEST_ROOT}/lib/doctor.sh"

ui_init

ingest_trap() {
  ui_warn "E080: Interrupted — state saved. Resume with: ingest.sh retry-failed or ingest.sh ingest"
  exit 5
}
trap ingest_trap INT TERM

ingest_usage() {
  ui_show_help
}

ingest_parse_globals() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --help|-h) ingest_usage; exit 0 ;;
      --config) INGEST_CONFIG_FILE="$2"; shift 2 ;;
      --verbose) INGEST_VERBOSE=1; shift ;;
      --quiet) INGEST_QUIET=1; shift ;;
      --json) INGEST_JSON=1; shift ;;
      --dry-run) INGEST_DRY_RUN=1; shift ;;
      --yes) INGEST_YES=1; shift ;;
      --force) INGEST_FORCE=1; shift ;;
      --offline) INGEST_OFFLINE=1; shift ;;
      --mock) INGEST_MOCK=1; shift ;;
      --all-new) shift ;;
      --manifest-only) INGEST_MANIFEST_ONLY=1; shift ;;
      --file) INGEST_FILE_FILTER="$2"; shift 2 ;;
      --project) INGEST_PROJECT_FILTER="$2"; shift 2 ;;
      --fix) DOCTOR_FIX=1; shift ;;
      --tail) INGEST_LOG_TAIL="$2"; shift 2 ;;
      --) shift; break ;;
      -*) ui_err "Unknown option: $1"; ingest_usage; exit 1 ;;
      *) break ;;
    esac
  done
  return 0
}

ingest_load_runtime() {
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  INGEST_CONFIG_FILE="$cfg"
  if [[ -f "$cfg" ]]; then
    config_load || true
    config_ensure_dirs
    state_init
    log_init
  fi
}

cmd_doctor() {
  ingest_parse_globals "$@"
  doctor_run
}

cmd_setup() {
  ingest_parse_globals "$@"
  DOCTOR_FIX=1
  setup_run
}

cmd_scan() {
  ingest_parse_globals "$@"
  ingest_load_runtime
  config_load || { ui_err "E010: config.env required"; exit 2; }
  config_validate || exit 2
  local results
  results="$(drive_scan)" || exit $?
  drive_print_scan "$results"
}

cmd_ingest() {
  ingest_parse_globals "$@"
  ingest_load_runtime
  config_load || { ui_err "E010: config.env required"; exit 2; }
  config_validate || exit 2

  local mode="all-new"
  if [[ -n "$INGEST_FILE_FILTER" ]]; then
    mode="file"
  elif [[ -n "$INGEST_PROJECT_FILTER" ]]; then
    mode="project"
  elif [[ "$INGEST_MANIFEST_ONLY" == "1" ]]; then
    mode="manifest-only"
  fi

  pipeline_run "$mode"
}

cmd_status() {
  ingest_parse_globals "$@"
  ingest_load_runtime
  config_load || { ui_err "E010: config.env required"; exit 2; }
  state_init
  pipeline_status
}

cmd_watch() {
  ingest_parse_globals "$@"
  ingest_load_runtime
  config_load || { ui_err "E010: config.env required"; exit 2; }
  state_init
  local job_id="${1:-}"
  if [[ -z "$job_id" ]]; then
    ui_err "Usage: ingest.sh watch <job-id>"
    exit 1
  fi
  pipeline_watch "$job_id"
}

cmd_retry_failed() {
  ingest_parse_globals "$@"
  ingest_load_runtime
  config_load || { ui_err "E010: config.env required"; exit 2; }
  config_validate || exit 2
  pipeline_retry_failed
}

cmd_map() {
  ingest_parse_globals "$@"
  ingest_load_runtime
  config_load || { ui_err "E010: config.env required"; exit 2; }
  state_init
  projects_map_ready
}

cmd_apply() {
  ingest_parse_globals "$@"
  ingest_load_runtime
  config_load || { ui_err "E010: config.env required"; exit 2; }
  state_init
  projects_apply "${INGEST_PROJECT_FILTER:-}"
}

cmd_logs() {
  ingest_parse_globals "$@"
  ingest_load_runtime
  if [[ -f "${INGEST_LOG_FILE}" ]]; then
    tail -n "$INGEST_LOG_TAIL" "$INGEST_LOG_FILE"
  else
    ui_warn "No log file for today yet."
  fi
}

cmd_cleanup() {
  ingest_parse_globals "$@"
  ingest_load_runtime
  pipeline_cleanup
}

cmd_configure() {
  ingest_parse_globals "$@"
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  if [[ ! -f "$cfg" ]]; then
    cp "${INGEST_ROOT}/config.example.env" "$cfg"
    chmod 600 "$cfg"
  fi
  ui_banner
  ui_section "Configure ingest"
  local val

  val="$(ui_prompt "MUX_TOKEN_ID" "")"
  [[ -n "$val" ]] && config_save_key "MUX_TOKEN_ID" "$val"
  val="$(ui_prompt "MUX_TOKEN_SECRET" "")"
  [[ -n "$val" ]] && config_save_key "MUX_TOKEN_SECRET" "$val"
  val="$(ui_prompt "RCLONE_REMOTE" "gdrive")"
  config_save_key "RCLONE_REMOTE" "$val"
  val="$(ui_prompt "RCLONE_FOLDER" "Portfolio/Masters")"
  config_save_key "RCLONE_FOLDER" "$val"
  val="$(ui_prompt "DRIVE_FOLDER_ID (optional)" "")"
  config_save_key "DRIVE_FOLDER_ID" "$val"
  val="$(ui_prompt "MUX_MAX_RESOLUTION_TIER" "1080p")"
  config_save_key "MUX_MAX_RESOLUTION_TIER" "$val"

  ui_ok "Saved $cfg"
  ui_dim "Run: ./scripts/ingest/ingest.sh doctor"
}

menu_ingest_flow() {
  ui_section "Ingest videos"
  printf 'Folder: %s\n\n' "${RCLONE_FOLDER:-?}" >&2
  printf '  [a] All new videos in that folder (recommended)\n' >&2
  printf '  [b] Pick specific files\n' >&2
  printf '  [c] One project slug\n' >&2
  local choice
  choice="$(ui_prompt "Choice" "a")"
  case "${choice,,}" in
    a|"") pipeline_run "all-new" ;;
    b)
      local scan
      scan="$(drive_scan)" || return $?
      INGEST_LAST_SCAN="$scan"
      drive_print_scan "$scan"
      pipeline_run "pick"
      ;;
    c)
      INGEST_PROJECT_FILTER="$(ui_prompt "Project ID (slug)" "")"
      pipeline_run "project"
      ;;
    *) ui_err "Invalid choice"; return 1 ;;
  esac
}

menu_interactive() {
  doctor_first_run
  ingest_load_runtime

  while true; do
    ui_banner
    if [[ -f "${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}" ]]; then
      ui_ok "Config: ${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
    else
      ui_warn "Status: Not configured"
    fi
    printf '\n'
    printf '  1) First-time setup (automated)\n'
    printf '  2) Setup / Doctor (check only)\n'
    printf '  3) Scan Drive folder\n'
    printf '  4) Ingest videos\n'
    printf '  5) Check progress\n'
    printf '  6) Retry failed\n'
    printf '  7) Map to projects\n'
    printf '  8) Apply to projects.ts (guarded)\n'
    printf '  9) Configure\n'
    printf ' 10) Logs & troubleshooting\n'
    printf '  0) Exit\n'
    printf '\n'
    local choice
    choice="$(ui_prompt "Select" "")"
    case "$choice" in
      1) setup_run || true ;;
      2) doctor_run || true ;;
      3)
        config_load || { ui_err "Run setup first (option 1)"; continue; }
        config_validate || continue
        cmd_scan
        ;;
      4)
        config_load || { ui_err "Run setup first (option 1)"; continue; }
        config_validate || continue
        menu_ingest_flow
        ;;
      5) pipeline_status ;;
      6) pipeline_retry_failed || true ;;
      7) projects_map_ready ;;
      8) projects_apply "" ;;
      9) cmd_configure ;;
      10)
        cmd_logs
        doctor_show_errors_help
        ;;
      0|q|Q) printf 'Goodbye.\n'; exit 0 ;;
      *) ui_err "Invalid option" ;;
    esac
    printf '\n'
    ui_prompt "Press Enter to continue" "" >/dev/null
  done
}

main() {
  local sub="${1:-}"
  shift || true

  case "$sub" in
    ""|menu) menu_interactive ;;
    help|--help|-h) ingest_usage ;;
    doctor) cmd_doctor "$@" ;;
    setup) cmd_setup "$@" ;;
    scan) cmd_scan "$@" ;;
    ingest) cmd_ingest "$@" ;;
    status) cmd_status "$@" ;;
    watch) cmd_watch "$@" ;;
    retry-failed) cmd_retry_failed "$@" ;;
    map) cmd_map "$@" ;;
    apply) cmd_apply "$@" ;;
    configure) cmd_configure "$@" ;;
    logs) cmd_logs "$@" ;;
    cleanup) cmd_cleanup "$@" ;;
    *)
      ingest_parse_globals "$sub" "$@"
      if [[ -n "$sub" && "$sub" == --* ]]; then
        menu_interactive
      else
        ui_err "Unknown command: $sub"
        ingest_usage
        exit 1
      fi
      ;;
  esac
}

main "$@"
