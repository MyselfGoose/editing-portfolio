#!/usr/bin/env bash
# Prerequisite checks and first-run onboarding.

doctor_check_bash() {
  if [[ "${BASH_VERSINFO[0]}" -lt 4 ]]; then
    ui_err "E001: Bash 4.0+ required (found ${BASH_VERSION})"
  return 1
  fi
  return 0
}

doctor_check_cmd() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1
}

doctor_install_hint() {
  if [[ "$(uname -s)" == "Darwin" ]]; then
    printf 'brew install %s' "$1"
  else
    printf 'sudo apt install %s' "$1"
  fi
}

doctor_run() {
  local offline="${INGEST_OFFLINE:-0}"
  local fix="${DOCTOR_FIX:-0}"
  local failures=0
  local warnings=0

  ui_banner

  if [[ "$offline" == "1" ]]; then
    ui_dim "Running in offline mode (skipping network checks)"
  fi

  ui_section "Prerequisite checks"
  printf '%-24s %s\n' "Check" "Result"

  if doctor_check_bash; then
    printf '%-24s ' "bash"; ui_ok "${BASH_VERSION}"
  else
    printf '%-24s ' "bash"; ui_err "fail"; failures=$((failures + 1))
  fi

  for cmd in curl jq; do
    if doctor_check_cmd "$cmd"; then
      printf '%-24s ' "$cmd"; ui_ok "found"
    else
      printf '%-24s ' "$cmd"; ui_err "missing — $(doctor_install_hint "$cmd")"
      failures=$((failures + 1))
    fi
  done

  if [[ "$offline" != "1" ]]; then
    if doctor_check_cmd rclone; then
      printf '%-24s ' "rclone"; ui_ok "found"
    else
      printf '%-24s ' "rclone"; ui_err "missing — install from https://rclone.org/install/"
      failures=$((failures + 1))
    fi
  else
    printf '%-24s ' "rclone"; ui_dim "skipped (offline)"
  fi

  if probe_has_ffprobe; then
    printf '%-24s ' "ffprobe"; ui_ok "found"
  else
    printf '%-24s ' "ffprobe"; ui_warn "optional — install ffmpeg for auto duration/aspect"
    warnings=$((warnings + 1))
  fi

  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  if [[ -f "$cfg" ]]; then
    printf '%-24s ' "config.env"; ui_ok "found"
    if config_load; then
      if config_validate; then
        printf '%-24s ' "config valid"; ui_ok "ok"
      else
        printf '%-24s ' "config valid"; ui_err "invalid"
        failures=$((failures + 1))
      fi
    fi
  else
    printf '%-24s ' "config.env"; ui_err "missing"
    failures=$((failures + 1))
    if [[ "$fix" == "1" ]]; then
      cp "${INGEST_ROOT}/config.example.env" "$cfg"
      chmod 600 "$cfg"
      ui_ok "Created $cfg from config.example.env — edit with your credentials"
    fi
  fi

  if [[ "$offline" != "1" && -f "$cfg" ]] && config_load 2>/dev/null; then
    if doctor_check_cmd rclone; then
      if rclone listremotes 2>/dev/null | grep -q "^${RCLONE_REMOTE}:$"; then
        printf '%-24s ' "rclone remote"; ui_ok "${RCLONE_REMOTE}"
      else
        printf '%-24s ' "rclone remote"; ui_err "E003: remote '${RCLONE_REMOTE}' not configured — run: rclone config"
        failures=$((failures + 1))
      fi
    fi

    if [[ -n "${MUX_TOKEN_ID}" && "${MUX_TOKEN_ID}" != "your_token_id" ]]; then
      printf '%-24s ' "Mux credentials"; ui_ok "configured ($(config_mask_secret "${MUX_TOKEN_ID}"))"
      if [[ "${INGEST_OFFLINE}" != "1" && "${INGEST_MOCK:-0}" != "1" ]]; then
        local http_code
        http_code="$(curl -sS -o /dev/null -w '%{http_code}' \
          -H "Authorization: $(mux_auth_header 2>/dev/null || echo '')" \
          "${MUX_API_BASE}/video/v1/assets?limit=1" 2>/dev/null || echo "000")"
        if [[ "$http_code" == "200" ]]; then
          printf '%-24s ' "Mux API"; ui_ok "reachable"
        elif [[ "$http_code" == "401" || "$http_code" == "403" ]]; then
          printf '%-24s ' "Mux API"; ui_err "E040: auth failed"
          failures=$((failures + 1))
        else
          printf '%-24s ' "Mux API"; ui_warn "could not verify (HTTP $http_code)"
        fi
      fi
    else
      printf '%-24s ' "Mux credentials"; ui_err "not set — https://dashboard.mux.com/settings/access-tokens"
      failures=$((failures + 1))
    fi

    if [[ -n "${RCLONE_FOLDER}" || -n "${DRIVE_FOLDER_ID}" ]]; then
      if [[ "${INGEST_MOCK:-0}" == "1" ]]; then
        printf '%-24s ' "Drive folder"; ui_ok "mocked"
      elif drive_list_json >/dev/null 2>&1; then
        printf '%-24s ' "Drive folder"; ui_ok "reachable"
      else
        printf '%-24s ' "Drive folder"; ui_err "E020/E021: not reachable"
        failures=$((failures + 1))
      fi
    else
      printf '%-24s ' "Drive folder"; ui_err "E021: set RCLONE_FOLDER or DRIVE_FOLDER_ID"
      failures=$((failures + 1))
    fi
  fi

  local projects_path
  if [[ "${CONFIG_LOADED:-0}" == "1" ]]; then
    projects_path="$(config_resolve_path PROJECTS_TS_PATH)"
  else
    projects_path="${INGEST_ROOT}/../../frontend/src/data/projects.ts"
  fi
  if [[ -r "$projects_path" ]]; then
    printf '%-24s ' "projects.ts"; ui_ok "readable"
  else
    printf '%-24s ' "projects.ts"; ui_err "E060: not found at $projects_path"
    failures=$((failures + 1))
  fi

  local free_gb
  free_gb="$(drive_free_disk_gb 2>/dev/null || echo "?")"
  printf '%-24s ' "disk space"; ui_ok "${free_gb}GB free in tmp"

  printf '\n'
  if [[ "$failures" -gt 0 ]]; then
    ui_err "$failures check(s) failed, $warnings warning(s)"
    return 2
  fi
  ui_ok "All checks passed ($warnings warning(s))"
  return 0
}

