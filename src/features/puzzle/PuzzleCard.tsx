"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Puzzle } from "@/features/puzzle/data";
import { formatPuzzleDate } from "./format";
import { PuzzleArtwork } from "./PuzzleArtwork";

const PROGRESS_VERSION = 1;
const MAX_SAVED_GUESSES = 100;
const MAX_SAVED_HINTS = 20;
const PROGRESS_STORAGE_PREFIX = "vinyle:puzzle-progress:";

type PuzzleCardProps = {
  puzzle: Pick<Puzzle, "date">;
};

type PuzzleHint = {
  label: string;
  value: string;
  isFinalHint: boolean;
};

type PuzzleProgress = {
  version: typeof PROGRESS_VERSION;
  puzzleDate: string;
  guesses: string[];
  wrongGuesses: number;
  hints: PuzzleHint[];
  solved: boolean;
  gameOver: boolean;
  isFinalAttempt: boolean;
};

function isPuzzleHint(value: unknown): value is PuzzleHint {
  if (!value || typeof value !== "object") {
    return false;
  }

  const hint = value as Record<string, unknown>;
  return (
    typeof hint.label === "string" &&
    hint.label.length > 0 &&
    hint.label.length <= 100 &&
    typeof hint.value === "string" &&
    hint.value.length > 0 &&
    hint.value.length <= 200 &&
    typeof hint.isFinalHint === "boolean"
  );
}

function isPuzzleProgress(value: unknown, puzzleDate: string): value is PuzzleProgress {
  if (!value || typeof value !== "object") {
    return false;
  }

  const progress = value as Record<string, unknown>;
  if (
    progress.version !== PROGRESS_VERSION ||
    progress.puzzleDate !== puzzleDate ||
    !Array.isArray(progress.guesses) ||
    progress.guesses.length > MAX_SAVED_GUESSES ||
    !progress.guesses.every(
      (guess) =>
        typeof guess === "string" &&
        guess.trim().length > 0 &&
        guess.length <= 500,
    ) ||
    !Number.isInteger(progress.wrongGuesses) ||
    (progress.wrongGuesses as number) < 0 ||
    (progress.wrongGuesses as number) > progress.guesses.length ||
    !Array.isArray(progress.hints) ||
    progress.hints.length > MAX_SAVED_HINTS ||
    !progress.hints.every(isPuzzleHint) ||
    typeof progress.solved !== "boolean" ||
    typeof progress.gameOver !== "boolean" ||
    typeof progress.isFinalAttempt !== "boolean" ||
    (progress.solved && progress.gameOver)
  ) {
    return false;
  }

  const hints = progress.hints as PuzzleHint[];
  const hasFinalHint = hints.some((hint) => hint.isFinalHint);
  return (
    (!progress.solved || progress.guesses.length > 0) &&
    (!progress.gameOver ||
      (progress.guesses.length > 0 &&
        (progress.wrongGuesses as number) >= 2 &&
        progress.isFinalAttempt)) &&
    (hints.length === 0 || (progress.wrongGuesses as number) >= 2) &&
    hints.filter((hint) => hint.isFinalHint).length <= 1 &&
    progress.isFinalAttempt === hasFinalHint
  );
}

function progressStorageKey(puzzleDate: string) {
  return `vinyle:puzzle-progress:v${PROGRESS_VERSION}:${puzzleDate}`;
}

function clearPuzzleProgress(storage: Storage) {
  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (key?.startsWith(PROGRESS_STORAGE_PREFIX)) {
      storage.removeItem(key);
    }
  }
}

