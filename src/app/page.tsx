import { PuzzleCard } from "@/features/puzzle/PuzzleCard";
import { formatPuzzleDate } from "@/features/puzzle/format";
import { todayPuzzle } from "@/features/puzzle/data";

export default function HomePage() {
  return (
    <div className="puzzle-page">
      <div className="puzzle-heading">
        <div>
          <div className="page-kicker">Listen closely</div>
          <h1 className="page-title">The daily spin.</h1>
          <p className="page-subtitle">
            A few clues. One record. How well do you know your music?
          </p>
        </div>
        <span className="date-chip">{formatPuzzleDate(todayPuzzle.date)}</span>
      </div>
      <PuzzleCard
        puzzle={{
          date: todayPuzzle.date,
          decade: todayPuzzle.decade,
          clues: todayPuzzle.clues,
        }}
      />
    </div>
  );
}
