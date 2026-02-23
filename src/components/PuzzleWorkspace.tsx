import React, { useState, useMemo, useEffect } from 'react';
import { EquationInput } from './EquationInput';
import { SolutionsList } from './SolutionsList';
import { usePuzzleSolver } from '../hooks/usePuzzleSolver';
import { useLanguage } from '../i18n/LanguageContext';
import { useAudio } from '../audio/AudioContext';
import { getMoveHighlights, calculateCombinedRemovalMask } from '../utils';
import { parseEquation, generatePuzzle } from '../services/puzzleSolver';
import { RefreshCw, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PuzzleWorkspaceProps {
    initialEquation: string;
    onSolveSuccess: (data: { equation: string, solutions: string[] }) => void;
}

export const PuzzleWorkspace: React.FC<PuzzleWorkspaceProps> = ({ initialEquation, onSolveSuccess }) => {
    const { t } = useLanguage();
    const { playSubmit, playSuccess, playNoSolution, playError, playHover } = useAudio();
    const [input, setInput] = useState(initialEquation);
    const [hoveredSolution, setHoveredSolution] = useState<string | null>(null);
    const [moves, setMoves] = useState(1);

    const { equation, solutions, error } = usePuzzleSolver(input, moves);

    useEffect(() => {
        setInput(initialEquation);
    }, [initialEquation]);

    const combinedRemovalMask = useMemo(() => {
        return calculateCombinedRemovalMask(equation, solutions || []);
    }, [solutions, equation]);

    const puzzleHighlightMask = useMemo(() => {
        if (hoveredSolution) {
            return getMoveHighlights(equation, hoveredSolution).removalPatterns;
        }
        return combinedRemovalMask;
    }, [hoveredSolution, equation, combinedRemovalMask]);

    const finalHighlightMask = input === equation ? puzzleHighlightMask : undefined;
    
    const triggerSolve = () => {
        const isValid = !!parseEquation(input);
        playSubmit();
        
        if (!isValid) {
            playError();
            return;
        }

        if (error) {
            playError();
        } else if (solutions?.length) {
            playSuccess();
            onSolveSuccess({ equation: input, solutions });
        } else {
            playNoSolution();
        }
    };
    
    const handleGeneratePuzzle = () => {
        const newPuzzle = generatePuzzle(moves);
        setInput(newPuzzle);
        playSubmit();
    };
    
    const handleSolutionHover = (sol: string | null) => {
        if (sol && hoveredSolution !== sol) {
            playHover();
        }
        setHoveredSolution(sol);
    };

    const hasSolutions = solutions && solutions.length > 0;

    return (
        <main className="bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <EquationInput
                    value={input}
                    onChange={setInput}
                    onSubmit={triggerSolve}
                    placeholder={t('app.inputPlaceholder')}
                    highlightMask={finalHighlightMask}
                    highlightClass={hoveredSolution ? "stick-removing" : "stick-remove-static"}
                />
                <button
                    onClick={triggerSolve}
                    className="flex-none flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-3 rounded-md transition-colors min-h-[58px]"
                    title={t('app.solveButton')}
                    aria-label={t('app.solveButton')}
                >
                    <Play size={24} fill="currentColor" />
                </button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select 
                        value={moves}
                        onChange={(e) => setMoves(Number(e.target.value))}
                        className="bg-slate-700 text-white px-3 py-3 rounded-md border border-slate-600 focus:outline-none focus:border-amber-500 min-h-[58px]"
                        title={t('app.moves_other').replace('{count}', 'N')}
                    >
                        <option value={1}>{t('app.moves_one')}</option>
                        <option value={2}>{t('app.moves_other').replace('{count}', '2')}</option>
                        <option value={3}>{t('app.moves_other').replace('{count}', '3')}</option>
                    </select>
                    <button
                        onClick={handleGeneratePuzzle}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-md transition-colors min-h-[58px]"
                        title={t('app.generatePuzzle')}
                    >
                        <RefreshCw size={20} />
                        <span className="sm:hidden">{t('app.generatePuzzle')}</span>
                    </button>
                </div>
            </div>
            
            <div>
                <AnimatePresence mode="wait">
                    <motion.h2 
                        key={hasSolutions ? 'found' : 'not-found'}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-lg font-semibold text-gray-300 mb-2"
                    >
                        {hasSolutions ? t('app.solutionsFound') : t('app.solutions')}
                    </motion.h2>
                </AnimatePresence>
                <div className="bg-slate-900 p-4 rounded-lg min-h-[80px] md:min-h-[120px] lg:min-h-[140px]">
                    {error && <p className="text-red-400 text-center">{t(error)}</p>}
                    {!error && equation && hasSolutions && (
                        <SolutionsList
                            originalEquation={equation}
                            solutions={solutions}
                            hoveredSolution={hoveredSolution}
                            onHover={handleSolutionHover}
                        />
                    )}
                    {!error && equation && solutions && solutions.length === 0 && (
                        <p className="text-gray-500 text-center">{t('app.noSolutions')}</p>
                    )}
                    {!equation && (
                        <p className="text-gray-500 text-center">{t('app.enterEquation')}</p>
                    )}
                </div>
            </div>
        </main>
    );
};
