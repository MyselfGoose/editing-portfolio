#!/usr/bin/env bash
# Mux Direct Upload API via curl + jq.

mux_auth_header() {
  local creds
  creds="$(printf '%s:%s' "${MUX_TOKEN_ID}" "${MUX_TOKEN_SECRET}" | base64 -w0 2>/dev/null || printf '%s:%s' "${MUX_TOKEN_ID}" "${MUX_TOKEN_SECRET}" | base64)"
  printf 'Basic %s' "$creds"
}

mux_curl_cmd() {
  if [[ "${INGEST_MOCK:-0}" == "1" ]]; then
    printf '%s' "${INGEST_ROOT}/test/fixtures/curl-mock.sh"
  else
    printf 'curl'
  fi
}

mux_create_upload() {
  if [[ "${INGEST_DRY_RUN:-0}" == "1" ]]; then
    jq -n '{
      data: {
        id: "upload_dryrun",
        url: "https://example.com/upload",
        status: "waiting",
        timeout: 3600
      }
    }'
    return 0
  fi

  local normalize="true"
  [[ "${MUX_NORMALIZE_AUDIO}" == "false" ]] && normalize="false"

  local body
  body="$(jq -n \
    --arg policy "${MUX_PLAYBACK_POLICY}" \
    --arg tier "${MUX_ENCODING_TIER}" \
    --argjson normalize "$normalize" \
    --arg mp4 "${MUX_MP4_SUPPORT}" \
    --arg max_res "${MUX_MAX_RESOLUTION_TIER}" \
    --arg cors "${CORS_ORIGIN}" \
    '{
      new_asset_settings: {
        playback_policy: [$policy],
        encoding_tier: $tier,
        normalize_audio: $normalize,
        mp4_support: $mp4,
        max_resolution_tier: $max_res
      },
      cors_origin: $cors,
      timeout: 3600
    }')"

  local curl_bin
  curl_bin="$(mux_curl_cmd)"
  local resp http_code
  resp="$("$curl_bin" -sS -w '\n%{http_code}' -X POST "${MUX_API_BASE}/video/v1/uploads" \
    -H "Authorization: $(mux_auth_header)" \
    -H "Content-Type: application/json" \
    -d "$body")" || {
    ui_err "E030: Network error creating Mux upload"
    return 3
  }

  http_code="$(printf '%s' "$resp" | tail -n1)"
  resp="$(printf '%s' "$resp" | sed '$d')"

  if [[ "$http_code" == "401" || "$http_code" == "403" ]]; then
    ui_err "E040: Mux authentication failed — verify MUX_TOKEN_ID and MUX_TOKEN_SECRET"
    return 4
  fi
  if [[ "$http_code" != "201" && "$http_code" != "200" ]]; then
    ui_err "E040: Mux upload create failed (HTTP $http_code): $resp"
    return 4
  fi
  printf '%s' "$resp"
}

mux_put_file() {
  local upload_url="$1"
  local file_path="$2"

  if [[ "${INGEST_DRY_RUN:-0}" == "1" ]]; then
    log_info "[dry-run] Would PUT $file_path to Mux upload URL"
    return 0
  fi

  local curl_bin
  curl_bin="$(mux_curl_cmd)"
  local args=(-sS -X PUT -H "Content-Type: video/mp4" --upload-file "$file_path" --retry 3 --retry-delay 5)
  if [[ -t 1 && "${INGEST_QUIET:-0}" != "1" ]]; then
    args+=(--progress-bar)
  fi
  args+=("$upload_url")

  log_info "Uploading to Mux..."
  if ! "$curl_bin" "${args[@]}" >/dev/null; then
    ui_err "E041: Mux file upload failed — URL may have expired; retry the job"
    return 4
  fi
  return 0
}

mux_get_upload() {
  local upload_id="$1"
  if [[ "${INGEST_DRY_RUN:-0}" == "1" ]]; then
    jq -n --arg id "$upload_id" '{
      data: { id: $id, status: "asset_created", asset_id: "asset_dryrun" }
    }'
    return 0
  fi
  local curl_bin
  curl_bin="$(mux_curl_cmd)"
  local resp http_code
  resp="$("$curl_bin" -sS -w '\n%{http_code}' \
    -H "Authorization: $(mux_auth_header)" \
    "${MUX_API_BASE}/video/v1/uploads/${upload_id}")" || return 3
  http_code="$(printf '%s' "$resp" | tail -n1)"
  resp="$(printf '%s' "$resp" | sed '$d')"
  if [[ "$http_code" != "200" ]]; then
    ui_err "E040: Mux get upload failed (HTTP $http_code)"
    return 4
  fi
  printf '%s' "$resp"
}