doctor_first_run() {
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  if [[ -f "$cfg" ]] && config_load 2>/dev/null && config_validate 2>/dev/null; then
    return 0
  fi

  ui_banner
  printf 'Status: Not configured\n\n'
  printf 'Missing:\n'
  [[ ! -f "$cfg" ]] && printf '  ✗ config.env (copy from config.example.env)\n'
  printf '  ✗ rclone remote '\''gdrive'\'' (or Google credentials)\n'
  printf '  ✗ MUX_TOKEN_ID / MUX_TOKEN_SECRET\n\n'
  printf 'This script will:\n'
  printf '  1. Pull videos from your Google Drive folder\n'
  printf '  2. Upload them to Mux for streaming on goose-productions.com\n'
  printf '  3. Give you playback IDs for frontend/src/data/projects.ts\n\n'

  if ui_confirm "Run setup now?"; then
    DOCTOR_FIX=1 doctor_run
  fi
}

doctor_show_errors_help() {
  ui_section "Error code reference"
  cat <<'EOF'
E001  Bash version too old
E002  Missing curl or jq
E003  rclone not installed or remote missing
E004  ffprobe missing (warning only)
E010  config.env missing or incomplete
E011  Invalid config value
E012  config.env permissions insecure
E020  Drive auth failed
E021  Drive folder not found
E022  Drive rate limited
E023  Not a video file
E030  Network timeout
E031  Corrupt/incomplete download
E040  Mux auth failed
E041  Mux upload URL expired
E042  Mux encoding failed
E043  Duplicate in-flight job
E050  Disk full
E051  Directory not writable
E060  projects.ts unreadable
E061  Patch ambiguous
E070  Git dirty (warning)
E080  User interrupt
E090  Dry-run (informational)
EOF
}
