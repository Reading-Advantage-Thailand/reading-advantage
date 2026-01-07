import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Target, Zap } from 'lucide-react'

interface ResultsScreenProps {
  score: number
  accuracy: number
  xp: number
  onRestart: () => void
}

export function ResultsScreen({ score, accuracy, xp, onRestart }: ResultsScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md bg-gradient-to-b from-background to-muted/50 border-2 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center font-bold tracking-tight">Game Over</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 py-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
              <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
              <span className="text-xs font-semibold text-muted-foreground uppercase">Score</span>
              <span className="text-xl font-bold">{score}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
              <Target className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-xs font-semibold text-muted-foreground uppercase">Accuracy</span>
              <span className="text-xl font-bold">{Math.round(accuracy * 100)}%</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
              <Zap className="w-6 h-6 text-purple-500 mb-2" />
              <span className="text-xs font-semibold text-muted-foreground uppercase">XP Earned</span>
              <span className="text-xl font-bold text-primary">{xp} XP</span>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={onRestart} className="w-full h-14 text-lg font-bold" size="lg">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
