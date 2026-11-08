import { PuzzleCard } from "@/features/puzzle/PuzzleCard";
import { todayPuzzle } from "@/features/puzzle/data";
import { formatPuzzleDate } from "@/features/puzzle/format";
import { SplashExperience } from "./SplashExperience";

export default function HomePage() {
  return (
    <SplashExperience>
      <div className="puzzle-page">
        <div className="puzzle-heading">
          <div>
            <div className="page-kicker">Listen closely</div>
            <h1 className="page-title">The daily spin.</h1>
            <p className="page-subtitle">
              A few guesses. One record. How well do you know your music?
            </p>
          </div>
          <span className="date-chip">{formatPuzzleDate(todayPuzzle.date)}</span>
        </div>
        <PuzzleCard
          key={todayPuzzle.date}
          puzzle={{
            date: todayPuzzle.date,
          }}
        />
      </div>
    </SplashExperience>
  );
}
