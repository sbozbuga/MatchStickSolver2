import { describe, it, expect } from 'vitest';
import { evaluateCharArray } from './evaluate';

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
});
