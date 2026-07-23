# Goose Productions — Cinematic Portfolio

A multi-route cinematic video studio portfolio built with Next.js — home story, `/films` archive, dedicated film pages, light contact/privacy routes, Mux playback, GSAP scroll cinema, and a tiered ExperienceShell.

**Live site:** [goose-productions.com](https://goose-productions.com)

![CI](https://github.com/MyselfGoose/editing-portfolio/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

Full documentation lives in the [`docs/`](docs/) folder:

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Install, dev server, build, and preview |
| [Architecture](docs/architecture.md) | System design, data flow, and tech stack |
| [Project Structure](docs/project-structure.md) | Directory map and file purposes |
| [Content Management](docs/content-management.md) | Editing projects, brand, and placeholders |
| [Video Ingest](docs/video-ingest.md) | Mux upload workflow and playback IDs |
| [Ingest CLI](scripts/ingest/README.md) | Drive → Mux automated ingest tool |
| [Experience](docs/experience.md) | Loader, cursor, smooth scroll, transitions |
| [Accessibility](docs/accessibility.md) | Reduced motion, focus, keyboard patterns |
| [Testing](docs/testing.md) | Unit, component, and e2e test guide |
| [Deployment](docs/deployment.md) | Vercel setup, env vars, production checklist |
| [Roadmap Decisions](docs/roadmap-decisions.md) | Decide-don’t-build register |
| [Responsive](docs/responsive.md) | Breakpoints, film page, light shell |
| [Troubleshooting](docs/troubleshooting.md) | Common issues and fixes |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| UI | React 19, Tailwind CSS v4 |
| Animation | GSAP, Motion, Lenis |
| Video | Mux (public playback IDs) |
| Testing | Vitest, Testing Library, Playwright |
| Deployment | Vercel |

## Project Structure

```
portfolio/
├── docs/           # Documentation (you are here for the app README)
├── scripts/
│   └── ingest/     # Drive → Mux ingest CLI (Bash)
├── frontend/       # Next.js application
│   ├── src/        # Source code
│   ├── e2e/        # Playwright end-to-end tests
│   └── public/     # Static assets
└── README.md       # This file
```

The deployable application lives in [`frontend/`](frontend/). All npm commands run from that directory.

### Video ingest (local)

Upload masters from Google Drive to Mux and get playback IDs for `projects.ts`:

```bash
./scripts/ingest/ingest.sh doctor
./scripts/ingest/ingest.sh ingest --all-new
```

See [scripts/ingest/README.md](scripts/ingest/README.md) for full setup.

## Scripts

Run these from the `frontend/` directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run unit and component tests |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run check` | Lint, typecheck, test, and build |

See [docs/testing.md](docs/testing.md) for the full testing guide.
