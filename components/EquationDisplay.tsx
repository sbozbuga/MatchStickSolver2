import React, { useState, useLayoutEffect, useRef } from 'react';
import { StickDisplay } from './StickDisplay';
import { PlusSign } from './PlusSign';
import { EqualsSign } from './EqualsSign';
import { DIGITS, OPERATORS } from '@/constants';
import type { SegmentPattern } from '@/types';
import { useLanguage } from '../i18n/LanguageContext';

interface EquationDisplayProps {
    equation: string;
    highlightMask?: SegmentPattern[];
    highlightClass?: string;
    animatedCharIndex?: number | null;
}

const DEFAULT_SIZE = { width: 48, height: 76.8 };

export const EquationDisplay: React.FC<EquationDisplayProps> = ({ equation, highlightMask, highlightClass, animatedCharIndex }) => {
    const { t } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    const [charSize, setCharSize] = useState(DEFAULT_SIZE);

    const cleanEquation = equation.replace(/\s/g, '');
    const charArray = cleanEquation.split('');
    
    useLayoutEffect(() => {
        const calculateSize = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            if (containerWidth === 0) return;

            const numChars = charArray.length || 1;
            const aspectRatio = 8 / 5; // height / width
            const gapRatio = 0.15; // Gap is 15% of character width

            const totalUnits = numChars + (numChars > 1 ? (numChars - 1) * gapRatio : 0);
            
            let charWidth = containerWidth / totalUnits;
            let charHeight = charWidth * aspectRatio;

            // Constraints to prevent extreme sizes
            const maxHeight = 120;
            const minHeight = 40;

            if (charHeight > maxHeight) {
                charHeight = maxHeight;
                charWidth = charHeight / aspectRatio;
            }
            
            if (charHeight < minHeight) {
                charHeight = minHeight;
                charWidth = charHeight / aspectRatio;
            }

            setCharSize({ width: charWidth, height: charHeight });
        };

        calculateSize();

        const resizeObserver = new ResizeObserver(calculateSize);
        const container = containerRef.current;
        if (container) {
            resizeObserver.observe(container);
        }

        return () => {
            if (container) {
                resizeObserver.unobserve(container);
            }
        };
    }, [charArray.length]);

    const components = [];
    let charIndex = 0; // Separate index for mask, as '=' is skipped
    for (let i = 0; i < charArray.length; i++) {
        const char = charArray[i];
        const isAnimating = i === animatedCharIndex;
        
        if (char === '=') {
            components.push(<EqualsSign key={i} size={charSize} isAnimating={isAnimating} />);
            continue; // Skip to next character, do not increment charIndex
        }

        const highlightPattern = highlightMask ? highlightMask[charIndex] : undefined;
        
        if (/\d/.test(char)) {
            const digit = parseInt(char);
            components.push(<StickDisplay key={i} pattern={DIGITS[digit]} highlightPattern={highlightPattern} highlightClass={highlightClass} size={charSize} isAnimating={isAnimating} />);
        } else if (char === '+') {
            components.push(<PlusSign key={i} highlightPattern={highlightPattern} highlightClass={highlightClass} size={charSize} isAnimating={isAnimating} />);
        } else if (char === '-') {
            components.push(<StickDisplay key={i} pattern={OPERATORS['-']} highlightPattern={highlightPattern} highlightClass={highlightClass} size={charSize} isAnimating={isAnimating} />);
        }
        charIndex++;
    }

    return (
        <div
            ref={containerRef}
            className="flex items-center justify-center w-full"
            style={{ gap: `${charSize.width * 0.15}px`, minHeight: `${charSize.height}px` }}
        >
            {charArray.length === 0 ? (
                <div className="text-gray-500 flex items-center" style={{height: `${DEFAULT_SIZE.height}px`}}>{t('app.enterEquation')}</div>
            ) : (
                charSize.width > 0 && components
            )}
        </div>
    );
};