# Goose Productions — Drive → Mux Ingest

Standalone Bash CLI to pull video masters from a Google Drive folder, upload them to Mux via Direct Upload, and produce `projects.ts` snippets for [goose-productions.com](https://goose-productions.com).

## What it does

```
Google Drive folder (rclone)
  → local temp download
  → Mux Direct Upload API
  → poll until asset ready
  → playback ID + metadata
  → output/ingest-output.json (+ optional projects.ts patch)
```

The site streams video from Mux (HLS, poster stills, hover previews). This tool is the only thing you need locally to wire new masters into [`frontend/src/data/projects.ts`](../../frontend/src/data/projects.ts).

## Prerequisites

| Tool | Required | Notes |
|------|----------|-------|
| Bash 4+ | Yes | `bash --version` |
| curl | Yes | Mux API |
| jq | Yes | JSON state + API responses |
| rclone | Yes | Google Drive access |
| ffprobe | Optional | Auto duration/aspect; falls back to defaults |

**Windows:** Use WSL2 — native Windows shells are not supported.

## One-time setup

**Automated (recommended):**

```bash
cd scripts/ingest
./ingest.sh setup
```

The setup wizard will:

1. **Detect your OS** (Arch/CachyOS, Debian/Ubuntu, Fedora, macOS, …)
2. **Install missing tools** via your package manager (`pacman`, `apt`, `brew`, …) — including `rclone`, `jq`, and `ffmpeg`
3. **Create `config.env`** with secure permissions
4. **Prompt for Mux API keys** (the only secrets you need to paste)
5. **Launch `rclone config`** for Google OAuth (browser sign-in)
6. **Set your Drive folder path** and verify access

Human input is only required for: sudo password (if needed), Mux tokens, Google OAuth, and Drive folder path.

**Manual alternative:**

```bash
cd scripts/ingest
cp config.example.env config.env
chmod 600 config.env
# Edit MUX_TOKEN_ID, MUX_TOKEN_SECRET, RCLONE_FOLDER
rclone config
./ingest.sh doctor
```

## Daily workflow

```bash
# 1. Drop a new master in your Drive folder (e.g. carezza-leanne.mp4)

# 2. Run ingest
./scripts/ingest/ingest.sh          # interactive menu
# or:
./scripts/ingest/ingest.sh ingest --all-new

# 3. Copy playback ID snippet (or apply to projects.ts)
./scripts/ingest/ingest.sh map
./scripts/ingest/ingest.sh apply --project carezza-leanne --dry-run
./scripts/ingest/ingest.sh apply --project carezza-leanne

# 4. Verify and deploy
cd frontend && npm run check
```

## Commands

| Command | Description |
|---------|-------------|
| `./ingest.sh` | Interactive menu |
| `./ingest.sh doctor` | Check prerequisites |
| `./ingest.sh scan` | List Drive videos + ingest status |
| `./ingest.sh ingest --all-new` | Ingest new/changed files only |
| `./ingest.sh ingest --file NAME` | Ingest one file |
| `./ingest.sh ingest --project ID` | Ingest by project slug |
| `./ingest.sh status` | Job status table |
| `./ingest.sh watch <job-id>` | Follow one job until done |
| `./ingest.sh retry-failed` | Retry failed jobs |
| `./ingest.sh map` | Generate `projects.ts` snippets |
| `./ingest.sh apply` | Patch `projects.ts` (guarded) |
| `./ingest.sh configure` | Edit config interactively |
| `./ingest.sh logs` | Tail today's log |
| `./ingest.sh cleanup` | Remove temp downloads |

**Flags:** `--dry-run`, `--force`, `--yes`, `--json`, `--verbose`, `--quiet`, `--config PATH`, `--offline` (doctor only)

## Selection modes

| Mode | How |
|------|-----|
| Scan + pick | Interactive ingest → pick by number |
| New only | Default `--all-new`; skips unchanged `ready` jobs |
| Manifest | `ingest-manifest.json` maps files → project IDs |
| Filename → slug | `carezza-leanne.mp4` → `carezza-leanne` |
| Exclusions | `EXCLUDE_GLOBS` in config (`draft-*`, `_*`, etc.) |
| Force | `--force` re-uploads to Mux (encoding cost) |

## Filename convention

| Drive file | Project ID |
|------------|------------|
| `carezza-leanne.mp4` | `carezza-leanne` |
| `Meghan and Edward.mov` | `meghan-and-edward` |

Override per file in `ingest-manifest.json` (see `ingest-manifest.example.json`).

## New project vs update existing

- **Existing** (`id` already in `projects.ts`): ingest outputs a `video: { ... }` snippet; `apply` patches only video fields.
- **Net-new**: ingest outputs a full project template — fill in `index`, `title`, `category`, `credits`, then add to the `projects` array manually or paste from `output/ingest-output.json`.

Placeholder playback IDs like `[PLAYBACK_ID_01]` still work for unreleased pieces (`isRealPlaybackId()` in the frontend).

## Mux settings (defaults)

Matches [`docs/video-ingest.md`](../../docs/video-ingest.md):

| Setting | Value |
|---------|-------|
| Playback policy | Public |
| Encoding | Smart |
| Normalize audio | On |
| MP4 support | None |
| Max resolution | 1080p (configurable → 2160p) |

## Cost awareness

Approximate Mux costs (from project docs):

- Encoding: ~$0.043/minute (one-time per asset)
- Storage: ~$0.003/min/month
- Delivery: ~$0.00096/minute streamed

For ~10 pieces × 5 min: **~$6–10/month** ongoing at moderate traffic.

`--force` creates a **new** asset; old assets remain in your Mux dashboard until you delete them.

## State, logs, and reset

| Path | Purpose |
|------|---------|
| `state/jobs.jsonl` | Per-file ingest state (resumable) |
| `tmp/` | Downloaded masters (cleaned on success) |
| `logs/ingest-YYYY-MM-DD.log` | Rotated daily logs |
| `output/ingest-output.json` | Latest snippets |

**Reset ingest state:**

```bash
rm -rf state/ tmp/ logs/ output/
```

**Uninstall:** Delete `scripts/ingest/config.env` and the directories above. No frontend changes required.

## Troubleshooting

| Code | Meaning | Fix |
|------|---------|-----|
| E001 | Bash too old | Install Bash 4+ |
| E002 | Missing curl/jq | `apt install curl jq` / `brew install curl jq` |
| E003 | rclone missing/misconfigured | Install + `rclone config` |
| E010 | No config.env | `cp config.example.env config.env` |
| E012 | Config world-readable | `chmod 600 config.env` |
| E020 | Drive auth failed | Re-run `rclone config`; check folder share |
| E021 | Folder not found | Fix `RCLONE_FOLDER` or `DRIVE_FOLDER_ID` |
| E040 | Mux auth failed | Verify tokens in dashboard |
| E042 | Mux encoding failed | Check master file; retry with `--force` |
| E050 | Disk full | Free space in `tmp/` |
| E061 | Patch failed | Use manual snippet from `output/` |
| E080 | Interrupted (Ctrl+C) | `ingest.sh retry-failed` |

Run `./ingest.sh doctor` for an automated checklist.

## Testing (developers)

```bash
./test/run-smoke.sh
```

Uses fixture mocks (`INGEST_MOCK=1`) — no real API keys required.

## Future enhancements

- Caption (VTT) upload to Mux or `public/captions/`
- Direct Drive → Mux without local temp (not planned — unreliable)

## Related docs

- [`docs/video-ingest.md`](../../docs/video-ingest.md) — site video pipeline
- [`docs/content-management.md`](../../docs/content-management.md) — project schema
