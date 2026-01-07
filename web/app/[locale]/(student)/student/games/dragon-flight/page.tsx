'use client'

import Link from 'next/link'
import { useCallback, useEffect } from 'react'
import { DragonFlightGame } from '@/components/games/dragon-flight/DragonFlightGame'
import type { DragonFlightResults } from '@/lib/games/dragonFlight'
import { SAMPLE_VOCABULARY } from '@/lib/games/sampleVocabulary'
import { useGameStore } from '@/store/useGameStore'

export default function DragonFlightPage() {
  const vocabulary = useGameStore((state) => state.vocabulary)
  const setVocabulary = useGameStore((state) => state.setVocabulary)
  const setLastResult = useGameStore((state) => state.setLastResult)

  useEffect(() => {
    setVocabulary(SAMPLE_VOCABULARY)
  }, [setVocabulary])

  const handleComplete = useCallback(
    (results: DragonFlightResults) => {
      setLastResult(results.xp, results.accuracy)
    },
    [setLastResult]
  )

  return (
    <main className='min-h-screen bg-slate-950 px-6 py-10 text-white'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-8'>
        <Link
          href='/'
          className='text-sm uppercase tracking-[0.2em] text-white/60 transition hover:text-white'
        >
          Back to Home
        </Link>

        <header className='flex flex-col gap-3'>
          <h1 className='text-4xl font-semibold tracking-tight md:text-5xl'>Dragon Flight</h1>
          <p className='max-w-2xl text-base text-white/70'>
            Choose the correct gate to grow your dragon flight before the Skeleton King arrives.
          </p>
        </header>

        <DragonFlightGame vocabulary={vocabulary} onComplete={handleComplete} />
      </div>
    </main>
  )
}
