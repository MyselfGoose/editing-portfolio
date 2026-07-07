# Video Ingest Workflow (Mux)

This project delivers video through [Mux](https://www.mux.com/). Masters are uploaded to Mux; the site references **playback IDs** in `src/data/projects.ts`.

## Prerequisites

1. Create a Mux account at [dashboard.mux.com](https://dashboard.mux.com).
2. No API keys are required for **public playback** on the website. Keys are only needed if you later add scripted uploads (Phase 2.5).

## Upload a New Piece

1. Sign in at [dashboard.mux.com](https://dashboard.mux.com) and select your environment.
2. Go to **Video → Assets → Upload**.
3. Drag your master file (3–5 GB is fine — Mux transcodes it).
4. Wait until the asset status is **ready** (typically ~1× realtime).
5. Open the asset and copy the **Playback ID** (public alphanumeric string).
6. Paste the ID into the matching project in [`src/data/projects.ts`](../src/data/projects.ts):

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

When uploading (or in asset settings):

| Setting | Value |
|---------|-------|
| Playback Policy | **Public** |
| Encoding | **Smart** (default) |
| MP4 Support | **None** |
| Normalize Audio | **On** |
| Max Resolution Tier | **1080p** or **2160p** (match your master) |

## Choosing `posterTime` and `previewRange`

- **`posterTime`**: Pick a frame that reads well as a still (strong composition, no motion blur).
- **`previewRange`**: Bracket 3–4 seconds of motion for the hover preview. The site uses Mux's `animated.webp` endpoint — it does not count as a play in Mux Data.

Preview URLs are built in [`src/lib/mux.ts`](../src/lib/mux.ts).

## Placeholder Projects

Until a playback ID is ready, use a bracketed placeholder:

```typescript
playbackId: "[PLAYBACK_ID_01]",
```

The UI shows **Coming Soon**, disables open, and skips Mux requests.

## Captions (Optional)

Add VTT tracks when available:

```typescript
captions: [
  {
    src: "https://example.com/captions.vtt",
    srcLang: "en",
    label: "English",
    default: true,
  },
],
```

Mux Player renders them in the fullscreen modal.

## Analytics

Mux Data is enabled automatically when viewers play videos in the modal (`metadata` is passed to `MuxPlayer`). View metrics at **dashboard.mux.com → Mux Data**.

Hover previews use animated WebP images and **do not** register as views.

## Cost Reference (approximate)

- Storage: ~$0.003/min/month
- Delivery: ~$0.00096/minute delivered
- Encoding: ~$0.043/minute (one-time per asset)

For ~10 pieces × 5 min, ~2000 modal plays/month: **~$6–10/month** ongoing.

## Master File Backup (Recommended)

Mux retains masters internally, but keep your own copies (e.g. Cloudflare R2, Backblaze B2) if you may re-transcode or hand files to clients later.

## Phase 2.5 (Future)

A scripted uploader (`scripts/ingest.ts` with `@mux/mux-node`) can automate Direct Uploads when dashboard drag-and-drop becomes tedious. Not required for the first 10 pieces.
