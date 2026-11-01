import Link from "next/link";
import { archivePuzzles, formatPuzzleDate } from "@/features/puzzle/data";

export default function ArchivePage() {
  return (
    <div className="archive-page">
      <div className="archive-heading">
        <div>
          <div className="page-kicker">The back catalogue</div>
          <h1 className="page-title">Puzzle archive.</h1>
          <p className="page-subtitle">Missed a day? Take another spin.</p>
        </div>
        <span className="archive-count">{archivePuzzles.length} PUZZLES</span>
      </div>
      <div className="archive-grid">
        {archivePuzzles.map((puzzle) => (
          <Link
            aria-label={`${puzzle.answer} by ${puzzle.artist}, ${formatPuzzleDate(puzzle.date)}`}
            className="archive-card"
            href={`/archive/${puzzle.date}`}
            key={puzzle.date}
          >
            <span aria-hidden="true" className="archive-art">
              v.
            </span>
            <span className="archive-info">
              <span className="archive-date">{formatPuzzleDate(puzzle.date)}</span>
              <span className="archive-title">{puzzle.answer}</span>
              <span className="archive-artist">{puzzle.artist}</span>
            </span>
            <span aria-hidden="true" className="archive-arrow">
              ↗
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
