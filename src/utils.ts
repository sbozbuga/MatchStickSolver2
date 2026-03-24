import { evaluateExpression, evaluateCharArray } from "./evaluate";
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
import type { SegmentPattern, SolutionHighlights } from "./types";

export function getEquationChars(
  equation: string,
  removeEquals: boolean,
): string[] {
  const chars: string[] = [];
  for (let i = 0; i < equation.length; i++) {
    const charCode = equation.charCodeAt(i);
    // Ignore space
    if (charCode !== CHAR_CODE_SPACE) {
      // Ignore equals if removeEquals is true
      if (!(removeEquals && charCode === CHAR_CODE_EQUALS)) {
        chars.push(equation[i]);
      }
    }
  }
  return chars;
}

export function getPattern(char: string | number): SegmentPattern {
  if (typeof char === "string") {
    if (char.length === 1) {
      const code = char.charCodeAt(0);
      if (code >= CHAR_CODE_0 && code <= CHAR_CODE_9)
        return DIGITS[code - CHAR_CODE_0];
      if (code === CHAR_CODE_PLUS) return OPERATORS["+"];
      if (code === CHAR_CODE_MINUS) return OPERATORS["-"];
      if (code === CHAR_CODE_EQUALS) return EQUALS_SIGN;
    } else {
      const digit = parseInt(char, 10);
      if (!isNaN(digit) && DIGITS[digit]) return DIGITS[digit];
    }
    return [0, 0, 0, 0, 0, 0, 0];
  }

  if (typeof char === "number") {
    if (char >= 0 && char <= 9 && Number.isInteger(char)) {
      return DIGITS[char];
    }
    return [0, 0, 0, 0, 0, 0, 0];
  }

  const charStr = String(char);
  if (charStr.length === 1) {
    const code = charStr.charCodeAt(0);
    if (code >= CHAR_CODE_0 && code <= CHAR_CODE_9)
      return DIGITS[code - CHAR_CODE_0];
    if (code === CHAR_CODE_PLUS) return OPERATORS["+"];
    if (code === CHAR_CODE_MINUS) return OPERATORS["-"];
    if (code === CHAR_CODE_EQUALS) return EQUALS_SIGN;
  } else {
    const digit = parseInt(charStr, 10);
    if (!isNaN(digit) && DIGITS[digit]) return DIGITS[digit];
  }
  return [0, 0, 0, 0, 0, 0, 0];
}

export function getMoveHighlights(
  originalEq: string,
  modifiedEq: string,
): SolutionHighlights {
  const originalChars = getEquationChars(originalEq, true);
  const modifiedChars = getEquationChars(modifiedEq, true);

  const maxLength = Math.max(originalChars.length, modifiedChars.length);
  const removalPatterns: SegmentPattern[] = [];
  const additionPatterns: SegmentPattern[] = [];

  for (let i = 0; i < maxLength; i++) {
    const originalPattern = getPattern(originalChars[i] || "");
    const modifiedPattern = getPattern(modifiedChars[i] || "");

    const removals: SegmentPattern = [0, 0, 0, 0, 0, 0, 0];
    const additions: SegmentPattern = [0, 0, 0, 0, 0, 0, 0];

    for (let j = 0; j < 7; j++) {
      if (originalPattern[j] === 1 && modifiedPattern[j] === 0) {
        removals[j] = 1;
      } else if (originalPattern[j] === 0 && modifiedPattern[j] === 1) {
        additions[j] = 1;
      }
    }
    removalPatterns.push(removals);
    additionPatterns.push(additions);
  }
  return { removalPatterns, additionPatterns };
}

export function calculateCombinedRemovalMask(
  equation: string,
  solutions: string[],
): SegmentPattern[] | undefined {
  if (!solutions || solutions.length === 0 || !equation) return undefined;

  const originalChars = getEquationChars(equation, true);
  const combinedMask: SegmentPattern[] = Array.from(
    { length: originalChars.length },
    () => [0, 0, 0, 0, 0, 0, 0],
  );

  for (const sol of solutions) {
    const { removalPatterns } = getMoveHighlights(equation, sol);
    for (let i = 0; i < combinedMask.length; i++) {
      if (removalPatterns[i]) {
        for (let j = 0; j < 7; j++) {
          if (removalPatterns[i][j] === 1) {
            combinedMask[i][j] = 1;
          }
        }
      }
    }
  }

  return combinedMask;
}

function isMatch(p1: SegmentPattern, p2: SegmentPattern): boolean {
  for (let i = 0; i < 7; i++) {
    if (p1[i] !== p2[i]) return false;
  }
  return true;
}

