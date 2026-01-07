'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'

interface InputControllerProps {
  onSubmit: (value: string) => void
}

export function InputController({ onSubmit }: InputControllerProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (inputValue.trim().length > 0) {
        onSubmit(inputValue.trim())
        setInputValue('')
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-background/80 backdrop-blur-md rounded-xl border shadow-2xl">
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type translation and press Enter..."
        className="text-lg h-12 text-center focus-visible:ring-primary"
        autoFocus
      />
    </div>
  )
}
