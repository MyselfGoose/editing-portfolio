#!/usr/bin/env bash
# Prerequisite checks, first-run onboarding, and automated setup wizard.

doctor_check_bash() {
  if [[ "${BASH_VERSINFO[0]}" -lt 4 ]]; then
    ui_err "E001: Bash 4.0+ required (found ${BASH_VERSION})"
    return 1
  fi
  return 0
}

doctor_check_cmd() {
  command -v "$1" >/dev/null 2>&1
}

doctor_install_hint() {
  deps_detect_os
  case "$DEPS_OS_FAMILY" in
    arch) printf 'sudo pacman -S %s' "$1" ;;
    macos) printf 'brew install %s' "$1" ;;
    fedora) printf 'sudo dnf install %s' "$1" ;;
    *) printf 'sudo apt install %s' "$1" ;;
  esac
}

doctor_missing_items() {
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  local items=()

  doctor_check_cmd curl || items+=("curl")
  doctor_check_cmd jq || items+=("jq")
  doctor_check_cmd rclone || items+=("rclone")
  probe_has_ffprobe || items+=("ffprobe (optional)")

  [[ ! -f "$cfg" ]] && items+=("config.env")

  if [[ -f "$cfg" ]]; then
    config_repair_file "$cfg"
    # shellcheck disable=SC1090
    set -a
    # shellcheck disable=SC1091
    source "$cfg" 2>/dev/null || true
    set +a
    [[ -z "${MUX_TOKEN_ID:-}" || "${MUX_TOKEN_ID}" == "your_token_id" ]] && items+=("MUX_TOKEN_ID")
    [[ -z "${MUX_TOKEN_SECRET:-}" || "${MUX_TOKEN_SECRET}" == "your_token_secret" ]] && items+=("MUX_TOKEN_SECRET")
    local remote="${RCLONE_REMOTE:-gdrive}"
    if doctor_check_cmd rclone && ! rclone listremotes 2>/dev/null | grep -q "^${remote}:$"; then
      items+=("rclone remote '${remote}'")
    fi
    [[ -z "${RCLONE_FOLDER:-}" && -z "${DRIVE_FOLDER_ID:-}" ]] && items+=("Drive folder path")
  else
    items+=("MUX_TOKEN_ID")
    items+=("MUX_TOKEN_SECRET")
    items+=("rclone remote 'gdrive'")
  fi

  printf '%s\n' "${items[@]}"
}

setup_ensure_config() {
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  INGEST_CONFIG_FILE="$cfg"
  if [[ -f "$cfg" ]]; then
    ui_ok "config.env exists"
    chmod 600 "$cfg" 2>/dev/null || true
    return 0
  fi
  cp "${INGEST_ROOT}/config.example.env" "$cfg"
  chmod 600 "$cfg"
  ui_ok "Created $cfg"
  config_load || true
}

setup_mux_credentials() {
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  config_load 2>/dev/null || true

  local need_id=0 need_secret=0
  [[ -z "${MUX_TOKEN_ID:-}" || "${MUX_TOKEN_ID}" == "your_token_id" ]] && need_id=1
  [[ -z "${MUX_TOKEN_SECRET:-}" || "${MUX_TOKEN_SECRET}" == "your_token_secret" ]] && need_secret=1

  if [[ "$need_id" -eq 0 && "$need_secret" -eq 0 ]]; then
    ui_ok "Mux credentials already configured"
    return 0
  fi

  ui_section "Mux API keys"
  printf '%s\n' \
    'Open https://dashboard.mux.com/settings/access-tokens' \
    '→ Generate new token → enable Mux Video Read + Write' \
    '→ Copy both values and paste below (Secret is shown only once)' \
    '' >&2

  local token_id token_secret
  if [[ "$need_id" -eq 1 ]]; then
    token_id="$(ui_prompt "Token ID")"
    while [[ -z "$token_id" ]]; do
      token_id="$(ui_prompt "Token ID")"
    done
    config_save_key "MUX_TOKEN_ID" "$token_id"
    ui_ok "Token ID saved"
  fi

  if [[ "$need_secret" -eq 1 ]]; then
    ui_dim "Token Secret (hidden as you type)" >&2
    token_secret="$(ui_prompt_secret "Token Secret")"
    while [[ -z "$token_secret" ]]; do
      token_secret="$(ui_prompt_secret "Token Secret")"
    done
    config_save_key "MUX_TOKEN_SECRET" "$token_secret"
    ui_ok "Token Secret saved"
  fi

  config_load
  ui_ok "Mux credentials saved"
}

