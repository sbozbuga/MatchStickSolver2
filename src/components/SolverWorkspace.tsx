import React, { useState, useMemo } from 'react';
import { DIGITS, OPERATORS, EQUALS_SIGN } from '../constants';
import type { SegmentPattern } from '../types';
import { solveEquation } from '../solver';

const EqualsSign = ({ size }: { size: { width: number, height: number } }) => (
    <svg viewBox="0 0 50 80" style={size} className="stroke-current text-amber-400" strokeWidth="4" strokeLinecap="round">
        <path d="M 10 30 H 40" className="transition-opacity opacity-100" />
        <path d="M 10 50 H 40" className="transition-opacity opacity-100" />
    </svg>
);

const charToPattern = (char: string): SegmentPattern => {
    if (/\d/.test(char)) return [...DIGITS[parseInt(char)]];
    if (char === '+') return [...OPERATORS['+']];
    if (char === '-') return [...OPERATORS['-']];
    if (char === '=') return [...EQUALS_SIGN];
    return [0, 0, 0, 0, 0, 0, 0];
};

const StaticEquation: React.FC<{ equation: string, originalEquation?: string }> = ({ equation, originalEquation }) => {
    const chars = equation.replace(/\s/g, '').split('');
    const originalChars = originalEquation ? originalEquation.replace(/\s/g, '').split('') : chars;
    
    const renderStickDisplay = (charIndex: number, char: string, originalChar: string) => {
        const size = { width: 36, height: 57.6 };
        const pattern = charToPattern(char);
        const originalPattern = charToPattern(originalChar);
        
        if (char === '=') {
            return <EqualsSign size={size} />;
        }

        if (char === '+' || char === '-') {
            return (
                <svg viewBox="0 0 50 80" style={size} className="stroke-current" strokeWidth="4" strokeLinecap="round">
                    {[1, 3].map(segmentIndex => {
                        const isActive = pattern[segmentIndex] === 1;
                        const wasActive = originalPattern[segmentIndex] === 1;
                        
                        let d = "";
                        if (segmentIndex === 3) d = "M 15 40 H 35";
                        if (segmentIndex === 1) d = "M 25 30 V 50";
                        
                        let colorClass = "text-amber-400";
                        if (isActive && !wasActive) colorClass = "text-emerald-400"; // Added stick
                        if (!isActive && wasActive) colorClass = "text-rose-500 opacity-30"; // Removed stick
                        if (!isActive && !wasActive) return null;

                        return (
                            <path
                                key={segmentIndex}
                                d={d}
                                className={`transition-opacity ${colorClass} ${isActive ? 'opacity-100' : ''}`}
                            />
                        );
                    })}
                </svg>
            );
        }

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
            <svg viewBox="0 0 50 80" style={size} className="stroke-current" strokeWidth="4" strokeLinecap="round">
                {segments.map((seg, segmentIndex) => {
                    const isActive = pattern[segmentIndex] === 1;
                    const wasActive = originalPattern[segmentIndex] === 1;
                    
                    let colorClass = "text-amber-400";
                    if (isActive && !wasActive) colorClass = "text-emerald-400"; // Added stick
                    if (!isActive && wasActive) colorClass = "text-rose-500 opacity-30"; // Removed stick
                    if (!isActive && !wasActive) return null;

                    return (
                        <path
                            key={seg.key}
                            d={seg.d}
                            className={`transition-opacity ${colorClass} ${isActive ? 'opacity-100' : ''}`}
                        />
                    );
                })}
            </svg>
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
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-2xl text-center text-slate-100 focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                    placeholder="e.g. 6+4=4"
                />
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