export function PuzzleCard({ puzzle }: PuzzleCardProps) {
  const [guess, setGuess] = useState("");
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [hints, setHints] = useState<PuzzleHint[]>([]);
  const [solved, setSolved] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isFinalAttempt, setIsFinalAttempt] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [solvedTitle, setSolvedTitle] = useState("");
  const [solvedArtist, setSolvedArtist] = useState("");
  const [requestError, setRequestError] = useState("");
  const [progressNotice, setProgressNotice] = useState("");
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let active = true;
    const storageKey = progressStorageKey(puzzle.date);

    async function restoreProgress() {
      await Promise.resolve();
      if (!active) {
        return;
      }

      let storage: Storage;
      let storedValue: string | null;
      try {
        storage = window.sessionStorage;
        storedValue = storage.getItem(storageKey);
      } catch {
        setProgressNotice("Session progress is unavailable in this browser.");
        setProgressLoaded(true);
        return;
      }

      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const existingKey = storage.key(index);
        if (
          existingKey?.startsWith(PROGRESS_STORAGE_PREFIX) &&
          existingKey !== storageKey
        ) {
          try {
            storage.removeItem(existingKey);
          } catch {
            setProgressNotice("Older puzzle progress could not be cleared.");
            break;
          }
        }
      }

      if (!storedValue) {
        setProgressLoaded(true);
        return;
      }

      let progress: PuzzleProgress | null = null;
      try {
        const parsed: unknown = JSON.parse(storedValue);
        if (isPuzzleProgress(parsed, puzzle.date)) {
          progress = parsed;
        }
      } catch {
        progress = null;
      }

      if (!progress) {
        try {
          window.sessionStorage.removeItem(storageKey);
        } catch {
          setProgressNotice("Saved progress was invalid and could not be cleared.");
        }
        setProgressNotice("Saved progress was invalid and has been reset.");
        setProgressLoaded(true);
        return;
      }

      setGuess("");
      setGuesses(progress.guesses);
      setWrongGuesses(progress.wrongGuesses);
      setHints(progress.hints);
      setIsFinalAttempt(progress.isFinalAttempt);
      setSolved(progress.solved);
      setGameOver(progress.gameOver);
      if (progress.solved) {
        setFeedback("That's it! You found the album.");
      } else if (progress.gameOver) {
        setFeedback("That was your final guess.");
      }

      if (!progress.solved && !progress.gameOver) {
        setProgressLoaded(true);
        return;
      }

      const lastGuess = progress.guesses[progress.guesses.length - 1];
      if (!lastGuess) {
        setSolved(false);
        setGameOver(false);
        setProgressNotice("Saved result was invalid and has been reset.");
        setProgressLoaded(true);
        return;
      }

      try {
        const response = await fetch("/api/puzzle-guess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: puzzle.date,
            guess: lastGuess,
            finalAttempt: progress.isFinalAttempt,
          }),
        });
        const result = (await response.json()) as {
          correct?: boolean;
          gameOver?: boolean;
          answer?: string;
          artist?: string;
        };
        const matchesSavedResult = progress.solved
          ? result.correct === true
          : result.gameOver === true;

        if (
          !response.ok ||
          !matchesSavedResult ||
          typeof result.answer !== "string" ||
          typeof result.artist !== "string"
        ) {
          try {
            window.sessionStorage.removeItem(storageKey);
          } catch {
            if (active) {
              setProgressNotice("Saved result was invalid and could not be cleared.");
            }
          }
          if (active) {
            setGuess("");
            setGuesses([]);
            setWrongGuesses(0);
            setHints([]);
            setSolved(false);
            setGameOver(false);
            setIsFinalAttempt(false);
            setFeedback("");
            setProgressNotice("Saved result could not be verified and was reset.");
          }
        } else if (active) {
          setSolvedTitle(result.answer);
          setSolvedArtist(result.artist);
        }
      } catch {
        if (active) {
          setRequestError("Could not restore the completed result. Please reload to retry.");
        }
      } finally {
        if (active) {
          setProgressLoaded(true);
        }
      }
    }

    void restoreProgress();
    return () => {
      active = false;
    };
  }, [puzzle.date]);

  useEffect(() => {
    if (!progressLoaded) {
      return;
    }

    try {
      const storage = window.sessionStorage;
      if (
        guesses.length === 0 &&
        wrongGuesses === 0 &&
        hints.length === 0 &&
        !solved &&
        !gameOver &&
        !isFinalAttempt
      ) {
        storage.removeItem(progressStorageKey(puzzle.date));
      } else {
        storage.setItem(
          progressStorageKey(puzzle.date),
          JSON.stringify({
            version: PROGRESS_VERSION,
            puzzleDate: puzzle.date,
            guesses,
            wrongGuesses,
            hints,
            solved,
            gameOver,
            isFinalAttempt,
          } satisfies PuzzleProgress),
        );
      }
    } catch {
      queueMicrotask(() => {
        setProgressNotice("Progress could not be saved or cleared in this browser session.");
      });
    }
  }, [
    gameOver,
    guesses,
    hints,
    isFinalAttempt,
    progressLoaded,
    puzzle.date,
    solved,
    wrongGuesses,
  ]);

  function resetPuzzleProgress() {
    let resetNotice = "";
    try {
      clearPuzzleProgress(window.sessionStorage);
    } catch {
      resetNotice =
        "The puzzle was reset, but saved progress could not be cleared in this browser.";
    }

    setGuess("");
    setWrongGuesses(0);
    setGuesses([]);
    setHints([]);
    setSolved(false);
    setGameOver(false);
    setIsFinalAttempt(false);
    setFeedback("");
    setSolvedTitle("");
    setSolvedArtist("");
    setRequestError("");
    setProgressNotice(resetNotice);
  }

  async function submitGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecking(true);
    setRequestError("");

    try {
      const response = await fetch("/api/puzzle-guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: puzzle.date,
          guess,
          finalAttempt: isFinalAttempt,
        }),
      });
      const result = (await response.json()) as {
        correct?: boolean;
        gameOver?: boolean;
        answer?: string;
        artist?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Could not check your guess.");
      }

      if (result.correct) {
        setGuesses((currentGuesses) => [...currentGuesses, guess.trim()]);
        setSolved(true);
        setSolvedTitle(result.answer ?? "");
        setSolvedArtist(result.artist ?? "");
        setFeedback("That's it! You found the album.");
      } else {
        const nextWrongGuesses = wrongGuesses + 1;
        setGuesses((currentGuesses) => [...currentGuesses, guess.trim()]);
        setWrongGuesses(nextWrongGuesses);
        setGuess("");

        if (result.gameOver) {
          setGameOver(true);
          setSolvedTitle(result.answer ?? "");
          setSolvedArtist(result.artist ?? "");
          setFeedback("That was your final guess.");
          return;
        }

        setFeedback(
          nextWrongGuesses < 2
            ? "Not quite. One more guess to unlock your first hint."
            : "Not quite. The cover is a little clearer now.",
        );

        if (nextWrongGuesses >= 2) {
          try {
            const hintParams = new URLSearchParams({
              date: puzzle.date,
              incorrectGuesses: String(nextWrongGuesses),
              index: String(hints.length),
            });
            const hintResponse = await fetch(`/api/puzzle-hint?${hintParams}`);
            const hintResult = (await hintResponse.json()) as {
              hint?: PuzzleHint | null;
              error?: string;
            };

            if (!hintResponse.ok) {
              throw new Error(hintResult.error ?? "Could not load the next hint.");
            }

            const hint = hintResult.hint;
            if (hint) {
              setHints((currentHints) => [...currentHints, hint]);
              setIsFinalAttempt(hint.isFinalHint);
              setFeedback(
                hint.isFinalHint
                  ? "Final hint unlocked. You have one last guess."
                  : "A new hint is ready.",
              );
            }
          } catch (error) {
            setRequestError(
              error instanceof Error
                ? error.message
                : "Could not load the next hint. Please try again.",
            );
          }
        }
      }
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Could not check your guess. Try again.",
      );
    } finally {
      setChecking(false);
    }
  }

  if (!progressLoaded) {
    return (
      <section
        aria-label={`Puzzle for ${formatPuzzleDate(puzzle.date)}`}
        className="puzzle-card"
      >
        <p aria-live="polite" className="hint-placeholder" role="status">
          Restoring your puzzle progress...
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label={`Puzzle for ${formatPuzzleDate(puzzle.date)}`}
      className="puzzle-card"
    >
      <PuzzleArtwork
        date={puzzle.date}
        incorrectGuesses={wrongGuesses}
        revealedTitle={solvedTitle}
        solved={solved || gameOver}
      />
      <div className="puzzle-details">
        <div className="round-label">Today&apos;s puzzle</div>
        <h2 className="puzzle-title">Name that record.</h2>
        <p className="puzzle-copy">
          Guess the album. Hints appear after two incorrect guesses.
        </p>
        {progressNotice && (
          <p aria-live="polite" className="guess-feedback" role="status">
            {progressNotice}
          </p>
        )}
        {hints.length > 0 ? (
          <ol aria-label="Album hints" className="clue-list">
            {hints.map((hint, index) => (
              <li className="clue-row" key={`${hint.label}-${index}`}>
                <span className="clue-number">{index + 1}</span>
                <span className="clue-text">
                  {hint.label}: {hint.value}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="hint-placeholder">
            Your first hint unlocks after two incorrect guesses.
          </p>
        )}
        <form className="guess-form" onSubmit={submitGuess}>
          <input
            aria-label="Your guess"
            autoComplete="off"
            className="guess-input"
            name="guess"
            placeholder="Type your guess..."
            onChange={(event) => setGuess(event.target.value)}
            required
            disabled={solved || gameOver || checking}
            value={guess}
          />
          <button
            className="guess-button"
            disabled={solved || gameOver || checking}
            type="submit"
          >
            {solved
              ? "Solved"
              : gameOver
                ? "Finished"
                : checking
                  ? "Checking..."
                  : isFinalAttempt
                    ? "Final guess"
                    : "Submit"}
          </button>
        </form>
        {requestError && (
          <p aria-live="polite" className="guess-feedback guess-feedback-error" role="alert">
            {requestError}
          </p>
        )}
        {feedback && (
          <p aria-live="polite" className="guess-feedback" role="status">
            {feedback}
          </p>
        )}
        {(solved || gameOver) && (
          <p className="solved-answer">
            {solved ? "You found it: " : "The album was "}
            {solvedTitle} · {solvedArtist}
          </p>
        )}
        <button
          className="progress-reset-button"
          disabled={checking}
          onClick={resetPuzzleProgress}
          type="button"
        >
          Reset test progress
        </button>
      </div>
    </section>
  );
}
