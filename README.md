# Jay CMS — Frontend (CMS_FE_V1)

Frontend for Jay CMS: a visual site builder and admin UI built with React and Vite.

## About Jay CMS

Jay CMS is a lightweight, API-driven content management system and visual page builder focused on rapid website creation and editing. It enables non-technical users (designers, marketers, and content editors) to compose pages from reusable sections and templates while giving developers an extensible platform to add custom blocks and integrations.

Core ideas:
- Visual editing: drag-and-drop sections, inline text editing, and live preview for fast iterations.
- Structured content: pages are represented as structured JSON composed of section blocks that the frontend renders; the backend persists these models via a simple API.
- Reusable templates and sections: create and reuse templates across sites and pages to keep brand consistency.
- Extensible: add custom section components, integrations (analytics, forms, media storage), and templates.
- Roles & workflows: admin and editor roles with a focused UI for content management and publishing.

Common use cases: marketing sites, landing pages, simple company websites, and microsites that require frequent content updates without developer intervention.

## Features
- Visual page builder with draggable sections and editable content
- Rich text editing powered by TipTap
- Drag-and-drop ordering via dnd-kit
- Lightweight state management with Zustand
- Preview and build for production

## Tech stack
- React 19, TypeScript, Vite
- Tailwind CSS, TipTap, dnd-kit, Zustand

## Prerequisites
- Node.js 18+ (or latest LTS)
- npm (or pnpm/yarn)

## Setup
Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## Configuration
Set your API base URL or other environment values in [src/services/api.ts](src/services/api.ts).

## Project structure (high level)
- `src/components/` — UI components and builder pieces
- `src/pages/` — route pages (Builder, Dashboard, Public site, etc.)
- `src/store/` — Zustand stores (auth, builder)
- `src/services/` — API clients
- `src/layouts/` — layout components
- `public/` — static assets

## Contributing
1. Make changes on a feature branch.
2. Commit and push:
```bash
git add README.md
git commit -m "chore: update README"
git push origin main
```

Add a LICENSE file if you want to set a license for this project.

---
Updated README for GitHub push.
