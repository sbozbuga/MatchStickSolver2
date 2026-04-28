import { evaluateCharArray } from "./evaluate";
import {
  DIGITS,
  OPERATORS,
  EQUALS_SIGN,
  CHAR_CODE_0,
  CHAR_CODE_9,
  CHAR_CODE_PLUS,
  CHAR_CODE_MINUS,
  CHAR_CODE_EQUALS,
  CHAR_CODE_SPACE,
} from "./constants";
import type { SegmentPattern } from "./types";

export function getEquationChars(
  equation: string,
  removeEquals: boolean,
): string[] {
  const chars: string[] = [];
  for (let i = 0; i < equation.length; i++) {
    const charCode = equation.charCodeAt(i);
    if (
      charCode !== CHAR_CODE_SPACE &&
      !(removeEquals && charCode === CHAR_CODE_EQUALS)
    ) {
      chars.push(equation[i]);
    }
  }
  return chars;
}

export function getPattern(char: string | number): SegmentPattern {
  if (typeof char === "number") {
    if (char >= 0 && char <= 9 && Number.isInteger(char)) {
      return DIGITS[char];
    }
    return [0, 0, 0, 0, 0, 0, 0];
  }

  const charStr = typeof char === "string" ? char : String(char);
  if (charStr.length === 1) {
    const code = charStr.charCodeAt(0);
    if (code >= CHAR_CODE_0 && code <= CHAR_CODE_9) {
      return DIGITS[code - CHAR_CODE_0];
    }
    if (code === CHAR_CODE_PLUS) return OPERATORS["+"];
    if (code === CHAR_CODE_MINUS) return OPERATORS["-"];
    if (code === CHAR_CODE_EQUALS) return EQUALS_SIGN;
  } else {
    const digit = parseInt(charStr, 10);
    if (!isNaN(digit) && DIGITS[digit]) return DIGITS[digit];
  }
  return [0, 0, 0, 0, 0, 0, 0];
}

function patternToMask(p: SegmentPattern): number {
  return (
    p[0] |
    (p[1] << 1) |
    (p[2] << 2) |
    (p[3] << 3) |
    (p[4] << 4) |
    (p[5] << 5) |
    (p[6] << 6)
  );
}

const EQUALS_MASK = patternToMask(EQUALS_SIGN);
const MASK_TO_CHAR: (string | null)[] = new Array(128).fill(null);

for (let i = 0; i <= 9; i++) {
  MASK_TO_CHAR[patternToMask(DIGITS[i])] = i.toString();
}
MASK_TO_CHAR[patternToMask(OPERATORS["+"])] = "+";
MASK_TO_CHAR[patternToMask(OPERATORS["-"])] = "-";

export function patternToChar(
  pattern: SegmentPattern,
  originalChar: string,
): string | null {
  const mask = patternToMask(pattern);
  if (originalChar === "=") {
    return mask === EQUALS_MASK ? "=" : null;
  }

  return MASK_TO_CHAR[mask];
}

