#!/usr/bin/env bash
# Configuration loading and validation.

# INGEST_ROOT is set by ingest.sh before sourcing libs
: "${INGEST_ROOT:?INGEST_ROOT must be set before sourcing config.sh}"
INGEST_CONFIG_FILE="${INGEST_CONFIG_FILE:-}"
CONFIG_LOADED=0

ingest_abs_path() {
  local p="$1"
  if [[ "$p" == /* ]]; then
    printf '%s' "$p"
  else
    printf '%s' "${INGEST_ROOT}/${p}"
  fi
}

config_resolve_path() {
  local key="$1"
  local val="${!key}"
  case "$key" in
    PROJECTS_TS_PATH|MANIFEST_PATH|STATE_DIR|TMP_DIR|LOG_DIR|OUTPUT_DIR)
      ingest_abs_path "$val"
      ;;
    *)
      printf '%s' "$val"
      ;;
  esac
}

config_quote_shell() {
  local raw="$1"
  local escaped="${raw//\'/\'\\\'\'}"
  printf "'%s'" "$escaped"
}

config_sanitize_value() {
  local val="$1"
  val="$(printf '%s' "$val" | sed -E \
    's/^Paste Token ID: //;
     s/^Paste Token Secret: //;
     s/^RCLONE_FOLDER \[[^]]*\]: //')"
  val="$(printf '%s' "$val" | sed -E 's/^["'\'']|["'\'']$//g')"
  printf '%s' "$val"
}

config_repair_file() {
  local cfg="$1"
  [[ -f "$cfg" ]] || return 0

  local repaired=0
  local tmp
  tmp="$(mktemp)"
  local line key raw val quoted

  while IFS= read -r line || [[ -n "$line" ]]; do
    case "$line" in
      MUX_TOKEN_ID=*|MUX_TOKEN_SECRET=*|RCLONE_FOLDER=*|RCLONE_REMOTE=*|DRIVE_FOLDER_ID=*)
        key="${line%%=*}"
        raw="${line#*=}"
        raw="${raw#\'}"; raw="${raw%\'}"
        raw="${raw#\"}"; raw="${raw%\"}"
        val="$(config_sanitize_value "$raw")"
        if [[ "$val" != "$raw" ]]; then
          repaired=1
        fi
        quoted="$(config_quote_shell "$val")"
        printf '%s=%s\n' "$key" "$quoted" >>"$tmp"
        ;;
      *)
        printf '%s\n' "$line" >>"$tmp"
        ;;
    esac
  done <"$cfg"

  if [[ "$repaired" == "1" ]]; then
    mv "$tmp" "$cfg"
    chmod 600 "$cfg" 2>/dev/null || true
  else
    rm -f "$tmp"
  fi
}

config_save_key() {
  local key="$1"
  local value="$2"
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  if [[ ! -f "$cfg" ]]; then
    cp "${INGEST_ROOT}/config.example.env" "$cfg"
    chmod 600 "$cfg"
  fi
  value="$(config_sanitize_value "$value")"
  local quoted
  quoted="$(config_quote_shell "$value")"
  local tmp="${cfg}.tmp.$$"
  local found=0

  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ ^${key}= ]]; then
      printf '%s=%s\n' "$key" "$quoted"
      found=1
    else
      printf '%s\n' "$line"
    fi
  done <"$cfg" >"$tmp"

  if [[ "$found" == "0" ]]; then
    printf '%s=%s\n' "$key" "$quoted" >>"$tmp"
  fi
  mv "$tmp" "$cfg"
  chmod 600 "$cfg" 2>/dev/null || true
}

config_load() {
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  if [[ ! -f "$cfg" ]]; then
    return 1
  fi
  config_repair_file "$cfg"
  # shellcheck disable=SC1090
  set -a
  source "$cfg"
  set +a

  : "${MUX_TOKEN_ID:=}"
  : "${MUX_TOKEN_SECRET:=}"
  : "${MUX_API_BASE:=https://api.mux.com}"
  : "${RCLONE_REMOTE:=gdrive}"
  : "${RCLONE_FOLDER:=}"
  : "${DRIVE_FOLDER_ID:=}"
  : "${MUX_PLAYBACK_POLICY:=public}"
  : "${MUX_ENCODING_TIER:=smart}"
  : "${MUX_NORMALIZE_AUDIO:=true}"
  : "${MUX_MP4_SUPPORT:=none}"
  : "${MUX_MAX_RESOLUTION_TIER:=1080p}"
  : "${PROJECTS_TS_PATH:=../../frontend/src/data/projects.ts}"
  : "${MANIFEST_PATH:=./ingest-manifest.json}"
  : "${STATE_DIR:=./state}"
  : "${TMP_DIR:=./tmp}"
  : "${LOG_DIR:=./logs}"
  : "${OUTPUT_DIR:=./output}"
  : "${DEFAULT_POSTER_PERCENT:=25}"
  : "${DEFAULT_PREVIEW_SECONDS:=4}"
  : "${PREVIEW_END_OFFSET:=0}"
  : "${EXCLUDE_GLOBS:=draft-*,_*,*.srt,*.vtt,*.jpg,*.png}"
  : "${MIN_FREE_DISK_GB:=10}"
  : "${MUX_POLL_INTERVAL_SEC:=5}"
  : "${MUX_POLL_MAX_WAIT_SEC:=7200}"
  : "${MUX_UPLOAD_RETRIES:=3}"
  : "${CONFIRM_BATCH_GB:=20}"
  : "${CORS_ORIGIN:=*}"

  CONFIG_LOADED=1
  return 0
}

config_mask_secret() {
  local val="$1"
  if [[ -z "$val" || ${#val} -lt 4 ]]; then
    printf '***'
  else
    printf '***%s' "${val: -4}"
  fi
}

config_validate() {
  local errors=0

  if [[ -z "${MUX_TOKEN_ID}" || "${MUX_TOKEN_ID}" == "your_token_id" ]]; then
    ui_err "E010: MUX_TOKEN_ID is not set in config.env"
    errors=$((errors + 1))
  fi
  if [[ -z "${MUX_TOKEN_SECRET}" || "${MUX_TOKEN_SECRET}" == "your_token_secret" ]]; then
    ui_err "E010: MUX_TOKEN_SECRET is not set in config.env"
    errors=$((errors + 1))
  fi

  case "${MUX_MAX_RESOLUTION_TIER}" in
    1080p|2160p) ;;
    *)
      ui_err "E011: MUX_MAX_RESOLUTION_TIER must be 1080p or 2160p"
      errors=$((errors + 1))
      ;;
  esac

  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  if [[ -f "$cfg" ]]; then
    local perms
    perms="$(stat -c '%a' "$cfg" 2>/dev/null || stat -f '%OLp' "$cfg" 2>/dev/null || echo "")"
    if [[ -n "$perms" && "$perms" != "600" && "$perms" != "400" ]]; then
      ui_warn "E012: config.env permissions are $perms (recommended: chmod 600 $cfg)"
    fi
  fi

  local projects_path
  projects_path="$(config_resolve_path PROJECTS_TS_PATH)"
  if [[ ! -r "$projects_path" ]]; then
    ui_err "E060: projects.ts not readable at $projects_path"
    errors=$((errors + 1))
  elif ! grep -q 'export const projects' "$projects_path" 2>/dev/null; then
    ui_err "E060: projects.ts does not contain 'export const projects'"
    errors=$((errors + 1))
  fi

  for dir_key in STATE_DIR TMP_DIR LOG_DIR OUTPUT_DIR; do
    local d
    d="$(config_resolve_path "$dir_key")"
    mkdir -p "$d"
    if [[ ! -w "$d" ]]; then
      ui_err "E051: Directory not writable: $d"
      errors=$((errors + 1))
    fi
  done

  return "$errors"
}

config_ensure_dirs() {
  mkdir -p "$(config_resolve_path STATE_DIR)"
  mkdir -p "$(config_resolve_path TMP_DIR)"
  mkdir -p "$(config_resolve_path LOG_DIR)"
  mkdir -p "$(config_resolve_path OUTPUT_DIR)"
}

config_is_complete() {
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  [[ -f "$cfg" ]] || return 1
  config_load || return 1
  [[ -n "${MUX_TOKEN_ID}" && "${MUX_TOKEN_ID}" != "your_token_id" ]] || return 1
  [[ -n "${MUX_TOKEN_SECRET}" && "${MUX_TOKEN_SECRET}" != "your_token_secret" ]] || return 1
  [[ -n "${RCLONE_FOLDER}" || -n "${DRIVE_FOLDER_ID}" ]] || return 1
  command -v rclone >/dev/null 2>&1 || return 1
  rclone listremotes 2>/dev/null | grep -q "^${RCLONE_REMOTE:-gdrive}:$" || return 1
  return 0
}
