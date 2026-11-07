import { archivePuzzles, todayPuzzle } from "@/features/puzzle/data";

type GuessRequest = {
  date?: unknown;
  guess?: unknown;
};

function findPuzzle(date: unknown) {
  if (typeof date !== "string") {
    return undefined;
  }

  return date === todayPuzzle.date
    ? todayPuzzle
    : archivePuzzles.find((puzzle) => puzzle.date === date);
}

function normalizeGuess(value: string) {
  return value.trim().normalize("NFKC").toLocaleLowerCase();
}

export async function POST(request: Request) {
  let body: GuessRequest;

  try {
    body = (await request.json()) as GuessRequest;
  } catch {
    return Response.json({ error: "Enter a guess to continue." }, { status: 400 });
  }

  const puzzle = findPuzzle(body.date);

  if (!puzzle) {
    return Response.json({ error: "Puzzle not found." }, { status: 404 });
  }

  if (typeof body.guess !== "string" || !body.guess.trim()) {
    return Response.json({ error: "Enter a guess to continue." }, { status: 400 });
  }

  if (normalizeGuess(body.guess) !== normalizeGuess(puzzle.answer)) {
    return Response.json({ correct: false });
  }

  return Response.json({
    correct: true,
    answer: puzzle.answer,
    artist: puzzle.artist,
  });
}
