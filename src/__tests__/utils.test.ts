import { evaluateExpression } from '../utils';

describe('evaluateExpression', () => {
    test('should handle simple addition', () => {
        expect(evaluateExpression('1+2')).toBe(3);
    });

    test('should handle simple subtraction', () => {
        expect(evaluateExpression('10-5')).toBe(5);
    });

    test('should handle multiple operations', () => {
        expect(evaluateExpression('1+2-3')).toBe(0);
        expect(evaluateExpression('10+20-5')).toBe(25);
    });

    test('should handle single numbers', () => {
        expect(evaluateExpression('5')).toBe(5);
    });

    test('should handle unary operators', () => {
        expect(evaluateExpression('+5')).toBe(5);
        expect(evaluateExpression('-5')).toBe(-5);
    });

    test('should handle zeros', () => {
        expect(evaluateExpression('0+0')).toBe(0);
    });

    test('should return null for empty string', () => {
        expect(evaluateExpression('')).toBe(null);
    });

    test('should return null for invalid characters', () => {
        expect(evaluateExpression('1+a')).toBe(null);
        expect(evaluateExpression('1*2')).toBe(null);
    });

    test('should return null for malformed expressions', () => {
        expect(evaluateExpression('1++2')).toBe(null);
        expect(evaluateExpression('1--2')).toBe(null);
        expect(evaluateExpression('1+2-')).toBe(null);
    });

    test('should return null for malicious strings', () => {
        expect(evaluateExpression('eval(alert(1))')).toBe(null);
        expect(evaluateExpression('1+2; alert(1)')).toBe(null);
    });
});
