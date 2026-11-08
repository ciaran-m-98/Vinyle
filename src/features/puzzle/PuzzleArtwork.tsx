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
  const currentResolutionRef = useRef<number | null>(null);
  const [loadedArtwork, setLoadedArtwork] = useState<{
    date: string;
    image: HTMLImageElement;
  } | null>(null);
  const [failedDate, setFailedDate] = useState<string | null>(null);
  const image = loadedArtwork?.date === date ? loadedArtwork.image : null;
  const failed = failedDate === date;

  useEffect(() => {
    let active = true;
    const artwork = new window.Image();
    let attempts = 0;
    artwork.onload = () => {
      if (!active) {
        return;
      }

      if (artwork.naturalWidth === 0 || artwork.naturalHeight === 0) {
        setFailedDate(date);
        return;
      }

      currentResolutionRef.current = null;
      setLoadedArtwork({ date, image: artwork });
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
  }, [date]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context || !image) {
      return;
    }

    const size = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceX = (image.naturalWidth - size) / 2;
    const sourceY = (image.naturalHeight - size) / 2;
    const targetResolution = solved
      ? canvas.width
      : Math.min(96, 12 + incorrectGuesses * 12);
    const startResolution = currentResolutionRef.current ?? targetResolution;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const shouldAnimate =
      !solved && !prefersReducedMotion && startResolution !== targetResolution;
    const pixelCanvas = document.createElement("canvas");
    const pixelContext = pixelCanvas.getContext("2d");

    if (!pixelContext) {
      return;
    }

    const drawAtResolution = (resolution: number) => {
      pixelCanvas.width = resolution;
      pixelCanvas.height = resolution;
      pixelContext.imageSmoothingEnabled = true;
      pixelContext.drawImage(
        image,
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
      context.imageSmoothingEnabled = resolution === canvas.width;
      context.drawImage(pixelCanvas, 0, 0, canvas.width, canvas.height);
      currentResolutionRef.current = resolution;
    };

    if (!shouldAnimate) {
      drawAtResolution(targetResolution);
      return;
    }

    const duration = 700;
    const startTime = performance.now();
    let frameId = 0;
    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const resolution = Math.round(
        startResolution + (targetResolution - startResolution) * eased,
      );
      drawAtResolution(resolution);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [date, image, incorrectGuesses, solved]);

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
