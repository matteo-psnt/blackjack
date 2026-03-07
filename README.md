# Blackjack

A browser-based blackjack table built with React, TypeScript, Zustand, Framer Motion, and Vite.

## Scripts

- `npm run dev`: start the Vite dev server
- `npm run build`: build the production bundle into `dist/`
- `npm run preview`: serve the production build locally
- `npm run test`: run Vitest in watch mode
- `npm run test:run`: run Vitest once
- `npm run lint`: run ESLint
- `npm run format`: format the repository with Prettier

## Project Structure

```text
src/
  app shell and bootstrap:
    App.tsx
    main.tsx
    styles/index.css
  game/model:
    Deck.ts
    enums.ts
    types.ts
  components:
    table and control UI
  store:
    Zustand game state
  utils:
    gameplay helpers
  hooks:
    UI-specific hooks
  test:
    shared test utilities
```

## Development

Install dependencies with `npm install`, then start the app with `npm run dev`.
