import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DIGITS, OPERATORS, EQUALS_SIGN } from '../constants';
import { safeEvaluate } from '../utils';
import type { SegmentPattern } from '../types';

const EqualsSign = ({ size }: { size: { width: number, height: number } }) => (
    <svg viewBox="0 0 50 80" style={size} className="stroke-current text-amber-400" strokeWidth="4" strokeLinecap="round">
        <path d="M 10 30 H 40" className="transition-opacity opacity-100" />
        <path d="M 10 50 H 40" className="transition-opacity opacity-100" />
    </svg>
);

// Helper to convert char to pattern
const charToPattern = (char: string): SegmentPattern => {
    if (/\d/.test(char)) return [...DIGITS[parseInt(char)]];
    if (char === '+') return [...OPERATORS['+']];
    if (char === '-') return [...OPERATORS['-']];
    if (char === '=') return [...EQUALS_SIGN];
    return [0, 0, 0, 0, 0, 0, 0];
};

interface InteractiveCharProps {
    charIndex: number;
    pattern: SegmentPattern;
    char: string;
    hoverTarget: { charIndex: number, segmentIndex: number } | null;
    onPointerDown: (charIndex: number, segmentIndex: number, e: React.PointerEvent) => void;
}

const InteractiveChar = React.memo(({ charIndex, pattern, char, hoverTarget, onPointerDown }: InteractiveCharProps) => {
    const size = { width: 72, height: 115.2 };

    if (char === '=') {
        return <EqualsSign size={size} />;
    }

    // For + and -, we only render segments 1 and 3, using the centered plus sign coordinates
    if (char === '+' || char === '-') {
        return (
            <svg viewBox="0 0 50 80" style={size} className="stroke-current text-amber-400" strokeWidth="4" strokeLinecap="round">
                {[1, 3].map(segmentIndex => {
                    const isActive = pattern[segmentIndex] === 1;
                    const isHovered = hoverTarget?.charIndex === charIndex && hoverTarget?.segmentIndex === segmentIndex;

                    let d = "";
                    if (segmentIndex === 3) d = "M 15 40 H 35"; // Horizontal
                    if (segmentIndex === 1) d = "M 25 30 V 50"; // Vertical

                    const classes = [
                        'transition-opacity cursor-pointer',
                        isActive ? 'opacity-100' : 'opacity-10',
                        isHovered ? 'text-amber-200 opacity-50' : ''
                    ].filter(Boolean).join(' ');

                    return (
                        <g key={segmentIndex}>
                            <path
                                d={d}
                                stroke="transparent"
                                strokeWidth="24"
                                onPointerDown={(e) => onPointerDown(charIndex, segmentIndex, e as any)}
                                data-char-index={charIndex}
                                data-segment-index={segmentIndex}
                                style={{ pointerEvents: 'auto' }}
                            />
                            <path
                                d={d}
                                className={classes}
                                style={{ pointerEvents: 'none' }}
                            />
                        </g>
                    );
                })}
            </svg>
        );
    }

    // Standard 7-segment display for digits
    const segments = [
        { key: 'top', d: "M 10 10 H 40" },
        { key: 'top-left', d: "M 10 10 V 40" },
        { key: 'top-right', d: "M 40 10 V 40" },
        { key: 'middle', d: "M 10 40 H 40" },
        { key: 'bot-left', d: "M 10 40 V 70" },
        { key: 'bot-right', d: "M 40 40 V 70" },
        { key: 'bottom', d: "M 10 70 H 40" },
    ];

    return (
        <svg viewBox="0 0 50 80" style={size} className="stroke-current text-amber-400" strokeWidth="4" strokeLinecap="round">
            {segments.map((seg, segmentIndex) => {
                const isActive = pattern[segmentIndex] === 1;
                const isHovered = hoverTarget?.charIndex === charIndex && hoverTarget?.segmentIndex === segmentIndex;

                const classes = [
                    'transition-opacity cursor-pointer',
                    isActive ? 'opacity-100' : 'opacity-10',
                    isHovered ? 'text-amber-200 opacity-50' : ''
                ].filter(Boolean).join(' ');

                return (
                    <g key={seg.key}>
                        <path
                            d={seg.d}
                            stroke="transparent"
                            strokeWidth="24"
                            onPointerDown={(e) => onPointerDown(charIndex, segmentIndex, e as any)}
                            data-char-index={charIndex}
                            data-segment-index={segmentIndex}
                            style={{ pointerEvents: 'auto' }}
                        />
                        <path
                            d={seg.d}
                            className={classes}
                            style={{ pointerEvents: 'none' }}
                        />
                    </g>
                );
            })}
        </svg>
    );
});

