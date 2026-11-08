import { todayPuzzle } from "@/features/puzzle/data";

type TheAudioDbAlbum = {
  intYearReleased?: unknown;
  strGenre?: unknown;
  strStyle?: unknown;
  strReleaseFormat?: unknown;
  strLabel?: unknown;
  strArtist?: unknown;
};

type PuzzleHint = {
  label: string;
  value: string;
  isFinalHint: boolean;
};

function text(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? String(value) : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized && normalized !== "0" ? normalized : null;
}

function createHints(album: TheAudioDbAlbum | undefined): PuzzleHint[] {
  const candidates: Array<[string, unknown]> = [
    ["Release year", album?.intYearReleased],
    ["Genre", album?.strGenre],
    ["Style", album?.strStyle],
    ["Release format", album?.strReleaseFormat],
    ["Label", album?.strLabel],
  ];
  const hints = candidates.flatMap(([label, value]) => {
    const hintValue = text(value);
    return hintValue ? [{ label, value: hintValue, isFinalHint: false }] : [];
  });

  hints.push({
    label: "Artist",
    value: text(album?.strArtist) ?? todayPuzzle.artist,
    isFinalHint: true,
  });

  return hints;
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const date = searchParams.get("date");
  const incorrectGuesses = Number(searchParams.get("incorrectGuesses"));
  const index = Number(searchParams.get("index"));

  if (date !== todayPuzzle.date) {
    return Response.json({ error: "Puzzle not found." }, { status: 404 });
  }

  if (
    !Number.isInteger(incorrectGuesses) ||
    incorrectGuesses < 2 ||
    !Number.isInteger(index) ||
    index < 0 ||
    index > incorrectGuesses - 2
  ) {
    return Response.json(
      { error: "Make more guesses to unlock this hint." },
      { status: 400 },
    );
  }

  try {
    const params = new URLSearchParams({
      s: todayPuzzle.artist,
      a: todayPuzzle.answer,
    });
    const response = await fetch(
      `https://www.theaudiodb.com/api/v1/json/123/searchalbum.php?${params}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!response.ok) {
      return Response.json(
        { error: "The album service is unavailable." },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      album?: TheAudioDbAlbum[] | null;
    };
    const album = Array.isArray(data.album) ? data.album[0] : undefined;
    const hint = createHints(album)[index] ?? null;

    return Response.json({ hint });
  } catch (error) {
    console.error("Failed to fetch a puzzle hint from TheAudioDB.", error);
    return Response.json(
      { error: "Could not load the next hint. Please try again." },
      { status: 502 },
    );
  }
}
