"use client";

import { FormEvent, useState } from "react";
import type { Puzzle } from "@/features/puzzle/data";
import { formatPuzzleDate } from "./format";
import { PuzzleArtwork } from "./PuzzleArtwork";

type PuzzleCardProps = {
  puzzle: Pick<Puzzle, "date" | "decade" | "clues">;
  archived?: boolean;
};

export function PuzzleCard({ puzzle, archived = false }: PuzzleCardProps) {
  const [guess, setGuess] = useState("");
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [solvedTitle, setSolvedTitle] = useState("");
  const [solvedArtist, setSolvedArtist] = useState("");
  const [requestError, setRequestError] = useState("");
  const [checking, setChecking] = useState(false);

  async function submitGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecking(true);
    setRequestError("");

    try {
      const response = await fetch("/api/puzzle-guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: puzzle.date, guess }),
      });
      const result = (await response.json()) as {
        correct?: boolean;
        answer?: string;
        artist?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Could not check your guess.");
      }

      if (result.correct) {
        setSolved(true);
        setSolvedTitle(result.answer ?? "");
        setSolvedArtist(result.artist ?? "");
        setFeedback("That's it! You found the album.");
      } else {
        setWrongGuesses((count) => count + 1);
        setFeedback("Not quite. The cover is a little clearer now.");
        setGuess("");
      }
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Could not check your guess. Try again.",
      );
    } finally {
      setChecking(false);
    }
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
        solved={solved}
      />
      <div className="puzzle-details">
        <div className="round-label">{archived ? "Archive puzzle" : "Today's puzzle"}</div>
        <h2 className="puzzle-title">Name that record.</h2>
        <p className="puzzle-copy">
          Uncover the record from the clues. One new mystery, every day.
        </p>
        <ul className="clue-list">
          {puzzle.clues.map((clue, index) => (
            <li className="clue-row" key={clue}>
              <span className="clue-number">{index + 1}</span>
              <span className="clue-text">{clue}</span>
            </li>
          ))}
          <li className="clue-row">
            <span className="clue-number">{puzzle.clues.length + 1}</span>
            <span className="clue-text">Released in {puzzle.decade}</span>
          </li>
        </ul>
        <form className="guess-form" onSubmit={submitGuess}>
          <input
            aria-label="Your guess"
            autoComplete="off"
            className="guess-input"
            name="guess"
            placeholder="Type your guess..."
            onChange={(event) => setGuess(event.target.value)}
            required
            disabled={solved || checking}
            value={guess}
          />
          <button className="guess-button" disabled={solved || checking} type="submit">
            {solved ? "Solved" : checking ? "Checking..." : "Submit"}
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
        {solved && (
          <p className="solved-answer">
            {solvedTitle} · {solvedArtist}
          </p>
        )}
      </div>
    </section>
  );
}
