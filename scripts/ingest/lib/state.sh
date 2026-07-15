#!/usr/bin/env bash
# JSONL state store for ingest jobs.

STATE_FILE=""

state_init() {
  local state_dir
  state_dir="$(config_resolve_path STATE_DIR)"
  mkdir -p "$state_dir"
  STATE_FILE="${state_dir}/jobs.jsonl"
  touch "$STATE_FILE"
}

state_job_id() {
  local project_id="$1"
  local suffix
  suffix="$(date +%Y%m%d)_$(printf '%04x' "$RANDOM")"
  printf 'job_%s_%s_%s' "$(date +%Y%m%d)" "$project_id" "$suffix"
}

state_now() {
  date -u +%Y-%m-%dT%H:%M:%SZ
}

state_get_all() {
  if [[ ! -s "$STATE_FILE" ]]; then
    return 0
  fi
  jq -sc '
    reduce .[] as $item ({}; .[$item.driveFileId] = $item)
    | .[]
  ' "$STATE_FILE" 2>/dev/null || true
}

state_get_by_drive_id() {
  local drive_id="$1"
  if [[ ! -s "$STATE_FILE" ]]; then
    return 1
  fi
  jq -sc --arg id "$drive_id" '
    map(select(.driveFileId == $id)) | last // empty
  ' "$STATE_FILE"
}

state_get_by_job_id() {
  local job_id="$1"
  if [[ ! -s "$STATE_FILE" ]]; then
    return 1
  fi
  jq -sc --arg id "$job_id" '
    map(select(.jobId == $id)) | last // empty
  ' "$STATE_FILE"
}

state_get_by_project_id() {
  local project_id="$1"
  if [[ ! -s "$STATE_FILE" ]]; then
    return 1
  fi
  jq -sc --arg id "$project_id" '
    map(select(.projectId == $id)) | last // empty
  ' "$STATE_FILE"
}

state_upsert() {
  local record="$1"
  local drive_id
  drive_id="$(printf '%s' "$record" | jq -r '.driveFileId')"
  local tmp
  tmp="$(mktemp)"

  if [[ -s "$STATE_FILE" ]]; then
    jq -sc --argjson rec "$record" --arg id "$drive_id" '
      (map(select(.driveFileId != $id)) + [$rec]) | .[]
    ' "$STATE_FILE" >"$tmp" 2>/dev/null || printf '%s\n' "$record" >"$tmp"
  else
    printf '%s\n' "$record" >"$tmp"
  fi

  mv "$tmp" "$STATE_FILE"
}

state_new_record() {
  local drive_id="$1"
  local drive_name="$2"
  local modified="$3"
  local size="$4"
  local project_id="$5"
  local now
  now="$(state_now)"
  local existing=""
  existing="$(state_get_by_drive_id "$drive_id" 2>/dev/null || true)"

  local job_id retry=0 previous_playback="null"
  if [[ -n "$existing" && "$existing" != "null" ]]; then
    job_id="$(printf '%s' "$existing" | jq -r '.jobId')"
    retry="$(printf '%s' "$existing" | jq -r '.retryCount // 0')"
    previous_playback="$(printf '%s' "$existing" | jq -c '.playbackId // null')"
  else
    job_id="$(state_job_id "$project_id")"
  fi

  jq -nc \
    --arg jobId "$job_id" \
    --arg driveFileId "$drive_id" \
    --arg driveFileName "$drive_name" \
    --arg driveModifiedTime "$modified" \
    --argjson driveSizeBytes "$size" \
    --arg projectId "$project_id" \
    --arg status "discovered" \
    --arg startedAt "$now" \
    --arg updatedAt "$now" \
    --argjson retryCount "$retry" \
    --argjson previousPlaybackId "$previous_playback" \
    '{
      jobId: $jobId,
      driveFileId: $driveFileId,
      driveFileName: $driveFileName,
      driveModifiedTime: $driveModifiedTime,
      driveSizeBytes: $driveSizeBytes,
      projectId: $projectId,
      status: $status,
      muxUploadId: null,
      muxAssetId: null,
      playbackId: null,
      previousPlaybackId: $previousPlaybackId,
      localPath: null,
      downloadBytes: 0,
      metadata: null,
      startedAt: $startedAt,
      updatedAt: $updatedAt,
      completedAt: null,
      errorCode: null,
      errorMessage: null,
      retryCount: $retryCount
    }'
}

state_update_field() {
  local drive_id="$1"
  local patch="$2"
  if [[ -z "$patch" ]]; then
    log_error "state_update_field: empty patch for $drive_id"
    return 1
  fi
  local existing
  existing="$(state_get_by_drive_id "$drive_id")"
  if [[ -z "$existing" || "$existing" == "null" ]]; then
    log_error "E043: No state record for drive file $drive_id"
    return 1
  fi
  local merged
  if ! merged="$(printf '%s' "$existing" | jq -c --argjson patch "$patch" --arg now "$(state_now)" '
    . * $patch | .updatedAt = $now
  ' 2>/dev/null)"; then
    log_error "state_update_field: jq merge failed for $drive_id"
    return 1
  fi
  state_upsert "$merged"
  printf '%s' "$merged"
}

state_should_skip() {
  local drive_id="$1"
  local modified="$2"
  local existing
  existing="$(state_get_by_drive_id "$drive_id" 2>/dev/null || true)"
  if [[ "${INGEST_FORCE:-0}" == "1" ]]; then
    return 1
  fi
  if [[ -z "$existing" || "$existing" == "null" ]]; then
    return 1
  fi
  local status prev_mod
  status="$(printf '%s' "$existing" | jq -r '.status')"
  prev_mod="$(printf '%s' "$existing" | jq -r '.driveModifiedTime')"
  if [[ "$status" == "ready" && "$prev_mod" == "$modified" ]]; then
    return 0
  fi
  return 1
}

state_list_by_status() {
  local status_filter="${1:-}"
  if [[ ! -s "$STATE_FILE" ]]; then
    return 0
  fi
  if [[ -z "$status_filter" ]]; then
    state_get_all
  else
    jq -sc --arg s "$status_filter" '
      reduce .[] as $item ({}; .[$item.driveFileId] = $item)
      | [.[] | select(.status == $s)] | .[]
    ' "$STATE_FILE"
  fi
}

state_mark_failed() {
  local drive_id="$1"
  local code="$2"
  local message="$3"
  state_update_field "$drive_id" "$(jq -nc \
    --arg status "failed" \
    --arg errorCode "$code" \
    --arg errorMessage "$message" \
    '{status: $status, errorCode: $errorCode, errorMessage: $errorMessage}')" >/dev/null
}

state_mark_skipped() {
  local drive_id="$1"
  local reason="$2"
  state_update_field "$drive_id" "$(jq -nc \
    --arg status "skipped" \
    --arg errorMessage "$reason" \
    --arg completedAt "$(state_now)" \
    '{status: $status, errorMessage: $errorMessage, completedAt: $completedAt}')" >/dev/null
}

state_export_json() {
  if [[ ! -s "$STATE_FILE" ]]; then
    printf '[]'
    return 0
  fi
  jq -sc 'reduce .[] as $item ({}; .[$item.driveFileId] = $item) | [.[]]' "$STATE_FILE"
}
