import React, { useState, useEffect, useRef } from 'react';
import { EquationDisplay } from './EquationDisplay';
import type { SegmentPattern } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useAudio } from '../audio/AudioContext';

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
    const { direction } = useLanguage();
    const { playKeyPress, playBackspace, playClear } = useAudio();
    const [animatedCharIndex, setAnimatedCharIndex] = useState<number | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus the component on mount for better usability.
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        
        // Only allow valid characters
        const filteredValue = newValue.split('').filter(char => ALLOWED_CHARS.includes(char)).join('');
        
        if (filteredValue !== value) {
            if (filteredValue.length > value.length) {
                playKeyPress();
                setAnimatedCharIndex(filteredValue.length - 1);
                setTimeout(() => setAnimatedCharIndex(null), 500);
            } else if (filteredValue.length < value.length) {
                playBackspace();
            }
            onChange(filteredValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
        }
    };

    const handleDoubleClick = () => {
        if (value.length > 0) playClear();
        onChange('');
        inputRef.current?.focus();
    };

    const focusClasses = isFocused ? 'border-amber-500 ring ring-amber-500/50' : 'border-slate-600';

    return (
        <div
            className={`relative w-full sm:w-auto flex-grow bg-slate-700 p-3 rounded-md border-2 ${focusClasses} transition flex items-center min-h-[58px] cursor-text`}
            onClick={() => inputRef.current?.focus()}
            onDoubleClick={handleDoubleClick}
        >
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-text"
                aria-label="Equation input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                inputMode="text"
            />
            <div className={`flex items-center w-full ${direction === 'rtl' ? 'flex-row-reverse' : ''} pointer-events-none`}>
                {value.length === 0 && !isFocused && (
                    <span className="text-slate-400 absolute left-4">{placeholder}</span>
                )}
                <EquationDisplay
                    equation={value}
                    animatedCharIndex={animatedCharIndex}
                    highlightMask={highlightMask}
                    highlightClass={highlightClass}
                />
                {isFocused && (
                    <div 
                        className={`bg-amber-400 w-0.5 h-10 blinking-cursor ${direction === 'rtl' ? 'me-2' : 'ms-2'}`}
                        aria-hidden="true"
                    />
                )}
            </div>
        </div>
    );
};