"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import type { EnchantedLibraryGameResult } from "@/components/games/vocabulary/enchanted-library/EnchantedLibraryGame";
import type { VocabularyItem } from "@/store/useGameStore";
import type { Difficulty } from "@/lib/games/enchantedLibrary";

const EnchantedLibraryGame = dynamic(
  () =>
    import("@/components/games/vocabulary/enchanted-library/EnchantedLibraryGame").then(
      (mod) => mod.EnchantedLibraryGame,
    ),
  { ssr: false },
);

interface RankingEntry {
  userId: string;
  name: string;
  image: string | null;
  xp: number;
}

export default function EnchantedLibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [rankings, setRankings] = useState<Record<Difficulty, RankingEntry[]>>({
    easy: [],
    normal: [],
    hard: [],
    extreme: [],
  });

  // Load vocabulary from API
  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/v1/games/enchanted-library/vocabulary?locale=${locale}`,
        );
        const data = await response.json();

        if (
          data.warning === "NO_VOCABULARY" ||
          data.warning === "INSUFFICIENT_VOCABULARY"
        ) {
          setError(data.message);
          setVocabulary([]);
        } else if (data.vocabulary) {
          setVocabulary(data.vocabulary);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load vocabulary:", err);
        setError("Failed to load vocabulary. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadVocabulary();
  }, [locale]);

  // Load rankings
  useEffect(() => {
    const loadRankings = async () => {
      try {
        const response = await fetch("/api/v1/games/enchanted-library/ranking");
        const data = await response.json();

        if (data.rankings) {
          setRankings(data.rankings);
        }
      } catch (err) {
        console.error("Failed to load rankings:", err);
      }
    };

    loadRankings();
  }, []);

  const handleComplete = useCallback(
    async (results: EnchantedLibraryGameResult & { gameTime: number }) => {
      try {
        const response = await fetch(
          "/api/v1/games/enchanted-library/complete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              score: results.xp,
              correctAnswers: Math.floor(results.xp / results.accuracy),
              totalAttempts: Math.floor(
                results.xp / results.accuracy / results.accuracy,
              ),
              accuracy: results.accuracy,
              difficulty,
              gameTime: results.gameTime,
            }),
          },
        );

        const data = await response.json();

        if (data.xpEarned) {
          console.log("Game completed! XP earned:", data.xpEarned);
          // Reload rankings after game completion
          const rankingsResponse = await fetch(
            "/api/v1/games/enchanted-library/ranking",
          );
          const rankingsData = await rankingsResponse.json();
          if (rankingsData.rankings) {
            setRankings(rankingsData.rankings);
          }
        }
      } catch (err) {
        console.error("Failed to save game results:", err);
      }
    },
    [difficulty],
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white flex items-center justify-center">
        <div className="text-xl">Loading vocabulary...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <Link
            href="/student/games"
            className="text-sm uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
          >
            Back to Games
          </Link>

          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Unable to Load Game</h2>
            <p className="text-red-200">{error}</p>
            <p className="text-sm text-red-300 mt-4">
              Please save some vocabulary words to your flashcards first by
              reading articles.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Link
          href="/student/games"
          className="text-sm uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
        >
          Back to Games
        </Link>

        <header className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Enchanted Library
          </h1>
          <p className="max-w-2xl text-base text-white/70">
            Collect magic books to master new words while dodging friendly
            spirits.
          </p>
        </header>

        <EnchantedLibraryGame
          vocabulary={vocabulary}
          onComplete={handleComplete}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          rankings={rankings}
        />
      </div>
    </main>
  );
}
