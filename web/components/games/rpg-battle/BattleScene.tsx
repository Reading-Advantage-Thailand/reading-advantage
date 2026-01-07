import React from 'react'

interface BattleSceneProps {
  player: React.ReactNode
  enemy: React.ReactNode
  playerHealth: React.ReactNode
  enemyHealth: React.ReactNode
  actionMenu: React.ReactNode
  battleLog: React.ReactNode
  backgroundImage?: string
}

export function BattleScene({
  player,
  enemy,
  playerHealth,
  enemyHealth,
  actionMenu,
  battleLog,
  backgroundImage,
}: BattleSceneProps) {
  const stageStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } : undefined

  return (
    <section className="w-full rounded-2xl border bg-background/80 p-4 shadow-sm md:p-6">
      <div
        data-testid="battle-stage"
        className="flex min-h-[280px] items-end justify-between gap-6 rounded-2xl bg-muted/60 p-4 md:p-6"
        style={stageStyle}
      >
        <div className="flex flex-1 flex-col items-start gap-3">
          <div className="w-full">{playerHealth}</div>
          <div className="flex w-full items-end justify-start">{player}</div>
        </div>

        <div className="flex flex-1 flex-col items-end gap-3">
          <div className="w-full">{enemyHealth}</div>
          <div className="flex w-full items-end justify-end">{enemy}</div>
        </div>
      </div>

      <div
        data-testid="battle-ui"
        className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <div className="min-h-[120px]">{actionMenu}</div>
        <div className="min-h-[120px]">{battleLog}</div>
      </div>
    </section>
  )
}
