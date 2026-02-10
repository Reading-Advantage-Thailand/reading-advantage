
import React from 'react'
import { render, screen } from '@testing-library/react'
import { VocabularyProgress } from './VocabularyProgress'
import type { VocabularyItem } from '@/store/useGameStore'

describe('VocabularyProgress', () => {
  const mockVocabulary: VocabularyItem[] = [
    { term: 'cat', translation: 'gato', id: '1' },
    { term: 'dog', translation: 'perro', id: '2' }
  ]

  const mockProgress = new Map<string, number>()
  mockProgress.set('cat', 1)
  mockProgress.set('dog', 2)

  it('renders all vocabulary words', () => {
    render(
      <VocabularyProgress 
        vocabulary={mockVocabulary} 
        progress={mockProgress} 
        isOpen={true}
        onClose={() => {}}
      />
    )
    
    expect(screen.getByText('cat')).toBeInTheDocument()
    expect(screen.getByText('dog')).toBeInTheDocument()
  })

  it('renders correct progress stars', () => {
    render(
      <VocabularyProgress 
        vocabulary={mockVocabulary} 
        progress={mockProgress} 
        isOpen={true}
        onClose={() => {}}
      />
    )
    
    // "cat" has 1 progress -> 1 star filled
    // We can find the container for "cat"
    const catText = screen.getByText('cat')
    // Go up to the row container (grandparent likely)
    const catRow = catText.closest('.flex.items-center.justify-between')
    
    // Check for filled stars in this row
    // filled stars have 'fill-yellow-400' class
    const catFilledStars = catRow?.querySelectorAll('.fill-yellow-400')
    expect(catFilledStars?.length).toBe(1)
    
    // "dog" has 2 progress -> 2 stars filled
    const dogText = screen.getByText('dog')
    const dogRow = dogText.closest('.flex.items-center.justify-between')
    const dogFilledStars = dogRow?.querySelectorAll('.fill-yellow-400')
    expect(dogFilledStars?.length).toBe(2)
  })

  it('does not render content when closed', () => {
    render(
      <VocabularyProgress 
        vocabulary={mockVocabulary} 
        progress={mockProgress} 
        isOpen={false}
        onClose={() => {}}
      />
    )
    
    expect(screen.queryByText('cat')).not.toBeInTheDocument()
  })
})
