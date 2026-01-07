import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VocabularyItem } from '@/store/useGameStore'

interface StartScreenProps {
  vocabulary: VocabularyItem[]
  onStart: () => void
}

export function StartScreen({ vocabulary, onStart }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Missile Command: Vocab Edition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Vocabulary to Study:</h3>
            <div className="max-h-48 overflow-y-auto border rounded-md p-2 divide-y">
              {vocabulary.map((item, index) => (
                <div key={index} className="flex justify-between py-1 text-sm">
                  <span className="font-medium text-primary">{item.term}</span>
                  <span className="text-muted-foreground">{item.translation}</span>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={onStart} className="w-full" size="lg">
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
