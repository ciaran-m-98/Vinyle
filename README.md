# Vinyle

A daily album guessing game with pixelated artwork and progressive album hints.

## Getting started

```bash
npm install
npm run dev
```

The splash screen is at `/`; selecting Play reveals the puzzle without leaving
the page. `/play` remains available as a direct puzzle route. Progress is saved
per puzzle in the current tab's session storage and restored when the game is
reopened. Puzzle artwork is looked up server-side from TheAudioDB's public test
API and rendered pixelated on a canvas. Album hints begin after two incorrect
guesses and are revealed one at a time. Update `src/features/puzzle/data.ts` to
change the puzzle content.

Useful checks:

```bash
npm run lint
npm run build
```
