"use client";

import { useState, type ReactNode } from "react";

export function SplashExperience({ children }: { children: ReactNode }) {
  const [hasStarted, setHasStarted] = useState(false);

  if (hasStarted) {
    return children;
  }

  return (
    <section aria-labelledby="splash-title" className="splash-page">
      <h1 className="splash-title" id="splash-title">
        Vinyle
      </h1>
      <p className="splash-tagline">Daily album guessing game</p>
      <button
        className="splash-button"
        onClick={() => setHasStarted(true)}
        type="button"
      >
        Play today&apos;s puzzle
      </button>
    </section>
  );
}
