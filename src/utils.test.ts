import * as evaluator from './evaluate';
import { evaluateExpression } from './evaluate';
import { describe, it, expect } from 'vitest';
import * as utils from './utils';
import { vi } from 'vitest';
import { getMoveHighlights, generateRandomPuzzle, getPattern, patternToChar, solveEquation, getEquationChars, findOneMovePermutations } from './utils';
import { evaluateExpression } from './evaluate';
import { DIGITS, OPERATORS, EQUALS_SIGN } from './constants';

describe('getEquationChars', () => {
    it('returns characters of a standard equation without modifications', () => {
        expect(getEquationChars('1+2=3', false)).toEqual(['1', '+', '2', '=', '3']);
    });

    it('ignores spaces in the equation', () => {
        expect(getEquationChars(' 1 + 2 = 3 ', false)).toEqual(['1', '+', '2', '=', '3']);
    });

    it('removes the equals sign when removeEquals is true', () => {
        expect(getEquationChars('1+2=3', true)).toEqual(['1', '+', '2', '3']);
    });

    it('keeps the equals sign when removeEquals is false', () => {
        expect(getEquationChars('1+2=3', false)).toEqual(['1', '+', '2', '=', '3']);
    });

    it('handles an empty string', () => {
        expect(getEquationChars('', false)).toEqual([]);
        expect(getEquationChars('', true)).toEqual([]);
    });

    it('handles multiple equals signs correctly based on removeEquals flag', () => {
        expect(getEquationChars('1=2=3', true)).toEqual(['1', '2', '3']);
        expect(getEquationChars('1=2=3', false)).toEqual(['1', '=', '2', '=', '3']);
    });
});

describe('generateRandomPuzzle', () => {
    it('skips invalid equations gracefully when evaluateCharArray returns null', () => {
        const originalEvaluate = evaluator.evaluateCharArray;
        let returnedNull = false;
        const spy = vi.spyOn(evaluator, 'evaluateCharArray').mockImplementation((chars, start, end) => {
            if (!returnedNull) {
                returnedNull = true;
                return null;
            }
            return originalEvaluate(chars, start, end);
        });

        expect(() => generateRandomPuzzle()).not.toThrow();
        expect(returnedNull).toBe(true);

        spy.mockRestore();
    });

    it('returns a string in the valid format A+/-B=C', () => {
        const puzzle = generateRandomPuzzle();
        expect(puzzle).toMatch(/^\d[+-]\d=\d$/);
    });

    it('returns an unsolved equation (mathematically incorrect)', () => {
        const puzzle = generateRandomPuzzle();
        const [left, right] = puzzle.split('=');
        const leftValue = evaluateExpression(left);
        const rightValue = parseInt(right, 10);

        expect(leftValue).not.toBeNull();
        expect(leftValue).not.toBe(rightValue);
    });

    it('generates different puzzles on multiple calls (randomness)', () => {
        const puzzles = new Set<string>();
        // Calling it 50 times should yield at least a few different puzzles.
        // There are many possible puzzles, so getting 1 is statistically impossible if random works.
        for (let i = 0; i < 50; i++) {
            puzzles.add(generateRandomPuzzle());
        }

        expect(puzzles.size).toBeGreaterThan(1);
    });
});

describe('getPattern', () => {
    it('returns the correct pattern for all digits 0-9 as numbers', () => {
        for (let i = 0; i <= 9; i++) {
            expect(getPattern(i)).toEqual(DIGITS[i]);
        }
    });

    it('returns the correct pattern for all digits 0-9 as strings', () => {
        for (let i = 0; i <= 9; i++) {
            expect(getPattern(i.toString())).toEqual(DIGITS[i]);
        }
    });

    it('returns the correct pattern for operators +, -, =', () => {
        expect(getPattern('+')).toEqual(OPERATORS['+']);
        expect(getPattern('-')).toEqual(OPERATORS['-']);
        expect(getPattern('=')).toEqual(EQUALS_SIGN);
    });

    it('returns all zeros for invalid inputs', () => {
        const emptyPattern = [0, 0, 0, 0, 0, 0, 0];
        expect(getPattern('a')).toEqual(emptyPattern);
        expect(getPattern('')).toEqual(emptyPattern);
        expect(getPattern(' ')).toEqual(emptyPattern);
        expect(getPattern('11')).toEqual(emptyPattern); // Only single digits are supported by DIGITS[digit]
    });
});

