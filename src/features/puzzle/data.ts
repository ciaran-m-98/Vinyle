export type Puzzle = {
  date: string;
  answer: string;
  artist: string;
  decade: string;
  clues: string[];
};

// Fictional sample content for the scaffold; replace with real puzzle data later.
export const todayPuzzle: Puzzle = {
  date: "2026-11-01",
  answer: "Midnight Frequencies",
  artist: "The Velvet Satellites",
  decade: "The 1980s",
  clues: [
    "A synth-driven record from the 1980s",
    "The band formed beside the sea",
    "Their best-known single mentions a city at night",
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

export function formatPuzzleDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
