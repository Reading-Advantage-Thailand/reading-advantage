'use client'

import { useEffect } from 'react'
import { GameContainer } from '@/components/games/game/GameContainer'
import { useGameStore } from '@/store/useGameStore'
import { SAMPLE_VOCABULARY } from '@/lib/games/sampleVocabulary'

export default function MagicDefensePage() {
  const setVocabulary = useGameStore((state) => state.setVocabulary)

  useEffect(() => {
    setVocabulary(SAMPLE_VOCABULARY)
  }, [setVocabulary])

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
            Magic Defense
          </h1>
          <p className="text-muted-foreground">
            Defend your castles from the falling words!
          </p>
        </header>

        <GameContainer />
      </div>
    </main>
  )
}
