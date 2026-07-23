# Video Ingest (Mux)

This project delivers video through [Mux](https://www.mux.com/). Masters are uploaded to Mux; the site references **playback IDs** in `frontend/src/data/projects.ts`.

**Last verified against:** Next.js 16.2.9

## Primary workflow: ingest CLI

Use the Bash ingest tool in [`scripts/ingest/`](../scripts/ingest/):

```bash
cd scripts/ingest
cp config.example.env config.env   # first time only
chmod 600 config.env
./ingest.sh doctor                 # verify setup
./ingest.sh ingest --all-new       # Drive → Mux → playback IDs
./ingest.sh map                    # generate projects.ts snippets
```

Full guide: **[scripts/ingest/README.md](../scripts/ingest/README.md)**

The CLI:

1. Scans a configured Google Drive folder (via rclone)
2. Downloads selected masters to local temp storage
3. Uploads to Mux via Direct Upload API
4. Polls until assets are **ready**
5. Writes playback IDs and metadata to `output/ingest-output.json`
6. Optionally patches `projects.ts` (guarded, with diff preview)

**Filename convention:** `carezza-leanne.mp4` → project id `carezza-leanne`.

## Manual fallback: Mux dashboard

If you prefer not to use the CLI:

1. Sign in at [dashboard.mux.com](https://dashboard.mux.com) and select your environment.
2. Go to **Video → Assets → Upload**.
3. Drag your master file (3–5 GB is fine — Mux transcodes it).
4. Wait until the asset status is **ready** (typically ~1× realtime).
5. Open the asset and copy the **Playback ID** (public alphanumeric string).
6. Paste the ID into the matching project in [`frontend/src/data/projects.ts`](../frontend/src/data/projects.ts):

```typescript
video: {
  playbackId: "YOUR_PLAYBACK_ID_HERE",
  aspectRatio: "16/9",
  duration: "03:42",
  posterTime: 12,           // seconds — frame used for still poster
  previewRange: { start: 8, end: 12 }, // hover animated preview window
},
```

7. Commit and deploy.

## Recommended Encoding Settings

When uploading (CLI defaults or dashboard):

| Setting | Value |
|---------|-------|
| Playback Policy | **Public** |
| Encoding | **Smart** (default) |
| MP4 Support | **None** |
| Normalize Audio | **On** |
| Max Resolution Tier | **1080p** or **2160p** (match your master) |

## Choosing `posterTime` and `previewRange`

- **`posterTime`**: Pick a frame that reads well as a still (strong composition, no motion blur). The ingest CLI suggests a default at 25% duration; override in `ingest-manifest.json` if needed.
- **`previewRange`**: Bracket 3–4 seconds of motion for the hover preview. The site uses Mux's `animated.webp` endpoint — it does not count as a play in Mux Data.

Preview URLs are built in [`frontend/src/lib/mux.ts`](../frontend/src/lib/mux.ts).

## Placeholder Projects

Until a playback ID is ready, use a bracketed placeholder:

```typescript
playbackId: "[PLAYBACK_ID_01]",
```

The UI shows **Coming Soon**, disables open, and skips Mux requests. See [Content Management](content-management.md#placeholder-convention) for details.

## Captions (Optional / future)

**Do not add stub VTT.** When real transcripts exist, reference them in `projects.ts` (or Mux-hosted text tracks). No caption files ship in `public/captions/` today. Players on film pages, modal, and showreel will pick up tracks when present. Caption upload via the ingest CLI remains a future enhancement.

## Analytics

Mux Data is enabled automatically when viewers play videos in the modal (`metadata` is passed to `MuxPlayer`). View metrics at **dashboard.mux.com → Mux Data**.

Hover previews use animated WebP images and **do not** register as views.

## Cost Reference (approximate)

- Storage: ~$0.003/min/month
- Delivery: ~$0.00096/minute delivered
- Encoding: ~$0.043/minute (one-time per asset)

For ~10 pieces × 5 min, ~2000 modal plays/month: **~$6–10/month** ongoing.

## Master File Backup (Recommended)

Mux retains masters internally, but keep your own copies (e.g. Google Drive ingest folder, Cloudflare R2, Backblaze B2) if you may re-transcode or hand files to clients later.

## URL Builders

The site constructs Mux URLs in `frontend/src/lib/mux.ts`:

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `posterUrl(id, opts)` | `image.mux.com/{id}/thumbnail.webp` | Still poster frame |
| `animatedPreviewUrl(id, opts)` | `image.mux.com/{id}/animated.webp` | Hover animated preview |
| `streamUrl(id)` | `stream.mux.com/{id}.m3u8` | HLS manifest for full playback |

All functions validate and clamp option values (time, width, start/end bounds).

## Related Documentation

- [scripts/ingest/README.md](../scripts/ingest/README.md) — CLI setup and daily usage
- [Content Management](content-management.md) — Project schema and placeholder convention
- [Architecture](architecture.md) — Video pipeline and data flow
- [Troubleshooting](troubleshooting.md) — Video playback issues