setup_drive_folder() {
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  config_load 2>/dev/null || true

  if [[ -n "${RCLONE_FOLDER:-}" || -n "${DRIVE_FOLDER_ID:-}" ]]; then
    if [[ "${INGEST_MOCK:-0}" != "1" ]] && doctor_check_cmd rclone; then
      if drive_list_json >/dev/null 2>&1; then
        ui_ok "Drive folder: ${RCLONE_FOLDER:-${DRIVE_FOLDER_ID}}"
        return 0
      fi
      ui_warn "Previous folder not reachable — pick again"
    else
      ui_ok "Drive folder configured"
      return 0
    fi
  fi

  ui_section "Google Drive folder"
  local remote="${RCLONE_REMOTE:-gdrive}"
  local folder=""

  if doctor_check_cmd rclone && rclone listremotes 2>/dev/null | grep -q "^${remote}:$"; then
    local -a folders=()
    while IFS= read -r name; do
      [[ -n "$name" ]] && folders+=("$name")
    done < <(rclone lsd "${remote}:" 2>/dev/null | awk '{print $NF}')

    if [[ "${#folders[@]}" -gt 0 ]]; then
      printf '\nPick the folder with your video files:\n' >&2
      local i=1 f
      for f in "${folders[@]}"; do
        printf '  %2d) %s\n' "$i" "$f" >&2
        i=$((i + 1))
      done
      printf '   c) Type a path manually\n\n' >&2

      local pick
      pick="$(ui_prompt "Folder # or c")"
      if [[ "${pick,,}" == "c" ]]; then
        folder="$(ui_prompt "Folder path (e.g. Portfolio/Wedding Videos)")"
      elif [[ "$pick" =~ ^[0-9]+$ ]] && [[ "$pick" -ge 1 && "$pick" -lt "$i" ]]; then
        folder="${folders[$((pick - 1))]}"
        printf '\nSubfolder inside "%s" (Enter if videos are here): ' "$folder" >&2
        local sub=""
        read -r sub
        sub="$(printf '%s' "$sub" | sed -E 's/^["'\'']|["'\'']$//g')"
        if [[ -n "$sub" ]]; then
          folder="${folder}/${sub}"
        fi
      else
        folder="$pick"
      fi
    fi
  fi

  if [[ -z "$folder" ]]; then
    folder="$(ui_prompt "Folder path (e.g. Portfolio/Wedding Videos)")"
  fi

  folder="$(config_sanitize_value "$folder")"
  while [[ -z "$folder" ]]; do
    folder="$(ui_prompt "Folder path")"
    folder="$(config_sanitize_value "$folder")"
  done

  config_save_key "RCLONE_FOLDER" "$folder"
  config_load

  if drive_list_json >/dev/null 2>&1; then
    ui_ok "Drive folder works: ${folder}"
    return 0
  fi

  ui_warn "Could not list '${folder}' — double-check the path in Google Drive."
  ui_dim "Tip: use Portfolio/Wedding Videos (no quotes)" >&2
  ui_confirm "Keep this path anyway?" && return 0
  return 1
}

setup_run() {
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  INGEST_CONFIG_FILE="$cfg"

  ui_banner
  printf 'Quick setup — only 3 things need you:\n' >&2
  printf '  1) Mux API keys (paste from dashboard)\n' >&2
  printf '  2) Google sign-in (browser, if rclone not done yet)\n' >&2
  printf '  3) Pick your Drive folder from a list\n\n' >&2

  if [[ "${INGEST_OFFLINE:-0}" == "1" ]]; then
    ui_err "Setup cannot run in offline mode"
    return 2
  fi

  config_repair_file "$cfg"

  ui_section "Installing tools"
  deps_install_all || true

  setup_ensure_config
  config_ensure_dirs

  ui_section "Mux API keys"
  setup_mux_credentials || return 2

  ui_section "Google Drive"
  setup_rclone_remote || true
  setup_drive_folder || true

  printf '\n'
  if doctor_run; then
    ui_ok "Setup complete. Run: ./ingest.sh scan"
    return 0
  fi

  ui_warn "Almost there — run ./ingest.sh setup again to fix remaining items"
  return 2
}

setup_rclone_remote() {
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  config_load 2>/dev/null || true
  local remote="${RCLONE_REMOTE:-gdrive}"

  if ! doctor_check_cmd rclone; then
    ui_err "rclone not available after install — check PATH or re-run setup"
    return 1
  fi

  if rclone listremotes 2>/dev/null | grep -q "^${remote}:$"; then
    ui_ok "rclone remote '${remote}' already configured"
    return 0
  fi

  ui_section "Google Drive authorization"
  printf 'Next: connect your Google account to rclone.\n\n'
  printf 'In the rclone prompts, choose:\n'
  printf '  1. n) New remote\n'
  printf '  2. Name: %s\n' "$remote"
  printf '  3. Storage: drive (Google Drive)\n'
  printf '  4. client_id / client_secret: press Enter (defaults)\n'
  printf '  5. scope: 1 (read-only recommended)\n'
  printf '  6. auto config: Y (opens browser)\n'
  printf '  7. Configure as Shared Drive: n (unless you use one)\n\n'

  config_save_key "RCLONE_REMOTE" "$remote"

  if ! ui_confirm "Launch rclone config now?"; then
    ui_warn "Skipped rclone config — run manually: rclone config"
    return 1
  fi

  printf '\n'
  rclone config
  printf '\n'

  if rclone listremotes 2>/dev/null | grep -q "^${remote}:$"; then
    ui_ok "rclone remote '${remote}' configured"
    return 0
  fi

  ui_warn "Remote '${remote}' still not found. You can rename an existing remote in config.env (RCLONE_REMOTE)."
  local existing
  existing="$(rclone listremotes 2>/dev/null | head -1 | tr -d ':')"
  if [[ -n "$existing" ]]; then
    if ui_confirm "Use existing remote '${existing}' instead?"; then
      config_save_key "RCLONE_REMOTE" "$existing"
      ui_ok "Set RCLONE_REMOTE=${existing}"
      return 0
    fi
  fi
  return 1
}

