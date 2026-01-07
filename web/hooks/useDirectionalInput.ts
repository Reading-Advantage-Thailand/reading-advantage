import { useEffect, useState, useCallback } from 'react'

export type InputVector = {
  dx: number
  dy: number
}

export function useDirectionalInput() {
  const [keys, setKeys] = useState<Set<string>>(new Set())
  const [virtualInput, setVirtualInput] = useState<InputVector>({ dx: 0, dy: 0 })
  const [castTriggered, setCastTriggered] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys((prev) => {
      const next = new Set(prev)
      next.add(e.code)
      return next
    })
    if (e.code === 'Space' || e.code === 'Enter') {
        setCastTriggered(true)
    }
  }, [])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setKeys((prev) => {
      const next = new Set(prev)
      next.delete(e.code)
      return next
    })
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  // Reset castTriggered after it's been processed?
  // In a React state-based loop, it's tricky.
  // Better: return it and reset it in an effect or callback.
  const consumeCast = useCallback(() => {
      setCastTriggered(false)
  }, [])

  // Calculate final input vector from keys + virtual
  let dx = 0
  let dy = 0

  if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= 1
  if (keys.has('ArrowDown') || keys.has('KeyS')) dy += 1
  if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= 1
  if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1

  // Combine with virtual input
  if (virtualInput.dx !== 0 || virtualInput.dy !== 0) {
      dx = virtualInput.dx
      dy = virtualInput.dy
  }

  return { 
      input: { dx, dy, cast: castTriggered },
      setVirtualInput,
      triggerCast: () => setCastTriggered(true),
      consumeCast
  }
}