describe('patternToChar', () => {
    it('returns "=" when originalChar is "=" and pattern matches EQUALS_SIGN', () => {
        expect(patternToChar([...EQUALS_SIGN], '=')).toBe('=');
    });

    it('returns null when originalChar is "=" but pattern does not match EQUALS_SIGN', () => {
        const invalidEqualsPattern = [1, 1, 0, 0, 0, 0, 1] as [number, number, number, number, number, number, number]; // slightly modified
        expect(patternToChar(invalidEqualsPattern, '=')).toBeNull();
    });

    it('returns correct string for valid digits 0-9', () => {
        for (let i = 0; i <= 9; i++) {
            expect(patternToChar([...DIGITS[i]], '')).toBe(i.toString());
        }
    });

    it('returns "+" for valid + operator pattern', () => {
        expect(patternToChar([...OPERATORS['+']], '')).toBe('+');
    });

    it('returns "-" for valid - operator pattern', () => {
        expect(patternToChar([...OPERATORS['-']], '')).toBe('-');
    });

    it('returns valid digit when originalChar is not "="', () => {
        expect(patternToChar([...DIGITS[5]], '+')).toBe('5');
    });

    it('returns valid operator when originalChar is not "="', () => {
        expect(patternToChar([...OPERATORS['+']], '8')).toBe('+');
    });

    it('returns null when originalChar is not "=" but pattern matches EQUALS_SIGN', () => {
        expect(patternToChar([...EQUALS_SIGN], '+')).toBeNull();
    });

    it('returns null for completely invalid patterns', () => {
        const allZeros = [0, 0, 0, 0, 0, 0, 0] as [number, number, number, number, number, number, number];
        expect(patternToChar(allZeros, '')).toBeNull();

        const allOnes = [1, 1, 1, 1, 1, 1, 1] as [number, number, number, number, number, number, number]; // this is '8', but what if we do something else?
        const invalidPattern = [0, 1, 0, 1, 1, 0, 0] as [number, number, number, number, number, number, number];
        expect(patternToChar(invalidPattern, '')).toBeNull();
    });
});

describe('evaluateExpression', () => {
    it('evaluates simple addition correctly', () => {
        expect(evaluateExpression('6+4')).toBe(10);
        expect(evaluateExpression('0+4')).toBe(4);
    });

    it('evaluates simple subtraction correctly', () => {
        expect(evaluateExpression('9-5')).toBe(4);
        expect(evaluateExpression('8-4')).toBe(4);
    });

    it('evaluates multiple operations sequentially left-to-right', () => {
        expect(evaluateExpression('6+4-2')).toBe(8);
        expect(evaluateExpression('10-5+3')).toBe(8);
    });

    it('returns null for empty or undefined input', () => {
        expect(evaluateExpression('')).toBeNull();
        expect(evaluateExpression(undefined as unknown as string)).toBeNull();
    });

    it('returns null for invalid strings containing no numbers', () => {
        expect(evaluateExpression('a+b')).toBeNull();
        expect(evaluateExpression('===')).toBeNull();
    });

    it('returns null for implicitly dangling operators', () => {
        expect(evaluateExpression('6+')).toBeNull();
        expect(evaluateExpression('-5')).toBeNull(); // Our regex grabs 5, but there's no initial number if it starts with -. The code expects \d+ first realistically for solving equation layouts. 
    });

    it('returns null for consecutive or malformed operators', () => {
        expect(evaluateExpression('6++4')).toBeNull();
        expect(evaluateExpression('6*4')).toBeNull(); // * is not matched by our regex [\d+|[+-]], so it might ignore it, but parsing breaks
    });
});

