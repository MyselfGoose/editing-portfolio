#!/usr/bin/env bash
# Ingest pipeline orchestration.

pipeline_select_queue() {
  local mode="${1:-all-new}"
  local scan
  scan="$(drive_scan)" || return $?

  local queue='[]'
  case "$mode" in
    all-new)
      while IFS= read -r row; do
        local st
        st="$(printf '%s' "$row" | jq -r '.status')"
        if [[ "$st" == "ingested" && "${INGEST_FORCE:-0}" != "1" ]]; then continue; fi
        [[ "$st" == "new" || "$st" == "failed" || "${INGEST_FORCE:-0}" == "1" ]] || continue
        queue="$(printf '%s' "$queue" | jq --argjson r "$row" '. + [$r]')"
      done < <(printf '%s' "$scan" | jq -c '.[]')
      ;;
    file)
      local fname="${INGEST_FILE_FILTER:-}"
      queue="$(printf '%s' "$scan" | jq --arg fn "$fname" '[.[] | select(.driveFileName == $fn)]')"
      ;;
    project)
      local pid="${INGEST_PROJECT_FILTER:-}"
      queue="$(printf '%s' "$scan" | jq --arg id "$pid" '[.[] | select(.projectId == $id)]')"
      ;;
    manifest-only)
      local manifest_path
      manifest_path="$(config_resolve_path MANIFEST_PATH)"
      if [[ ! -f "$manifest_path" ]]; then
        ui_err "Manifest not found at $manifest_path"
        return 2
      fi
      while IFS= read -r row; do
        local id fn
        id="$(printf '%s' "$row" | jq -r '.driveFileId')"
        fn="$(printf '%s' "$row" | jq -r '.driveFileName')"
        local match
        match="$(printf '%s' "$scan" | jq --arg id "$id" --arg fn "$fn" '[.[] | select(.driveFileId == $id or .driveFileName == $fn)][0]')"
        [[ "$match" == "null" || -z "$match" ]] && continue
        queue="$(printf '%s' "$queue" | jq --argjson m "$match" '. + [$m]')"
      done < <(jq -c '.entries[]? | select(.skip != true)' "$manifest_path")
      ;;
    pick)
      drive_print_scan "$scan"
      local nums
      nums="$(ui_prompt "Enter numbers to ingest (comma-separated)" "")"
      IFS=',' read -ra picks <<<"$nums"
      local i
      for i in "${picks[@]}"; do
        i="$(printf '%s' "$i" | xargs)"
        local row
        row="$(printf '%s' "$scan" | jq --argjson n "$i" '.[$n - 1]')"
        [[ "$row" == "null" ]] && continue
        queue="$(printf '%s' "$queue" | jq --argjson r "$row" '. + [$r]')"
      done
      ;;
    *)
      ui_err "Unknown selection mode: $mode"
      return 1
      ;;
  esac

  printf '%s' "$queue"
}

pipeline_confirm_queue() {
  local queue="$1"
  local count total_bytes
  count="$(printf '%s' "$queue" | jq 'length')"
  if [[ "$count" -eq 0 ]]; then
    ui_warn "No files queued for ingest."
    return 1
  fi
  total_bytes="$(printf '%s' "$queue" | jq '[.[].driveSizeBytes] | add // 0')"

  if [[ "${INGEST_JSON:-0}" != "1" ]]; then
    ui_section "Ingest queue ($count files, $(ui_format_bytes "$total_bytes"))"
    printf '%s' "$queue" | jq -r '.[] | "  • \(.driveFileName) → \(.projectId)"'
  fi

  if [[ "${INGEST_FORCE:-0}" == "1" ]]; then
    ui_warn "Force re-ingest: creates new Mux assets (encoding cost applies). Old assets remain in Mux dashboard."
    if ! ui_confirm "Continue with force re-ingest?"; then
      return 1
    fi
  fi

  local total_gb=$(( (total_bytes + 1073741823) / 1073741824 ))
  local confirm_gb="${CONFIRM_BATCH_GB}"
  if [[ "$total_gb" -gt "$confirm_gb" ]]; then
    ui_warn "Batch size ~${total_gb}GB exceeds CONFIRM_BATCH_GB=${confirm_gb}"
    if ! ui_confirm "Continue with large batch?"; then
      return 1
    fi
  fi

  if [[ "${INGEST_DRY_RUN:-0}" != "1" ]]; then
    drive_check_disk_space "$total_bytes" || return 1
  fi
  return 0
}

