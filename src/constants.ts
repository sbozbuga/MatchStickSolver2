import type { SegmentPattern } from './types';

// Segments are indexed:
//    0
//  1   2
//    3
//  4   5
//    6

export const DIGITS: { [key: number]: SegmentPattern } = {
    0: [1, 1, 1, 0, 1, 1, 1],
    1: [0, 0, 1, 0, 0, 1, 0],
    2: [1, 0, 1, 1, 1, 0, 1],
    3: [1, 0, 1, 1, 0, 1, 1],
    4: [0, 1, 1, 1, 0, 1, 0],
    5: [1, 1, 0, 1, 0, 1, 1],
    6: [1, 1, 0, 1, 1, 1, 1],
    7: [1, 0, 1, 0, 0, 1, 0],
    8: [1, 1, 1, 1, 1, 1, 1],
    9: [1, 1, 1, 1, 0, 1, 1],
};

export const OPERATORS: { [key: string]: SegmentPattern } = {
    // Represents a '+' with a vertical stick (segment 1) and horizontal stick (segment 3).
    // This makes it differ from '-' by exactly one stick.
    '+': [0, 1, 0, 1, 0, 0, 0], 
    '-': [0, 0, 0, 1, 0, 0, 0],
};

export const EQUALS_SIGN: SegmentPattern = [1, 0, 0, 0, 0, 0, 1]; // Top and bottom bars for a clearer equals sign

// Helper to convert array pattern to bitmask
const patternToMask = (pattern: SegmentPattern): number =>
    pattern.reduce((acc, val, idx) => acc | (val << idx), 0);

export const DIGIT_MASKS: { [key: number]: number } = Object.fromEntries(
    Object.entries(DIGITS).map(([k, v]) => [k, patternToMask(v)])
);

export const OPERATOR_MASKS: { [key: string]: number } = Object.fromEntries(
    Object.entries(OPERATORS).map(([k, v]) => [k, patternToMask(v)])
);

export const EQUALS_SIGN_MASK: number = patternToMask(EQUALS_SIGN);