describe('findOneMovePermutations', () => {
    it('calls the callback with correctly generated permutations', () => {
        const callback = vi.fn();
        findOneMovePermutations('6-4=2', callback);

        // Based on local testing, we expect certain permutations like 0-4=2, 9-4=2, 5+4=2, 6-4=3
        expect(callback).toHaveBeenCalledWith(['0', '-', '4', '=', '2'], -4, 2);
        expect(callback).toHaveBeenCalledWith(['9', '-', '4', '=', '2'], 5, 2);
        expect(callback).toHaveBeenCalledWith(['5', '+', '4', '=', '2'], 9, 2);
        expect(callback).toHaveBeenCalledWith(['6', '-', '4', '=', '3'], 2, 3);
    });

    it('works with multi-digit numbers', () => {
        const callback = vi.fn();
        findOneMovePermutations('1+1=11', callback);

        expect(callback).toHaveBeenCalledWith(['7', '-', '1', '=', '1', '1'], 6, 11);
        expect(callback).toHaveBeenCalledWith(['1', '-', '7', '=', '1', '1'], -6, 11);
        expect(callback).toHaveBeenCalledWith(['1', '-', '1', '=', '7', '1'], 0, 71);
        expect(callback).toHaveBeenCalledWith(['1', '-', '1', '=', '1', '7'], 0, 17);
    });

    it('invokes callback for all permutations including those where leftVal !== rightVal', () => {
        const callback = vi.fn();
        findOneMovePermutations('0+0=0', callback);

        // It should find 9 permutations for 0+0=0
        expect(callback).toHaveBeenCalledTimes(9);
        expect(callback).toHaveBeenCalledWith(['6', '+', '0', '=', '0'], 6, 0);
        expect(callback).toHaveBeenCalledWith(['8', '-', '0', '=', '0'], 8, 0);
        expect(callback).toHaveBeenCalledWith(['0', '-', '0', '=', '8'], 0, 8);
    });
});

describe('solveEquation', () => {
    it('does not crash when encountering malformed generated equations', () => {
        // evaluateCharArray returns null for invalid strings safely
        const spy = vi.spyOn(evaluator, 'evaluateCharArray').mockImplementation(() => {
            return null;
        });

        expect(() => solveEquation('====')).not.toThrow();
        expect(solveEquation('====')).toEqual([]);

        spy.mockRestore();
    });


    it('skips invalid equations gracefully when evaluateCharArray returns null and continues searching', () => {
        const originalEvaluate = evaluator.evaluateCharArray;
        let calledWithZeroPlusFour = false;
        const spy = vi.spyOn(evaluator, 'evaluateCharArray').mockImplementation((chars, start, end) => {
            const expr = chars.slice(start, end).join('');
            if (expr === '0+4') {
                calledWithZeroPlusFour = true;
                return null;
            }
            return originalEvaluate(chars, start, end);
        });

        expect(() => solveEquation('8-4=4')).not.toThrow();
        expect(solveEquation('8-4=4')).toEqual([]);
        expect(calledWithZeroPlusFour).toBe(true);

        spy.mockRestore();
    });

    it('handles potential evaluation errors gracefully', () => {
        expect(() => solveEquation('++++')).not.toThrow();
        expect(solveEquation('++++')).toEqual([]);
    });

    it('returns an empty array if equation length exceeds 20 characters (security limit)', () => {
        const longEquation = '1+1=2' + ' '.repeat(20);
        expect(solveEquation(longEquation)).toEqual([]);
    });

    it('returns an empty array for an empty string', () => {
        expect(solveEquation('')).toEqual([]);
    });

    it('returns a single solution for a valid puzzle that has exactly one solution', () => {
        expect(solveEquation('8-4=4')).toEqual(['0+4=4']);
    });

    it('returns multiple solutions for a puzzle that has more than one valid 1-stick move solution', () => {
        const solutions = solveEquation('6+4=4');
        expect(solutions).toContain('0+4=4');
        expect(solutions).toContain('8-4=4');
        expect(solutions.length).toBe(2);
    });

    it('returns an empty array when the puzzle has no valid 1-stick solution', () => {
        expect(solveEquation('1+1=9')).toEqual([]);
    });

    it('returns an empty array when the equation is already valid and no other 1-stick move produces a valid equation', () => {
        expect(solveEquation('5+4=9')).toEqual([]);
    });

    it('returns an empty array without throwing when given an invalid formatted or un-evaluable string', () => {
        expect(solveEquation('===++==*')).toEqual([]);
    });

    it('handles and ignores whitespaces appropriately during string solving', () => {
        const solutions = solveEquation(' 6 + 4 = 4 ');
        expect(solutions).toContain('0+4=4');
        expect(solutions).toContain('8-4=4');
        expect(solutions.length).toBe(2);
    });
});

