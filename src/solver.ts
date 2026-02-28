import { DIGITS, OPERATORS, EQUALS_SIGN } from './constants';
import { safeEvaluate } from './utils';

// Convert a SegmentPattern to a bitmask integer
const patternToMask = (pattern: number[]): number => {
    let mask = 0;
    for (let i = 0; i < 7; i++) {
        if (pattern[i]) mask |= (1 << i);
    }
    return mask;
};

// Map bitmask -> character (e.g., 119 -> '0', etc)
const MASK_TO_CHAR = new Map<number, string>();
for (let i = 0; i <= 9; i++) {
    MASK_TO_CHAR.set(patternToMask(DIGITS[i]), i.toString());
}
MASK_TO_CHAR.set(patternToMask(OPERATORS['+']), '+');
MASK_TO_CHAR.set(patternToMask(OPERATORS['-']), '-');
MASK_TO_CHAR.set(patternToMask(EQUALS_SIGN), '=');

const charToMask = (char: string): number => {
    if (/\d/.test(char)) return patternToMask(DIGITS[parseInt(char)]);
    if (char === '+') return patternToMask(OPERATORS['+']);
    if (char === '-') return patternToMask(OPERATORS['-']);
    if (char === '=') return patternToMask(EQUALS_SIGN);
    return 0;
};

export const solveEquation = (equation: string): string[] => {
    const chars = equation.replace(/\s/g, '').split('');
    const masks = chars.map(charToMask);
    const solutions = new Set<string>();

    for (let i = 0; i < masks.length; i++) {
        const char1 = chars[i];

        for (let j = 0; j < 7; j++) {
            // Check if segment j is present
            if (masks[i] & (1 << j)) {
                // Remove segment
                const removedMask = masks[i] & ~(1 << j);

                for (let k = 0; k < masks.length; k++) {
                    const char2 = chars[k];

                    for (let l = 0; l < 7; l++) {
                        const baseMask = (i === k) ? removedMask : masks[k];
                        // Check if segment l is missing
                        if (!(baseMask & (1 << l))) {
                            // Add segment
                            const addedMask = baseMask | (1 << l);

                            // Check if the new masks form valid characters
                            const newChar1 = MASK_TO_CHAR.get(i === k ? addedMask : removedMask);
                            if (!newChar1) continue;
                            // Equals sign is strict
                            if (char1 === '=' && newChar1 !== '=') continue;
                            if (char1 !== '=' && newChar1 === '=') continue;

                            const newChar2 = (i === k) ? newChar1 : MASK_TO_CHAR.get(addedMask);
                            if (!newChar2) continue;
                            if (char2 === '=' && newChar2 !== '=') continue;
                            if (char2 !== '=' && newChar2 === '=') continue;

                            // Rebuild the equation string
                            let testEq = "";
                            for(let m = 0; m < masks.length; m++) {
                                if (m === i && m === k) {
                                    testEq += newChar1;
                                } else if (m === i) {
                                    testEq += newChar1;
                                } else if (m === k) {
                                    testEq += newChar2;
                                } else {
                                    testEq += chars[m];
                                }
                            }

                            if (testEq !== equation) {
                                const eqIdx = testEq.indexOf('=');
                                if (eqIdx !== -1 && eqIdx > 0 && eqIdx < testEq.length - 1) {
                                    const left = testEq.substring(0, eqIdx);
                                    const right = testEq.substring(eqIdx + 1);

                                    const leftVal = safeEvaluate(left);
                                    if (leftVal === null) continue;

                                    const rightVal = safeEvaluate(right);
                                    if (rightVal === null) continue;

                                    if (leftVal === rightVal) {
                                        solutions.add(testEq);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return Array.from(solutions);
};
