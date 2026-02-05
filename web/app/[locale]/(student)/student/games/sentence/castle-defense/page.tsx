'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect } from 'react'
import { loadVocabulary } from '@/lib/games/vocabLoader'
import { useGameStore } from '@/store/useGameStore'

const CastleDefenseGame = dynamic(
  () => import('@/components/games/sentence/castle-defense').then((mod) => mod.CastleDefenseGame),
  { ssr: false }
)

export default function CastleDefensePage() {
  const vocabulary = useGameStore((state) => state.vocabulary)
  const setVocabulary = useGameStore((state) => state.setVocabulary)
  const setLastResult = useGameStore((state) => state.setLastResult)

  useEffect(() => {
    if (vocabulary.length === 0) {
      loadVocabulary('castle-defense')
        .then((vocab) => setVocabulary(vocab))
        .catch((error) => console.error('Failed to load vocabulary:', error))
    }
  }, [vocabulary.length, setVocabulary])

  const handleComplete = useCallback(
    (results: { xp: number; accuracy: number }) => {
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
          <h1 className='text-4xl font-semibold tracking-tight md:text-5xl'>Castle Defense</h1>
          <p className='max-w-2xl text-base text-white/70'>
            Collect words to build towers and defend your castle!
          </p>
        </header>

        <CastleDefenseGame vocabulary={vocabulary} onComplete={handleComplete} />
      </div>
    </main>
  )
}
