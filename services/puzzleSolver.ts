import type { ParsedEquation, Operator } from '../types';
import { getPattern } from '../utils';

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

// Pre-generate all valid equations
const VALID_EQUATIONS: string[] = [];
for (let a = 0; a <= 99; a++) {
    for (let b = 0; b <= 99; b++) {
        if (a + b <= 99) VALID_EQUATIONS.push(`${a}+${b}=${a + b}`);
        if (a - b >= 0) VALID_EQUATIONS.push(`${a}-${b}=${a - b}`);
    }
}

function getDistance(eq1: string, eq2: string): number | null {
    if (eq1.length !== eq2.length) return null;
    let diffCount = 0;
    let sticks1 = 0;
    let sticks2 = 0;
    for (let i = 0; i < eq1.length; i++) {
        const p1 = getPattern(eq1[i]);
        const p2 = getPattern(eq2[i]);
        for (let j = 0; j < 7; j++) {
            sticks1 += p1[j];
            sticks2 += p2[j];
            if (p1[j] !== p2[j]) {
                diffCount++;
            }
        }
    }
    if (sticks1 !== sticks2) return null;
    return diffCount / 2;
}

export function solve(equationString: string, moves: number = 1): { solutions?: string[]; error?: string } {
    const cleanEquation = equationString.replace(/\s/g, '');
    if (!parseEquation(cleanEquation)) {
        return { error: "error.invalidFormat" };
    }

    const solutions: string[] = [];
    for (const validEq of VALID_EQUATIONS) {
        if (getDistance(cleanEquation, validEq) === moves) {
            solutions.push(validEq);
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

