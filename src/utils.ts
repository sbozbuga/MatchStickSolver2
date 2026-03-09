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

export function evaluateExpression(expr: string): number | null {
    if (!expr) return null;

    // Split into numbers and operators
    const tokens = expr.match(/\d+|[+-]/g);
    if (!tokens) return null;

    let result = parseInt(tokens[0], 10);
    if (isNaN(result)) return null;

    for (let i = 1; i < tokens.length; i += 2) {
        const op = tokens[i];
        const nextVal = parseInt(tokens[i + 1], 10);

        if (isNaN(nextVal)) return null;

        if (op === '+') {
            result += nextVal;
        } else if (op === '-') {
            result -= nextVal;
        } else {
            return null; // Unexpected operator
        }
    }

    return result;
}

function isMatch(p1: SegmentPattern, p2: SegmentPattern): boolean {
    for (let i = 0; i < 7; i++) {
        if (p1[i] !== p2[i]) return false;
    }
    return true;
}

export function patternToChar(pattern: SegmentPattern, originalChar: string): string | null {
    if (originalChar === '=') {
        if (isMatch(pattern, EQUALS_SIGN)) return '=';
        return null;
    }

    // Check digits
    for (let i = 0; i <= 9; i++) {
        if (isMatch(pattern, DIGITS[i])) return i.toString();
    }

    // Check operators
    if (isMatch(pattern, OPERATORS['+'])) return '+';
    if (isMatch(pattern, OPERATORS['-'])) return '-';

    return null;
}

export const solveEquation = (equation: string): string[] => {
    // SECURITY: Limit input to prevent CPU exhaustion DoS (Client thread locking)
    if (equation.length > 20) return [];

    const chars = equation.replace(/\s/g, '').split('');
    const patterns = chars.map(c => [...getPattern(c)] as SegmentPattern);
    const solutions = new Set<string>();

    for (let i = 0; i < patterns.length; i++) {
        for (let j = 0; j < 7; j++) {
            if (patterns[i][j] === 1) {
                // Try removing stick from i, j
                patterns[i][j] = 0;

                for (let k = 0; k < patterns.length; k++) {
                    for (let l = 0; l < 7; l++) {
                        if (patterns[k][l] === 0) {
                            // Try adding stick to k, l
                            patterns[k][l] = 1;

                            const testChars = patterns.map((p, idx) => patternToChar(p as SegmentPattern, chars[idx]));
                            if (!testChars.includes(null)) {
                                const testEq = testChars.join('');
                                if (testEq !== equation) {
                                    try {
                                        const [left, right] = testEq.split('=');
                                        if (left && right) {
                                            const leftVal = evaluateExpression(left);
                                            const rightVal = evaluateExpression(right);
                                            if (leftVal !== null && rightVal !== null && leftVal === rightVal) {
                                                solutions.add(testEq);
                                            }
                                        }
                                    } catch (e) {
                                        // Ignore invalid equations
                                    }
                                }
                            }

                            // Backtrack adding stick
                            patterns[k][l] = 0;
                        }
                    }
                }

                // Backtrack removing stick
                patterns[i][j] = 1;
            }
        }
    }

    return Array.from(solutions);
};

let CACHED_PUZZLES: string[] | null = null;

export const generateRandomPuzzle = (): string => {
    if (!CACHED_PUZZLES) {
        const ALL_PUZZLES = new Set<string>();
        const validEquations: string[] = [];
        const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const ops = ['+', '-'];

        // 1. Generate all purely valid one-digit mathematics strings A +/- B = C
        for (const a of digits) {
            for (const op of ops) {
                for (const b of digits) {
                    for (const c of digits) {
                        const eq = `${a}${op}${b}=${c}`;
                        const left = evaluateExpression(`${a}${op}${b}`);
                        if (left !== null && left === parseInt(c)) {
                            validEquations.push(eq);
                        }
                    }
                }
            }
        }

        // 2. Iterate backward generating exactly 1-move permutations representing valid but incorrect puzzle states
        for (const eq of validEquations) {
            const chars = eq.replace(/\s/g, '').split('');
            const patterns = chars.map(c => [...getPattern(c)] as SegmentPattern);

            for (let i = 0; i < patterns.length; i++) {
                for (let j = 0; j < 7; j++) {
                    if (patterns[i][j] === 1) {
                        patterns[i][j] = 0;

                        for (let k = 0; k < patterns.length; k++) {
                            for (let l = 0; l < 7; l++) {
                                if (patterns[k][l] === 0) {
                                    patterns[k][l] = 1;

                                    const testChars = patterns.map((p, idx) => patternToChar(p as SegmentPattern, chars[idx]));
                                    if (!testChars.includes(null)) {
                                        const testEq = testChars.join('');
                                        if (testEq !== eq) {
                                            try {
                                                const [left, right] = testEq.split('=');
                                                if (left && right) {
                                                    const leftVal = evaluateExpression(left);
                                                    const rightVal = evaluateExpression(right);
                                                    // It MUST evaluate falsely explicitly so it operates as a puzzle and not an identical solved clone natively
                                                    if (leftVal !== null && rightVal !== null && leftVal !== rightVal) {
                                                        ALL_PUZZLES.add(testEq);
                                                    }
                                                }
                                            } catch (e) { }
                                        }
                                    }
                                    patterns[k][l] = 0;
                                }
                            }
                        }
                        patterns[i][j] = 1;
                    }
                }
            }
        }
        CACHED_PUZZLES = Array.from(ALL_PUZZLES);
    }

    return CACHED_PUZZLES[Math.floor(Math.random() * CACHED_PUZZLES.length)];
};
