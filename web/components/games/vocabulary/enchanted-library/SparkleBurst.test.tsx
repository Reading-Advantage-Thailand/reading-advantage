import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SparkleBurst } from './SparkleBurst'

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onAnimationComplete, ...props }: {
      children?: ReactNode
      onAnimationComplete?: () => void
    }) => {
      if (onAnimationComplete) {
        onAnimationComplete()
      }
      return <div {...props}>{children}</div>
    },
  },
}))

describe('SparkleBurst', () => {
  it('renders sparkles and triggers completion', () => {
    const onComplete = jest.fn()
    const { container } = render(<SparkleBurst x={40} y={60} onComplete={onComplete} />)

    const sparkles = container.querySelectorAll('.sparkle-particle')
    expect(sparkles).toHaveLength(10)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
