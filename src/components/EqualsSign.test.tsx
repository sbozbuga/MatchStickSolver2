import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { EqualsSign } from './EqualsSign';

describe('EqualsSign', () => {
    it('renders an SVG element with correct default attributes', () => {
        const size = { width: 42, height: 42 };
        const { container } = render(<EqualsSign size={size} />);

        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('viewBox', '0 0 50 80');
        expect(svg).toHaveClass('stroke-current', 'text-amber-400');
        expect(svg).toHaveAttribute('stroke-width', '4');
        expect(svg).toHaveAttribute('stroke-linecap', 'round');
    });

    it('applies the provided size prop to the style attribute', () => {
        const size = { width: 100, height: 200 };
        const { container } = render(<EqualsSign size={size} />);

        const svg = container.querySelector('svg');
        expect(svg).toHaveStyle({
            width: '100px',
            height: '200px'
        });
    });

    it('contains exactly two path elements with correct coordinates', () => {
        const size = { width: 50, height: 80 };
        const { container } = render(<EqualsSign size={size} />);

        const paths = container.querySelectorAll('path');
        expect(paths).toHaveLength(2);

        // Top line of the equals sign
        expect(paths[0]).toHaveAttribute('d', 'M 10 30 H 40');
        expect(paths[0]).toHaveClass('transition-opacity', 'opacity-100');

        // Bottom line of the equals sign
        expect(paths[1]).toHaveAttribute('d', 'M 10 50 H 40');
        expect(paths[1]).toHaveClass('transition-opacity', 'opacity-100');
    });
});
