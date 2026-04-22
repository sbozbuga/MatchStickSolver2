import { describe, it, expect } from 'vitest';
import { evaluateExpression, evaluateCharArray } from './evaluate';

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
        expect(evaluateExpression('-5')).toBeNull();
    });

    it('returns null for consecutive or malformed operators', () => {
        expect(evaluateExpression('6++4')).toBeNull();
        expect(evaluateExpression('6*4')).toBeNull();
    });
});

describe('evaluateCharArray', () => {
    it('evaluates simple addition correctly', () => {
        const chars = ['1', '+', '2'];
        expect(evaluateCharArray(chars, 0, 3)).toBe(3);
    });

    it('evaluates simple subtraction correctly', () => {
        const chars = ['5', '-', '3'];
        expect(evaluateCharArray(chars, 0, 3)).toBe(2);
    });

    it('evaluates a slice of the array', () => {
        const chars = ['=', '1', '+', '2', '='];
        expect(evaluateCharArray(chars, 1, 4)).toBe(3);
    });

    it('returns null if start >= end', () => {
        const chars = ['1', '+', '2'];
        expect(evaluateCharArray(chars, 3, 3)).toBeNull();
        expect(evaluateCharArray(chars, 4, 3)).toBeNull();
    });

    it('returns null if the array contains null', () => {
        const chars = ['1', null, '2'];
        expect(evaluateCharArray(chars, 0, 3)).toBeNull();
    });

    it('returns null for invalid characters', () => {
        const chars = ['1', 'a', '2'];
        expect(evaluateCharArray(chars, 0, 3)).toBeNull();
    });

    it('handles multiple operations correctly', () => {
        const chars = ['1', '0', '+', '5', '-', '3'];
        expect(evaluateCharArray(chars, 0, 6)).toBe(12);
    });

    it('returns null for empty segments', () => {
        const chars = ['+', '1'];
        expect(evaluateCharArray(chars, 0, 2)).toBeNull();
    });

    it('returns null for dangling operators', () => {
        const chars = ['1', '+'];
        expect(evaluateCharArray(chars, 0, 2)).toBeNull();
    });

    it('returns null for complex malformed arrays with unmatched operators', () => {
        const chars = ['1', '+', null, '-'];
        expect(evaluateCharArray(chars, 0, 4)).toBeNull();
        expect(evaluateCharArray(chars, 1, 4)).toBeNull();
        expect(evaluateCharArray(chars, 3, 4)).toBeNull();
    });
});