export function findOneMovePermutations(
  equation: string,
  onPermutationFound: (permutation: string, leftVal: number, finalRightVal: number) => void,
): void {
  const chars = getEquationChars(equation, false);
  const eqIdx = chars.indexOf("=");
  const patterns = chars.map((c) => [...getPattern(c)] as SegmentPattern);

  const testChars = patterns.map((p, idx) =>
    patternToChar(p as SegmentPattern, chars[idx]),
  );
  let nullCount = testChars.filter((c) => c === null).length;

  const initialLeftVal = evaluateCharArray(testChars, 0, eqIdx);
  const initialRightVal = evaluateCharArray(testChars, eqIdx + 1, testChars.length);

  for (let i = 0; i < patterns.length; i++) {
    for (let j = 0; j < 7; j++) {
      if (patterns[i][j] === 1) {
        // Try removing stick from i, j
        patterns[i][j] = 0;

        const oldCharI = testChars[i];
        testChars[i] = patternToChar(patterns[i], chars[i]);
        if (oldCharI === null && testChars[i] !== null) nullCount--;
        else if (oldCharI !== null && testChars[i] === null) nullCount++;

        let currentLeftVal = initialLeftVal;
        let currentRightVal = initialRightVal;

        if (i < eqIdx) {
          currentLeftVal = evaluateCharArray(testChars, 0, eqIdx);
        } else if (i > eqIdx) {
          currentRightVal = evaluateCharArray(testChars, eqIdx + 1, testChars.length);
        }

        for (let k = 0; k < patterns.length; k++) {
          for (let l = 0; l < 7; l++) {
            if (patterns[k][l] === 0) {
              // Try adding stick to k, l
              patterns[k][l] = 1;

              const oldCharK = testChars[k];
              testChars[k] = patternToChar(patterns[k], chars[k]);
              if (oldCharK === null && testChars[k] !== null) nullCount--;
              else if (oldCharK !== null && testChars[k] === null) nullCount++;

              if (nullCount === 0) {
                const isEq =
                  i === k
                    ? testChars[i] === chars[i]
                    : testChars[i] === chars[i] && testChars[k] === chars[k];

                if (!isEq) {
                  if (eqIdx > 0 && eqIdx < testChars.length - 1) {
                    let finalLeftVal = currentLeftVal;
                    let finalRightVal = currentRightVal;

                    if (k < eqIdx) {
                      finalLeftVal = evaluateCharArray(testChars, 0, eqIdx);
                    } else if (k > eqIdx) {
                      finalRightVal = evaluateCharArray(testChars, eqIdx + 1, testChars.length);
                    }

                    if (
                      finalLeftVal !== null &&
                      finalRightVal !== null
                    ) {
                      onPermutationFound(testChars.join(""), finalLeftVal, finalRightVal);
                    }
                  }
                }
              }

              // Backtrack adding stick
              patterns[k][l] = 0;
              const newCharK = testChars[k];
              testChars[k] = oldCharK;
              if (newCharK === null && testChars[k] !== null) nullCount--;
              else if (newCharK !== null && testChars[k] === null) nullCount++;
            }
          }
        }

        // Backtrack removing stick
        patterns[i][j] = 1;
        const newCharI = testChars[i];
        testChars[i] = oldCharI;
        if (newCharI === null && testChars[i] !== null) nullCount--;
        else if (newCharI !== null && testChars[i] === null) nullCount++;
      }
    }
  }
}

export const solveEquation = (equation: string): string[] => {
  // SECURITY: Limit input to prevent CPU exhaustion DoS (Client thread locking)
  if (equation.length > 20) return [];

  const solutions = new Set<string>();

  findOneMovePermutations(equation, (permutation, finalLeftVal, finalRightVal) => {
    if (finalLeftVal === finalRightVal) {
      solutions.add(permutation);
    }
  });

  return Array.from(solutions);
};

export let CACHED_PUZZLES: string[] | null = null;

export const generateRandomPuzzle = (): string => {
  if (!CACHED_PUZZLES) {
    const ALL_PUZZLES = new Set<string>();
    const validEquations: string[] = [];
    const ops = ["+", "-"];

    // 1. Generate all purely valid one-digit mathematics strings A +/- B = C
    for (let aNum = 0; aNum <= 9; aNum++) {
      for (const op of ops) {
        for (let bNum = 0; bNum <= 9; bNum++) {
          const left = op === "+" ? aNum + bNum : aNum - bNum;
          if (left >= 0 && left <= 9) {
            validEquations.push(`${aNum}${op}${bNum}=${left}`);
          }
        }
      }
    }

    // 2. Iterate backward generating exactly 1-move permutations representing valid but incorrect puzzle states
    for (const eq of validEquations) {
      findOneMovePermutations(eq, (permutation, finalLeftVal, finalRightVal) => {
        // It MUST evaluate falsely explicitly so it operates as a puzzle and not an identical solved clone natively
        if (finalLeftVal !== finalRightVal) {
          ALL_PUZZLES.add(permutation);
        }
      });
    }
    CACHED_PUZZLES = Array.from(ALL_PUZZLES);
  }

  const n = CACHED_PUZZLES.length;
  if (n === 0) return "";

  const array = new Uint32Array(1);
  const limit = 0x100000000 - (0x100000000 % n);
  let r: number;
  do {
    crypto.getRandomValues(array);
    r = array[0];
  } while (r >= limit);
  return CACHED_PUZZLES[r % n];
};
