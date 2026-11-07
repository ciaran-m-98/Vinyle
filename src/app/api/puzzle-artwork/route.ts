import {
  archivePuzzles,
  todayPuzzle,
} from "@/features/puzzle/data";

type TheAudioDbAlbum = {
  strAlbumThumb?: unknown;
};

async function fetchWithRetry(url: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok || response.status < 500 || attempt === 1) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt === 1) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("TheAudioDB request failed.");
}

function isArtworkUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "theaudiodb.com" ||
        url.hostname.endsWith(".theaudiodb.com"))
    );
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date");
  const puzzle =
    date === todayPuzzle.date
      ? todayPuzzle
      : archivePuzzles.find((item) => item.date === date);

  if (!puzzle) {
    return new Response("Puzzle not found.", { status: 404 });
  }

  try {
    const searchParams = new URLSearchParams({
      s: puzzle.artist,
      a: puzzle.answer,
    });
    const albumEndpoint = `https://www.theaudiodb.com/api/v1/json/123/searchalbum.php?${searchParams}`;
    let artworkUrl: unknown;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const albumResponse = await fetchWithRetry(albumEndpoint);

      if (!albumResponse.ok) {
        return new Response("The album service is unavailable.", { status: 502 });
      }

      try {
        const data = (await albumResponse.json()) as {
          album?: TheAudioDbAlbum[] | null;
        };
        artworkUrl = data.album?.[0]?.strAlbumThumb;
      } catch (error) {
        if (attempt === 1) {
          throw error;
        }
      }

      if (isArtworkUrl(artworkUrl)) {
        break;
      }
    }

    if (!isArtworkUrl(artworkUrl)) {
      return new Response("No album artwork was returned for this puzzle.", {
        status: 404,
      });
    }

    const artworkResponse = await fetchWithRetry(artworkUrl);
    const contentType = artworkResponse.headers.get("content-type");

    if (
      !artworkResponse.ok ||
      !contentType?.toLowerCase().startsWith("image/")
    ) {
      return new Response("Album artwork is unavailable.", { status: 502 });
    }

    return new Response(artworkResponse.body, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("Failed to fetch daily puzzle artwork from TheAudioDB.", error);
    return new Response("Album artwork is unavailable.", { status: 502 });
  }
}
