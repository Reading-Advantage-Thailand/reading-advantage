'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useGameStore } from '@/store/useGameStore'
import { useRPGBattleStore } from '@/store/useRPGBattleStore'
import { selectBattleActions, WordPerformance } from '@/lib/games/rpgBattleWordSelection'
import { calculateRpgBattleXp } from '@/lib/games/rpgBattleXp'
import { SAMPLE_VOCABULARY } from '@/lib/games/sampleVocabulary'
import { battleEnemies, battleHeroes, battleLocations } from '@/lib/games/rpgBattleSelection'
import { rollEnemyDamage, scaleBattleXp, scaleEnemyHealth } from '@/lib/games/rpgBattleScaling'
import { ActionMenu } from '@/components/games/rpg-battle/ActionMenu'
import { BattleScene } from '@/components/games/rpg-battle/BattleScene'
import { BattleLog } from '@/components/games/rpg-battle/BattleLog'
import { HealthBar } from '@/components/games/rpg-battle/HealthBar'
import { Sprite } from '@/components/games/rpg-battle/Sprite'
import { BattleResults } from '@/components/games/rpg-battle/BattleResults'
import { BattleEffects } from '@/components/games/rpg-battle/BattleEffects'
import { BattleSelectionModal } from '@/components/games/rpg-battle/BattleSelectionModal'
import { useSound } from '@/hooks/useSound'
import { AnimatePresence, motion } from 'framer-motion'

const ACTION_COUNT = 3
const BASIC_DAMAGE = 10
const POWER_DAMAGE = 18
const MAX_TURNS = 12