doctor_run() {
  local offline="${INGEST_OFFLINE:-0}"
  local fix="${DOCTOR_FIX:-0}"
  local failures=0
  local warnings=0

  if [[ "${INGEST_QUIET:-0}" != "1" && "${INGEST_JSON:-0}" != "1" ]]; then
    ui_banner
  fi

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
      printf '%-24s ' "$cmd"; ui_err "missing"
      if [[ "$fix" == "1" ]]; then
        deps_install_tool "$cmd" && ui_ok "installed ${cmd}" || failures=$((failures + 1))
      else
        ui_dim "       → $(doctor_install_hint "$cmd")"
        failures=$((failures + 1))
      fi
    fi
  done

  if [[ "$offline" != "1" ]]; then
    if doctor_check_cmd rclone; then
      printf '%-24s ' "rclone"; ui_ok "found"
    else
      printf '%-24s ' "rclone"; ui_err "missing"
      if [[ "$fix" == "1" ]]; then
        if deps_install_tool rclone; then
          ui_ok "installed rclone"
        else
          failures=$((failures + 1))
        fi
      else
        failures=$((failures + 1))
      fi
    fi
  else
    printf '%-24s ' "rclone"; ui_dim "skipped (offline)"
  fi

  if probe_has_ffprobe; then
    printf '%-24s ' "ffprobe"; ui_ok "found"
  else
    printf '%-24s ' "ffprobe"; ui_warn "optional — install ffmpeg"
    if [[ "$fix" == "1" ]]; then
      deps_install_optional
    fi
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
      setup_ensure_config
    fi
  fi

  if [[ "$offline" != "1" && -f "$cfg" ]] && config_load 2>/dev/null; then
    if doctor_check_cmd rclone; then
      if rclone listremotes 2>/dev/null | grep -q "^${RCLONE_REMOTE}:$"; then
        printf '%-24s ' "rclone remote"; ui_ok "${RCLONE_REMOTE}"
      else
        printf '%-24s ' "rclone remote"; ui_err "not configured"
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
      printf '%-24s ' "Mux credentials"; ui_err "not set"
      failures=$((failures + 1))
    fi

    if [[ -n "${RCLONE_FOLDER}" || -n "${DRIVE_FOLDER_ID}" ]]; then
      if [[ "${INGEST_MOCK:-0}" == "1" ]]; then
        printf '%-24s ' "Drive folder"; ui_ok "mocked"
      elif drive_list_json >/dev/null 2>&1; then
        printf '%-24s ' "Drive folder"; ui_ok "reachable"
      else
        printf '%-24s ' "Drive folder"; ui_err "not reachable"
        failures=$((failures + 1))
      fi
    else
      printf '%-24s ' "Drive folder"; ui_err "not set"
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
    printf '%-24s ' "projects.ts"; ui_err "E060: not found"
    failures=$((failures + 1))
  fi

  local free_gb
  free_gb="$(drive_free_disk_gb 2>/dev/null || echo "?")"
  printf '%-24s ' "disk space"; ui_ok "${free_gb}GB free in tmp"

  printf '\n'
  if [[ "$failures" -gt 0 ]]; then
    ui_err "$failures check(s) failed, $warnings warning(s)"
    if [[ "$fix" != "1" ]]; then
      ui_dim "Run: ./ingest.sh setup   (automated first-time setup)"
    fi
    return 2
  fi
  ui_ok "All checks passed ($warnings warning(s))"
  return 0
}

doctor_first_run() {
  local cfg="${INGEST_CONFIG_FILE:-${INGEST_ROOT}/config.env}"
  INGEST_CONFIG_FILE="$cfg"

  if config_is_complete 2>/dev/null; then
    if drive_list_json >/dev/null 2>&1; then
      return 0
    fi
  fi

  ui_banner
  printf 'Status: Not configured\n\n'
  printf 'Missing:\n'
  local item
  while IFS= read -r item; do
    [[ -z "$item" ]] && continue
    printf '  ✗ %s\n' "$item"
  done < <(doctor_missing_items)
  printf '\n'
  printf 'This script will:\n' >&2
  printf '  1. Install any missing tools automatically\n' >&2
  printf '  2. Ask for Mux API keys (paste from dashboard)\n' >&2
  printf '  3. Let you pick your Drive folder from a list\n\n' >&2

  if ui_confirm "Run setup now?"; then
    setup_run
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