pipeline_process_one() {
  local row="$1"
  local drive_id drive_name modified size project_id
  drive_id="$(printf '%s' "$row" | jq -r '.driveFileId')"
  drive_name="$(printf '%s' "$row" | jq -r '.driveFileName')"
  modified="$(printf '%s' "$row" | jq -r '.driveModifiedTime')"
  size="$(printf '%s' "$row" | jq -r '.driveSizeBytes')"
  project_id="$(printf '%s' "$row" | jq -r '.projectId')"
  project_id="$(projects_resolve_slug "$project_id")"

  ui_section "Processing: $drive_name → $project_id"

  if [[ "${INGEST_FORCE:-0}" != "1" ]] && projects_has_real_playback "$project_id"; then
    ui_ok "Skip: $project_id already has a Mux playbackId in projects.ts"
    return 0
  fi

  if state_should_skip "$drive_id" "$modified"; then
    ui_ok "Skip: $drive_name (unchanged since last successful ingest)"
    return 0
  fi

  local record
  record="$(state_new_record "$drive_id" "$drive_name" "$modified" "$size" "$project_id")"
  if [[ "${INGEST_FORCE:-0}" == "1" ]]; then
    local prev
    prev="$(printf '%s' "$record" | jq -r '.playbackId // empty')"
    if [[ -n "$prev" && "$prev" != "null" ]]; then
      record="$(printf '%s' "$record" | jq --arg p "$prev" '.previousPlaybackId = $p')"
    fi
  fi
  record="$(printf '%s' "$record" | jq '.status = "queued"')"
  state_upsert "$record"

  local tmp_dir local_path
  tmp_dir="$(config_resolve_path TMP_DIR)"
  local_path="${tmp_dir}/${project_id}--${drive_id}.${drive_name##*.}"
  state_update_field "$drive_id" "$(jq -nc --arg p "$local_path" --arg s "downloading" '{status:$s, localPath:$p}')" >/dev/null

  log_info "Downloading from Drive..."
  if ! drive_download "$drive_name" "$local_path"; then
    state_mark_failed "$drive_id" "E030" "Download failed"
    return 3
  fi
  log_info "Download complete — probing video..."

  local manifest_overrides
  manifest_overrides="$(probe_manifest_video_overrides "$drive_id" "$drive_name" 2>/dev/null || echo '{}')"
  [[ -z "$manifest_overrides" || "$manifest_overrides" == "null" ]] && manifest_overrides='{}'

  local metadata
  metadata="$(probe_file "$local_path" "$manifest_overrides" 2>/dev/null | jq -c . 2>/dev/null || true)"
  if [[ -z "$metadata" ]]; then
    metadata='{"durationSeconds":0,"durationFormatted":"00:00","width":1920,"height":1080,"aspectRatio":"16/9","posterTime":0,"previewRange":{"start":0,"end":4}}'
  fi
  log_info "Probe OK ($(printf '%s' "$metadata" | jq -r '.durationFormatted // "?"') / $(printf '%s' "$metadata" | jq -r '.aspectRatio // "?"')) — creating Mux upload..."

  local upload_patch
  if ! upload_patch="$(jq -nc \
    --argjson m "$metadata" \
    --argjson sz "${size:-0}" \
    '{metadata:$m, downloadBytes:$sz, status:"uploading"}')"; then
    upload_patch="$(jq -nc --argjson sz "${size:-0}" '{metadata:{"durationFormatted":"00:00","aspectRatio":"16/9","posterTime":0,"previewRange":{"start":0,"end":4}}, downloadBytes:$sz, status:"uploading"}')"
  fi
  state_update_field "$drive_id" "$upload_patch" >/dev/null || true

  local upload_id
  if ! upload_id="$(mux_upload_file_with_retries "$local_path" "$drive_id")"; then
    state_mark_failed "$drive_id" "E041" "Mux PUT upload failed"
    return 4
  fi

  local playback_id
  if ! playback_id="$(mux_poll_until_ready "$upload_id" "$drive_id")"; then
    state_mark_failed "$drive_id" "E042" "Mux processing failed"
    return 4
  fi

  local now
  now="$(state_now)"
  state_update_field "$drive_id" "$(jq -nc \
    --arg playback "$playback_id" \
    --arg completed "$now" \
    '{status:"ready", playbackId:$playback, completedAt:$completed, errorCode:null, errorMessage:null}')" >/dev/null

  if [[ "${INGEST_DRY_RUN:-0}" != "1" && -f "$local_path" ]]; then
    rm -f "$local_path"
  fi

  ui_ok "Ready: $project_id → playbackId $playback_id"
  log_info "Ingest complete: $project_id playbackId=$playback_id"
  return 0
}

pipeline_run() {
  local mode="${1:-all-new}"
  local queue
  queue="$(pipeline_select_queue "$mode")" || return $?
  pipeline_confirm_queue "$queue" || return 0

  if [[ "${INGEST_DRY_RUN:-0}" == "1" ]]; then
    ui_warn "E090: Dry-run — no downloads or uploads performed"
    printf '%s' "$queue" | jq -r '.[] | "[dry-run] Would ingest: \(.driveFileName) → \(.projectId)"'
    return 0
  fi

  local failures=0
  local completed='[]'
  while IFS= read -r row; do
    [[ -z "$row" ]] && continue
    if pipeline_process_one "$row"; then
      local drive_id ready_job
      drive_id="$(printf '%s' "$row" | jq -r '.driveFileId')"
      ready_job="$(state_get_by_drive_id "$drive_id" 2>/dev/null || true)"
      if [[ -n "$ready_job" && "$ready_job" != "null" ]]; then
        completed="$(printf '%s' "$completed" | jq --argjson j "$ready_job" '. + [$j]')"
      fi
    else
      failures=$((failures + 1))
    fi
  done < <(printf '%s' "$queue" | jq -c '.[]')

  if [[ "$(printf '%s' "$completed" | jq 'length')" -gt 0 ]]; then
    projects_write_output "$completed"
  fi

  if [[ "$failures" -gt 0 ]]; then
    ui_err "$failures job(s) failed — run: ingest.sh retry-failed"
    return 1
  fi
  ui_ok "All queued jobs completed."
  return 0
}

