# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

| npm script | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server with HMR. Development server runs at `http://localhost:5173`.
| `npm run build` | Type‑check and build the site for production. Output is written to the `docs/` directory (the GitHub Pages deploy target).
| `npm run preview` | Serve the production build locally for testing. Useful after `npm run build`.
| `npm run lint` | Run ESLint on all TypeScript/TSX files.

There are currently no unit or integration tests in this repo, so no dedicated test script exists.

## Development Environment

- **Node**: 18+ (Node 22 is used in CI)
- **npm**: Package manager bundled with Node.
- **Environment Variables**:
  - `VITE_GITHUB_TOKEN`: When set in a `.env.local` file, authenticated GitHub API requests are used for repo stats in the editor.
  - `VITE_BASE`: Base URL path of the deployed site. Defaults to `/`. Can be set before building, e.g. `VITE_BASE=/my-portfolio/ npm run build`.
  - `VITE_OUT_DIR`: Build output directory. Defaults to `docs`.

## Project Structure Overview

```
portfolio/
├── src/
│   ├── sections/              # Page sections (Hero, About, Projects, Experience, Contact, Footer)
│   ├── components/
│   │   ├── ui/                # shadcn/ui component library
│   │   └── AnimatedBackground.tsx
│   ├── pages/
│   │   └── PortfolioEditor.tsx  # In‑app JSON editor (dev only)
│   ├── lib/
│   │   ├── portfolio.ts       # Data types and parsing helpers
│   │   ├── editorSchema.ts    # Zod schema for editor validation
│   │   └── utils.ts           # Shared utilities (cn, etc.)
│   ├── data/
│   │   └── portfolio.json     # Edit this file to update all content
│   ├── Assets/                # Static images and other assets
│   ├── App.tsx                # Route definitions
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles and CSS variables
├── docs/                      # Production build output (deployed to GitHub Pages)
├── vite.config.ts             # Vite configuration + custom plugins
├── tailwind.config.js         # Tailwind CSS configuration
├── components.json            # shadcn/ui configuration
└── .github/workflows/
    └── deploy-pages.yml       # Automated GitHub Pages deployment
```

- **Data** is stored in `src/data/portfolio.json`. The **Portfolio Editor** (accessible at `/editor` in dev mode) writes back to this file via a custom Vite middleware (`/__portfolio-json`).
- The site uses **React 19**, **TypeScript 5**, **Vite 7**, **Tailwind CSS 3**, **shadcn/ui**, **Radix UI**, and **GSAP** for animations.

## Deployment

- **Automatic**: Pushing to `main` triggers the GitHub Actions workflow `deploy-pages.yml`, which builds the site and publishes the `docs/` folder to GitHub Pages.
- **Manual**: Run `npm run build` to generate the `docs/` directory. Host this folder on any static hosting provider.

## Editing Content

1. Run `npm run dev`.
2. Open `http://localhost:5173/editor`.
3. Edit any field; changes are validated in real time.
4. Click **Save** to write the updated JSON back to `src/data/portfolio.json`.
5. The dev server hot‑reloads automatically.

> **Note**: The editor only works in development mode.

## Summary

- Use `npm run dev` for development.
- Use `npm run build` and `npm run preview` for production.
- Lint with `npm run lint`.
- Edit content via the `/editor` route in dev.
- Deployment is handled automatically by GitHub Actions.
