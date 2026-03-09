import { describe, it, expect } from 'vitest';
import { calculateCombinedRemovalMask, getMoveHighlights, evaluateExpression, getPattern } from './utils';
import { DIGITS, OPERATORS, EQUALS_SIGN } from './constants';

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

describe('calculateCombinedRemovalMask', () => {
    it('returns undefined if solutions array is empty or undefined', () => {
        expect(calculateCombinedRemovalMask('6+4=4', [])).toBeUndefined();
        expect(calculateCombinedRemovalMask('6+4=4', undefined as any)).toBeUndefined();
    });

    it('returns undefined if equation is empty or undefined', () => {
        expect(calculateCombinedRemovalMask('', ['6+4=4'])).toBeUndefined();
        expect(calculateCombinedRemovalMask(undefined as any, ['6+4=4'])).toBeUndefined();
    });

    it('returns an empty mask (all zeros) when solutions are identical to the original equation', () => {
        const mask = calculateCombinedRemovalMask('6+4=4', ['6+4=4']);
        // '6+4=4' has 4 chars excluding '=': '6', '+', '4', '4'
        expect(mask).toBeDefined();
        expect(mask?.length).toBe(4);
        mask?.forEach(charMask => {
            expect(charMask).toEqual([0, 0, 0, 0, 0, 0, 0]);
        });
    });

    it('calculates the correct mask for a single solution (e.g. 6 to 0 removes middle segment 3)', () => {
        // '6' is [1, 1, 0, 1, 1, 1, 1]
        // '0' is [1, 1, 1, 0, 1, 1, 1]
        // Removal for 6 -> 0 should be segment 3.
        const mask = calculateCombinedRemovalMask('6+4=4', ['0+4=4']);
        expect(mask).toBeDefined();

        // char index 0 is '6'
        expect(mask?.[0]).toEqual([0, 0, 0, 1, 0, 0, 0]);
        // char index 1 is '+'
        expect(mask?.[1]).toEqual([0, 0, 0, 0, 0, 0, 0]);
        // char index 2 is '4'
        expect(mask?.[2]).toEqual([0, 0, 0, 0, 0, 0, 0]);
        // char index 3 is '4'
        expect(mask?.[3]).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it('combines removal masks from multiple solutions via logical OR', () => {
        // '8' is [1, 1, 1, 1, 1, 1, 1]
        // '9' is [1, 1, 1, 1, 0, 1, 1] - removes segment 4 (bot-left)
        // '0' is [1, 1, 1, 0, 1, 1, 1] - removes segment 3 (middle)
        const mask = calculateCombinedRemovalMask('8+4=4', ['9+4=4', '0+4=4']);
        expect(mask).toBeDefined();

        // Combining segment 4 and segment 3 removals
        expect(mask?.[0]).toEqual([0, 0, 0, 1, 1, 0, 0]);
    });

    it('ignores whitespaces in equations correctly when aligning characters', () => {
        const spacedEq = calculateCombinedRemovalMask(' 6 + 4 = 4 ', ['0+4=4']);
        const tightEq = calculateCombinedRemovalMask('6+4=4', ['0+4=4']);

        expect(spacedEq).toEqual(tightEq);
    });

    it('handles mismatched string lengths without crashing', () => {
        // This is a defensive edge case. 
        // If a generated solution happens to have more/less characters (excluding '='), it shouldn't crash.
        const mask = calculateCombinedRemovalMask('6+4=4', ['6+44=4']);
        // 4 chars mapping to 5 chars solution
        expect(mask).toBeDefined();
        expect(mask?.length).toBe(4); // base mask follows original equation length
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
        expect(evaluateExpression(undefined as any)).toBeNull();
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
