#!/usr/bin/env bash
# Logging with secret redaction.

INGEST_LOG_FILE=""

log_init() {
  local log_dir
  log_dir="$(ingest_abs_path "${LOG_DIR}")"
  mkdir -p "$log_dir"
  INGEST_LOG_FILE="${log_dir}/ingest-$(date +%Y-%m-%d).log"
}

log_redact() {
  local msg="$1"
  if [[ -n "${MUX_TOKEN_SECRET:-}" ]]; then
    msg="${msg//${MUX_TOKEN_SECRET}/***${MUX_TOKEN_SECRET: -4}}"
  fi
  if [[ -n "${MUX_TOKEN_ID:-}" ]]; then
    msg="${msg//${MUX_TOKEN_ID}/***${MUX_TOKEN_ID: -4}}"
  fi
  printf '%s' "$msg"
}

log_write() {
  local level="$1"
  shift
  local msg
  msg="$(log_redact "$*")"
  local ts
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  if [[ -n "$INGEST_LOG_FILE" ]]; then
    printf '[%s] [%s] %s\n' "$ts" "$level" "$msg" >>"$INGEST_LOG_FILE"
  fi
  if [[ "${INGEST_QUIET:-0}" == "1" && "$level" != "ERROR" ]]; then
    return 0
  fi
  case "$level" in
    ERROR) ui_err "$msg" ;;
    WARN) ui_warn "$msg" ;;
    INFO) printf '  → %s\n' "$msg" >&2 ;;
    *)
      if [[ "${INGEST_VERBOSE:-0}" == "1" ]]; then
        ui_dim "[$level] $msg"
      fi
      ;;
  esac
}

log_info() { log_write "INFO" "$@"; }
log_warn() { log_write "WARN" "$@"; }
log_error() { log_write "ERROR" "$@"; }
log_debug() {
  if [[ "${INGEST_VERBOSE:-0}" == "1" ]]; then
    log_write "DEBUG" "$@"
  fi
}
