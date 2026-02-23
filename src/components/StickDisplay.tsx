import React from 'react';
import type { SegmentPattern } from '../types';

interface StickDisplayProps {
    pattern: SegmentPattern;
    highlightPattern?: SegmentPattern;
    highlightClass?: string;
    size: { width: number, height: number };
    isAnimating?: boolean;
}

export const StickDisplay: React.FC<StickDisplayProps> = ({ pattern, highlightPattern, highlightClass = 'stick-moved', size, isAnimating }) => {
    const segments = [
        // Top       (0)
        { key: 'top', d: "M 10 10 H 40", active: pattern[0], len: 30 },
        // Top-left  (1)
        { key: 'top-left', d: "M 10 10 V 40", active: pattern[1], len: 30 },
        // Top-right (2)
        { key: 'top-right', d: "M 40 10 V 40", active: pattern[2], len: 30 },
        // Middle    (3)
        { key: 'middle', d: "M 10 40 H 40", active: pattern[3], len: 30 },
        // Bot-left  (4)
        { key: 'bot-left', d: "M 10 40 V 70", active: pattern[4], len: 30 },
        // Bot-right (5)
        { key: 'bot-right', d: "M 40 40 V 70", active: pattern[5], len: 30 },
        // Bottom    (6)
        { key: 'bottom', d: "M 10 70 H 40", active: pattern[6], len: 30 },
    ];

    return (
        <svg 
            viewBox="0 0 50 80" 
            style={{ width: size.width, height: size.height }}
            className={`stroke-current text-amber-400 ${isAnimating ? 'stick-draw-in' : ''}`}
            strokeWidth="4" 
            strokeLinecap="round"
        >
            {segments.map((seg, index) => {
                const isHighlighted = highlightPattern && highlightPattern[index];
                const classes = [
                    'transition-opacity',
                    seg.active ? 'opacity-100' : 'opacity-10',
                    isHighlighted ? highlightClass : ''
                ].filter(Boolean).join(' ');
                
                return (
                    <path
                        key={seg.key}
                        d={seg.d}
                        className={classes}
                        strokeDasharray={seg.len}
                        strokeDashoffset={isAnimating ? seg.len : 0}
                    />
                );
            })}
        </svg>
    );
};