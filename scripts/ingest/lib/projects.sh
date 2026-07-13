#!/usr/bin/env bash
# projects.ts integration: read IDs, generate snippets, guarded patch.

projects_ts_path() {
  config_resolve_path PROJECTS_TS_PATH
}

projects_id_exists() {
  local id="$1"
  local path
  path="$(projects_ts_path)"
  grep -qE "id:[[:space:]]*\"${id}\"" "$path" 2>/dev/null
}

projects_list_ids() {
  local path
  path="$(projects_ts_path)"
  grep -oE 'id:[[:space:]]*"[a-z0-9-]+"' "$path" | sed 's/id:[[:space:]]*"\(.*\)"/\1/'
}

projects_video_snippet() {
  local playback_id="$1"
  local metadata="$2"
  local aspect duration poster preview_start preview_end
  aspect="$(printf '%s' "$metadata" | jq -r '.aspectRatio')"
  duration="$(printf '%s' "$metadata" | jq -r '.durationFormatted')"
  poster="$(printf '%s' "$metadata" | jq -r '.posterTime')"
  preview_start="$(printf '%s' "$metadata" | jq -r '.previewRange.start')"
  preview_end="$(printf '%s' "$metadata" | jq -r '.previewRange.end')"

  cat <<EOF
video: {
  playbackId: "${playback_id}",
  aspectRatio: "${aspect}",
  duration: "${duration}",
  posterTime: ${poster},
  previewRange: { start: ${preview_start}, end: ${preview_end} },
},
EOF
}

projects_new_template() {
  local project_id="$1"
  local playback_id="$2"
  local metadata="$3"
  local title
  title="$(printf '%s' "$project_id" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2)); print}')"
  local aspect duration poster preview_start preview_end
  aspect="$(printf '%s' "$metadata" | jq -r '.aspectRatio')"
  duration="$(printf '%s' "$metadata" | jq -r '.durationFormatted')"
  poster="$(printf '%s' "$metadata" | jq -r '.posterTime')"
  preview_start="$(printf '%s' "$metadata" | jq -r '.previewRange.start')"
  preview_end="$(printf '%s' "$metadata" | jq -r '.previewRange.end')"

  cat <<EOF
// New project template for "${project_id}" — assign index, category, credits, captions
{
  id: "${project_id}",
  index: 0,  // TODO: set next index
  title: "${title}",
  category: "Wedding Film",  // TODO: adjust
  year: $(date +%Y),
  location: "California",
  video: {
    playbackId: "${playback_id}",
    aspectRatio: "${aspect}",
    duration: "${duration}",
    posterTime: ${poster},
    previewRange: { start: ${preview_start}, end: ${preview_end} },
  },
  credits: {
    role: "Director / Editor",
    client: "TODO",
  },
},
EOF
}

projects_write_output() {
  local jobs_json="$1"
  local out_dir
  out_dir="$(config_resolve_path OUTPUT_DIR)"
  mkdir -p "$out_dir"
  local out_file="${out_dir}/ingest-output.json"
  local generated_at
  generated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  local projects_arr='[]'
  while IFS= read -r job; do
    [[ -z "$job" ]] && continue
    local pid playback meta exists
    pid="$(printf '%s' "$job" | jq -r '.projectId')"
    playback="$(printf '%s' "$job" | jq -r '.playbackId')"
    meta="$(printf '%s' "$job" | jq -c '.metadata // {}')"
    if [[ -z "$playback" || "$playback" == "null" ]]; then
      continue
    fi
    exists="false"
    projects_id_exists "$pid" && exists="true"
    local snippet
    snippet="$(printf '%s' "$meta" | jq -c --arg playbackId "$playback" '. + {playbackId: $playbackId}')"
    projects_arr="$(printf '%s' "$projects_arr" | jq \
      --arg projectId "$pid" \
      --arg exists "$exists" \
      --argjson videoSnippet "$snippet" \
      '. + [{
        projectId: $projectId,
        existsInProjectsTs: ($exists == "true"),
        videoSnippet: $videoSnippet
      }]')"
  done < <(printf '%s' "$jobs_json" | jq -c '.[]')

  jq -n \
    --arg generatedAt "$generated_at" \
    --argjson projects "$projects_arr" \
    '{generatedAt: $generatedAt, projects: $projects}' >"$out_file"

  if [[ "${INGEST_JSON:-0}" == "1" ]]; then
    cat "$out_file"
  else
    ui_ok "Wrote $out_file"
    while IFS= read -r proj; do
      local pid exists playback meta
      pid="$(printf '%s' "$proj" | jq -r '.projectId')"
      exists="$(printf '%s' "$proj" | jq -r '.existsInProjectsTs')"
      playback="$(printf '%s' "$proj" | jq -r '.videoSnippet.playbackId')"
      meta="$(printf '%s' "$proj" | jq -c '.videoSnippet')"
      ui_section "Project: $pid"
      if [[ "$exists" == "true" ]]; then
        projects_video_snippet "$playback" "$meta"
      else
        projects_new_template "$pid" "$playback" "$meta"
      fi
    done < <(jq -c '.projects[]' "$out_file")
  fi
}

