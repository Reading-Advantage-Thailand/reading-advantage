'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Konva from 'konva'
import { Group, Image as KonvaImage, Layer, Rect, Stage } from 'react-konva'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Flame } from 'lucide-react'
import { withBasePath } from '@/lib/games/basePath'
import {
  advanceDragonFlightTime,
  calculateBossPower,
  createDragonFlightState,
  getDragonFlightResults,
} from '@/lib/games/dragonFlight'
import type {
  DragonFlightResults,
  DragonFlightRound,
  DragonFlightState,
  GateSide,
} from '@/lib/games/dragonFlight'
import type { VocabularyItem } from '@/store/useGameStore'
import { useInterval } from '@/hooks/useInterval'
import { useSound } from '@/hooks/useSound'

type DragonFlightAssets = {
  gates: HTMLImageElement
  boss: HTMLImageElement
  player: HTMLImageElement
  playerCamera: HTMLImageElement
  army: HTMLImageElement
  parallaxTop: HTMLImageElement
  parallaxMiddle: HTMLImageElement
  parallaxBottom: HTMLImageElement
  loadingBackground: HTMLImageElement | null
}

type DragonFlightGameProps = {
  vocabulary: VocabularyItem[]
  durationMs?: number
  onComplete?: (results: DragonFlightResults) => void
  preloadedAssets?: DragonFlightAssets
}

type GateFeedback = {
  pairId: string
  side: GateSide
  outcome: 'correct' | 'incorrect'
}

type GatePair = {
  id: string
  round: DragonFlightRound
  y: number
}

type PendingSelection = {
  pairId: string
  side: GateSide
  outcome: 'correct' | 'incorrect'
}

type SpriteGrid = {
  columns: number[]
  rows: number[]
  columnOffsets: number[]
  rowOffsets: number[]
}

type StageSize = {
  width: number
  height: number
}

type GateLayout = {
  left: number
  top: number
  width: number
  height: number
}

type FlightLayout = {
  leftGate: GateLayout
  rightGate: GateLayout
  gateScale: number
  gateFrameWidth: number
  gateFrameHeight: number
  playerScale: number
  playerFrameWidth: number
  playerFrameHeight: number
  bossScale: number
  bossFrameWidth: number
  bossFrameHeight: number
  armyScale: number
  armyFrameWidth: number
  armyFrameHeight: number
  playerX: number
  playerY: number
  bossX: number
  bossY: number
}

const ASSETS = {
  gates: withBasePath('/games/dragon-flight/gates-3x3-sheet-facing-up.png'),
  boss: withBasePath('/games/dragon-flight/boss-3x3-sheet-facing-up.png'),
  player: withBasePath('/games/dragon-flight/player-3x3-sheet-facing-down.png'),
  playerCamera: withBasePath('/games/dragon-flight/player-3x3-sheet-facing-camera.png'),
  army: withBasePath('/games/dragon-flight/dragon-army-3x3-sheet-facing-up.png'),
  parallaxTop: withBasePath('/games/dragon-flight/parallax-top-tiling.png'),
  parallaxMiddle: withBasePath('/games/dragon-flight/parallax-middle-tiling.png'),
  parallaxBottom: withBasePath('/games/dragon-flight/parallax-bottom-tiling.png'),
  loadingBackground: withBasePath('/games/dragon-flight/loading-screen-background.png'),
}

const DEFAULT_STAGE: StageSize = { width: 960, height: 540 }
const TICK_MS = 60
const GATE_ANIM_MS = 160
const GATE_TRAVEL_MS = 7200
const PLAYER_LERP = 0.22
const PLAYER_ANIM_MS = 120
const BOSS_ANIM_MS = 180
const BOSS_HEALTH_TICK_MS = 450
const RESULTS_REVEAL_MS = 900
const GATE_SCALE_FACTOR = 0.5
const PLAYER_BASE_SCALE = 0.22
const BOSS_BASE_SCALE = 0.55
const ARMY_BASE_SCALE = 0.12

const buildSpriteGrid = (width: number, height: number): SpriteGrid => {
  const columnBase = Math.floor(width / 3)
  const rowBase = Math.floor(height / 3)
  const columnRemainder = width % 3
  const rowRemainder = height % 3
  const columns = [0, 1, 2].map((index) => columnBase + (index < columnRemainder ? 1 : 0))
  const rows = [0, 1, 2].map((index) => rowBase + (index < rowRemainder ? 1 : 0))
  const columnOffsets = columns.reduce<number[]>((acc, _value, index) => {
    const nextValue = index === 0 ? 0 : acc[index - 1] + columns[index - 1]
    acc.push(nextValue)
    return acc
  }, [])
  const rowOffsets = rows.reduce<number[]>((acc, _value, index) => {
    const nextValue = index === 0 ? 0 : acc[index - 1] + rows[index - 1]
    acc.push(nextValue)
    return acc
  }, [])

  return { columns, rows, columnOffsets, rowOffsets }
}