mux_get_asset() {
  local asset_id="$1"
  if [[ "${INGEST_DRY_RUN:-0}" == "1" ]]; then
    jq -n --arg id "$asset_id" '{
      data: {
        id: $id,
        status: "ready",
        playback_ids: [{ id: "dryrunPlaybackId123456789012345678901", policy: "public" }]
      }
    }'
    return 0
  fi
  local curl_bin
  curl_bin="$(mux_curl_cmd)"
  local resp http_code
  resp="$("$curl_bin" -sS -w '\n%{http_code}' \
    -H "Authorization: $(mux_auth_header)" \
    "${MUX_API_BASE}/video/v1/assets/${asset_id}")" || return 3
  http_code="$(printf '%s' "$resp" | tail -n1)"
  resp="$(printf '%s' "$resp" | sed '$d')"
  if [[ "$http_code" != "200" ]]; then
    ui_err "E040: Mux get asset failed (HTTP $http_code)"
    return 4
  fi
  printf '%s' "$resp"
}

mux_poll_until_ready() {
  local upload_id="$1"
  local drive_id="$2"
  local interval="${MUX_POLL_INTERVAL_SEC}"
  local elapsed=0
  local max_wait="${MUX_POLL_MAX_WAIT_SEC}"
  local asset_id=""

  state_update_field "$drive_id" '{"status":"processing"}' >/dev/null

  while [[ "$elapsed" -lt "$max_wait" ]]; do
    local upload_resp status
    upload_resp="$(mux_get_upload "$upload_id")" || return $?
    status="$(printf '%s' "$upload_resp" | jq -r '.data.status')"

    if [[ "$status" == "asset_created" ]]; then
      asset_id="$(printf '%s' "$upload_resp" | jq -r '.data.asset_id')"
      state_update_field "$drive_id" "$(jq -n --arg id "$asset_id" '{muxAssetId: $id}')" >/dev/null
      break
    fi
    if [[ "$status" == "errored" ]]; then
      local err
      err="$(printf '%s' "$upload_resp" | jq -r '.data.error.message // "unknown"')"
      ui_err "E042: Mux upload errored: $err"
      return 4
    fi

    if [[ "${INGEST_DRY_RUN:-0}" != "1" && -t 1 ]]; then
      printf '\r  Mux processing... (%ds)' "$elapsed"
    fi
    sleep "$interval"
    elapsed=$((elapsed + interval))
    if [[ "$interval" -lt 30 ]]; then
      interval=$((interval + 5))
    fi
  done

  [[ -t 1 ]] && printf '\n'

  if [[ -z "$asset_id" ]]; then
    ui_err "E042: Timed out waiting for Mux asset creation"
    return 4
  fi

  interval="${MUX_POLL_INTERVAL_SEC}"
  elapsed=0
  while [[ "$elapsed" -lt "$max_wait" ]]; do
    local asset_resp asset_status playback_id
    asset_resp="$(mux_get_asset "$asset_id")" || return $?
    asset_status="$(printf '%s' "$asset_resp" | jq -r '.data.status')"

    if [[ "$asset_status" == "ready" ]]; then
      playback_id="$(printf '%s' "$asset_resp" | jq -r '
        [.data.playback_ids[]? | select(.policy == "public") | .id][0] // .data.playback_ids[0].id // empty
      ')"
      if [[ -z "$playback_id" ]]; then
        ui_err "E042: Mux asset ready but no playback ID found"
        return 4
      fi
      printf '%s' "$playback_id"
      return 0
    fi
    if [[ "$asset_status" == "errored" ]]; then
      local errors
      errors="$(printf '%s' "$asset_resp" | jq -r '.data.errors // [] | map(.message) | join("; ")')"
      ui_err "E042: Mux encoding failed: $errors"
      return 4
    fi

    if [[ "${INGEST_DRY_RUN:-0}" != "1" && -t 1 ]]; then
      printf '\r  Mux encoding... (%ds)' "$elapsed"
    fi
    sleep "$interval"
    elapsed=$((elapsed + interval))
    if [[ "$interval" -lt 30 ]]; then
      interval=$((interval + 5))
    fi
  done

  ui_err "E042: Timed out waiting for Mux asset to be ready"
  return 4
}
