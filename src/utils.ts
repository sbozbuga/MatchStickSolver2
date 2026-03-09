import { DIGITS, OPERATORS, EQUALS_SIGN } from './constants';
import type { SegmentPattern, SolutionHighlights } from './types';

export function getPattern(char: string | number): SegmentPattern {
    const charStr = String(char);
    if (charStr === '+') return OPERATORS['+'];
    if (charStr === '-') return OPERATORS['-'];
    if (charStr === '=') return EQUALS_SIGN;
    
    const digit = parseInt(charStr, 10);
    if (!isNaN(digit) && DIGITS[digit]) {
        return DIGITS[digit];
    }
    
    return [0, 0, 0, 0, 0, 0, 0];
}

export function getMoveHighlights(originalEq: string, modifiedEq: string): SolutionHighlights {
    const originalChars = originalEq.replace(/\s/g, '').split('').filter(c => c !== '=');
    const modifiedChars = modifiedEq.replace(/\s/g, '').split('').filter(c => c !== '=');

    const maxLength = Math.max(originalChars.length, modifiedChars.length);
    const removalPatterns: SegmentPattern[] = [];
    const additionPatterns: SegmentPattern[] = [];

    for (let i = 0; i < maxLength; i++) {
        const originalPattern = getPattern(originalChars[i] || '');
        const modifiedPattern = getPattern(modifiedChars[i] || '');

        const removals: SegmentPattern = [0, 0, 0, 0, 0, 0, 0];
        const additions: SegmentPattern = [0, 0, 0, 0, 0, 0, 0];

        for (let j = 0; j < 7; j++) {
            if (originalPattern[j] === 1 && modifiedPattern[j] === 0) {
                removals[j] = 1;
            } else if (originalPattern[j] === 0 && modifiedPattern[j] === 1) {
                additions[j] = 1;
            }
        }
        removalPatterns.push(removals);
        additionPatterns.push(additions);
    }
    return { removalPatterns, additionPatterns };
}

export function calculateCombinedRemovalMask(equation: string, solutions: string[]): SegmentPattern[] | undefined {
    if (!solutions?.length || !equation) return undefined;

    const equationChars = equation.replace(/\s/g, '').split('').filter(c => c !== '=');
    const baseMask: SegmentPattern[] = equationChars.map(() => [0, 0, 0, 0, 0, 0, 0]);

    solutions.forEach(sol => {
        const { removalPatterns } = getMoveHighlights(equation, sol);
        removalPatterns.forEach((charPattern, charIndex) => {
            if (baseMask[charIndex]) {
                charPattern.forEach((segment, segmentIndex) => {
                    if (segment === 1) baseMask[charIndex][segmentIndex] = 1;
                });
            }
        });
    });

    return baseMask;
}

/**
 * Safely evaluates a simple arithmetic expression containing only addition and subtraction.
 * @param expr The expression to evaluate (e.g., "1+2-3")
 * @returns The result of the evaluation, or null if the expression is invalid.
 */
export function evaluateExpression(expr: string): number | null {
    if (!expr || !/^[0-9+-]+$/.test(expr)) {
        return null;
    }

    const tokens = expr.match(/[+-]?[0-9]+/g);
    if (!tokens || tokens.join('') !== expr) {
        return null;
    }

    return tokens.reduce((acc, token) => acc + parseInt(token, 10), 0);
}
