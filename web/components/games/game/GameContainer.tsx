'use client'

import React from 'react'
import { useGameStore } from '@/store/useGameStore'
import { StartScreen } from './StartScreen'
import { GameEngine } from './GameEngine'
import { ResultsScreen } from './ResultsScreen'
import { calculateXP } from '@/lib/games/xp'

export function GameContainer() {
  const { status, vocabulary, score, correctAnswers, totalAttempts, resetGame } = useGameStore()

  const accuracy = totalAttempts > 0 ? correctAnswers / totalAttempts : 0
  const xp = calculateXP(score, correctAnswers, totalAttempts)

  if (status === 'idle') {
    return <StartScreen vocabulary={vocabulary} onStart={resetGame} />
  }

  if (status === 'playing') {
    return <GameEngine />
  }

  if (status === 'game-over') {
    return (
      <ResultsScreen
        score={score}
        accuracy={accuracy}
        xp={xp}
        onRestart={resetGame}
      />
    )
  }

  return null
}