pipeline_retry_failed() {
  local queue='[]'
  while IFS= read -r job; do
    local drive_id retry
    drive_id="$(printf '%s' "$job" | jq -r '.driveFileId')"
    retry="$(printf '%s' "$job" | jq -r '.retryCount // 0')"
    retry=$((retry + 1))
    state_update_field "$drive_id" "$(jq -n --argjson r "$retry" '{retryCount:$r, status:"queued", errorCode:null, errorMessage:null}')" >/dev/null
    local row
    row="$(jq -n \
      --arg driveFileId "$(printf '%s' "$job" | jq -r '.driveFileId')" \
      --arg driveFileName "$(printf '%s' "$job" | jq -r '.driveFileName')" \
      --arg driveModifiedTime "$(printf '%s' "$job" | jq -r '.driveModifiedTime')" \
      --argjson driveSizeBytes "$(printf '%s' "$job" | jq -r '.driveSizeBytes')" \
      --arg projectId "$(printf '%s' "$job" | jq -r '.projectId')" \
      '{driveFileId:$driveFileId,driveFileName:$driveFileName,driveModifiedTime:$driveModifiedTime,driveSizeBytes:$driveSizeBytes,projectId:$projectId,status:"new"}')"
    queue="$(printf '%s' "$queue" | jq --argjson r "$row" '. + [$r]')"
  done < <(state_list_by_status "failed")

  if [[ "$(printf '%s' "$queue" | jq 'length')" -eq 0 ]]; then
    ui_warn "No failed jobs to retry."
    return 0
  fi

  if ! ui_confirm "Retry $(printf '%s' "$queue" | jq 'length') failed job(s)?"; then
    return 0
  fi

  local failures=0
  while IFS= read -r row; do
    pipeline_process_one "$row" || failures=$((failures + 1))
  done < <(printf '%s' "$queue" | jq -c '.[]')

  [[ "$failures" -eq 0 ]]
}

pipeline_watch() {
  local job_id="$1"
  local job
  job="$(state_get_by_job_id "$job_id")" || {
    ui_err "Job not found: $job_id"
    return 1
  }
  local drive_id
  drive_id="$(printf '%s' "$job" | jq -r '.driveFileId')"
  while true; do
    job="$(state_get_by_drive_id "$drive_id")"
    local status updated playback err
    status="$(printf '%s' "$job" | jq -r '.status')"
    updated="$(printf '%s' "$job" | jq -r '.updatedAt')"
    playback="$(printf '%s' "$job" | jq -r '.playbackId // "-"')"
    err="$(printf '%s' "$job" | jq -r '.errorMessage // ""')"
    if [[ "${INGEST_JSON:-0}" == "1" ]]; then
      printf '%s\n' "$job" | jq '{jobId, status, updatedAt, playbackId, errorMessage}'
    else
      printf '[%s] status=%s playbackId=%s %s\n' "$updated" "$status" "$playback" "$err"
    fi
    case "$status" in
      ready|failed|skipped) break ;;
    esac
    sleep 2
  done
}

pipeline_status() {
  if [[ "${INGEST_JSON:-0}" == "1" ]]; then
    state_export_json | jq .
    return 0
  fi
  ui_section "Job status"
  ui_table_header "$(printf '%-28s %-24s %-12s %-20s %s' 'Job ID' 'File' 'Status' 'Updated' 'Playback ID')"
  while IFS= read -r job; do
    [[ -z "$job" ]] && continue
    printf '%-28s %-24s %-12s %-20s %s\n' \
      "$(printf '%s' "$job" | jq -r '.jobId' | cut -c1-28)" \
      "$(printf '%s' "$job" | jq -r '.driveFileName' | cut -c1-24)" \
      "$(printf '%s' "$job" | jq -r '.status')" \
      "$(printf '%s' "$job" | jq -r '.updatedAt' | cut -c1-19)" \
      "$(printf '%s' "$job" | jq -r '.playbackId // "-"')"
  done < <(state_get_all)
}

pipeline_cleanup() {
  local tmp_dir
  tmp_dir="$(config_resolve_path TMP_DIR)"
  rm -rf "${tmp_dir:?}"/*
  mkdir -p "$tmp_dir"
  ui_ok "Cleaned temp directory: $tmp_dir"
}
