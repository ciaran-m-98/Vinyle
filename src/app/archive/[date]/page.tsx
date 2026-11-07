import Link from "next/link";
import { notFound } from "next/navigation";
import { PuzzleCard } from "@/features/puzzle/PuzzleCard";
import {
  archivePuzzles,
  getArchivedPuzzle,
} from "@/features/puzzle/data";
import { formatPuzzleDate } from "@/features/puzzle/format";

type ArchivedPuzzlePageProps = {
  params: Promise<{ date: string }>;
};

export function generateStaticParams() {
  return archivePuzzles.map((puzzle) => ({ date: puzzle.date }));
}

export default async function ArchivedPuzzlePage({
  params,
}: ArchivedPuzzlePageProps) {
  const { date } = await params;
  const puzzle = getArchivedPuzzle(date);

  if (!puzzle) {
    notFound();
  }

  return (
    <div className="puzzle-page">
      <div className="puzzle-heading">
        <div>
          <div className="page-kicker">
            <Link href="/archive">← Puzzle archive</Link>
          </div>
          <h1 className="page-title">A past spin.</h1>
          <p className="page-subtitle">{formatPuzzleDate(puzzle.date)}</p>
        </div>
        <span className="date-chip">ARCHIVE</span>
      </div>
      <PuzzleCard
        archived
        puzzle={{
          date: puzzle.date,
          decade: puzzle.decade,
          clues: puzzle.clues,
        }}
      />
    </div>
  );
}
