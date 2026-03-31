<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🔥 Matchstick Puzzle Solver

A **React + TypeScript + Vite** web app that lets users solve matchstick equation puzzles — drag a single matchstick to fix a broken equation!

## Tech Stack

- **React 19** + **TypeScript 5.8**
- **Vite 6** (build / dev server)
- **TailwindCSS v4** (via `@tailwindcss/vite` plugin)
- **Motion** (animations), **Lucide React** (icons)
- **Vitest** + **Testing Library** (tests)

## Project Structure

| File / Directory | Purpose |
|---|---|
| `index.html` | Entry point, mounts React to `#root` |
| `src/main.tsx` | React root render with StrictMode |
| `src/App.tsx` | Top-level app with **Quiz Mode** / **Solver Mode** toggle |
| `src/types.ts` | TypeScript types: `ParsedEquation`, `SegmentPattern`, `SolutionHighlights` |
| `src/constants.ts` | 7-segment display patterns for digits 0–9, operators `+`/`-`, and `=` |
| `src/utils.ts` | Core logic: `solveEquation()`, `generateRandomPuzzle()`, `evaluateExpression()`, pattern matching |
| `src/index.css` | TailwindCSS import + custom keyframe animations for stick highlights |
| `src/components/` | UI components (see below) |

## Components

| Component | Description |
|---|---|
| `QuizWorkspace.tsx` | Interactive drag-and-drop puzzle mode. User picks up and places matchsticks (SVG segments) to fix a broken equation. Supports click-to-place and pointer drag. Tracks solved/failed state. |
| `SolverWorkspace.tsx` | Input an equation, click Solve, and see all valid 1-stick-move solutions rendered with color-coded diffs (green = added, red = removed). |
| `EqualsSign.tsx` | Simple SVG equals sign component. |

## Core Algorithm

- **`solveEquation()`** — Brute-force: tries removing each active segment and placing it on every inactive segment across all characters. Validates if the resulting equation is mathematically correct. Input capped at 20 characters.
- **`generateRandomPuzzle()`** — Pre-generates all valid single-digit `A ± B = C` equations, then creates all 1-move permutations that produce an *incorrect* equation (a solvable puzzle). Results are cached.
- **7-segment model** — Digits and operators are represented as 7-element binary arrays mapping to a classic 7-segment display layout.

## Tests

- `src/utils.test.ts` — Unit tests for the solver and utility functions
- `src/components/*.test.tsx` — Component tests for `EqualsSign`, `QuizWorkspace`, and `SolverWorkspace`

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. Run the app:
   ```
   npm run dev
   ```
3. Run tests:
   ```
   npm test
   ```
