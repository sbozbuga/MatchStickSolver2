import type { ParsedEquation, Operator } from '@/types';
import { getPattern } from '@/utils';
import { DIGIT_MASKS, OPERATOR_MASKS, EQUALS_SIGN_MASK } from '@/constants';

export function parseEquation(eq: string): ParsedEquation | null {
    const clean = eq.replace(/\s/g, '');
    const match = clean.match(/^(\d{1,2})([+\-])(\d{1,2})=(\d{1,2})$/);
    if (!match) return null;

    if (match.slice(1).some(s => s.length > 1 && s.startsWith('0'))) {
        return null;
    }

    return {
        a: parseInt(match[1], 10),
        op: match[2] as Operator,
        b: parseInt(match[3], 10),
        c: parseInt(match[4], 10),
    };
}

function checkMath(a: number, op: Operator, b: number, c: number): boolean {
    return op === '+' ? a + b === c : a - b === c;
}

// Bit manipulation helper to count set bits (population count)
function popcount(n: number): number {
    // Standard SWAR algorithm for 32-bit integers
    n = n - ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return ((n + (n >> 4) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

function charToMask(char: string): number {
    if (char === '=') return EQUALS_SIGN_MASK;
    if (char === '+') return OPERATOR_MASKS['+'];
    if (char === '-') return OPERATOR_MASKS['-'];
    const d = parseInt(char, 10);
    if (!isNaN(d) && DIGIT_MASKS[d] !== undefined) return DIGIT_MASKS[d];
    return 0;
}

function toMasks(eq: string): number[] {
    const masks: number[] = [];
    for (let i = 0; i < eq.length; i++) {
        masks.push(charToMask(eq[i]));
    }
    return masks;
}

// Pre-generate all valid equations with their bitmasks
// This avoids repeated string parsing and array generation during solving
const VALID_PRECOMPUTED: { str: string, masks: number[] }[] = [];

for (let a = 0; a <= 99; a++) {
    for (let b = 0; b <= 99; b++) {
        if (a + b <= 99) {
            const s = `${a}+${b}=${a + b}`;
            VALID_PRECOMPUTED.push({ str: s, masks: toMasks(s) });
        }
        if (a - b >= 0) {
            const s = `${a}-${b}=${a - b}`;
            VALID_PRECOMPUTED.push({ str: s, masks: toMasks(s) });
        }
    }
}

// Optimized distance calculation using bitmasks
// Returns null if stick counts don't match (impossible move)
// Returns number of moves (half of difference count) otherwise
function getDistanceMasks(masks1: number[], masks2: number[]): number | null {
    // Length check is done by caller usually, but safety first
    if (masks1.length !== masks2.length) return null;

    let diffCount = 0;
    let sticks1 = 0;
    let sticks2 = 0;

    for (let i = 0; i < masks1.length; i++) {
        const m1 = masks1[i];
        const m2 = masks2[i];

        // XOR gives bits that are different
        const xor = m1 ^ m2;
        if (xor !== 0) {
            diffCount += popcount(xor);
        }

        sticks1 += popcount(m1);
        sticks2 += popcount(m2);
    }

    if (sticks1 !== sticks2) return null;
    return diffCount / 2;
}

export function solve(equationString: string, moves: number = 1): { solutions?: string[]; error?: string } {
    const cleanEquation = equationString.replace(/\s/g, '');
    if (!parseEquation(cleanEquation)) {
        return { error: "error.invalidFormat" };
    }

    const inputMasks = toMasks(cleanEquation);
    const solutions: string[] = [];

    for (const pre of VALID_PRECOMPUTED) {
        if (pre.masks.length !== inputMasks.length) continue;

        if (getDistanceMasks(inputMasks, pre.masks) === moves) {
            solutions.push(pre.str);
        }
    }

    return { solutions };
}

export function generatePuzzle(moves: number = 1): string {
    while (true) {
        const a = Math.floor(Math.random() * 20);
        const b = Math.floor(Math.random() * 20);
        const op = Math.random() > 0.5 ? '+' : '-';
        
        const c = op === '+' ? a + b : a - b;
        if (c < 0 || c > 99) continue;
        
        const validEq = `${a}${op}${b}=${c}`;
        
        const puzzle = mutateEquation(validEq, moves);
        if (!puzzle) continue;
        
        const parsed = parseEquation(puzzle);
        if (!parsed) continue; // Must be valid format
        
        if (!checkMath(parsed.a, parsed.op, parsed.b, parsed.c)) {
            // Ensure it has at least one solution (which is validEq)
            const { solutions } = solve(puzzle, moves);
            if (solutions && solutions.length > 0) {
                return puzzle;
            }
        }
    }
}

function mutateEquation(eq: string, moves: number): string | null {
    let chars = eq.split('');
    
    const ones: {charIdx: number, segIdx: number}[] = [];
    const zeros: {charIdx: number, segIdx: number}[] = [];
    
    for (let i = 0; i < chars.length; i++) {
        if (chars[i] === '=') continue;
        const p = getPattern(chars[i]);
        for (let j = 0; j < 7; j++) {
            if (p[j] === 1) ones.push({charIdx: i, segIdx: j});
            else zeros.push({charIdx: i, segIdx: j});
        }
    }
    
    if (ones.length < moves || zeros.length < moves) return null;
    
    // Shuffle
    ones.sort(() => Math.random() - 0.5);
    zeros.sort(() => Math.random() - 0.5);
    
    const newPatterns = chars.map(c => [...getPattern(c)]);
    
    for (let i = 0; i < moves; i++) {
        const o = ones[i];
        const z = zeros[i];
        newPatterns[o.charIdx][o.segIdx] = 0;
        newPatterns[z.charIdx][z.segIdx] = 1;
    }
    
    // Reconstruct string
    let newEq = '';
    for (let i = 0; i < chars.length; i++) {
        if (chars[i] === '=') {
            newEq += '=';
            continue;
        }
        const char = patternToChar(newPatterns[i]);
        if (char === null) return null; // Invalid character formed
        newEq += char;
    }
    
    return newEq;
}

function patternToChar(pattern: number[]): string | null {
    const pStr = pattern.join('');
    const map: Record<string, string> = {
        '1110111': '0',
        '0010010': '1',
        '1011101': '2',
        '1011011': '3',
        '0111010': '4',
        '1101011': '5',
        '1101111': '6',
        '1010010': '7',
        '1111111': '8',
        '1111011': '9',
        '0101000': '+',
        '0001000': '-'
    };
    return map[pStr] || null;
}
