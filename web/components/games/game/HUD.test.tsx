import { render, screen } from '@testing-library/react'
import { HUD } from './HUD'

describe('HUD', () => {
  it('renders score and accuracy', () => {
    render(<HUD score={1230} accuracy={0.85} />)
    
    expect(screen.getByText('1230')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })
})
