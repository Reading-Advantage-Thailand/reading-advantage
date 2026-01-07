'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Trophy, Target } from 'lucide-react'

interface HUDProps {
  score: number
  accuracy: number
}

export function HUD({ score, accuracy }: HUDProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none z-10">
      <Card className="flex items-center p-2 gap-2 bg-background/80 backdrop-blur border-primary/20">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <span className="font-bold text-lg">{score}</span>
      </Card>
      <Card className="flex items-center p-2 gap-2 bg-background/80 backdrop-blur border-primary/20">
        <Target className="w-4 h-4 text-blue-500" />
        <span className="font-bold text-lg">{Math.round(accuracy * 100)}%</span>
      </Card>
    </div>
  )
}
