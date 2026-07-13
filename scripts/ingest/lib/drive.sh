#!/usr/bin/env bash
# Google Drive operations via rclone.

VIDEO_EXTENSIONS='\.(mp4|mov|mkv|webm|m4v)$'

drive_slug_from_filename() {
  local name="$1"
  local base="${name%.*}"
  base="$(printf '%s' "$base" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr '_' '-')"
  base="$(printf '%s' "$base" | sed 's/[^a-z0-9-]//g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')"
  printf '%s' "$base"
}

drive_is_video() {
  local name="$1"
  [[ "$name" =~ $VIDEO_EXTENSIONS ]]
}

drive_matches_exclude() {
  local name="$1"
  local basename="${name##*/}"
  local IFS=','
  read -ra globs <<<"${EXCLUDE_GLOBS}"
  local g
  for g in "${globs[@]}"; do
    g="$(printf '%s' "$g" | xargs)"
    [[ -z "$g" ]] && continue
    case "$basename" in
      $g) return 0 ;;
    esac
  done
  return 1
}

drive_rclone_cmd() {
  if [[ "${INGEST_MOCK:-0}" == "1" ]]; then
    printf '%s' "${INGEST_ROOT}/test/fixtures/rclone-mock.sh"
  else
    printf 'rclone'
  fi
}

drive_remote_spec() {
  if [[ -n "${DRIVE_FOLDER_ID}" ]]; then
    printf '%s:' "${RCLONE_REMOTE}"
  elif [[ -n "${RCLONE_FOLDER}" ]]; then
    printf '%s:%s' "${RCLONE_REMOTE}" "${RCLONE_FOLDER}"
  else
    ui_err "E021: Set RCLONE_FOLDER or DRIVE_FOLDER_ID in config.env"
    return 1
  fi
}

drive_list_json() {
  local remote
  remote="$(drive_remote_spec)" || return 1
  local rclone
  rclone="$(drive_rclone_cmd)"

  local args=(lsjson "$remote" --files-only)
  if [[ -n "${DRIVE_FOLDER_ID}" ]]; then
    args+=(--drive-root-folder-id="${DRIVE_FOLDER_ID}")
  fi

  log_debug "drive_list_json: $rclone ${args[*]}"
  local out err code
  if ! out="$("$rclone" "${args[@]}" 2>&1)"; then
    err="$out"
    if echo "$err" | grep -qiE '401|403|couldn.t find|directory not found|access denied'; then
      ui_err "E020: Drive access failed — re-run rclone config and verify folder is shared"
      log_error "$err"
      return 4
    fi
    if echo "$err" | grep -qi '429'; then
      ui_err "E022: Drive rate limited — wait and retry"
      return 4
    fi
    ui_err "E021: Could not list Drive folder: $err"
    return 2
  fi
  printf '%s' "$out"
}

drive_scan() {
  local raw
  raw="$(drive_list_json)" || return $?
  if [[ -z "$raw" || "$raw" == "[]" ]]; then
  if [[ "${INGEST_JSON:-0}" == "1" ]]; then
    printf '[]'
  else
    ui_warn "No files found in configured Drive folder."
  fi
    return 0
  fi

  local manifest_path
  manifest_path="$(config_resolve_path MANIFEST_PATH)"
  local manifest='{}'
  if [[ -f "$manifest_path" ]]; then
    manifest="$(jq -c '
      reduce .entries[]? as $e ({}; .[$e.driveFileId // $e.filename] = $e)
    ' "$manifest_path" 2>/dev/null || echo '{}')"
  fi

  local results='[]'
  local item name id mod size slug="" status project_exists skip_reason

  while IFS= read -r item; do
    [[ -z "$item" ]] && continue
    slug=""
    name="$(printf '%s' "$item" | jq -r '.Name')"
    id="$(printf '%s' "$item" | jq -r '.ID')"
    mod="$(printf '%s' "$item" | jq -r '.ModTime')"
    size="$(printf '%s' "$item" | jq -r '.Size')"

    skip_reason=""
    status="new"

    if drive_matches_exclude "$name"; then
      status="excluded"
      skip_reason="matches EXCLUDE_GLOBS"
    elif ! drive_is_video "$name"; then
      status="excluded"
      skip_reason="not a video extension"
    fi

    local manifest_entry='null'
    manifest_entry="$(printf '%s' "$manifest" | jq --arg id "$id" --arg fn "$name" '.[$id] // .[$fn] // null')"

    if [[ "$manifest_entry" != "null" ]]; then
      if [[ "$(printf '%s' "$manifest_entry" | jq -r '.skip // false')" == "true" ]]; then
        status="excluded"
        skip_reason="manifest skip:true"
      fi
      slug="$(printf '%s' "$manifest_entry" | jq -r '.projectId // empty')"
    fi
    if [[ -z "${slug:-}" ]]; then
      slug="$(drive_slug_from_filename "$name")"
    fi

    if [[ "$status" != "excluded" ]]; then
      if state_should_skip "$id" "$mod"; then
        status="ingested"
        skip_reason="already ingested (unchanged)"
      fi
      local existing_state
      existing_state="$(state_get_by_drive_id "$id" 2>/dev/null || true)"
      if [[ -n "$existing_state" && "$existing_state" != "null" ]]; then
        local st
        st="$(printf '%s' "$existing_state" | jq -r '.status')"
        if [[ "$st" == "failed" ]]; then
          status="failed"
          skip_reason="$(printf '%s' "$existing_state" | jq -r '.errorMessage // ""')"
        elif [[ "$st" == "ready" && "$status" == "new" ]]; then
          status="ingested"
        fi
      fi
    fi

    project_exists="false"
    if projects_id_exists "$slug"; then
      project_exists="true"
    fi

    results="$(printf '%s' "$results" | jq \
      --arg name "$name" \
      --arg id "$id" \
      --arg mod "$mod" \
      --argjson size "$size" \
      --arg slug "$slug" \
      --arg status "$status" \
      --arg skip_reason "$skip_reason" \
      --arg project_exists "$project_exists" \
      '. + [{
        driveFileId: $id,
        driveFileName: $name,
        driveModifiedTime: $mod,
        driveSizeBytes: $size,
        projectId: $slug,
        status: $status,
        skipReason: $skip_reason,
        existsInProjectsTs: ($project_exists == "true")
      }]')"
  done < <(printf '%s' "$raw" | jq -c '.[]')

  printf '%s' "$results"
}

