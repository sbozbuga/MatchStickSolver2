import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import type { SegmentPattern } from '../types';
import { EqualsSign } from './EqualsSign';
import { getPattern, patternToChar, evaluateExpression, generateRandomPuzzle } from '../utils';

interface QuizWorkspaceProps {
    onSolveSuccess?: () => void;
}

export const QuizWorkspace: React.FC<QuizWorkspaceProps> = ({ onSolveSuccess }) => {
    // State
    const [puzzleCount, setPuzzleCount] = useState(1);
    const [originalEquation, setOriginalEquation] = useState('');
    const [patterns, setPatterns] = useState<SegmentPattern[]>([]);
    const [dragSource, setDragSource] = useState<{ charIndex: number, segmentIndex: number } | null>(null);
    const [hoverTarget, setHoverTarget] = useState<{ charIndex: number, segmentIndex: number } | null>(null);
    const [isSolved, setIsSolved] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [initialSticksCount, setInitialSticksCount] = useState(0);

    // Refs for touch tracking
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const hasMovedRef = useRef(false);
    const pointerStartRef = useRef<{ x: number, y: number } | null>(null);

    // Initialize quiz
    const loadNewPuzzle = useCallback(() => {
        const eq = generateRandomPuzzle();
        setOriginalEquation(eq);
        const initialPatterns = eq.split('').map(c => [...getPattern(c)] as SegmentPattern);
        setPatterns(initialPatterns);
        setInitialSticksCount(initialPatterns.flat().reduce((sum, v) => sum + v, 0));
        setIsSolved(false);
        setIsFailed(false);
    }, []);

    useEffect(() => {
        loadNewPuzzle();
    }, [loadNewPuzzle]);

    // Check if solved
    useEffect(() => {
        if (patterns.length === 0) return;

        const currentSticksCount = patterns.flat().reduce((sum, v) => sum + v, 0);
        if (currentSticksCount !== initialSticksCount) {
            setIsSolved(false);
            setIsFailed(false);
            return;
        }

        const currentChars = patterns.map((p, i) => patternToChar(p, originalEquation[i]));
        const currentEq = currentChars.join('');

        if (currentEq === originalEquation) {
            setIsSolved(false);
            setIsFailed(false);
            return;
        }

        if (currentChars.includes(null)) {
            setIsFailed(true);
            setIsSolved(false);
            return;
        }

        try {
            const [left, right] = currentEq.split('=');
            if (left && right) {
                const leftVal = evaluateExpression(left);
                const rightVal = evaluateExpression(right);
                if (leftVal !== null && rightVal !== null && leftVal === rightVal) {
                    setIsSolved(true);
                    setIsFailed(false);
                    if (onSolveSuccess) onSolveSuccess();
                } else {
                    setIsFailed(true);
                    setIsSolved(false);
                }
            } else {
                setIsFailed(true);
                setIsSolved(false);
            }
        } catch (e) {
            setIsFailed(true);
            setIsSolved(false);
        }
    }, [patterns, originalEquation, initialSticksCount, onSolveSuccess]);

    const handlePointerDown = (charIndex: number, segmentIndex: number, e: React.PointerEvent) => {
        if (isSolved || isFailed) return;

        const isPresent = patterns[charIndex] && patterns[charIndex][segmentIndex] === 1;

        if (dragSource && !isDraggingRef.current) {
            // We have a selected stick and we are clicking to place it
            if (!isPresent) {
                e.preventDefault();
                e.stopPropagation();

                setPatterns(prev => {
                    const newPatterns = [...prev];
                    newPatterns[charIndex] = [...newPatterns[charIndex]];
                    newPatterns[charIndex][segmentIndex] = 1;
                    return newPatterns;
                });

                setDragSource(null);
                setHoverTarget(null);
            }
            return;
        }

        if (isPresent) {
            e.preventDefault();
            e.stopPropagation();

            isDraggingRef.current = true;
            hasMovedRef.current = false;
            pointerStartRef.current = { x: e.clientX, y: e.clientY };

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
    };

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!dragSource) return;

        // If pointer is down, check for movement to distinguish click from drag
        if (isDraggingRef.current && pointerStartRef.current) {
            const dx = e.clientX - pointerStartRef.current.x;
            const dy = e.clientY - pointerStartRef.current.y;
            if (dx * dx + dy * dy > 25) { // 5px movement threshold
                hasMovedRef.current = true;
            }
        }

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
    }, [patterns, dragSource]);

    const handlePointerUp = useCallback(() => {
        if (isDraggingRef.current && dragSource) {
            if (hoverTarget && hasMovedRef.current) {
                // Placed stick via drag & drop
                setPatterns(prev => {
                    const newPatterns = [...prev];
                    newPatterns[hoverTarget.charIndex] = [...newPatterns[hoverTarget.charIndex]];
                    newPatterns[hoverTarget.charIndex][hoverTarget.segmentIndex] = 1;
                    return newPatterns;
                });
                setDragSource(null);
                setHoverTarget(null);
                isDraggingRef.current = false;
            } else if (hasMovedRef.current) {
                // Dragged to an invalid area (missed target). Cancel drop.
                setPatterns(prev => {
                    const newPatterns = [...prev];
                    newPatterns[dragSource.charIndex] = [...newPatterns[dragSource.charIndex]];
                    newPatterns[dragSource.charIndex][dragSource.segmentIndex] = 1;
                    return newPatterns;
                });
                setDragSource(null);
                setHoverTarget(null);
                isDraggingRef.current = false;
            } else {
                // Pointer was held down and released without moving (click).
                // Keep the stick selected for click-to-place.
                isDraggingRef.current = false;
            }
        }
    }, [dragSource, hoverTarget]);

    const handleGlobalPointerDown = useCallback((e: PointerEvent) => {
        if (dragSource && !isDraggingRef.current) {
            // We have a selected stick, and we clicked somewhere.
            // Check if we clicked on an SVG path (handled safely by local segment boundaries)
            if ((e.target as Element).tagName === 'path' || (e.target as Element).closest('svg')) {
                return;
            }

            // Otherwise, we clicked empty background space. Deselect the stick and return it.
            setPatterns(prev => {
                const newPatterns = [...prev];
                newPatterns[dragSource.charIndex] = [...newPatterns[dragSource.charIndex]];
                newPatterns[dragSource.charIndex][dragSource.segmentIndex] = 1;
                return newPatterns;
            });
            setDragSource(null);
            setHoverTarget(null);
        }
    }, [dragSource]);

    useEffect(() => {
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
        window.addEventListener('pointerdown', handleGlobalPointerDown);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
            window.removeEventListener('pointerdown', handleGlobalPointerDown);
        };
    }, [handlePointerMove, handlePointerUp, handleGlobalPointerDown]);

    const handleNextPuzzle = () => {
        setPuzzleCount(prev => prev + 1);
        loadNewPuzzle();
    };

    const handleReset = () => {
        setPatterns(originalEquation.split('').map(c => [...getPattern(c)] as SegmentPattern));
        setIsSolved(false);
        setIsFailed(false);
    };

    const handleCopyEquation = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(originalEquation);
        } else {
            // Fallback for insecure HTTP contexts
            const textArea = document.createElement("textarea");
            textArea.value = originalEquation;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(textArea);
        }

        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const renderInteractiveStickDisplay = (charIndex: number, pattern: SegmentPattern, char: string) => {
        const size = { width: 72, height: 115.2 };

        if (char === '=') {
            return <EqualsSign size={size} />;
        }

        // For + and -, we only render segments 1 and 3, using the centered plus sign coordinates
        if (char === '+' || char === '-') {
            return (
                <svg viewBox="0 0 50 80" style={size} className="stroke-current text-amber-400" strokeWidth="4" strokeLinecap="round">
                    {[3, 1].map(segmentIndex => {
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
                                    strokeWidth="8"
                                    onPointerDown={(e) => handlePointerDown(charIndex, segmentIndex, e)}
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
                                strokeWidth="8"
                                onPointerDown={(e) => handlePointerDown(charIndex, segmentIndex, e)}
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
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700" ref={containerRef}>
            <div className="text-center mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-amber-400">Quiz Mode</h2>
                <span className="text-slate-400">Solving Puzzle #{puzzleCount}</span>
            </div>
            <p className="text-slate-300 mt-2 text-center mb-8 text-lg">Drag 1 stick to fix the equation!</p>

            <div className="flex items-center justify-center gap-2 sm:gap-6 py-12 select-none touch-none overflow-x-auto">
                {patterns.map((pattern, i) => (
                    <div key={i} className="flex-shrink-0">
                        {renderInteractiveStickDisplay(i, pattern, originalEquation[i])}
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
                ) : isFailed ? (
                    <>
                        <span className="text-3xl font-bold text-red-400 animate-bounce">Incorrect!</span>
                        <button
                            onClick={handleReset}
                            className="px-8 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-400 transition text-lg"
                        >
                            Try Again
                        </button>
                    </>
                ) : (
                    <div className="flex gap-4">
                        <button
                            onClick={handleCopyEquation}
                            className={`px-6 py-2 font-medium rounded-lg border transition flex items-center gap-2 ${isCopied
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600'
                                }`}
                            title="Copy Original Equation"
                        >
                            {isCopied ? <Check size={18} /> : <Copy size={18} />}
                            {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition"
                        >
                            Reset Puzzle
                        </button>
                    </div>
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
