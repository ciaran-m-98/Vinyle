export type Puzzle = {
  date: string;
  answer: string;
  artist: string;
  decade: string;
  clues: string[];
};

export const todayPuzzle: Puzzle = {
  date: "2026-11-01",
  answer: "Discovery",
  artist: "Daft Punk",
  decade: "The 2000s",
  clues: [
    "A French electronic duo's second studio album",
    "Released at the start of the 2000s",
    "Blends house music with disco and synth-pop",
  ],
};

export const archivePuzzles: Puzzle[] = [
  {
    date: "2026-10-31",
    answer: "Paper Moons",
    artist: "June & the Weather",
    decade: "The 1970s",
    clues: ["A warm, acoustic sound", "Recorded in a converted farmhouse"],
  },
  {
    date: "2026-10-30",
    answer: "Soft Focus",
    artist: "Common Hours",
    decade: "The 1990s",
    clues: ["An independent debut", "A favorite of late-night radio"],
  },
  {
    date: "2026-10-29",
    answer: "Blue on Blue",
    artist: "The Sunday People",
    decade: "The 2000s",
    clues: ["Four-piece from the north", "Their first tour sold out in a day"],
  },
  {
    date: "2026-10-28",
    answer: "The Long Way Home",
    artist: "Marlowe Street",
    decade: "The 1960s",
    clues: ["A harmony-rich group", "A song about taking the scenic route"],
  },
];

export function getArchivedPuzzle(date: string): Puzzle | undefined {
  return archivePuzzles.find((puzzle) => puzzle.date === date);
}
