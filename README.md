# Omar AbdElzaher — Portfolio

A modern, fully data-driven portfolio website for a senior game developer. Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**, it features a cyberpunk/game-dev aesthetic, smooth GSAP animations, and a built-in visual JSON editor so you can update every piece of content without touching code.

🌐 **Live site:** [omar92.github.io/portfolio](https://omar92.github.io/portfolio/)

---

## Features

- **Single-file content management** — All portfolio data lives in `src/data/portfolio.json`. Edit it directly or use the in-app editor.
- **Built-in Portfolio Editor** — Navigate to `/editor` in development to edit every section through a form UI that writes back to `portfolio.json` in real time.
- **Game-dev aesthetic** — Glassmorphism, neon glow, parallax animated background, GSAP scroll-triggered reveals, and a glitch text effect.
- **Project showcase** — Filterable grid of projects with lightbox screenshots, tags, stats, and external links.
- **Responsive design** — Mobile-first layout built with Tailwind CSS utility classes.
- **Dark theme** — A consistent cyan / violet / gold neon color palette defined via CSS variables.
- **Automated deployment** — GitHub Actions builds the site and deploys to GitHub Pages on every push to `main`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19, TypeScript 5 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 3, shadcn/ui, Radix UI |
| Animations | GSAP 3 + ScrollTrigger |
| Forms | React Hook Form 7 + Zod 4 |
| Icons | Lucide React |
| Deployment | GitHub Pages via GitHub Actions |

---

## Prerequisites

- **Node.js 18+** (Node.js 22 is used in CI)
- **npm** (comes with Node.js)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/omar92/portfolio.git
cd portfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The site is now available at **http://localhost:5173**.

The **Portfolio Editor** is available at **http://localhost:5173/editor**.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Type-check and build for production (output → `docs/`) |
| `npm run preview` | Serve the production build locally for testing |
| `npm run lint` | Run ESLint on all TypeScript/TSX files |

---

## Customizing Your Portfolio

All portfolio content is stored in a single JSON file:

```
src/data/portfolio.json
```

You can edit it directly **or** use the built-in editor UI (see below).

### Data structure

```json
{
  "personal": {
    "name": "Your Name",
    "title": "Your Title",
    "subtitle": "Your Subtitle",
    "location": "Your Location",
    "tagline": "Your tagline",
    "about": "Your bio paragraph",
    "avatar": "URL to your profile picture",
    "resume": "URL to your resume or GitHub profile",
    "contacts": {
      "email": "you@example.com",
      "phone": "+1 234 567 8900",
      "links": [
        { "label": "github",   "url": "https://github.com/you",   "icon": "Github" },
        { "label": "linkedin", "url": "https://linkedin.com/in/you", "icon": "Linkedin" }
      ]
    }
  },
  "stats": [
    { "value": 5, "suffix": "+", "label": "Years Experience" }
  ],
  "skills": [
    { "category": "Languages", "items": ["TypeScript", "Python"] }
  ],
  "experience": [
    {
      "id": "job-1",
      "company": "Acme Corp",
      "url": "https://acme.com",
      "position": "Senior Developer",
      "location": "Remote",
      "startDate": "2020-01",
      "endDate": "Present",
      "description": ["Bullet point 1", "Bullet point 2"],
      "skills": ["React", "Node.js"],
      "projectIds": []
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "school": "University Name",
      "degree": "B.Sc.",
      "field": "Computer Science",
      "startYear": 2014,
      "endYear": 2018
    }
  ],
  "projects": [
    {
      "id": "project-1",
      "name": "My Project",
      "category": "Game",
      "image": "https://example.com/image.png",
      "featured": true,
      "tags": ["Unity", "C#"],
      "filterTags": ["Unity"],
      "shortDescription": "A short description",
      "description": "A longer description of the project.",
      "links": [
        { "label": "GitHub", "url": "https://github.com/you/project", "icon": "Github" }
      ],
      "features": ["Feature 1", "Feature 2"],
      "platforms": ["PC", "Mobile"],
      "skills": ["Unity", "C#"]
    }
  ]
}
```

### Using the built-in Portfolio Editor

1. Run `npm run dev`.
2. Open **http://localhost:5173/editor** in your browser.
3. Edit any field in the form UI — changes are validated in real time.
4. Click **Save** to write the updated JSON back to `src/data/portfolio.json`.
5. The development server hot-reloads automatically so you can see changes instantly.

> **Note:** The editor only works in development mode. It uses a custom Vite middleware (`/__portfolio-json` endpoint) to read and write the JSON file on disk.

---

## Project Structure

```
portfolio/
├── src/
│   ├── sections/              # Page sections (Hero, About, Projects, Experience, Contact, Footer)
│   ├── components/
│   │   ├── ui/                # shadcn/ui component library
│   │   └── AnimatedBackground.tsx
│   ├── pages/
│   │   └── PortfolioEditor.tsx  # In-app JSON editor
│   ├── lib/
│   │   ├── portfolio.ts       # Data types and parsing helpers
│   │   ├── editorSchema.ts    # Zod schema for editor validation
│   │   └── utils.ts           # Shared utilities (cn, etc.)
│   ├── data/
│   │   └── portfolio.json     # ← Edit this file to update all content
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

---

## Deployment

### GitHub Pages (automatic)

The repository is configured for **automatic deployment** via GitHub Actions:

1. Push to the `main` branch.
2. The workflow (`.github/workflows/deploy-pages.yml`) runs `npm ci && npm run build`.
3. The contents of the `docs/` directory are deployed to GitHub Pages.
4. The live site is updated at `https://<your-username>.github.io/portfolio/`.

### Manual build

```bash
npm run build
```

The production-ready site is written to the `docs/` directory. You can host this folder on any static hosting provider (Netlify, Vercel, Cloudflare Pages, etc.).

### Configuration

| Environment variable | Default | Description |
|---|---|---|
| `VITE_BASE` | `/portfolio/` (prod) / `/` (dev) | Base URL path of the deployed site |
| `VITE_OUT_DIR` | `docs` | Build output directory |

To deploy to a custom sub-path, set `VITE_BASE` before building:

```bash
VITE_BASE=/my-portfolio/ npm run build
```

---

## Customizing the Design

- **Colors** — CSS custom properties are defined in `src/index.css`. Look for the `:root` block to change the primary, secondary, and accent colors.
- **Fonts** — Font families are configured in `tailwind.config.js`.
- **Section layout** — Each section is a standalone component in `src/sections/`. You can reorder, hide, or modify sections in `src/App.tsx`.
- **Animations** — GSAP timelines are co-located with each section component for easy adjustment.

---

## License

This project is open source. Feel free to fork it and adapt it for your own portfolio.
