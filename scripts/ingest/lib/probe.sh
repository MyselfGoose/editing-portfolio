#!/usr/bin/env bash
# ffprobe metadata extraction.

probe_has_ffprobe() {
  command -v ffprobe >/dev/null 2>&1
}

probe_format_duration() {
  local seconds="$1"
  local secs_int
  secs_int="$(printf '%.0f' "$seconds")"
  local mins=$((secs_int / 60))
  local secs=$((secs_int % 60))
  printf '%02d:%02d' "$mins" "$secs"
}

probe_aspect_ratio() {
  local width="$1"
  local height="$2"
  if [[ "$width" -le 0 || "$height" -le 0 ]]; then
    printf '16/9'
    return 0
  fi
  local ratio
  ratio="$(awk "BEGIN{printf \"%.4f\", $width/$height}")"
  local r169 r916 r43 diff169 diff916 diff43
  r169="$(awk 'BEGIN{printf "%.4f", 16/9}')"
  r916="$(awk 'BEGIN{printf "%.4f", 9/16}')"
  r43="$(awk 'BEGIN{printf "%.4f", 4/3}')"
  diff169="$(awk "BEGIN{d=$ratio-$r169; printf \"%.4f\", (d<0?-d:d)}")"
  diff916="$(awk "BEGIN{d=$ratio-$r916; printf \"%.4f\", (d<0?-d:d)}")"
  diff43="$(awk "BEGIN{d=$ratio-$r43; printf \"%.4f\", (d<0?-d:d)}")"
  local min="$diff169" result="16/9"
  if awk "BEGIN{exit !($diff916 < $min)}"; then min="$diff916"; result="9/16"; fi
  if awk "BEGIN{exit !($diff43 < $min)}"; then result="4/3"; fi
  printf '%s' "$result"
}

probe_file() {
  local file_path="$1"
  local manifest_overrides="${2-}"
  if [[ -z "$manifest_overrides" ]]; then
    manifest_overrides='{}'
  fi

  if [[ "${INGEST_DRY_RUN:-0}" == "1" ]]; then
    jq -nc \
      --argjson overrides "$manifest_overrides" \
      '{
        durationSeconds: 252,
        durationFormatted: "04:12",
        width: 1920,
        height: 1080,
        aspectRatio: "16/9",
        posterTime: 63,
        previewRange: { start: 59, end: 63 }
      } | . * ($overrides // {})'
    return 0
  fi

  if ! probe_has_ffprobe; then
    ui_warn "E004: ffprobe not found — using defaults (duration 00:00, aspectRatio 16/9)"
    local poster=0 preview_start=0 preview_end=4
    jq -nc \
      --argjson overrides "$manifest_overrides" \
      '{
        durationSeconds: 0,
        durationFormatted: "00:00",
        width: 1920,
        height: 1080,
        aspectRatio: "16/9",
        posterTime: 0,
        previewRange: { start: 0, end: 4 }
      } | . * ($overrides // {})'
    return 0
  fi

  local json
  json="$(ffprobe -v quiet -print_format json -show_format -show_streams "$file_path" 2>/dev/null)" || json=""
  if [[ -z "$json" ]] || ! printf '%s' "$json" | jq -e '.format.duration // empty' >/dev/null 2>&1; then
    ui_warn "ffprobe failed on $file_path — using defaults"
    jq -nc \
      --argjson overrides "$manifest_overrides" \
      '{
        durationSeconds: 0,
        durationFormatted: "00:00",
        width: 1920,
        height: 1080,
        aspectRatio: "16/9",
        posterTime: 0,
        previewRange: { start: 0, end: 4 }
      } | . * ($overrides // {})'
    return 0
  fi

  local duration width height
  duration="$(printf '%s' "$json" | jq -r '.format.duration // "0"')"
  width="$(printf '%s' "$json" | jq -r '[.streams[]? | select(.codec_type=="video") | .width][0] // 1920')"
  height="$(printf '%s' "$json" | jq -r '[.streams[]? | select(.codec_type=="video") | .height][0] // 1080')"

  local duration_fmt aspect poster preview_start preview_end
  duration_fmt="$(probe_format_duration "$duration")"
  aspect="$(probe_aspect_ratio "$width" "$height")"

  local dur_int
  dur_int="$(printf '%.0f' "$duration")"
  poster=$(( dur_int * DEFAULT_POSTER_PERCENT / 100 ))
  preview_end=$(( poster - PREVIEW_END_OFFSET ))
  preview_start=$(( preview_end - DEFAULT_PREVIEW_SECONDS ))
  [[ "$preview_start" -lt 0 ]] && preview_start=0
  [[ "$preview_end" -lt "$preview_start" ]] && preview_end=$((preview_start + DEFAULT_PREVIEW_SECONDS))
  [[ "$preview_end" -gt "$dur_int" ]] && preview_end="$dur_int"

  jq -nc \
    --argjson durationSeconds "$dur_int" \
    --arg durationFormatted "$duration_fmt" \
    --argjson width "$width" \
    --argjson height "$height" \
    --arg aspectRatio "$aspect" \
    --argjson posterTime "$poster" \
    --argjson previewStart "$preview_start" \
    --argjson previewEnd "$preview_end" \
    --argjson overrides "$manifest_overrides" \
    '{
      durationSeconds: $durationSeconds,
      durationFormatted: $durationFormatted,
      width: $width,
      height: $height,
      aspectRatio: $aspectRatio,
      posterTime: $posterTime,
      previewRange: { start: $previewStart, end: $previewEnd }
    } | . * ($overrides // {}) | if ($overrides.previewRange) then .previewRange = $overrides.previewRange else . end'
}

probe_manifest_video_overrides() {
  local drive_id="$1"
  local filename="$2"
  local manifest_path
  manifest_path="$(config_resolve_path MANIFEST_PATH)"
  if [[ ! -f "$manifest_path" ]]; then
    printf '{}'
    return 0
  fi
  jq -c --arg id "$drive_id" --arg fn "$filename" '
    (.entries[]? | select(.driveFileId == $id or .filename == $fn) | .video) // {}
  ' "$manifest_path" 2>/dev/null || printf '{}'
}
