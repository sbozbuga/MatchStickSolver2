
import { DIGITS, OPERATORS, EQUALS_SIGN } from '../constants';
import type { SegmentPattern } from '../types';

// Re-implementing helpers to avoid import issues if running standalone (though tsx handles imports)
// But to be self-contained in this thought process:

const charToPattern = (char: string): SegmentPattern => {
    if (/\d/.test(char)) return [...DIGITS[parseInt(char)]];
    if (char === '+') return [...OPERATORS['+']];
    if (char === '-') return [...OPERATORS['-']];
    if (char === '=') return [...EQUALS_SIGN];
    return [0, 0, 0, 0, 0, 0, 0];
};

const patternToChar = (pattern: SegmentPattern, originalChar: string): string | null => {
    if (originalChar === '=') {
        if (pattern.every((v, i) => v === EQUALS_SIGN[i])) return '=';
        return null;
    }

    for (let i = 0; i <= 9; i++) {
        if (pattern.every((v, idx) => v === DIGITS[i][idx])) return i.toString();
    }

    if (pattern.every((v, idx) => v === OPERATORS['+'][idx])) return '+';
    if (pattern.every((v, idx) => v === OPERATORS['-'][idx])) return '-';

    return null;
};

// Mappings
const REMOVALS: Record<string, string[]> = {};
const ADDITIONS: Record<string, string[]> = {};
const SELF_MOVES: Record<string, string[]> = {};

const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '='];

chars.forEach(char => {
    const pattern = charToPattern(char);
    REMOVALS[char] = [];
    ADDITIONS[char] = [];
    SELF_MOVES[char] = [];

    // Try removing 1 stick
    for (let i = 0; i < 7; i++) {
        if (pattern[i] === 1) {
            const newPattern = [...pattern] as SegmentPattern;
            newPattern[i] = 0;
            const newChar = patternToChar(newPattern, char);
            if (newChar) {
                REMOVALS[char].push(newChar);
            }

            // Try moving this stick to another position (Self Move)
            for (let j = 0; j < 7; j++) {
                if (newPattern[j] === 0) {
                    const selfMovePattern = [...newPattern] as SegmentPattern;
                    selfMovePattern[j] = 1;
                    const selfMoveChar = patternToChar(selfMovePattern, char);
                    if (selfMoveChar && selfMoveChar !== char) {
                        SELF_MOVES[char].push(selfMoveChar);
                    }
                }
            }
        }
    }

    // Try adding 1 stick
    for (let i = 0; i < 7; i++) {
        if (pattern[i] === 0) {
            const newPattern = [...pattern] as SegmentPattern;
            newPattern[i] = 1;
            const newChar = patternToChar(newPattern, char);
            if (newChar) {
                ADDITIONS[char].push(newChar);
            }
        }
    }

    // Deduplicate
    REMOVALS[char] = [...new Set(REMOVALS[char])];
    ADDITIONS[char] = [...new Set(ADDITIONS[char])];
    SELF_MOVES[char] = [...new Set(SELF_MOVES[char])];
});

console.log('REMOVALS:', REMOVALS);
console.log('ADDITIONS:', ADDITIONS);
console.log('SELF_MOVES:', SELF_MOVES);
