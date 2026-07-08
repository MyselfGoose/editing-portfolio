# Getting Started

This guide walks you through setting up the Goose Productions portfolio for local development.

**Last verified against:** Next.js 16.2.9

## Prerequisites

- **Node.js** 20 or later ([download](https://nodejs.org/))
- **npm** 10+ (ships with Node.js)
- A modern browser (Chrome, Firefox, Safari, or Edge)

No database, API keys, or environment variables are required for local development. Video playback uses public Mux playback IDs baked into the source code.

## Installation

Clone the repository and install dependencies:

```bash
git clone git@github.com:MyselfGoose/editing-portfolio.git
cd editing-portfolio/frontend
npm install
```

## Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The page hot-reloads when you edit files in `src/`.

## Available Scripts

All commands run from the `frontend/` directory:

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Start development server on port 3000 |
| Build | `npm run build` | Create an optimized production build |
| Start | `npm run start` | Serve the production build locally |
| Lint | `npm run lint` | Run ESLint across the project |
| Typecheck | `npm run typecheck` | Run TypeScript compiler without emitting files |
| Test | `npm run test` | Run Vitest unit and component tests |
| Test (watch) | `npm run test:watch` | Run tests in watch mode |
| Coverage | `npm run test:coverage` | Run tests with coverage report |
| E2E | `npm run test:e2e` | Run Playwright end-to-end tests |
| Check | `npm run check` | Run lint, typecheck, test, and build in sequence |

## Production Preview

To test the production build locally:

```bash
npm run build
npm run start
```

This serves the optimized build at [http://localhost:3000](http://localhost:3000).

## Project Layout

The application source lives entirely in `frontend/`:

```
frontend/
├── src/
│   ├── app/          # Next.js App Router (layout, page, styles)
│   ├── components/   # React components (experience, projects, sections)
│   ├── data/         # Static content (projects)
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utilities, constants, Mux helpers
├── e2e/              # Playwright end-to-end tests
├── public/           # Static assets
└── package.json      # Dependencies and scripts
```

See [Project Structure](project-structure.md) for a detailed file-by-file map.

## Next Steps

- [Architecture](architecture.md) — Understand how the app is structured
- [Content Management](content-management.md) — Customize projects and brand
- [Testing](testing.md) — Run and write tests
