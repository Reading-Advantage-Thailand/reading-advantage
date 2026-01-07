'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Rect, Text, Group, Image as KonvaImage } from 'react-konva'
import { AnimatePresence, motion } from 'framer-motion'
import { createRuneMatchState, initializeGrid, swapRunes, findMatches, processMatches, applyMatchResult, advanceTime, type RuneMatchState } from '@/lib/games/runeMatch'
import { RUNE_MATCH_CONFIG, type MonsterType } from '@/lib/games/runeMatchConfig'
import type { VocabularyItem } from '@/store/useGameStore'
import { withBasePath } from '@/lib/games/basePath'
import { MonsterSelection } from './MonsterSelection'
import { Button } from '@/components/ui/button'

export type RuneMatchGameResult = { xp: number; accuracy: number }
export type RuneMatchGameProps = { vocabulary: VocabularyItem[]; onComplete: (result: RuneMatchGameResult) => void }

type RuneMatchAssets = {
  monsters: { goblin: HTMLImageElement; skeleton: HTMLImageElement; orc: HTMLImageElement; dragon: HTMLImageElement }
  runes: { base: HTMLImageElement; heal: HTMLImageElement; shield: HTMLImageElement }
  background: HTMLImageElement
}

export function RuneMatchGame({ vocabulary, onComplete }: RuneMatchGameProps) {
  const [gameState, setGameState] = useState<RuneMatchState | null>(null)
  const [assets, setAssets] = useState<RuneMatchAssets | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [animFrame, setAnimFrame] = useState(0)
  const [monsterAnimFrame, setMonsterAnimFrame] = useState(0)

  const layout = useMemo(() => {
    const padding = 20; const monsterAreaHeight = dimensions.height * 0.4; const gridAreaHeight = dimensions.height * 0.5
    const availableGridWidth = dimensions.width - padding * 2; const availableGridHeight = gridAreaHeight - padding
    const cellSize = Math.min(availableGridWidth / RUNE_MATCH_CONFIG.grid.columns, availableGridHeight / RUNE_MATCH_CONFIG.grid.rows)
    const gridWidth = cellSize * RUNE_MATCH_CONFIG.grid.columns; const gridHeight = cellSize * RUNE_MATCH_CONFIG.grid.rows
    const gridX = (dimensions.width - gridWidth) / 2; const gridY = monsterAreaHeight + (gridAreaHeight - gridHeight) / 2
    return { cellSize, gridX, gridY, gridWidth, gridHeight, monsterAreaHeight }
  }, [dimensions])

  useEffect(() => {
    const rInt = setInterval(() => setAnimFrame((f) => (f + 1) % 3), 500)
    const mInt = setInterval(() => setMonsterAnimFrame((f) => (f + 1) % 3), 150)
    return () => { clearInterval(rInt); clearInterval(mInt) }
  }, [])

  useEffect(() => {
    const tickRate = 100
    const interval = setInterval(() => {
      setGameState((current) => {
        if (!current || current.status !== 'playing') return current
        return advanceTime(current, tickRate)
      })
    }, tickRate)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let lastTime = performance.now(); let frameId: number
    const tick = (now: number) => {
      const dt = now - lastTime; lastTime = now
      setGameState((current) => {
        if (!current || current.floatingTexts.length === 0) return current
        const nextTexts = current.floatingTexts.map(ft => {
          const remaining = ft.duration - dt; const progress = 1 - (remaining / ft.maxDuration)
          return { ...ft, offsetX: ft.offsetX + (dt / 1000) * 40, offsetY: ft.offsetY - (dt / 1000) * 80, opacity: Math.max(0, 1 - progress), scale: 1 + progress * 0.8, duration: remaining }
        }).filter(ft => ft.duration > 0)
        return { ...current, floatingTexts: nextTexts }
      })
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const loadImage = (src: string): Promise<HTMLImageElement> =>
        new Promise((res, rej) => { const img = new Image(); img.src = withBasePath(src); img.onload = () => res(img); img.onerror = rej })
      try {
        const [goblin, skeleton, orc, dragon, base, heal, shield, background] = await Promise.all([
          loadImage('/games/rune-match/monsters/goblin_3x4_pose_sheet.png'), loadImage('/games/rune-match/monsters/skeleton_3x4_pose_sheet.png'),
          loadImage('/games/rune-match/monsters/orc_3x4_pose_sheet.png'), loadImage('/games/rune-match/monsters/dragon_3x4_pose_sheet.png'),
          loadImage('/games/rune-match/runes/rune_base_3x2_pose_sheet.png'), loadImage('/games/rune-match/runes/rune_heal_3x2_pose_sheet.png'),
          loadImage('/games/rune-match/runes/rune_shield_3x2_pose_sheet.png'), loadImage('/games/rune-match/ui/background-tiled.png'),
        ])
        if (mounted) setAssets({ monsters: { goblin, skeleton, orc, dragon }, runes: { base, heal, shield }, background })
      } catch (e) { console.error('Failed to load assets', e) }
    }
    load(); return () => { mounted = false }
  }, [])

  const resetGame = useCallback(() => {
    if (vocabulary.length > 0) setGameState(createRuneMatchState(vocabulary))
  }, [vocabulary])

  useEffect(() => { resetGame() }, [resetGame])

  const handleSelectMonster = useCallback((monsterType: MonsterType) => {
    const config = RUNE_MATCH_CONFIG.monsters[monsterType]
    setGameState((prev) => {
      if (!prev) return null
      const grid = initializeGrid(prev.vocabulary, { rng: prev.rng })
      return { ...prev, status: 'playing', selectedMonster: monsterType, monster: { type: monsterType, hp: config.hp, maxHp: config.hp, attack: config.attack, xp: config.xp }, grid }
    })
  }, [])

  const handleCellClick = useCallback((row: number, col: number) => {
    setGameState((prev) => {
      if (!prev || prev.status !== 'playing') return prev
      const selected = prev.selectedCell
      if (!selected) return { ...prev, selectedCell: { row, col } }
      const isAdjacent = (Math.abs(selected.row - row) === 1 && selected.col === col) || (Math.abs(selected.col - col) === 1 && selected.row === row)
      if (isAdjacent) {
        const gridAfterSwap = swapRunes(prev.grid, selected, { row, col })
        const matches = findMatches(gridAfterSwap)
        if (matches.length > 0) {
          const result = processMatches(gridAfterSwap, prev.vocabulary, { rng: prev.rng })
          return { ...applyMatchResult({ ...prev, grid: gridAfterSwap }, result), selectedCell: null }
        } else {
          // No match: keep swapped, but deduct penalty HP
          const penalty = RUNE_MATCH_CONFIG.combat.invalidSwapPenalty
          const newHp = Math.max(0, prev.player.hp - penalty)
          const newStatus = newHp <= 0 ? 'defeat' : prev.status
          
          return {
            ...prev,
            grid: gridAfterSwap,
            player: { ...prev.player, hp: newHp },
            status: newStatus,
            selectedCell: null,
            totalAttempts: prev.totalAttempts + 1,
            floatingTexts: [
              ...prev.floatingTexts,
              {
                id: Math.random().toString(36).substring(2, 9),
                text: `-${penalty} HP`,
                x: col,
                y: row,
                offsetX: 0,
                offsetY: 0,
                color: "#ef4444",
                opacity: 1,
                scale: 1,
                duration: 2000,
                maxDuration: 2000
              }
            ]
          }
        }
      } else { return { ...prev, selectedCell: { row, col } } }
    })
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const updateDimensions = () => {
      if (!containerRef.current) return
      const { width, height } = containerRef.current.getBoundingClientRect()
      if (width > 0 && height > 0) setDimensions({ width, height })
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) { if (entry.contentRect.width > 0 && entry.contentRect.height > 0) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height }) }
    })
    observer.observe(containerRef.current); updateDimensions()
    const interval = setInterval(updateDimensions, 200); const timeout = setTimeout(() => clearInterval(interval), 2000)
    return () => { observer.disconnect(); clearInterval(interval); clearTimeout(timeout) }
  }, [])

  if (!assets || !gameState || dimensions.width === 0) {
    return (
      <div ref={containerRef} data-testid="rune-match-container" className="relative h-[60vh] w-full overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center border border-white/10 md:aspect-video md:h-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          <p className="text-sm text-white/60">Loading assets...</p>
        </div>
      </div>
    )
  }

  const renderHealthBar = (x: number, y: number, width: number, current: number, max: number, color: string, label: string) => {
    const height = 20; const progress = Math.max(0, Math.min(1, current / max))
    return (
      <Group x={x} y={y}>
        <Rect width={width} height={height} fill="rgba(0, 0, 0, 0.5)" cornerRadius={height / 2} stroke="rgba(255, 255, 255, 0.2)" strokeWidth={1}/>
        <Rect width={Math.max(height, width * progress)} height={height} fill={color} cornerRadius={height / 2}/>
        <Text text={`${label}: ${Math.ceil(current)}/${max}`} width={width} height={height} fontSize={12} fill="white" align="center" verticalAlign="middle" fontStyle="bold" fontFamily="Arial"/>
      </Group>
    )
  }

  return (
    <div ref={containerRef} data-testid="rune-match-container" className="relative h-[60vh] w-full overflow-hidden rounded-2xl bg-slate-950 border border-white/10 md:aspect-video md:h-auto">
      <AnimatePresence mode="wait">
        {gameState.status === 'selection' && (
          <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex items-start justify-center bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <MonsterSelection onSelect={handleSelectMonster}/>
          </motion.div>
        )}
        {gameState.status === 'victory' && (
          <motion.div key="victory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-center space-y-6">
            <div className="w-[140px] h-[140px] bg-yellow-500/20 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-yellow-500/30 shadow-lg shadow-yellow-500/10">
              <div 
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundImage: `url(${assets.monsters[gameState.monster?.type || 'goblin'].src})`,
                  backgroundSize: '300% 400%',
                  backgroundPosition: `${monsterAnimFrame * 50}% 100%`, // Row 3 is Death pose
                  imageRendering: 'pixelated'
                }}
              />
            </div>
            <div className="space-y-2"><h2 className="text-4xl font-bold text-white">Victory!</h2><p className="text-xl text-slate-400">You defeated the {gameState.monster?.type}!</p></div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 min-w-[200px]"><p className="text-sm text-slate-500 uppercase tracking-widest">XP Earned</p><p className="text-5xl font-black text-yellow-500">+{gameState.monster?.xp}</p></div>
            <Button onClick={() => onComplete({ xp: gameState.monster?.xp || 0, accuracy: gameState.totalAttempts > 0 ? (gameState.correctAnswers / gameState.totalAttempts) * 100 : 100 })} size="lg" className="px-12 bg-yellow-500 hover:bg-yellow-600 text-black font-bold">Continue</Button>
          </motion.div>
        )}
        {gameState.status === 'defeat' && (
          <motion.div key="defeat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-center space-y-6">
            <div className="w-[140px] h-[140px] bg-red-500/20 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-red-500/30 shadow-lg shadow-red-500/10">
              <div 
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundImage: `url(${assets.monsters[gameState.monster?.type || 'goblin'].src})`,
                  backgroundSize: '300% 400%',
                  backgroundPosition: `${monsterAnimFrame * 50}% 33.33%`, // Row 1 is Attack
                  imageRendering: 'pixelated'
                }}
              />
            </div>
            <div className="space-y-2"><h2 className="text-4xl font-bold text-white">Defeat...</h2><p className="text-xl text-slate-400">The monster was too strong.</p></div>
            <Button onClick={resetGame} variant="outline" size="lg" className="px-12 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">Try Again</Button>
          </motion.div>
        )}
      </AnimatePresence>
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          <Group x={gameState.shakeIntensity * (Math.random() * 10 - 5)} y={gameState.shakeIntensity * (Math.random() * 10 - 5)}>
            <KonvaImage image={assets.background} width={dimensions.width} height={dimensions.height}/>
            {(gameState.status === 'playing' || gameState.status === 'victory' || gameState.status === 'defeat') && (
              <Group>
                <Rect x={0} y={0} width={dimensions.width} height={layout.monsterAreaHeight} fill="rgba(0, 0, 0, 0.2)"/>
                {gameState.monster && (
                  <Group>
                    <KonvaImage image={assets.monsters[gameState.monster.type]} x={dimensions.width / 2 - 60} y={layout.monsterAreaHeight * 0.05} width={120} height={120} crop={{ x: monsterAnimFrame * (assets.monsters[gameState.monster.type].width / 3), y: (gameState.monsterState === 'idle' ? 0 : gameState.monsterState === 'attack' ? 1 : gameState.monsterState === 'hurt' ? 2 : 3) * (assets.monsters[gameState.monster.type].height / 4), width: assets.monsters[gameState.monster.type].width / 3, height: assets.monsters[gameState.monster.type].height / 4 }}/>
                    {renderHealthBar(dimensions.width / 2 - 150, layout.monsterAreaHeight * 0.45, 300, gameState.monster.hp, gameState.monster.maxHp, "#ef4444", gameState.monster.type.toUpperCase())}
                    <Rect x={dimensions.width / 2 - 150} y={layout.monsterAreaHeight * 0.45 + 25} width={300 * (1 - gameState.attackTimer / RUNE_MATCH_CONFIG.combat.attackIntervalMs)} height={4} fill="#f87171" opacity={0.6}/>
                  </Group>
                )}
                {renderHealthBar(dimensions.width / 2 - 150, layout.monsterAreaHeight * 0.8, 300, gameState.player.hp, gameState.player.maxHp, "#22c55e", "PLAYER")}
                <Text text={`POWER WORD: ${gameState.powerWord?.toUpperCase()}`} x={dimensions.width / 2} y={layout.monsterAreaHeight * 0.65} offsetX={150} width={300} fontSize={18} fill="#facc15" fontStyle="bold" align="center" fontFamily="Arial"/>
                {gameState.player.hasShield && ( <Text text="🛡️ SHIELD ACTIVE" x={dimensions.width / 2 + 160} y={layout.monsterAreaHeight * 0.8} fontSize={14} fill="#60a5fa" fontStyle="bold"/> )}
                <Rect x={layout.gridX - 8} y={layout.gridY - 8} width={layout.gridWidth + 16} height={layout.gridHeight + 16} fill="rgba(0, 0, 0, 0.4)" cornerRadius={12} stroke="rgba(255, 255, 255, 0.1)" strokeWidth={2}/>
                {gameState.grid.map((row, r) => row.map((rune, c) => {
                  const isSelected = gameState.selectedCell?.row === r && gameState.selectedCell?.col === c; const runeSize = layout.cellSize - 4
                  const spriteSheet = rune.type === 'vocabulary' ? assets.runes.base : rune.type === 'heal' ? assets.runes.heal : assets.runes.shield
                  const fw = spriteSheet.width / 3; const fh = spriteSheet.height / 2; const crop = { x: animFrame * fw, y: 0, width: fw, height: fh }
                  return (
                    <Group key={rune.id} x={layout.gridX + c * layout.cellSize + 2} y={layout.gridY + r * layout.cellSize + 2} onClick={() => handleCellClick(r, c)} onTap={() => handleCellClick(r, c)}>
                      {isSelected && ( <Rect width={runeSize + 8} height={runeSize + 8} x={-4} y={-4} fill="rgba(96, 165, 250, 0.3)" cornerRadius={8} stroke="#60a5fa" strokeWidth={2}/> )}
                      <KonvaImage image={spriteSheet} width={runeSize} height={runeSize} cornerRadius={6} crop={crop}/>
                      {rune.type === 'vocabulary' && ( <Text text={rune.text} width={runeSize - 12} height={runeSize - 12} x={6} y={6} fontSize={Math.max(12, layout.cellSize / 3.5)} fill="#0f172a" align="center" verticalAlign="middle" fontFamily="Arial" fontStyle="bold"/> )}
                    </Group>
                  )
                }))}
              </Group>
            )}
            {gameState.floatingTexts.map((ft) => {
              let screenX = dimensions.width / 2; let screenY = layout.monsterAreaHeight / 2
              if (ft.x !== -1) { screenX = layout.gridX + ft.x * layout.cellSize + layout.cellSize / 2; screenY = layout.gridY + ft.y * layout.cellSize + layout.cellSize / 2 }
              return ( <Text key={ft.id} text={ft.text} x={screenX + ft.offsetX} y={screenY + ft.offsetY - 20} fontSize={28} scaleX={ft.scale} scaleY={ft.scale} fill={ft.color} opacity={ft.opacity} fontStyle="bold" fontFamily="Arial" align="center" shadowColor="black" shadowBlur={4} shadowOpacity={0.8} offsetX={50}/> )
            })}
          </Group>
        </Layer>
      </Stage>
    </div>
  )
}
