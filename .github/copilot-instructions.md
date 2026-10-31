# Mona Mayhem Copilot Instructions

## Project Overview

Mona Mayhem is a retro arcade GitHub Contribution Battle Arena. The app will compare GitHub contribution activity for two users and present the result as an engaging arcade-style experience.

## Technology Stack

- Astro 6
- JavaScript and TypeScript
- Tailwind CSS and/or Astro scoped CSS for styling
- Node.js with the Astro Node adapter
- GitHub contribution data API

## Development Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

Use `npm run dev` for local development and `npm run build` to verify production builds.

## Project Structure

- `src/pages/` contains Astro pages and API routes.
- `src/pages/api/contributions/[username].ts` is the dynamic endpoint for GitHub contribution data.
- `public/` contains static assets.
- `workshop/` contains the workshop instructions and should not be treated as application source code.

## Coding Rules

- Keep components modular and focused on one responsibility.
- Follow the existing file naming conventions and Astro project structure.
- Favor clean, readable code over clever abstractions.
- Use TypeScript types where they improve safety and clarity.
- Reuse existing helpers and patterns before introducing new abstractions.
- Keep API responses explicit and handle invalid input and upstream failures clearly.
- Avoid unrelated changes when implementing a feature.

## Astro Guidelines

- Use `.astro` files for page and component markup.
- Keep server-only logic in API routes or server-side frontmatter.
- Use `export const prerender = false` for routes that require runtime data.
- Preserve accessible HTML semantics, keyboard interaction, and responsive behavior.
- Keep styling local with scoped CSS or use Tailwind utility classes consistently within a component.

## Current Implementation Notes

- The home page is currently a minimal placeholder and will become the contribution battle arena.
- The contribution API route is currently stubbed and returns HTTP 501 with a `Not implemented` error. Implement GitHub contribution fetching there before wiring the battle UI to it.

## Design Guide

- Keep the Mona Mayhem interface visually consistent with a 1980s retro arcade fighting game.
- Use a dark CRT cabinet background around `#0a0a12`, with subtle scanlines and a vignette overlay.
- Use `Press Start 2P` for arcade headers, buttons, scores, and status indicators.
- Use `JetBrains Mono` for statistics and dense data.
- Player 1 uses neon cyan/green accents; Player 2 uses neon magenta/gold accents.
- Use neon borders, glow text shadows, restrained pulsing/flicker, and contribution cells whose glow increases with intensity.
- Respect `prefers-reduced-motion` for decorative animations.