export function patternToChar(
  pattern: SegmentPattern,
  originalChar: string,
): string | null {
  if (originalChar === "=") {
    if (isMatch(pattern, EQUALS_SIGN)) return "=";
    return null;
  }

  // Check digits
  for (let i = 0; i <= 9; i++) {
    if (isMatch(pattern, DIGITS[i])) return i.toString();
  }

  // Check operators
  if (isMatch(pattern, OPERATORS["+"])) return "+";
  if (isMatch(pattern, OPERATORS["-"])) return "-";

  return null;
}

export const solveEquation = (equation: string): string[] => {
  // SECURITY: Limit input to prevent CPU exhaustion DoS (Client thread locking)
  if (equation.length > 20) return [];

  const chars = getEquationChars(equation, false);
  const eqIdx = chars.indexOf("=");
  const patterns = chars.map((c) => [...getPattern(c)] as SegmentPattern);
  const solutions = new Set<string>();

  const testChars = patterns.map((p, idx) =>
    patternToChar(p as SegmentPattern, chars[idx]),
  );
  let nullCount = testChars.filter((c) => c === null).length;

  for (let i = 0; i < patterns.length; i++) {
    for (let j = 0; j < 7; j++) {
      if (patterns[i][j] === 1) {
        // Try removing stick from i, j
        patterns[i][j] = 0;

        const oldCharI = testChars[i];
        testChars[i] = patternToChar(patterns[i], chars[i]);
        if (oldCharI === null && testChars[i] !== null) nullCount--;
        else if (oldCharI !== null && testChars[i] === null) nullCount++;

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
                const isEq = testChars[i] === chars[i] && testChars[k] === chars[k];

                if (!isEq) {
                  if (eqIdx > 0 && eqIdx < testChars.length - 1) {
                      const leftVal = evaluateCharArray(testChars, 0, eqIdx);
                      const rightVal = evaluateCharArray(testChars, eqIdx + 1, testChars.length);
                    if (
                      leftVal !== null &&
                      rightVal !== null &&
                      leftVal === rightVal
                    ) {
                      solutions.add(testChars.join(""));
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

  return Array.from(solutions);
};

let CACHED_PUZZLES: string[] | null = null;

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
      const chars = getEquationChars(eq, false);
      const eqIdx = chars.indexOf("=");
      const patterns = chars.map((c) => [...getPattern(c)] as SegmentPattern);

      const testChars = patterns.map((p, idx) =>
        patternToChar(p as SegmentPattern, chars[idx]),
      );
      let nullCount = testChars.filter((c) => c === null).length;

      for (let i = 0; i < patterns.length; i++) {
        for (let j = 0; j < 7; j++) {
          if (patterns[i][j] === 1) {
            patterns[i][j] = 0;

            const oldCharI = testChars[i];
            testChars[i] = patternToChar(patterns[i], chars[i]);
            if (oldCharI === null && testChars[i] !== null) nullCount--;
            else if (oldCharI !== null && testChars[i] === null) nullCount++;

            for (let k = 0; k < patterns.length; k++) {
              for (let l = 0; l < 7; l++) {
                if (patterns[k][l] === 0) {
                  patterns[k][l] = 1;

                  const oldCharK = testChars[k];
                  testChars[k] = patternToChar(patterns[k], chars[k]);
                  if (oldCharK === null && testChars[k] !== null) nullCount--;
                  else if (oldCharK !== null && testChars[k] === null)
                    nullCount++;

                  if (nullCount === 0) {
                    const isEq = testChars[i] === chars[i] && testChars[k] === chars[k];

                    if (!isEq) {
                      if (eqIdx > 0 && eqIdx < testChars.length - 1) {
                        const leftVal = evaluateCharArray(testChars, 0, eqIdx);
                        const rightVal = evaluateCharArray(testChars, eqIdx + 1, testChars.length);
                        // It MUST evaluate falsely explicitly so it operates as a puzzle and not an identical solved clone natively
                        if (
                          leftVal !== null &&
                          rightVal !== null &&
                          leftVal !== rightVal
                        ) {
                          ALL_PUZZLES.add(testChars.join(""));
                        }
                      }
                    }
                  }
                  patterns[k][l] = 0;
                  const newCharK = testChars[k];
                  testChars[k] = oldCharK;
                  if (newCharK === null && testChars[k] !== null) nullCount--;
                  else if (newCharK !== null && testChars[k] === null)
                    nullCount++;
                }
              }
            }

            patterns[i][j] = 1;
            const newCharI = testChars[i];
            testChars[i] = oldCharI;
            if (newCharI === null && testChars[i] !== null) nullCount--;
            else if (newCharI !== null && testChars[i] === null) nullCount++;
          }
        }
      }
    }
    CACHED_PUZZLES = Array.from(ALL_PUZZLES);
  }

  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return CACHED_PUZZLES[array[0] % CACHED_PUZZLES.length];
};
