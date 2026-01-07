"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect } from "react";
import type { WizardZombieGameResult } from "@/components/games/wizard-vs-zombie/WizardZombieGame";
import { SAMPLE_VOCABULARY } from "@/lib/games/sampleVocabulary";
import { useGameStore } from "@/store/useGameStore";

const WizardZombieGame = dynamic(
  () =>
    import("@/components/games/wizard-vs-zombie/WizardZombieGame").then(
      (mod) => mod.WizardZombieGame
    ),
  { ssr: false }
);

export default function WizardZombiePage() {
  const vocabulary = useGameStore((state) => state.vocabulary);
  const setVocabulary = useGameStore((state) => state.setVocabulary);
  const setLastResult = useGameStore((state) => state.setLastResult);

  useEffect(() => {
    if (vocabulary.length === 0) {
      setVocabulary(SAMPLE_VOCABULARY);
    }
  }, [vocabulary.length, setVocabulary]);

  const handleComplete = useCallback(
    (results: WizardZombieGameResult) => {
      setLastResult(results.xp, results.accuracy);
    },
    [setLastResult]
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Link
          href="/"
          className="text-sm uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
        >
          Back to Home
        </Link>

        <header className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Wizard vs Zombie
          </h1>
          <p className="max-w-2xl text-base text-white/70">
            Collect healing orbs and survive the zombie horde.
          </p>
        </header>

        <WizardZombieGame vocabulary={vocabulary} onComplete={handleComplete} />
      </div>
    </main>
  );
}
