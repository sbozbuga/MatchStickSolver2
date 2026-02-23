import React from 'react';

interface EqualsSignProps {
    size: { width: number, height: number };
    isAnimating?: boolean;
}

export const EqualsSign: React.FC<EqualsSignProps> = ({ size, isAnimating }) => {
    return (
        <svg 
            viewBox="0 0 50 80" 
            style={{ width: size.width, height: size.height }}
            className={`stroke-current text-amber-400 ${isAnimating ? 'stick-draw-in' : ''}`}
            strokeWidth="4" 
            strokeLinecap="round"
        >
            {/* Top bar */}
            <path
                d="M 15 35 H 35"
                strokeDasharray="20"
                strokeDashoffset={isAnimating ? '20' : '0'}
            />
            {/* Bottom bar */}
            <path
                d="M 15 45 H 35"
                strokeDasharray="20"
                strokeDashoffset={isAnimating ? '20' : '0'}
            />
        </svg>
    );
};