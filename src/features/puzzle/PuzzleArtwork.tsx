"use client";

import { useEffect, useRef, useState } from "react";

type PuzzleArtworkProps = {
  revealedTitle?: string;
  date: string;
  incorrectGuesses: number;
  solved: boolean;
};

export function PuzzleArtwork({
  revealedTitle,
  date,
  incorrectGuesses,
  solved,
}: PuzzleArtworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failedDate, setFailedDate] = useState<string | null>(null);
  const failed = failedDate === date;

  useEffect(() => {
    let active = true;
    const artwork = new window.Image();
    let attempts = 0;
    artwork.onload = () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (!active) {
        return;
      }

      if (
        !canvas ||
        !context ||
        artwork.naturalWidth === 0 ||
        artwork.naturalHeight === 0
      ) {
        setFailedDate(date);
        return;
      }

      const size = Math.min(artwork.naturalWidth, artwork.naturalHeight);
      const sourceX = (artwork.naturalWidth - size) / 2;
      const sourceY = (artwork.naturalHeight - size) / 2;
      const resolution = solved
        ? canvas.width
        : Math.min(96, 12 + incorrectGuesses * 12);
      const pixelCanvas = document.createElement("canvas");
      pixelCanvas.width = resolution;
      pixelCanvas.height = resolution;
      const pixelContext = pixelCanvas.getContext("2d");

      if (!pixelContext) {
        setFailedDate(date);
        return;
      }

      pixelContext.drawImage(
        artwork,
        sourceX,
        sourceY,
        size,
        size,
        0,
        0,
        resolution,
        resolution,
      );
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = solved;
      context.drawImage(pixelCanvas, 0, 0, canvas.width, canvas.height);
    };
    artwork.onerror = () => {
      if (active) {
        if (attempts === 0) {
          attempts = 1;
          artwork.src = `/api/puzzle-artwork?date=${encodeURIComponent(date)}&retry=1`;
        } else {
          setFailedDate(date);
        }
      }
    };
    artwork.src = `/api/puzzle-artwork?date=${encodeURIComponent(date)}`;

    return () => {
      active = false;
      artwork.onload = null;
      artwork.onerror = null;
    };
  }, [date, incorrectGuesses, solved]);

  if (failed) {
    return (
      <div aria-label="Album artwork unavailable" className="record-art artwork-unavailable" role="img">
        Artwork unavailable
      </div>
    );
  }

  return (
    <canvas
      aria-label={
        solved && revealedTitle
          ? `Album cover for ${revealedTitle}, revealed`
          : "Pixelated album cover; each incorrect guess reveals more"
      }
      className="record-art"
      height={400}
      ref={canvasRef}
      role="img"
      width={400}
    />
  );
}
