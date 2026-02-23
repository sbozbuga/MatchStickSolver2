import React, { useState, useEffect, useRef } from 'react';
import { EquationDisplay } from './EquationDisplay';
import type { SegmentPattern } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useAudio } from '../audio/AudioContext';
import { X } from 'lucide-react';

interface EquationInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder: string;
    highlightMask?: SegmentPattern[];
    highlightClass?: string;
}

const ALLOWED_CHARS = '0123456789+-=';

export const EquationInput: React.FC<EquationInputProps> = ({ value, onChange, onSubmit, placeholder, highlightMask, highlightClass }) => {
    const { direction, t } = useLanguage();
    const { playKeyPress, playBackspace, playClear } = useAudio();
    const [animatedCharIndex, setAnimatedCharIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-focus the component on mount for better usability.
    useEffect(() => {
        containerRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (e.key === 'Enter') {
            onSubmit();
            return;
        }

        if (e.key === 'Backspace') {
            if (value.length > 0) playBackspace();
            onChange(value.slice(0, -1));
        } else if (ALLOWED_CHARS.includes(e.key)) {
            const newValue = value + e.key;
            playKeyPress();
            onChange(newValue);
            setAnimatedCharIndex(value.length);
            // Reset animation state after it has played
            setTimeout(() => setAnimatedCharIndex(null), 500);
        }
    };

    const handleDoubleClick = () => {
        if (value.length > 0) playClear();
        onChange('');
    };

    const focusClasses = isFocused ? 'border-amber-500 ring ring-amber-500/50' : 'border-slate-600';
    const hasValue = value.length > 0;
    const paddingClass = hasValue
        ? (direction === 'rtl' ? 'pl-10 pr-3 py-3' : 'pr-10 pl-3 py-3')
        : 'p-3';

    return (
        <div
            className={`relative w-full sm:w-auto flex-grow bg-slate-700 ${paddingClass} rounded-md border-2 ${focusClasses} transition flex items-center min-h-[58px] cursor-text`}
            onClick={() => inputRef.current?.focus()}
            onDoubleClick={handleDoubleClick}
            aria-label="Equation input"
        >
            <div className={`flex items-center w-full ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <EquationDisplay
                    equation={value}
                    animatedCharIndex={animatedCharIndex}
                    highlightMask={highlightMask}
                    highlightClass={highlightClass}
                />
                <div 
                    className={`bg-amber-400 w-0.5 h-10 blinking-cursor ${direction === 'rtl' ? 'me-2' : 'ms-2'}`}
                    aria-hidden="true"
                />
            </div>
            {hasValue && (
                <button
                    className={`absolute ${direction === 'rtl' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-600 transition-colors z-10`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange('');
                        playClear();
                        inputRef.current?.focus();
                    }}
                    aria-label={t('app.clearInput')}
                    type="button"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};