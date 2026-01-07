'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import type { RuneMatchGameResult } from '@/components/games/rune-match/RuneMatchGame'
import { SAMPLE_VOCABULARY } from '@/lib/games/sampleVocabulary'
import { useGameStore } from '@/store/useGameStore'

const RuneMatchGame = dynamic(
  () => import('@/components/games/rune-match/RuneMatchGame').then((mod) => mod.RuneMatchGame),
  { ssr: false }
)

export default function RuneMatchPage() {
  const router = useRouter()
  const vocabulary = useGameStore((state) => state.vocabulary)
  const setVocabulary = useGameStore((state) => state.setVocabulary)
  const setLastResult = useGameStore((state) => state.setLastResult)

  useEffect(() => {
    if (vocabulary.length === 0) {
      setVocabulary(SAMPLE_VOCABULARY)
    }
  }, [vocabulary.length, setVocabulary])

  const handleComplete = useCallback(
    (results: RuneMatchGameResult) => {
      setLastResult(results.xp, results.accuracy)
      router.push('/')
    },
    [setLastResult, router]
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
          <h1 className='text-4xl font-semibold tracking-tight md:text-5xl'>Rune Match</h1>
          <p className='max-w-2xl text-base text-white/70'>
            Match vocabulary runes to battle monsters in this RPG puzzle adventure.
          </p>
        </header>

        <RuneMatchGame vocabulary={vocabulary} onComplete={handleComplete} />
      </div>
    </main>
  )
}
