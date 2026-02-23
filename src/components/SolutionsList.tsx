import React, { useMemo } from 'react';
import { EquationDisplay } from './EquationDisplay';
import { getMoveHighlights } from '../utils';
import { motion } from 'motion/react';

interface SolutionsListProps {
    originalEquation: string;
    solutions: string[];
    hoveredSolution: string | null;
    onHover: (solution: string | null) => void;
}

export const SolutionsList: React.FC<SolutionsListProps> = ({
    originalEquation,
    solutions,
    hoveredSolution,
    onHover,
}) => {
    const solutionsWithHighlights = useMemo(() => {
        return solutions.map(sol => ({
            equation: sol,
            highlights: getMoveHighlights(originalEquation, sol)
        }));
    }, [originalEquation, solutions]);

    return (
        <ul className="space-y-4" onMouseLeave={() => onHover(null)}>
            {solutionsWithHighlights.map(({ equation, highlights }, index) => {
                const isHovered = hoveredSolution === equation;
                return (
                    <motion.li
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        key={equation}
                        className="bg-slate-800 p-3 rounded-md transition-colors hover:bg-slate-700"
                        onMouseEnter={() => onHover(equation)}
                    >
                        <EquationDisplay
                            equation={equation}
                            highlightMask={highlights.additionPatterns}
                            highlightClass={isHovered ? 'stick-adding' : 'stick-highlight-static'}
                        />
                    </motion.li>
                );
            })}
        </ul>
    );
};
