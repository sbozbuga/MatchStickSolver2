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

export function safeEvaluate(expression: string): number {
    // Basic validation to only allow digits, plus, minus, and whitespace
    if (!/^[0-9+\-\s]+$/.test(expression)) {
        throw new Error('Invalid characters in expression');
    }

    // Tokenize the string (e.g. "12 + 3 - 4" -> ["12", "+", "3", "-", "4"])
    const tokens = expression.match(/\d+|[+-]/g);
    if (!tokens || tokens.length === 0) {
        throw new Error('Invalid expression format');
    }

    // Start with the first number
    let result = parseInt(tokens[0], 10);

    // Evaluate left-to-right
    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const nextNumberStr = tokens[i + 1];

        if (nextNumberStr === undefined) {
             throw new Error('Missing operand');
        }

        const nextNumber = parseInt(nextNumberStr, 10);

        if (operator === '+') {
            result += nextNumber;
        } else if (operator === '-') {
            result -= nextNumber;
        } else {
             throw new Error(`Invalid operator: ${operator}`);
        }
    }

    return result;
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