drive_download() {
  local remote_path="$1"
  local local_path="$2"
  local rclone
  rclone="$(drive_rclone_cmd)"

  if [[ "${INGEST_DRY_RUN:-0}" == "1" ]]; then
    log_info "[dry-run] Would download $remote_path → $local_path"
    return 0
  fi

  mkdir -p "$(dirname "$local_path")"
  local remote
  remote="$(drive_remote_spec)" || return 1

  local src="${remote%/}"
  if [[ -n "${RCLONE_FOLDER}" && -z "${DRIVE_FOLDER_ID}" ]]; then
    src="${RCLONE_REMOTE}:${RCLONE_FOLDER}/${remote_path}"
  else
    src="${RCLONE_REMOTE}:${remote_path}"
  fi

  log_info "Downloading $remote_path..."
  if [[ -t 1 && "${INGEST_QUIET:-0}" != "1" ]]; then
  if ! "$rclone" copyto "$src" "$local_path" --progress --partial-links --retries 3 --low-level-retries 10; then
      ui_err "E030: Download failed for $remote_path"
      return 3
    fi
  else
    if ! "$rclone" copyto "$src" "$local_path" --partial-links --retries 3 --low-level-retries 10; then
      ui_err "E030: Download failed for $remote_path"
      return 3
    fi
  fi

  if [[ ! -f "$local_path" ]]; then
    ui_err "E031: Download incomplete — file missing at $local_path"
    return 3
  fi
  return 0
}

drive_free_disk_gb() {
  local target
  target="$(config_resolve_path TMP_DIR)"
  df -BG "$target" 2>/dev/null | awk 'NR==2 {gsub(/G/,"",$4); print $4}' || echo "999"
}

drive_check_disk_space() {
  local needed_bytes="$1"
  local free_gb
  free_gb="$(drive_free_disk_gb)"
  local needed_gb
  needed_gb=$(( (needed_bytes + 1073741823) / 1073741824 ))
  local min_gb="${MIN_FREE_DISK_GB}"
  if [[ "$free_gb" -lt $((needed_gb + min_gb)) ]]; then
    ui_err "E050: Not enough disk space. Need ~${needed_gb}GB + ${min_gb}GB buffer, have ${free_gb}GB free"
    return 1
  fi
  return 0
}

# Store last scan for interactive pick
INGEST_LAST_SCAN='[]'

drive_print_scan() {
  local results="$1"
  INGEST_LAST_SCAN="$results"
  if [[ "${INGEST_JSON:-0}" == "1" ]]; then
    printf '%s\n' "$results" | jq .
    return 0
  fi
  ui_section "Drive folder scan"
  ui_table_header "$(printf '%-4s %-30s %-10s %-20s %-10s %s' '#' 'Filename' 'Size' 'Project ID' 'Status' 'In projects.ts')"
  local i=0
  while IFS= read -r row; do
  i=$((i + 1))
    local name slug st size_bytes exists
    name="$(printf '%s' "$row" | jq -r '.driveFileName')"
    slug="$(printf '%s' "$row" | jq -r '.projectId')"
    st="$(printf '%s' "$row" | jq -r '.status')"
    size_bytes="$(printf '%s' "$row" | jq -r '.driveSizeBytes')"
    exists="$(printf '%s' "$row" | jq -r '.existsInProjectsTs')"
    local size_human
    size_human="$(ui_format_bytes "$size_bytes")"
    local exists_mark="no"
    [[ "$exists" == "true" ]] && exists_mark="yes"
    printf '%-4s %-30s %-10s %-20s %-10s %s\n' "$i" "$name" "$size_human" "$slug" "$st" "$exists_mark"
    local reason
    reason="$(printf '%s' "$row" | jq -r '.skipReason // empty')"
    if [[ -n "$reason" ]]; then
      ui_dim "     → $reason"
    fi
  done < <(printf '%s' "$results" | jq -c '.[]')
  printf '\nLegend: new | ingested | excluded | failed\n'
}
