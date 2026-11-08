import { todayPuzzle } from "@/features/puzzle/data";

type GuessRequest = {
  date?: unknown;
  guess?: unknown;
  finalAttempt?: unknown;
};

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

  if (body.date !== todayPuzzle.date) {
    return Response.json({ error: "Puzzle not found." }, { status: 404 });
  }

  if (typeof body.guess !== "string" || !body.guess.trim()) {
    return Response.json({ error: "Enter a guess to continue." }, { status: 400 });
  }

  if (normalizeGuess(body.guess) !== normalizeGuess(todayPuzzle.answer)) {
    if (body.finalAttempt === true) {
      return Response.json({
        correct: false,
        gameOver: true,
        answer: todayPuzzle.answer,
        artist: todayPuzzle.artist,
      });
    }

    return Response.json({ correct: false });
  }

  return Response.json({
    correct: true,
    answer: todayPuzzle.answer,
    artist: todayPuzzle.artist,
  });
}
