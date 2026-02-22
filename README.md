# The Unusual Chop Planner

A React + Tailwind meal planning app focused on Lagos-based meals for weekly breakfast, lunch, and dinner planning.

## Features

- Weekly Lagos meal plans for `Breakfast`, `Lunch`, and `Dinner`
- Dynamic meal selection (pick any combination like Lunch + Dinner only)
- Weight-loss toggle to prioritize lighter meals
- Cooking instructions, calories, and portion size per meal
- People-per-meal tab (adults + children) with portion scaling
- Blue/black primary palette with red/green secondary colors

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub deployment

This repo includes `.github/workflows/deploy.yml` for GitHub Pages deployment on pushes to `main`.

1. Push the repository to GitHub.
2. In GitHub repo settings, enable `Pages` with source as `GitHub Actions`.
3. Push to `main`; the workflow deploys the app automatically.

Note: `vite.config.ts` uses `/FoodApp/` as base path during GitHub Actions build. If your repository name is different, update `repoName` in `vite.config.ts`.