const getSpriteCrop = (grid: SpriteGrid, col: number, row: number) => ({
  x: grid.columnOffsets[col] ?? 0,
  y: grid.rowOffsets[row] ?? 0,
  width: grid.columns[col] ?? 0,
  height: grid.rows[row] ?? 0,
})

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load ${src}`))
    image.src = src
  })

const buildAssets = async (): Promise<DragonFlightAssets> => {
  const [
    gates,
    boss,
    player,
    playerCamera,
    army,
    parallaxTop,
    parallaxMiddle,
    parallaxBottom,
    loadingBackground,
  ] = await Promise.all([
    loadImage(ASSETS.gates),
    loadImage(ASSETS.boss),
    loadImage(ASSETS.player),
    loadImage(ASSETS.playerCamera),
    loadImage(ASSETS.army),
    loadImage(ASSETS.parallaxTop),
    loadImage(ASSETS.parallaxMiddle),
    loadImage(ASSETS.parallaxBottom),
    loadImage(ASSETS.loadingBackground),
  ])

  return {
    gates,
    boss,
    player,
    playerCamera,
    army,
    parallaxTop,
    parallaxMiddle,
    parallaxBottom,
    loadingBackground,
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const buildLayout = (
  stage: StageSize,
  gateGrid: SpriteGrid,
  playerGrid: SpriteGrid,
  bossGrid: SpriteGrid,
  armyGrid: SpriteGrid
): FlightLayout => {
  const gateFrameWidth = gateGrid.columns[0] ?? 1
  const gateFrameHeight = gateGrid.rows[0] ?? 1
  const gateWidth = clamp(stage.width * 0.32, 180, 320) * GATE_SCALE_FACTOR
  const gateScale = gateWidth / gateFrameWidth
  const gateHeight = gateFrameHeight * gateScale
  const gateTop = clamp(stage.height * 0.55 - gateHeight / 2, 120, stage.height * 0.7)

  const leftGate = {
    left: clamp(stage.width * 0.28 - gateWidth / 2, 24, stage.width - gateWidth - 24),
    top: gateTop,
    width: gateWidth,
    height: gateHeight,
  }
  const rightGate = {
    left: clamp(stage.width * 0.72 - gateWidth / 2, 24, stage.width - gateWidth - 24),
    top: gateTop,
    width: gateWidth,
    height: gateHeight,
  }

  const playerFrameWidth = playerGrid.columns[0] ?? 1
  const playerFrameHeight = playerGrid.rows[0] ?? 1
  const playerScale = clamp(stage.width * PLAYER_BASE_SCALE / playerFrameWidth, 0.12, 0.3)

  const bossFrameWidth = bossGrid.columns[0] ?? 1
  const bossFrameHeight = bossGrid.rows[0] ?? 1
  const bossScale = clamp(stage.width * BOSS_BASE_SCALE / bossFrameWidth, 0.25, 0.65)

  const armyFrameWidth = armyGrid.columns[0] ?? 1
  const armyFrameHeight = armyGrid.rows[0] ?? 1
  const armyScale = clamp(stage.width * ARMY_BASE_SCALE / armyFrameWidth, 0.06, 0.18)

  return {
    leftGate,
    rightGate,
    gateScale,
    gateFrameWidth,
    gateFrameHeight,
    playerScale,
    playerFrameWidth,
    playerFrameHeight,
    bossScale,
    bossFrameWidth,
    bossFrameHeight,
    armyScale,
    armyFrameWidth,
    armyFrameHeight,
    playerX: stage.width / 2,
    playerY: stage.height * 0.78,
    bossX: stage.width / 2,
    bossY: stage.height * 0.28,
  }
}

const getGateLabels = (round: DragonFlightState['round']) => {
  const left = round.correctSide === 'left' ? round.correctTranslation : round.decoyTranslation
  const right = round.correctSide === 'right' ? round.correctTranslation : round.decoyTranslation
  return { left, right }
}

const pickRandomIndex = (max: number) => Math.min(max - 1, Math.floor(Math.random() * max))

const buildGateRound = (vocabulary: VocabularyItem[]): DragonFlightRound => {
  if (vocabulary.length === 0) {
    return {
      term: '',
      correctTranslation: '',
      decoyTranslation: '',
      correctSide: 'left',
    }
  }

  const correctIndex = pickRandomIndex(vocabulary.length)
  let decoyIndex = pickRandomIndex(vocabulary.length)
  if (decoyIndex === correctIndex && vocabulary.length > 1) {
    decoyIndex = (correctIndex + 1) % vocabulary.length
  }

  const correctItem = vocabulary[correctIndex]
  const decoyItem = vocabulary[decoyIndex]

  return {
    term: correctItem.term,
    correctTranslation: correctItem.translation,
    decoyTranslation: decoyItem.translation,
    correctSide: Math.random() < 0.5 ? 'left' : 'right',
  }
}

const getActiveGatePair = (pairs: GatePair[]) => {
  if (pairs.length === 0) return null
  return pairs.reduce((current, pair) => (pair.y > current.y ? pair : current), pairs[0])
}

export function DragonFlightGame({
  vocabulary,
  durationMs = 30000,
  onComplete,
  preloadedAssets,
}: DragonFlightGameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [stageSize, setStageSize] = useState<StageSize>(DEFAULT_STAGE)
  const [assets, setAssets] = useState<DragonFlightAssets | null>(preloadedAssets ?? null)
  const [isLoading, setIsLoading] = useState(!preloadedAssets)
  const [state, setState] = useState<DragonFlightState>(() => {
    return createDragonFlightState(vocabulary, { durationMs })
  })
  const initialRoundRef = useRef<DragonFlightRound>(state.round)
  const [gatePairs, setGatePairs] = useState<GatePair[]>([])
  const gateIdRef = useRef(0)
  const [feedback, setFeedback] = useState<GateFeedback | null>(null)
  const [results, setResults] = useState<DragonFlightResults | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [gateFrame, setGateFrame] = useState(0)
  const [playerFrame, setPlayerFrame] = useState(0)
  const [bossFrame, setBossFrame] = useState(0)
  const [playerX, setPlayerX] = useState(DEFAULT_STAGE.width / 2)
  const [hasStarted, setHasStarted] = useState(false)
  const [lockedPairId, setLockedPairId] = useState<string | null>(null)
  const [displayDragonCount, setDisplayDragonCount] = useState(1)
  const [bossHealth, setBossHealth] = useState(0)
  const [bossY, setBossY] = useState(DEFAULT_STAGE.height * 0.28)
  const [bossSequenceDone, setBossSequenceDone] = useState(false)
  const { playSound } = useSound()
  const resultsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSelectionRef = useRef<PendingSelection | null>(null)
  const playerTargetRef = useRef<number | null>(null)

  const measureStage = useCallback(() => {
    const element = containerRef.current
    if (!element) return
    const { width, height } = element.getBoundingClientRect()
    if (width <= 0 || height <= 0) return
    const nextWidth = Math.round(width)
    const nextHeight = Math.round(height)
    setStageSize((prev) =>
      prev.width === nextWidth && prev.height === nextHeight
        ? prev
        : { width: nextWidth, height: nextHeight }
    )
  }, [])

  useEffect(() => {
    let isMounted = true
    if (preloadedAssets) {
      setAssets(preloadedAssets)
      setIsLoading(false)
      return () => undefined
    }

    setIsLoading(true)
    buildAssets()
      .then((loadedAssets) => {
        if (!isMounted) return
        setAssets(loadedAssets)
        setIsLoading(false)
      })
      .catch(() => {
        if (!isMounted) return
        setAssets(null)
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [preloadedAssets])

  const resetGame = useCallback(() => {
    const nextState = createDragonFlightState(vocabulary, { durationMs })
    initialRoundRef.current = nextState.round
    setState(nextState)
    setGatePairs([])
    setFeedback(null)
    setResults(null)
    setShowResults(false)
    setLockedPairId(null)
    setPlayerX(DEFAULT_STAGE.width / 2)
    setDisplayDragonCount(1)
    setBossHealth(0)
    setBossSequenceDone(false)
    pendingSelectionRef.current = null
    playerTargetRef.current = null
  }, [vocabulary, durationMs])

  useEffect(() => {
    resetGame()
    setHasStarted(false)
  }, [resetGame])

  useEffect(() => {
    if (isLoading) return
    if (!containerRef.current) return
    measureStage()
    let frameId = 0
    const handleResize = () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
      frameId = requestAnimationFrame(() => {
        frameId = 0
        measureStage()
      })
    }

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(handleResize)
      observer.observe(containerRef.current)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    const viewport = window.visualViewport
    if (viewport) {
      viewport.addEventListener('resize', handleResize)
      viewport.addEventListener('scroll', handleResize)
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
      observer?.disconnect()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (viewport) {
        viewport.removeEventListener('resize', handleResize)
        viewport.removeEventListener('scroll', handleResize)
      }
    }
  }, [isLoading, measureStage])

  const gateGrid = useMemo(
    () => (assets ? buildSpriteGrid(assets.gates.width, assets.gates.height) : null),
    [assets]
  )
  const playerGrid = useMemo(
    () => (assets ? buildSpriteGrid(assets.player.width, assets.player.height) : null),
    [assets]
  )
  const bossGrid = useMemo(
    () => (assets ? buildSpriteGrid(assets.boss.width, assets.boss.height) : null),
    [assets]
  )
  const armyGrid = useMemo(
    () => (assets ? buildSpriteGrid(assets.army.width, assets.army.height) : null),
    [assets]
  )
  const layout = useMemo(() => {
    if (!gateGrid || !playerGrid || !bossGrid || !armyGrid) return null
    return buildLayout(stageSize, gateGrid, playerGrid, bossGrid, armyGrid)
  }, [stageSize, gateGrid, playerGrid, bossGrid, armyGrid])

  useEffect(() => {
    if (!layout) return
    if (playerTargetRef.current !== null) return
    setPlayerX((prev) => (Math.abs(prev - layout.playerX) > 1 ? layout.playerX : prev))
  }, [layout])

  useEffect(() => {
    if (!layout) return
    if (state.status === 'boss') {
      setBossY(-layout.bossFrameHeight * layout.bossScale)
      setBossHealth(calculateBossPower(state.attempts))
      setDisplayDragonCount(state.dragonCount)
      setBossSequenceDone(false)
    } else {
      setBossY(layout.bossY)
      setBossHealth(0)
      setBossSequenceDone(false)
    }
  }, [layout, state.status, state.attempts, state.dragonCount])

  useEffect(() => {
    if (state.status === 'boss') return
    setDisplayDragonCount(state.dragonCount)
  }, [state.dragonCount, state.status])

  useInterval(() => {
    setState((prev) => advanceDragonFlightTime(prev, TICK_MS))

    if (!layout) return

    const gateStartY = -layout.leftGate.height
    const gateEndY = stageSize.height + layout.leftGate.height
    const gateSpeed = (gateEndY - gateStartY) / (GATE_TRAVEL_MS / 1000)
    const deltaSeconds = TICK_MS / 1000

    setGatePairs((prev) => {
      const nextPairs = prev
        .map((pair) => ({ ...pair, y: pair.y + gateSpeed * deltaSeconds }))
        .filter((pair) => pair.y <= gateEndY)

      if (nextPairs.length === 0) {
        const nextPair = createGatePair()
        return nextPair ? [nextPair] : nextPairs
      }

      return nextPairs.slice(0, 1)
    })

    setPlayerX((prev) => {
      const target = playerTargetRef.current ?? layout.playerX
      const next = prev + (target - prev) * PLAYER_LERP
      const isNearTarget = Math.abs(target - next) < 1.5

      if (isNearTarget && pendingSelectionRef.current) {
        const pending = pendingSelectionRef.current
        pendingSelectionRef.current = null

        setFeedback({
          pairId: pending.pairId,
          side: pending.side,
          outcome: pending.outcome,
        })
        setState((prevState) => ({
          ...prevState,
          attempts: prevState.attempts + 1,
          correctAnswers:
            prevState.correctAnswers + (pending.outcome === 'correct' ? 1 : 0),
          dragonCount:
            pending.outcome === 'correct'
              ? prevState.dragonCount + 1
              : Math.max(1, prevState.dragonCount - 1),
        }))
        playSound(pending.outcome === 'correct' ? 'success' : 'error')
        playerTargetRef.current = layout.playerX
      }

      if (isNearTarget && playerTargetRef.current !== null && !pendingSelectionRef.current) {
        playerTargetRef.current = null
      }

      return isNearTarget ? target : next
    })
  }, state.status === 'running' && layout && hasStarted ? TICK_MS : null)

  const createGatePair = useCallback(
    (round?: DragonFlightRound) => {
      if (!layout || vocabulary.length === 0) return null

      gateIdRef.current += 1
      return {
        id: `gate-${gateIdRef.current}`,
        round: round ?? buildGateRound(vocabulary),
        y: -layout.leftGate.height,
      }
    },
    [layout, vocabulary]
  )

  useEffect(() => {
    if (!layout || gatePairs.length > 0) return
    const initialPair = createGatePair(initialRoundRef.current)
    if (initialPair) {
      setGatePairs([initialPair])
    }
  }, [layout, createGatePair, gatePairs.length])

  useInterval(() => {
    setGateFrame((prev) => (prev + 1) % 3)
  }, hasStarted ? GATE_ANIM_MS : null)

  useInterval(() => {
    setPlayerFrame((prev) => (prev + 1) % 9)
  }, hasStarted ? PLAYER_ANIM_MS : null)

  useInterval(() => {
    setBossFrame((prev) => (prev + 1) % 3)
  }, state.status === 'boss' && hasStarted ? BOSS_ANIM_MS : null)

  useInterval(() => {
    if (!layout) return
    const gateStartY = -layout.leftGate.height
    const gateEndY = stageSize.height + layout.leftGate.height
    const gateSpeed = (gateEndY - gateStartY) / (GATE_TRAVEL_MS / 1000)
    const deltaSeconds = TICK_MS / 1000
    const targetY = layout.playerY

    setBossY((prev) => {
      const next = prev + gateSpeed * deltaSeconds
      return next >= targetY ? targetY : next
    })
  }, state.status === 'boss' && layout && hasStarted ? TICK_MS : null)

  useInterval(() => {
    setBossHealth((prev) => Math.max(0, prev - 1))
    setDisplayDragonCount((prev) => Math.max(0, prev - 1))
  }, state.status === 'boss' && bossHealth > 0 && displayDragonCount > 0 && hasStarted
    ? BOSS_HEALTH_TICK_MS
    : null)

  useEffect(() => {
    if (feedback) {
      const timeout = setTimeout(() => {
        setFeedback(null)
        setLockedPairId(null)
      }, 450)
      return () => clearTimeout(timeout)
    }
    return () => undefined
  }, [feedback])

  useEffect(() => {
    if (state.status !== 'boss' || !layout) return
    const bossHit = bossY >= layout.playerY
    const battleOver = bossHealth <= 0 || displayDragonCount <= 0
    if (bossHit && battleOver) {
      setBossSequenceDone(true)
    }
  }, [bossHealth, bossY, displayDragonCount, layout, state.status])

  useEffect(() => {
    if (resultsTimeoutRef.current) {
      clearTimeout(resultsTimeoutRef.current)
      resultsTimeoutRef.current = null
    }

    if (state.status !== 'boss') {
      setResults(null)
      setShowResults(false)
      setBossSequenceDone(false)
      return () => undefined
    }

    const nextResults = getDragonFlightResults({
      correctAnswers: state.correctAnswers,
      totalAttempts: state.attempts,
      dragonCount: state.dragonCount,
    })
    setResults(nextResults)
    setShowResults(false)

    if (onComplete) {
      onComplete(nextResults)
    }

    return () => undefined
  }, [state.status, state.correctAnswers, state.attempts, state.dragonCount, onComplete])

  useEffect(() => {
    if (!bossSequenceDone) return
    resultsTimeoutRef.current = setTimeout(() => {
      setShowResults(true)
    }, RESULTS_REVEAL_MS)
    return () => {
      if (resultsTimeoutRef.current) {
        clearTimeout(resultsTimeoutRef.current)
        resultsTimeoutRef.current = null
      }
    }
  }, [bossSequenceDone])

  const activePair = useMemo(() => {
    if (lockedPairId) {
      return gatePairs.find((pair) => pair.id === lockedPairId) ?? null
    }
    return getActiveGatePair(gatePairs)
  }, [gatePairs, lockedPairId])

  const handleGateSelection = useCallback((side: GateSide) => {
    if (!hasStarted) return
    if (state.status !== 'running') return
    if (pendingSelectionRef.current) return
    if (lockedPairId) return

    const pair = activePair
    if (!pair || !layout) return

    const isCorrect = side === pair.round.correctSide
    const targetX =
      side === 'left'
        ? layout.leftGate.left + layout.leftGate.width / 2
        : layout.rightGate.left + layout.rightGate.width / 2

    pendingSelectionRef.current = {
      pairId: pair.id,
      side,
      outcome: isCorrect ? 'correct' : 'incorrect',
    }
    playerTargetRef.current = targetX

    setLockedPairId(pair.id)
    setFeedback(null)
  }, [activePair, hasStarted, layout, lockedPairId, state.status])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!hasStarted) return
      if (state.status !== 'running') return
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        handleGateSelection('left')
      }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        handleGateSelection('right')
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleGateSelection, hasStarted, state.status])

  const promptRound = activePair?.round ?? state.round
  const remainingRatio = state.durationMs > 0
    ? Math.max(0, 1 - state.elapsedMs / state.durationMs)
    : 0

  const dragonCountDisplay = state.status === 'boss' ? displayDragonCount : state.dragonCount
  const activePairId = activePair?.id ?? null
  const statusLabel = showResults ? 'results' : hasStarted ? state.status : 'ready'

  if (!assets && !isLoading) {
    return (
      <div className='rounded-3xl border border-red-500/40 bg-red-950/30 p-6 text-sm text-red-200'>
        Unable to load Dragon Flight assets. Please refresh to try again.
      </div>
    )
  }

  const canRenderGame = Boolean(hasStarted && layout && assets)
  const gateLabels = canRenderGame && activePair ? getGateLabels(activePair.round) : null
  const gateLabelTop = canRenderGame
    ? (activePair
      ? activePair.y + layout!.leftGate.height + 8
      : layout!.leftGate.top + layout!.leftGate.height + 8)
    : 0
  const arrowSize = canRenderGame ? clamp(layout!.leftGate.width * 0.45, 64, 120) : 0
  const arrowOffsetX = canRenderGame ? clamp(layout!.leftGate.width * 0.75, 110, 190) : 0
  const arrowTop = canRenderGame
    ? clamp(
      layout!.playerY - arrowSize / 2,
      140,
      stageSize.height - arrowSize - 80
    )
    : 0
  const leftArrowX = canRenderGame
    ? clamp(
      layout!.playerX - arrowOffsetX - arrowSize / 2,
      12,
      stageSize.width - arrowSize - 12
    )
    : 0
  const rightArrowX = canRenderGame
    ? clamp(
      layout!.playerX + arrowOffsetX - arrowSize / 2,
      12,
      stageSize.width - arrowSize - 12
    )
    : 0

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[70vh] min-h-[480px] max-h-[760px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.45)] ${hasStarted ? 'touch-none select-none' : ''}`}
      data-testid='dragon-flight'
      data-status={statusLabel}
    >
      <div
        className='absolute inset-0 bg-cover bg-center'
        style={{
          backgroundImage: `url(${ASSETS.loadingBackground})`,
        }}
      />
      <div className='absolute inset-0 bg-slate-950/55' />

      {canRenderGame && (
        <DragonFlightCanvas
          stageSize={stageSize}
          assets={assets!}
          feedback={feedback}
          gatePairs={gatePairs}
          activePairId={activePairId}
          layout={layout!}
          gateFrame={gateFrame}
          playerFrame={playerFrame}
          playerX={playerX}
          dragonCount={dragonCountDisplay}
          bossFrame={bossFrame}
          bossY={bossY}
          bossHealth={bossHealth}
          onSelectGate={handleGateSelection}
          showBoss={state.status === 'boss'}
        />
      )}

      {canRenderGame && (
        <div className='absolute inset-0 z-10 pointer-events-none'>
          <div className='flex items-start justify-between p-6'>
            <div className='max-w-[60%] rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur'>
              <div className='text-xs uppercase tracking-[0.2em] text-white/70'>Prompt</div>
              <div className='text-2xl font-semibold text-white'>{promptRound.term || '—'}</div>
            </div>
            <div className='flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-white backdrop-blur'>
              <Flame className='h-4 w-4 text-amber-300' aria-hidden='true' />
              <span className='text-xs uppercase tracking-[0.2em] text-white/70'>Dragons</span>
              <motion.span
                key={dragonCountDisplay}
                data-testid='dragon-flight-dragon-count'
                className='text-lg font-semibold'
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {dragonCountDisplay}
              </motion.span>
            </div>
          </div>

          <div className='absolute left-6 right-6 top-20'>
            <div
              className='h-2 w-full overflow-hidden rounded-full bg-white/10'
              role='progressbar'
              aria-label='Run timer'
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(remainingRatio * 100)}
            >
              <motion.div
                className='h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400'
                initial={{ width: '100%' }}
                animate={{ width: `${remainingRatio * 100}%` }}
                transition={{ duration: 0.2, ease: 'linear' }}
                data-testid='dragon-flight-timer'
              />
            </div>
          </div>

          {state.status === 'running' && (
            <>
              <button
                type='button'
                className='absolute flex items-center justify-center rounded-2xl border border-white/20 bg-white/20 text-white backdrop-blur-sm transition active:scale-95 pointer-events-auto'
                style={{
                  width: arrowSize,
                  height: arrowSize,
                  left: leftArrowX,
                  top: arrowTop,
                }}
                onPointerDown={() => handleGateSelection('left')}
                aria-label='Choose left gate'
              >
                <ArrowLeft size={arrowSize * 0.55} aria-hidden='true' />
              </button>
              <button
                type='button'
                className='absolute flex items-center justify-center rounded-2xl border border-white/20 bg-white/20 text-white backdrop-blur-sm transition active:scale-95 pointer-events-auto'
                style={{
                  width: arrowSize,
                  height: arrowSize,
                  left: rightArrowX,
                  top: arrowTop,
                }}
                onPointerDown={() => handleGateSelection('right')}
                aria-label='Choose right gate'
              >
                <ArrowRight size={arrowSize * 0.55} aria-hidden='true' />
              </button>
            </>
          )}

          {gateLabels && layout && (
            <>
              <div
                className='absolute -translate-x-1/2 rounded-xl border border-white/10 bg-black/80 px-4 py-2 text-2xl font-semibold text-white shadow-lg'
                style={{
                  left: layout.leftGate.left + layout.leftGate.width / 2,
                  top: gateLabelTop,
                }}
              >
              {gateLabels?.left}
              </div>
              <div
                className='absolute -translate-x-1/2 rounded-xl border border-white/10 bg-black/80 px-4 py-2 text-2xl font-semibold text-white shadow-lg'
                style={{
                  left: layout.rightGate.left + layout.rightGate.width / 2,
                  top: gateLabelTop,
                }}
              >
              {gateLabels?.right}
              </div>
            </>
          )}

          <AnimatePresence>
            {feedback && (
              <motion.div
                className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur'
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {feedback.outcome === 'correct' ? '+1 Dragon' : '-1 Dragon'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {canRenderGame && (
        <div className='absolute inset-0 z-20 pointer-events-none'>
          <AnimatePresence>
            {state.status === 'boss' && !showResults && (
              <motion.div
                className='absolute inset-x-0 top-24 mx-auto flex w-fit items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-5 py-2 text-sm uppercase tracking-[0.2em] text-white'
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                data-testid='dragon-flight-boss'
              >
                Skeleton King Approaches
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showResults && results && (
              <motion.div
                className='absolute inset-0 flex items-center justify-center bg-slate-950/70 px-6'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                data-testid='dragon-flight-results'
              >
                <div className='w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-6 text-white shadow-xl'>
                  <div className='text-sm uppercase tracking-[0.2em] text-white/60'>Run Complete</div>
                  <div className='mt-2 text-3xl font-semibold'>
                    {results.victory ? 'Victory' : 'Defeat'}
                  </div>
                  <div className='mt-4 grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <div className='text-white/60'>Dragons</div>
                      <div className='text-lg font-semibold'>{results.dragonCount}</div>
                    </div>
                    <div>
                      <div className='text-white/60'>Boss Power</div>
                      <div className='text-lg font-semibold'>{results.bossPower}</div>
                    </div>
                    <div>
                      <div className='text-white/60'>Accuracy</div>
                      <div className='text-lg font-semibold'>
                        {Math.round(results.accuracy * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className='text-white/60'>XP</div>
                      <div className='text-lg font-semibold'>{results.xp}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {!hasStarted && (
        <div className='relative z-20 flex h-full flex-col text-white'>
          <div className='flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <div className='text-xs uppercase tracking-[0.35em] text-white/70'>Dragon Flight</div>
                <div className='mt-2 text-2xl font-semibold sm:text-3xl'>Flight Briefing</div>
                <p className='mt-2 max-w-xl text-sm text-white/80'>
                  Review the vocabulary, then tap Start Game to launch your dragon flight.
                </p>
              </div>
              <div className='rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.25em] text-white/80'>
                {isLoading ? 'Loading Assets' : 'Ready'}
              </div>
            </div>

            <div className='grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'>
              <div className='flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/10 px-5 py-6 text-center backdrop-blur sm:px-6 sm:py-8'>
                <div
                  className='dragon-flight-intro-sprite h-32 w-32 overflow-hidden rounded-3xl border border-white/20 bg-white/5 shadow-lg sm:h-44 sm:w-44'
                  style={{
                    backgroundImage: `url(${ASSETS.playerCamera})`,
                  }}
                />
                <div className='text-base font-semibold'>The Gate Run Begins Soon</div>
                <div className='text-sm text-white/70'>
                  Choose the correct translation to grow your dragon flight.
                </div>
              </div>

              <div className='rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur sm:p-6'>
                <div className='text-xs uppercase tracking-[0.3em] text-white/60'>
                  Vocabulary Preview
                </div>
                <div className='mt-3 max-h-40 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 sm:max-h-56'>
                  {vocabulary.length === 0 ? (
                    <div className='px-4 py-6 text-sm text-white/60'>
                      No vocabulary loaded yet.
                    </div>
                  ) : (
                    vocabulary.map((item, index) => (
                      <div
                        key={`${item.term}-${index}`}
                        className='flex items-center justify-between gap-4 border-b border-white/10 px-4 py-2 text-sm last:border-b-0'
                      >
                        <span className='font-semibold text-white'>{item.term}</span>
                        <span className='text-white/70'>{item.translation}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950/60 px-4 py-4 backdrop-blur sm:px-6'>
            <div className='text-xs uppercase tracking-[0.25em] text-white/70'>
              {isLoading ? 'Summoning Dragon Gates' : 'Ready To Fly'}
            </div>
            <button
              type='button'
              className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                isLoading
                  ? 'cursor-not-allowed bg-white/20 text-white/50'
                  : 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'
              }`}
              onClick={() => {
                if (isLoading) return
                resetGame()
                setHasStarted(true)
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Start Game'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

type DragonFlightCanvasProps = {
  stageSize: StageSize
  assets: DragonFlightAssets
  feedback: GateFeedback | null
  gatePairs: GatePair[]
  activePairId: string | null
  layout: FlightLayout
  gateFrame: number
  playerFrame: number
  playerX: number
  dragonCount: number
  bossFrame: number
  bossY: number
  bossHealth: number
  onSelectGate: (side: GateSide) => void
  showBoss: boolean
}

type ParallaxRefs = {
  topA: Konva.Image | null
  topB: Konva.Image | null
  middleA: Konva.Image | null
  middleB: Konva.Image | null
  bottomA: Konva.Image | null
  bottomB: Konva.Image | null
}

const buildParallaxMetrics = (image: HTMLImageElement, stageWidth: number) => {
  const scale = stageWidth / image.width
  return {
    scale,
    height: image.height * scale,
  }
}

const DragonFlightCanvas = ({
  stageSize,
  assets,
  feedback,
  gatePairs,
  activePairId,
  layout,
  gateFrame,
  playerFrame,
  playerX,
  dragonCount,
  bossFrame,
  bossY,
  bossHealth,
  onSelectGate,
  showBoss,
}: DragonFlightCanvasProps) => {
  const bottomLayerRef = useRef<Konva.Layer | null>(null)
  const middleLayerRef = useRef<Konva.Layer | null>(null)
  const topLayerRef = useRef<Konva.Layer | null>(null)
  const parallaxRefs = useRef<ParallaxRefs>({
    topA: null,
    topB: null,
    middleA: null,
    middleB: null,
    bottomA: null,
    bottomB: null,
  })
  const parallaxOffsets = useRef({ top: 0, middle: 0, bottom: 0 })

  const gateGrid = useMemo(() => buildSpriteGrid(assets.gates.width, assets.gates.height), [assets])
  const playerGrid = useMemo(
    () => buildSpriteGrid(assets.player.width, assets.player.height),
    [assets]
  )
  const bossGrid = useMemo(() => buildSpriteGrid(assets.boss.width, assets.boss.height), [assets])
  const armyGrid = useMemo(() => buildSpriteGrid(assets.army.width, assets.army.height), [assets])

  useEffect(() => {
    if (!bottomLayerRef.current || !middleLayerRef.current || !topLayerRef.current) return

    const topMetrics = buildParallaxMetrics(assets.parallaxTop, stageSize.width)
    const middleMetrics = buildParallaxMetrics(assets.parallaxMiddle, stageSize.width)
    const bottomMetrics = buildParallaxMetrics(assets.parallaxBottom, stageSize.width)

    const animation = new Konva.Animation((frame) => {
      if (!frame) return
      const delta = frame.timeDiff / 1000
      parallaxOffsets.current.top =
        (parallaxOffsets.current.top + delta * 40) % topMetrics.height
      parallaxOffsets.current.middle =
        (parallaxOffsets.current.middle + delta * 28) % middleMetrics.height
      parallaxOffsets.current.bottom =
        (parallaxOffsets.current.bottom + delta * 18) % bottomMetrics.height

      const { topA, topB, middleA, middleB, bottomA, bottomB } = parallaxRefs.current
      if (topA && topB) {
        topA.y(parallaxOffsets.current.top)
        topB.y(parallaxOffsets.current.top - topMetrics.height)
      }
      if (middleA && middleB) {
        middleA.y(parallaxOffsets.current.middle)
        middleB.y(parallaxOffsets.current.middle - middleMetrics.height)
      }
      if (bottomA && bottomB) {
        bottomA.y(parallaxOffsets.current.bottom)
        bottomB.y(parallaxOffsets.current.bottom - bottomMetrics.height)
      }
    }, [bottomLayerRef.current, middleLayerRef.current, topLayerRef.current])

    animation.start()
    return () => {
      animation.stop()
    }
  }, [assets, stageSize.width])

  const playerRow = Math.floor(playerFrame / 3)
  const playerCol = playerFrame % 3

  const bossRow = showBoss && bossHealth <= 0 ? 2 : 0
  const bossCol = bossFrame % 3

  const armyCount = Math.min(dragonCount, 12)
  const armyItems = Array.from({ length: armyCount }, (_, index) => ({
    index,
    row: Math.floor(index / 3) % 3,
    col: index % 3,
  }))

  const topMetrics = buildParallaxMetrics(assets.parallaxTop, stageSize.width)
  const middleMetrics = buildParallaxMetrics(assets.parallaxMiddle, stageSize.width)
  const bottomMetrics = buildParallaxMetrics(assets.parallaxBottom, stageSize.width)

  return (
    <Stage width={stageSize.width} height={stageSize.height}>
      <Layer ref={bottomLayerRef}>
        <KonvaImage
          image={assets.parallaxBottom}
          x={0}
          y={0}
          scaleX={bottomMetrics.scale}
          scaleY={bottomMetrics.scale}
          ref={(node) => {
            parallaxRefs.current.bottomA = node
          }}
        />
        <KonvaImage
          image={assets.parallaxBottom}
          x={0}
          y={bottomMetrics.height * -1}
          scaleX={bottomMetrics.scale}
          scaleY={bottomMetrics.scale}
          ref={(node) => {
            parallaxRefs.current.bottomB = node
          }}
        />
      </Layer>
      <Layer ref={middleLayerRef}>
        <KonvaImage
          image={assets.parallaxMiddle}
          x={0}
          y={0}
          scaleX={middleMetrics.scale}
          scaleY={middleMetrics.scale}
          opacity={0.85}
          ref={(node) => {
            parallaxRefs.current.middleA = node
          }}
        />
        <KonvaImage
          image={assets.parallaxMiddle}
          x={0}
          y={middleMetrics.height * -1}
          scaleX={middleMetrics.scale}
          scaleY={middleMetrics.scale}
          opacity={0.85}
          ref={(node) => {
            parallaxRefs.current.middleB = node
          }}
        />
      </Layer>
      <Layer ref={topLayerRef}>
        <KonvaImage
          image={assets.parallaxTop}
          x={0}
          y={0}
          scaleX={topMetrics.scale}
          scaleY={topMetrics.scale}
          opacity={0.7}
          ref={(node) => {
            parallaxRefs.current.topA = node
          }}
        />
        <KonvaImage
          image={assets.parallaxTop}
          x={0}
          y={topMetrics.height * -1}
          scaleX={topMetrics.scale}
          scaleY={topMetrics.scale}
          opacity={0.7}
          ref={(node) => {
            parallaxRefs.current.topB = node
          }}
        />
      </Layer>

      <Layer>
        {armyItems.map((army) => {
          const offsetX = (army.index % 4) * (layout.armyFrameWidth * layout.armyScale * 0.9)
          const offsetY = Math.floor(army.index / 4) * (layout.armyFrameHeight * layout.armyScale * 0.6)
          const crop = getSpriteCrop(armyGrid, army.col, army.row)
          return (
            <KonvaImage
              key={`army-${army.index}`}
              image={assets.army}
              crop={crop}
              x={playerX - layout.armyFrameWidth * layout.armyScale + offsetX}
              y={layout.playerY - layout.armyFrameHeight * layout.armyScale - 40 + offsetY}
              width={crop.width}
              height={crop.height}
              scaleX={layout.armyScale}
              scaleY={-layout.armyScale}
              offsetY={crop.height}
              opacity={0.85}
            />
          )
        })}

        <KonvaImage
          image={assets.player}
          crop={getSpriteCrop(playerGrid, playerCol, playerRow)}
          x={playerX}
          y={layout.playerY}
          width={layout.playerFrameWidth}
          height={layout.playerFrameHeight}
          offsetX={layout.playerFrameWidth / 2}
          offsetY={layout.playerFrameHeight / 2}
          scaleX={layout.playerScale}
          scaleY={-layout.playerScale}
        />

        {showBoss && (
          <KonvaImage
            image={assets.boss}
            crop={getSpriteCrop(bossGrid, bossCol, bossRow)}
            x={layout.bossX}
            y={bossY}
            width={layout.bossFrameWidth}
            height={layout.bossFrameHeight}
            offsetX={layout.bossFrameWidth / 2}
            offsetY={layout.bossFrameHeight / 2}
            scaleX={layout.bossScale}
            scaleY={layout.bossScale}
            opacity={0.95}
          />
        )}
        {gatePairs.map((pair) => {
          const gateCenterY = pair.y + layout.leftGate.height / 2
          const isActive = pair.id === activePairId
          const isFeedbackPair = feedback?.pairId === pair.id
          const leftRow = isFeedbackPair ? (pair.round.correctSide === 'left' ? 1 : 2) : 0
          const rightRow = isFeedbackPair ? (pair.round.correctSide === 'right' ? 1 : 2) : 0
          const gateOpacity = isActive ? 1 : 0.7

          return (
            <React.Fragment key={pair.id}>
              <Group
                x={layout.leftGate.left + layout.leftGate.width / 2}
                y={gateCenterY}
                scaleX={layout.gateScale}
                scaleY={layout.gateScale}
                opacity={gateOpacity}
                listening={isActive}
                onPointerDown={isActive ? () => onSelectGate('left') : undefined}
              >
                <KonvaImage
                  image={assets.gates}
                  crop={getSpriteCrop(gateGrid, gateFrame, leftRow)}
                  width={layout.gateFrameWidth}
                  height={layout.gateFrameHeight}
                  offsetX={layout.gateFrameWidth / 2}
                  offsetY={layout.gateFrameHeight / 2}
                />
                {isFeedbackPair && (
                  <Rect
                    width={layout.gateFrameWidth}
                    height={layout.gateFrameHeight}
                    offsetX={layout.gateFrameWidth / 2}
                    offsetY={layout.gateFrameHeight / 2}
                    fill={leftRow === 1 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}
                  />
                )}
              </Group>

              <Group
                x={layout.rightGate.left + layout.rightGate.width / 2}
                y={gateCenterY}
                scaleX={layout.gateScale}
                scaleY={layout.gateScale}
                opacity={gateOpacity}
                listening={isActive}
                onPointerDown={isActive ? () => onSelectGate('right') : undefined}
              >
                <KonvaImage
                  image={assets.gates}
                  crop={getSpriteCrop(gateGrid, gateFrame, rightRow)}
                  width={layout.gateFrameWidth}
                  height={layout.gateFrameHeight}
                  offsetX={layout.gateFrameWidth / 2}
                  offsetY={layout.gateFrameHeight / 2}
                />
                {isFeedbackPair && (
                  <Rect
                    width={layout.gateFrameWidth}
                    height={layout.gateFrameHeight}
                    offsetX={layout.gateFrameWidth / 2}
                    offsetY={layout.gateFrameHeight / 2}
                    fill={rightRow === 1 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}
                  />
                )}
              </Group>
            </React.Fragment>
          )
        })}
      </Layer>
    </Stage>
  )
}
