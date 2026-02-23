import React from 'react';
import type { SegmentPattern } from '../types';

interface PlusSignProps {
    highlightPattern?: SegmentPattern;
    highlightClass?: string;
    size: { width: number, height: number };
    isAnimating?: boolean;
}

export const PlusSign: React.FC<PlusSignProps> = ({ highlightPattern, highlightClass = 'stick-moved', size, isAnimating }) => {
    // In constants.ts, '+' is defined by segment 1 (vertical) and 3 (horizontal).
    const highlightVertical = highlightPattern && highlightPattern[1];
    const highlightHorizontal = highlightPattern && highlightPattern[3];

    const verticalClasses = ['transition-opacity opacity-100', highlightVertical ? highlightClass : ''].filter(Boolean).join(' ');
    const horizontalClasses = ['transition-opacity opacity-100', highlightHorizontal ? highlightClass : ''].filter(Boolean).join(' ');

    return (
        <svg 
            viewBox="0 0 50 80"
            style={{ width: size.width, height: size.height }}
            className={`stroke-current text-amber-400 ${isAnimating ? 'stick-draw-in' : ''}`}
            strokeWidth="4" 
            strokeLinecap="round"
        >
            {/* Horizontal bar (segment 3) */}
            <path 
                d="M 15 40 H 35" 
                className={horizontalClasses}
                strokeDasharray="20"
                strokeDashoffset={isAnimating ? '20' : '0'}
            />
            {/* Vertical bar (segment 1) */}
            <path 
                d="M 25 30 V 50" 
                className={verticalClasses}
                strokeDasharray="20"
                strokeDashoffset={isAnimating ? '20' : '0'}
            />
        </svg>
    );
};