describe('getMoveHighlights', () => {
    it('identifies a basic stick move (e.g., 6 to 0)', () => {
        const { removalPatterns, additionPatterns } = getMoveHighlights('6+4=4', '0+4=4');

        // '6' -> '0'
        expect(removalPatterns[0]).toEqual([0, 0, 0, 1, 0, 0, 0]);
        expect(additionPatterns[0]).toEqual([0, 0, 1, 0, 0, 0, 0]);

        // '+' -> '+'
        expect(removalPatterns[1]).toEqual([0, 0, 0, 0, 0, 0, 0]);
        expect(additionPatterns[1]).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it('identifies a stick addition (e.g., 5 to 9)', () => {
        const { removalPatterns, additionPatterns } = getMoveHighlights('5+4=9', '9+4=9');

        // '5' -> '9'
        expect(removalPatterns[0]).toEqual([0, 0, 0, 0, 0, 0, 0]);
        expect(additionPatterns[0]).toEqual([0, 0, 1, 0, 0, 0, 0]);
    });

    it('identifies a stick removal (e.g., 8 to 9)', () => {
        const { removalPatterns, additionPatterns } = getMoveHighlights('8+4=12', '9+4=12');

        // '8' -> '9'
        expect(removalPatterns[0]).toEqual([0, 0, 0, 0, 1, 0, 0]);
        expect(additionPatterns[0]).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it('ignores whitespaces and "=" characters in both equations', () => {
        const result1 = getMoveHighlights('6+4=4', '0+4=4');
        const result2 = getMoveHighlights(' 6 + 4 = 4 ', ' 0 + 4 = 4 ');

        expect(result1).toEqual(result2);
    });

    it('handles mismatched equation lengths by treating missing chars as empty patterns', () => {
        const { removalPatterns, additionPatterns } = getMoveHighlights('1+1', '11+1');

        // original: 1, +, 1
        // modified: 1, 1, +, 1
        // maxLength = 4

        expect(removalPatterns.length).toBe(4);
        expect(additionPatterns.length).toBe(4);

        // index 0: '1' -> '1' (no change)
        expect(removalPatterns[0]).toEqual([0, 0, 0, 0, 0, 0, 0]);
        expect(additionPatterns[0]).toEqual([0, 0, 0, 0, 0, 0, 0]);

        // index 1: '+' -> '1'
        // '+' is [0, 1, 0, 1, 0, 0, 0]
        // '1' is [0, 0, 1, 0, 0, 1, 0]
        // removed: 1, 3
        // added: 2, 5
        expect(removalPatterns[1]).toEqual([0, 1, 0, 1, 0, 0, 0]);
        expect(additionPatterns[1]).toEqual([0, 0, 1, 0, 0, 1, 0]);

        // index 3: '' -> '1'
        // '' is [0, 0, 0, 0, 0, 0, 0]
        // '1' is [0, 0, 1, 0, 0, 1, 0]
        // removed: none
        // added: 2, 5
        expect(removalPatterns[3]).toEqual([0, 0, 0, 0, 0, 0, 0]);
        expect(additionPatterns[3]).toEqual([0, 0, 1, 0, 0, 1, 0]);
    });

    it('handles invalid characters by treating them as empty patterns', () => {
        const { removalPatterns, additionPatterns } = getMoveHighlights('a', '1');

        // 'a' is unknown -> [0, 0, 0, 0, 0, 0, 0]
        // '1' is [0, 0, 1, 0, 0, 1, 0]
        expect(removalPatterns[0]).toEqual([0, 0, 0, 0, 0, 0, 0]);
        expect(additionPatterns[0]).toEqual([0, 0, 1, 0, 0, 1, 0]);
    });
});