// Helper to convert pattern to char
const patternToChar = (pattern: SegmentPattern, originalChar: string): string | null => {
    if (originalChar === '=') {
        if (pattern.every((v, i) => v === EQUALS_SIGN[i])) return '=';
        return null;
    }
    
    // Check digits
    for (let i = 0; i <= 9; i++) {
        if (pattern.every((v, idx) => v === DIGITS[i][idx])) return i.toString();
    }
    
    // Check operators
    if (pattern.every((v, idx) => v === OPERATORS['+'][idx])) return '+';
    if (pattern.every((v, idx) => v === OPERATORS['-'][idx])) return '-';
    
    return null;
};

const QUIZ_PUZZLES = [
    '6+4=4', // 0+4=4
    '5+7=2', // 9-7=2
    '9-5=8', // 3+5=8
    '2+2=5', // 2+3=5
    '5-5=2', // 5-3=2
    '4+2=9', // 4+5=9
    '3+3=8', // 3+5=8
    '1+1=3', // 1+1=2
    '9+3=4', // 8-3=4
    '6+2=9', // 6+3=9
    '0+4=4', // 8-4=4
];

interface QuizWorkspaceProps {
    onSolveSuccess?: () => void;
}

export const QuizWorkspace: React.FC<QuizWorkspaceProps> = ({ onSolveSuccess }) => {
    // State
    const [puzzleIndex, setPuzzleIndex] = useState(0);
    const [originalEquation, setOriginalEquation] = useState(QUIZ_PUZZLES[0]);
    const [patterns, setPatterns] = useState<SegmentPattern[]>([]);
    const [dragSource, setDragSource] = useState<{ charIndex: number, segmentIndex: number } | null>(null);
    const [hoverTarget, setHoverTarget] = useState<{ charIndex: number, segmentIndex: number } | null>(null);
    const [isSolved, setIsSolved] = useState(false);
    
    // Refs for touch tracking
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    
    // Initialize quiz
    useEffect(() => {
        const eq = QUIZ_PUZZLES[puzzleIndex];
        setOriginalEquation(eq);
        setPatterns(eq.split('').map(charToPattern));
        setIsSolved(false);
    }, [puzzleIndex]);

    // Check if solved
    useEffect(() => {
        if (patterns.length === 0) return;
        
        const currentChars = patterns.map((p, i) => patternToChar(p, originalEquation[i]));
        if (currentChars.includes(null)) {
            setIsSolved(false);
            return;
        }
        
        const currentEq = currentChars.join('');
        
        try {
            const [left, right] = currentEq.split('=');
            if (left && right) {
                const leftVal = safeEvaluate(left);
                const rightVal = safeEvaluate(right);
                if (leftVal !== null && rightVal !== null && leftVal === rightVal && currentEq !== originalEquation) {
                    setIsSolved(true);
                    if (onSolveSuccess) onSolveSuccess();
                } else {
                    setIsSolved(false);
                }
            }
        } catch (e) {
            setIsSolved(false);
        }
    }, [patterns, originalEquation, onSolveSuccess]);

    const handlePointerDown = useCallback((charIndex: number, segmentIndex: number, e: React.PointerEvent) => {
        if (patterns[charIndex][segmentIndex] === 1 && !isSolved) {
            e.preventDefault();
            e.stopPropagation();
            
            isDraggingRef.current = true;
            
            // Set drag source
            setDragSource({ charIndex, segmentIndex });
            
            // Optimistically remove the stick
            setPatterns(prev => {
                const newPatterns = [...prev];
                newPatterns[charIndex] = [...newPatterns[charIndex]];
                newPatterns[charIndex][segmentIndex] = 0;
                return newPatterns;
            });
        }
    }, [patterns, isSolved]);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!isDraggingRef.current) return;
        
        // Find element under pointer
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (!element) {
            setHoverTarget(null);
            return;
        }
        
        // Check if element has data attributes for charIndex and segmentIndex
        const charIndexStr = element.getAttribute('data-char-index');
        const segmentIndexStr = element.getAttribute('data-segment-index');
        
        if (charIndexStr !== null && segmentIndexStr !== null) {
            const charIndex = parseInt(charIndexStr, 10);
            const segmentIndex = parseInt(segmentIndexStr, 10);
            
            if (patterns[charIndex] && patterns[charIndex][segmentIndex] === 0) {
                setHoverTarget({ charIndex, segmentIndex });
                return;
            }
        }
        
        setHoverTarget(null);
    }, [patterns]);

    const handlePointerUp = useCallback(() => {
        if (isDraggingRef.current && dragSource) {
            setPatterns(prev => {
                const newPatterns = [...prev];
                
                if (hoverTarget) {
                    // Place stick at hover target
                    newPatterns[hoverTarget.charIndex] = [...newPatterns[hoverTarget.charIndex]];
                    newPatterns[hoverTarget.charIndex][hoverTarget.segmentIndex] = 1;
                } else {
                    // Return stick to source
                    newPatterns[dragSource.charIndex] = [...newPatterns[dragSource.charIndex]];
                    newPatterns[dragSource.charIndex][dragSource.segmentIndex] = 1;
                }
                
                return newPatterns;
            });
            
            setDragSource(null);
            setHoverTarget(null);
            isDraggingRef.current = false;
        }
    }, [dragSource, hoverTarget]);

    useEffect(() => {
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [handlePointerMove, handlePointerUp]);

    const handleNextPuzzle = () => {
        setPuzzleIndex(prev => (prev + 1) % QUIZ_PUZZLES.length);
    };

    const handleReset = () => {
        setPatterns(originalEquation.split('').map(charToPattern));
        setIsSolved(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700" ref={containerRef}>
            <div className="text-center mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-amber-400">Quiz Mode</h2>
                <span className="text-slate-400">Puzzle {puzzleIndex + 1} of {QUIZ_PUZZLES.length}</span>
            </div>
            <p className="text-slate-300 mt-2 text-center mb-8 text-lg">Drag 1 stick to fix the equation!</p>

            <div className="flex items-center justify-center gap-2 sm:gap-6 py-12 select-none touch-none overflow-x-auto">
                {patterns.map((pattern, i) => (
                    <div key={i} className="flex-shrink-0">
                        <InteractiveChar
                            charIndex={i}
                            pattern={pattern}
                            char={originalEquation[i]}
                            hoverTarget={hoverTarget}
                            onPointerDown={handlePointerDown}
                        />
                    </div>
                ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 min-h-[80px]">
                {isSolved ? (
                    <>
                        <span className="text-3xl font-bold text-emerald-400 animate-bounce">Correct! Well done!</span>
                        <button 
                            onClick={handleNextPuzzle}
                            className="px-8 py-3 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition text-lg"
                        >
                            Next Puzzle
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={handleReset}
                        className="px-6 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition"
                    >
                        Reset Puzzle
                    </button>
                )}
            </div>
            
            {dragSource && (
                <div className="fixed top-4 right-4 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full animate-pulse z-50">
                    Dragging stick...
                </div>
            )}
        </div>
    );
};
