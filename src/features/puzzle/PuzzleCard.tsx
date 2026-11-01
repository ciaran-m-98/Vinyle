import type { Puzzle } from "@/features/puzzle/data";
import { formatPuzzleDate } from "@/features/puzzle/data";

type PuzzleCardProps = {
  puzzle: Puzzle;
  archived?: boolean;
};

export function PuzzleCard({ puzzle, archived = false }: PuzzleCardProps) {
  return (
    <section
      aria-label={`Puzzle for ${formatPuzzleDate(puzzle.date)}`}
      className="puzzle-card"
    >
      <div
        aria-label="Abstract vinyl record placeholder, not album artwork"
        className="record-art"
        role="img"
      >
        <span className="record-label" />
      </div>
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
        <div className="guess-form">
          <input
            aria-label="Your guess"
            autoComplete="off"
            className="guess-input"
            name="guess"
            placeholder="Type your guess..."
          />
          <button className="guess-button" type="button">
            Submit
          </button>
        </div>
        <p className="mock-note">
          Sample puzzle content · Guess submission is a visual placeholder.
        </p>
      </div>
    </section>
  );
}
