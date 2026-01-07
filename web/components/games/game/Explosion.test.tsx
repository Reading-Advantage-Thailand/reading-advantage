import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Explosion } from './Explosion';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onAnimationComplete, ...props }: {
      children?: ReactNode;
      onAnimationComplete?: () => void;
    }) => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
      return <div {...props}>{children}</div>;
    },
  },
}));

describe('Explosion', () => {
  it('renders particles and triggers completion once', () => {
    const onComplete = jest.fn();
    const { container } = render(<Explosion x={10} y={20} onComplete={onComplete} />);

    const particles = container.querySelectorAll('.bg-yellow-500');
    expect(particles).toHaveLength(8);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