projects_map_ready() {
  local ready='[]'
  while IFS= read -r job; do
    [[ -z "$job" ]] && continue
    ready="$(printf '%s' "$ready" | jq --argjson j "$job" '. + [$j]')"
  done < <(state_list_by_status "ready")
  if [[ "$(printf '%s' "$ready" | jq 'length')" -eq 0 ]]; then
    ui_warn "No ready jobs to map."
    return 0
  fi
  projects_write_output "$ready"
}

projects_git_dirty_warning() {
  local path
  path="$(projects_ts_path)"
  if git -C "${INGEST_ROOT}/../.." rev-parse --git-dir >/dev/null 2>&1; then
    if ! git -C "${INGEST_ROOT}/../.." diff --quiet -- "$path" 2>/dev/null; then
      ui_warn "E070: projects.ts has uncommitted changes"
    fi
  fi
}

projects_build_patched_content() {
  local project_id="$1"
  local playback_id="$2"
  local metadata="$3"
  local path
  path="$(projects_ts_path)"

  local aspect duration poster pstart pend
  aspect="$(printf '%s' "$metadata" | jq -r '.aspectRatio')"
  duration="$(printf '%s' "$metadata" | jq -r '.durationFormatted')"
  poster="$(printf '%s' "$metadata" | jq -r '.posterTime')"
  pstart="$(printf '%s' "$metadata" | jq -r '.previewRange.start')"
  pend="$(printf '%s' "$metadata" | jq -r '.previewRange.end')"

  awk -v pid="$project_id" \
      -v playback="$playback_id" \
      -v aspect="$aspect" \
      -v duration="$duration" \
      -v poster="$poster" \
      -v pstart="$pstart" \
      -v pend="$pend" '
    BEGIN { in_project=0; in_video=0; depth=0; matched=0 }
    {
      line = $0
      if (match(line, /^[[:space:]]*id:[[:space:]]*"/)) {
        if (line ~ ("id:[[:space:]]*\"" pid "\"")) {
          in_project=1
          matched=1
        } else if (in_project) {
          in_project=0
          in_video=0
        }
      }
      if (in_project && match(line, /^[[:space:]]*video:[[:space:]]*\{/)) {
        in_video=1
        depth=1
        print "    video: {"
        print "      playbackId: \"" playback "\","
        print "      aspectRatio: \"" aspect "\","
        print "      duration: \"" duration "\","
        print "      posterTime: " poster ","
        print "      previewRange: { start: " pstart ", end: " pend " },"
        next
      }
      if (in_video) {
        if (line ~ /\{/) depth += gsub(/\{/, "&")
        if (line ~ /\}/) depth -= gsub(/\}/, "&")
        if (depth <= 0) {
          in_video=0
          if (line ~ /captions:/) {
            print "      " line
            next
          }
          print line
          next
        }
        if (line ~ /captions:/) {
          in_video=0
          print line
          next
        }
        next
      }
      print line
    }
    END { if (!matched) exit 1 }
  ' "$path"
}

projects_apply() {
  local filter_project="${1:-}"
  projects_git_dirty_warning

  local jobs='[]'
  while IFS= read -r job; do
    [[ -z "$job" ]] && continue
    local pid
    pid="$(printf '%s' "$job" | jq -r '.projectId')"
    if [[ -n "$filter_project" && "$pid" != "$filter_project" ]]; then
      continue
    fi
    if ! projects_id_exists "$pid"; then
      ui_warn "Project $pid not in projects.ts — use snippet from ingest-output.json to add manually"
      continue
    fi
    jobs="$(printf '%s' "$jobs" | jq --argjson j "$job" '. + [$j]')"
  done < <(state_list_by_status "ready")

  if [[ "$(printf '%s' "$jobs" | jq 'length')" -eq 0 ]]; then
    ui_warn "No applicable ready jobs for projects.ts"
    return 1
  fi

  local path
  path="$(projects_ts_path)"
  local tmp_content
  tmp_content="$(cat "$path")"

  while IFS= read -r job; do
    local pid playback meta patched
    pid="$(printf '%s' "$job" | jq -r '.projectId')"
    playback="$(printf '%s' "$job" | jq -r '.playbackId')"
    meta="$(printf '%s' "$job" | jq -c '.metadata')"

    if ! patched="$(projects_build_patched_content "$pid" "$playback" "$meta" <<<"$tmp_content")"; then
      ui_err "E061: Could not patch project block for $pid"
      return 1
    fi
    tmp_content="$patched"
  done < <(printf '%s' "$jobs" | jq -c '.[]')

  if [[ "${INGEST_DRY_RUN:-0}" == "1" ]]; then
    ui_section "Dry-run diff for projects.ts"
    diff -u "$path" <(printf '%s' "$tmp_content") || true
    return 0
  fi

  ui_section "Diff preview"
  diff -u "$path" <(printf '%s' "$tmp_content") || true

  if ! ui_confirm "Apply changes to projects.ts?"; then
    ui_warn "Aborted — snippets remain in output/ingest-output.json"
    return 1
  fi

  local backup="${path}.bak.$(date +%Y%m%d%H%M%S)"
  cp "$path" "$backup"
  printf '%s' "$tmp_content" >"$path"
  ui_ok "Patched projects.ts (backup: $backup)"
  ui_dim "Run: cd frontend && npm run typecheck"
}
