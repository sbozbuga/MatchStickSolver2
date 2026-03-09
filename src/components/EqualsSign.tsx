import React from 'react';

interface EqualsSignProps {
    size: { width: number; height: number };
}

export const EqualsSign: React.FC<EqualsSignProps> = ({ size }) => (
    <svg viewBox="0 0 50 80" style={size} className="stroke-current text-amber-400" strokeWidth="4" strokeLinecap="round">
        <path d="M 10 30 H 40" className="transition-opacity opacity-100" />
        <path d="M 10 50 H 40" className="transition-opacity opacity-100" />
    </svg>
);