export default function RpgBattlePage() {
  const vocabulary = useGameStore((state) => state.vocabulary)
  const setVocabulary = useGameStore((state) => state.setVocabulary)
  const {
    playerHealth,
    playerMaxHealth,
    enemyHealth,
    enemyMaxHealth,
    turn,
    status,
    battleLog,
    playerPose,
    enemyPose,
    inputLocked,
    revealedTranslation,
    selectionStep,
    selectedHeroId,
    selectedLocationId,
    selectedEnemyId,
    streak,
    initializeBattle,
    setStatus,
    setTurn,
    damageEnemy,
    enemyAttack,
    submitAnswer,
    addLogEntry,
    selectHero,
    selectLocation,
    selectEnemy,
    resetSelection,
  } = useRPGBattleStore()

  const [inputValue, setInputValue] = useState('')
  const [performance, setPerformance] = useState<Record<string, WordPerformance>>({})
  const [turnsTaken, setTurnsTaken] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [shakeKey, setShakeKey] = useState(0)
  const [flashKey, setFlashKey] = useState(0)
  const [flashTone, setFlashTone] = useState<'player' | 'enemy'>('enemy')
  const [showResults, setShowResults] = useState(false)
  const [resultXp, setResultXp] = useState(1)
  const [resultAccuracy, setResultAccuracy] = useState(0)
  const [heroSprite, setHeroSprite] = useState(() => battleHeroes[0].sprite)
  const [enemySprite, setEnemySprite] = useState(() => battleEnemies[0].sprite)
  const { playSound } = useSound()
  const resultsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedEnemy = useMemo(
    () => battleEnemies.find((enemy) => enemy.id === selectedEnemyId),
    [selectedEnemyId]
  )
  const enemyMultiplier = selectedEnemy?.multiplier ?? 1
  const selectedLocation = useMemo(
    () => battleLocations.find((location) => location.id === selectedLocationId),
    [selectedLocationId]
  )

  useEffect(() => {
    setVocabulary(SAMPLE_VOCABULARY)
    resetSelection()
    setStatus('idle')
  }, [resetSelection, setStatus, setVocabulary])

  useEffect(() => {
    if (selectionStep !== 'ready' || !selectedHeroId || !selectedEnemyId) {
      return
    }

    const heroSelection = battleHeroes.find((hero) => hero.id === selectedHeroId) ?? battleHeroes[0]
    const enemySelection = selectedEnemy ?? battleEnemies[0]

    setHeroSprite(heroSelection.sprite)
    setEnemySprite(enemySelection.sprite)
    initializeBattle({ enemyMaxHealth: scaleEnemyHealth(enemySelection.multiplier) })
  }, [initializeBattle, selectedEnemy, selectedEnemyId, selectedHeroId, selectionStep])

  useEffect(() => {
    setLongestStreak((prev) => Math.max(prev, streak))
  }, [streak])

  const actions = useMemo(
    () => selectBattleActions(vocabulary, performance, { count: ACTION_COUNT }),
    [performance, vocabulary]
  )

  const { totalCorrect, totalAttempts } = useMemo(() => {
    return Object.values(performance).reduce(
      (acc, entry) => ({
        totalCorrect: acc.totalCorrect + entry.correct,
        totalAttempts: acc.totalAttempts + entry.attempts,
      }),
      { totalCorrect: 0, totalAttempts: 0 }
    )
  }, [performance])

  useEffect(() => {
    if (resultsTimeoutRef.current) {
      clearTimeout(resultsTimeoutRef.current)
      resultsTimeoutRef.current = null
    }

    if (status === 'victory' || status === 'defeat') {
      const accuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0
      setResultAccuracy(accuracy)
      const baseXp = calculateRpgBattleXp({
        playerHealth,
        playerMaxHealth,
        turnsTaken: Math.max(1, turnsTaken),
        maxTurns: MAX_TURNS,
        longestStreak,
      })
      setResultXp(scaleBattleXp(baseXp, enemyMultiplier))
      setShowResults(false)
      resultsTimeoutRef.current = setTimeout(() => {
        setShowResults(true)
      }, 1200)
    } else {
      setShowResults(false)
    }

    return () => {
      if (resultsTimeoutRef.current) {
        clearTimeout(resultsTimeoutRef.current)
        resultsTimeoutRef.current = null
      }
    }
  }, [
    status,
    longestStreak,
    playerHealth,
    playerMaxHealth,
    totalAttempts,
    totalCorrect,
    turnsTaken,
    enemyMultiplier,
  ])

  const menuActions = useMemo(
    () => actions.map((action) => ({ id: action.id, label: action.term, power: action.power })),
    [actions]
  )

  const updatePerformance = (term: string, correct: boolean) => {
    setPerformance((prev) => {
      const current = prev[term] ?? { correct: 0, attempts: 0 }
      return {
        ...prev,
        [term]: {
          correct: current.correct + (correct ? 1 : 0),
          attempts: current.attempts + 1,
        },
      }
    })
  }

  const triggerEnemyTurn = () => {
    const damage = rollEnemyDamage(enemyMultiplier)
    setTurn('enemy')
    setTimeout(() => {
      enemyAttack(damage)
      setTurnsTaken((prev) => prev + 1)
      setFlashTone('player')
      setFlashKey((prev) => prev + 1)
      setShakeKey((prev) => prev + 1)
      addLogEntry('Enemy strikes back!', 'enemy')
      playSound('missile-hit')
    }, 600)
  }

  const handleSubmit = (value: string) => {
    if (status !== 'playing' || inputLocked || turn !== 'player') return

    const normalized = value.trim().toLowerCase()
    const matched = actions.find((action) => action.translation.toLowerCase() === normalized)
    const fallback = actions.find((action) => action.power === 'power') ?? actions[0]

    if (matched) {
      const damage = matched.power === 'power' ? POWER_DAMAGE : BASIC_DAMAGE
      const nextEnemyHealth = Math.max(0, enemyHealth - damage)

      submitAnswer(value, matched.translation, matched.power)
      playSound('success')
      updatePerformance(matched.term, true)
      addLogEntry(`You cast ${matched.term}!`, 'player')
      damageEnemy(damage)
      setTurnsTaken((prev) => prev + 1)
      setFlashTone('enemy')
      setFlashKey((prev) => prev + 1)
      setShakeKey((prev) => prev + 1)
      setInputValue('')

      if (nextEnemyHealth > 0) {
        triggerEnemyTurn()
      }
      return
    }

    if (fallback) {
      submitAnswer(value, fallback.translation)
      playSound('error')
      updatePerformance(fallback.term, false)
      addLogEntry(`Incorrect! The spell was ${fallback.translation}.`, 'system')
    }
  }

  const handleRestart = () => {
    setInputValue('')
    setTurnsTaken(0)
    setLongestStreak(0)
    setFlashKey(0)
    setShakeKey(0)
    setFlashTone('enemy')
    setShowResults(false)
    setResultXp(1)
    setResultAccuracy(0)
    setStatus('idle')
    resetSelection()
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-6">
        <header className="space-y-2 text-center">
          <div className="flex items-center justify-between text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Back to Home
            </Link>
            <span className="text-muted-foreground">Turn: {turn === 'player' ? 'Player' : 'Enemy'}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">RPG Battle</h1>
          <p className="text-muted-foreground">
            Type the correct translation to unleash your spells.
          </p>
        </header>

        {showResults && (status === 'victory' || status === 'defeat') ? (
          <BattleResults
            outcome={status}
            xp={resultXp}
            accuracy={resultAccuracy}
            onRestart={handleRestart}
          />
        ) : (
          <BattleEffects shakeKey={shakeKey} flashKey={flashKey} flashTone={flashTone}>
            <BattleScene
              backgroundImage={selectedLocation?.background}
              playerHealth={
                <HealthBar
                  current={playerHealth}
                  max={playerMaxHealth}
                  label="Hero"
                  tone="player"
                />
              }
              enemyHealth={
                <HealthBar
                  current={enemyHealth}
                  max={enemyMaxHealth}
                  label="Enemy"
                  tone="enemy"
                />
              }
              player={
                <Sprite
                  src={heroSprite}
                  pose={playerPose}
                  alt="Hero"
                  size={140}
                  flip
                />
              }
              enemy={
                <Sprite
                  src={enemySprite}
                  pose={enemyPose}
                  alt="Enemy"
                  size={140}
                />
              }
              actionMenu={
                <div className="space-y-2">
                  <ActionMenu
                    actions={menuActions}
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleSubmit}
                    disabled={inputLocked || turn !== 'player' || status !== 'playing'}
                  />
                  <AnimatePresence>
                    {revealedTranslation ? (
                      <motion.p
                        key={revealedTranslation}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-sm font-semibold text-amber-600"
                      >
                        Correct answer: {revealedTranslation}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>
              }
              battleLog={<BattleLog entries={battleLog} />}
            />
          </BattleEffects>
        )}
      </div>
      <BattleSelectionModal
        step={selectionStep}
        heroes={battleHeroes}
        locations={battleLocations}
        enemies={battleEnemies}
        onSelectHero={selectHero}
        onSelectLocation={selectLocation}
        onSelectEnemy={selectEnemy}
      />
    </main>
  )
}
