import React, { useState, useMemo } from 'react';
import type { SegmentPattern } from '../types';
import { SegmentDisplay } from './SegmentDisplay';
import { getPattern, patternToChar, solveEquation, generateRandomPuzzle } from '../utils';

const StaticEquation: React.FC<{ equation: string, originalEquation?: string }> = ({ equation, originalEquation }) => {
    const chars = equation.replace(/\s/g, '').split('');
    const originalChars = originalEquation ? originalEquation.replace(/\s/g, '').split('') : chars;

    const renderStickDisplay = (charIndex: number, char: string, originalChar: string) => {
        const size = { width: 72, height: 115.2 };
        const pattern = getPattern(char);
        const originalPattern = getPattern(originalChar);

        return (
            <SegmentDisplay
                char={char}
                pattern={pattern}
                size={size}
                originalPattern={originalPattern}
            />
        );
    };

    return (
        <div className="flex items-center justify-center gap-2 sm:gap-4 select-none">
            {chars.map((char, i) => (
                <div key={i} className="flex-shrink-0">
                    {renderStickDisplay(i, char, originalChars[i])}
                </div>
            ))}
        </div>
    );
};

export const SolverWorkspace: React.FC = () => {
    const [input, setInput] = useState('6+4=4');
    const [equation, setEquation] = useState('6+4=4');

    const solutions = useMemo(() => {
        return solveEquation(equation);
    }, [equation]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setEquation(input);
    };

    const handleRandomize = () => {
        const randomEq = generateRandomPuzzle();
        setInput(randomEq);
        setEquation(randomEq);
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-amber-400">Solver Mode</h2>
                <p className="text-slate-300 mt-2 text-lg">Enter an equation to find all 1-stick solutions!</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-4 mb-12 max-w-xl mx-auto">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    maxLength={20} // Security: Defense in depth against malicious long inputs
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-2xl text-center text-slate-100 focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                    placeholder="e.g. 6+4=4"
                />
                <button
                    type="button"
                    onClick={handleRandomize}
                    className="px-6 py-3 bg-slate-700 text-amber-500 font-bold rounded-lg hover:bg-slate-600 border border-slate-600 transition text-lg w-32"
                >
                    Random
                </button>
                <button
                    type="submit"
                    className="px-8 py-3 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition text-lg"
                >
                    Solve
                </button>
            </form>

            <div className="mt-8">
                <div className="flex flex-col items-center mb-12">
                    <h3 className="text-xl font-bold text-slate-200 mb-6 text-center">
                        Original Equation
                    </h3>
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                        <StaticEquation equation={equation} />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-slate-200 mb-8 text-center">
                    Solutions
                </h3>
                {solutions.length > 0 ? (
                    <>
                        <div className="flex justify-center gap-6 mb-8 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-1 bg-emerald-400 rounded"></div>
                                <span className="text-slate-300">Added stick</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-1 bg-rose-500 opacity-50 rounded"></div>
                                <span className="text-slate-300">Removed stick</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {solutions.map((sol, idx) => (
                                <div key={idx} className="bg-slate-700/50 p-6 rounded-xl border border-slate-600 flex flex-col items-center gap-4">
                                    <StaticEquation equation={sol} originalEquation={equation} />
                                    <div className="text-slate-400 font-mono text-sm tracking-widest">{sol}</div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-center text-slate-400 text-lg">No 1-stick solutions found.</p>
                )}
            </div>
        </div>
    );
};
