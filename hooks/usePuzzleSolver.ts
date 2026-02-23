import { useState, useMemo, useEffect } from 'react';
import { solve, parseEquation } from '../services/puzzleSolver';

export function usePuzzleSolver(input: string, moves: number = 1) {
    const [equation, setEquation] = useState('');

    // This effect synchronizes the 'equation' state (which drives the solver)
    // with the 'input' state from the user.
    useEffect(() => {
        const isValid = !!parseEquation(input);
        setEquation(isValid ? input : '');
    }, [input]);

    const { solutions, error } = useMemo(() => {
        if (!equation) return { solutions: [], error: undefined };
        return solve(equation, moves);
    }, [equation, moves]);

    return { equation, solutions, error };
}
