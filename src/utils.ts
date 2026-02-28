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
 * Safely evaluates a mathematical expression string.
 * Supports basic arithmetic (+, -) and integer numbers.
 * Throws an error for invalid input or unsafe characters.
 */
export function safeEvaluate(expression: string): number {
    // Remove whitespace
    const cleanExpr = expression.replace(/\s+/g, '');

    // Validate characters: only digits, +, - are allowed
    if (!/^[0-9+\-]+$/.test(cleanExpr)) {
        throw new Error('Invalid characters in expression');
    }

    // Evaluate the expression manually
    // Split by operators but keep them to process
    // Actually, a simpler approach for + and - is to split by the operators and sum/subtract

    // We can use a regex to match numbers and their preceding sign (if any)
    // But since the first number might not have a sign, we handle that.

    // Check for double operators or ending with operator which are invalid in this simple parser
    if (/[\+\-]{2,}/.test(cleanExpr) || /[\+\-]$/.test(cleanExpr) || /^[\+\-]/.test(cleanExpr)) {
         // The matchstick puzzles don't usually start with negative numbers, so we can be strict.
         // However, if "0-4=-4" is a valid puzzle state (even if wrong), we might need to support negative results.
         // But `eval("6+4")` works. `eval("-5+2")` works.
         // Let's stick to what's needed for "6+4=4" style puzzles.
         // If the user forms "-5", that's a valid intermediate state?
         // The puzzle logic `eval(left)` might get called on "9-".
         // `eval("9-")` throws SyntaxError. So we should throw too.
         throw new Error('Invalid expression format');
    }

    // Tokenize: split into numbers and operators
    const tokens = cleanExpr.split(/([+\-])/).filter(t => t.length > 0);

    if (tokens.length === 0) return 0;

    let result = parseInt(tokens[0], 10);

    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const nextVal = parseInt(tokens[i + 1], 10);

        if (isNaN(nextVal)) {
             throw new Error('Invalid number');
        }

        if (operator === '+') {
            result += nextVal;
        } else if (operator === '-') {
            result -= nextVal;
        }
    }

    return result;
}
