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
 * Safely evaluates simple math expressions containing integers, +, and -.
 * Returns null if the expression is invalid.
 */
export function safeEvaluate(expr: string): number | null {
    if (!expr) return null;

    // Split by operators, keeping the operators in the array
    const parts = expr.split(/([+-])/);
    if (parts.length === 0) return null;

    let result = parseInt(parts[0], 10);
    if (isNaN(result)) return null;

    for (let i = 1; i < parts.length; i += 2) {
        const op = parts[i];
        const valStr = parts[i + 1];

        // Handle trailing operators or missing values
        if (valStr === undefined || valStr === '') return null;

        const val = parseInt(valStr, 10);
        if (isNaN(val)) return null;

        if (op === '+') {
            result += val;
        } else if (op === '-') {
            result -= val;
        } else {
            return null; // Unsupported operator
        }
    }

    return result;
}
