# Vinyle

A small Next.js starter for a daily music puzzle. Puzzle content is fictional
sample data, and the record illustration is an original CSS placeholder.

## Getting started

```bash
npm install
npm run dev
```

The app includes the daily puzzle at `/`, a list of sample puzzles at `/archive`,
and archived puzzle pages at `/archive/[date]`. The daily puzzle artwork is
looked up server-side from TheAudioDB's public test API and rendered pixelated
on a canvas; incorrect guesses progressively reveal it. Update
`src/features/puzzle/data.ts` to change the puzzle content. The archive entries
are fictional sample puzzles and may not have matching album artwork.

Useful checks:

```bash
npm run lint
npm run build
```
