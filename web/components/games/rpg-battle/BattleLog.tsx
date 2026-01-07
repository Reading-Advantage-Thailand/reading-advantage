import React from 'react'
import { BattleLogEntry } from '@/store/useRPGBattleStore'

interface BattleLogProps {
  entries: BattleLogEntry[]
}

export function BattleLog({ entries }: BattleLogProps) {
  return (
    <div className="rounded-xl border bg-background/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Battle Log</span>
        <span className="text-xs text-muted-foreground">Latest actions</span>
      </div>

      <div className="mt-3 max-h-40 overflow-y-auto">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No actions yet.</p>
        ) : (
          <ul className="space-y-2" role="log" aria-live="polite">
            {entries.map((entry, index) => {
              const tone =
                entry.type === 'player'
                  ? 'text-emerald-700'
                  : entry.type === 'enemy'
                    ? 'text-rose-700'
                    : 'text-muted-foreground'

              return (
                <li key={`${entry.type}-${index}`} className={`text-sm ${tone}`}>
                  {entry.text}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
