import { performance } from 'perf_hooks';

// Setup Mock Constants
const DIGITS = {
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

const OPERATORS = {
    '+': [0, 1, 0, 1, 0, 0, 0],
    '-': [0, 0, 0, 1, 0, 0, 0],
};

const EQUALS_SIGN = [1, 0, 0, 0, 0, 0, 1];

function getPattern(char) {
    const charStr = String(char);
    if (charStr === '+') return OPERATORS['+'];
    if (charStr === '-') return OPERATORS['-'];
    if (charStr === '=') return EQUALS_SIGN;
    const digit = parseInt(charStr, 10);
    if (!isNaN(digit) && DIGITS[digit]) return DIGITS[digit];
    return [0, 0, 0, 0, 0, 0, 0];
}

function patternToChar(pattern, originalChar) {
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
}

function evaluateExpression(expr) {
    if (!expr) return null;
    const tokens = expr.match(/\d+|[+-]/g);
    if (!tokens) return null;
    let result = parseInt(tokens[0], 10);
    if (isNaN(result)) return null;
    for (let i = 1; i < tokens.length; i += 2) {
        const op = tokens[i];
        const nextVal = parseInt(tokens[i + 1], 10);
        if (isNaN(nextVal)) return null;
        if (op === '+') result += nextVal;
        else if (op === '-') result -= nextVal;
        else return null;
    }
    return result;
}

function getEquationChars(str, removeEq) {
    const chars = [];
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        if (c !== 32 && (!removeEq || c !== 61)) {
            chars.push(str[i]);
        }
    }
    return chars;
}

function solveEquationOriginal(equation) {
    const chars = getEquationChars(equation, false);
    const eqIdx = chars.indexOf('=');
    const patterns = chars.map((c) => [...getPattern(c)]);
    const solutions = new Set();

    const testChars = patterns.map((p, idx) =>
      patternToChar(p, chars[idx])
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
                else if (oldCharK !== null && testChars[k] === null) nullCount++;

                if (nullCount === 0) {
                  let isEq = true;
                  for (let ci = 0; ci < chars.length; ci++) {
                    if (testChars[ci] !== chars[ci]) {
                      isEq = false;
                      break;
                    }
                  }

                  if (!isEq) {
                    if (eqIdx > 0 && eqIdx < testChars.length - 1) {
                        let leftStr = '';
                        for(let m=0; m<eqIdx; m++) leftStr += testChars[m];
                        let rightStr = '';
                        for(let m=eqIdx+1; m<testChars.length; m++) rightStr += testChars[m];

                        const leftVal = evaluateExpression(leftStr);
                        const rightVal = evaluateExpression(rightStr);
                      if (
                        leftVal !== null &&
                        rightVal !== null &&
                        leftVal === rightVal
                      ) {
                        solutions.add(testChars.join(''));
                      }
                    }
                  }
                }

                patterns[k][l] = 0;
                const newCharK = testChars[k];
                testChars[k] = oldCharK;
                if (newCharK === null && testChars[k] !== null) nullCount--;
                else if (newCharK !== null && testChars[k] === null) nullCount++;
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

    return Array.from(solutions);
  }

function solveEquationOptimized(equation) {
    const chars = getEquationChars(equation, false);
    const eqIdx = chars.indexOf('=');
    const patterns = chars.map((c) => [...getPattern(c)]);
    const solutions = new Set();

    const testChars = patterns.map((p, idx) =>
      patternToChar(p, chars[idx])
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
                else if (oldCharK !== null && testChars[k] === null) nullCount++;

                if (nullCount === 0) {
                  let isEq = testChars[i] === chars[i] && testChars[k] === chars[k];
                  if (!isEq) {
                    if (eqIdx > 0 && eqIdx < testChars.length - 1) {
                        let leftStr = '';
                        for(let m=0; m<eqIdx; m++) leftStr += testChars[m];
                        let rightStr = '';
                        for(let m=eqIdx+1; m<testChars.length; m++) rightStr += testChars[m];

                        const leftVal = evaluateExpression(leftStr);
                        const rightVal = evaluateExpression(rightStr);
                      if (
                        leftVal !== null &&
                        rightVal !== null &&
                        leftVal === rightVal
                      ) {
                        solutions.add(testChars.join(''));
                      }
                    }
                  }
                }

                patterns[k][l] = 0;
                const newCharK = testChars[k];
                testChars[k] = oldCharK;
                if (newCharK === null && testChars[k] !== null) nullCount--;
                else if (newCharK !== null && testChars[k] === null) nullCount++;
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

    return Array.from(solutions);
  }

const ITERATIONS = 1000;
const testCases = [
    '6+4=4',
    '5+7=2',
    '9-5=8',
    '2+2=5'
];

console.log(`Running Solve Check Optimization Benchmark with ${ITERATIONS} iterations...`);

let origStart = performance.now();
let origCount = 0;
for (let i = 0; i < ITERATIONS; i++) {
    for (const eq of testCases) {
        origCount += solveEquationOriginal(eq).length;
    }
}
let origEnd = performance.now();
const origTime = origEnd - origStart;

let optStart = performance.now();
let optCount = 0;
for (let i = 0; i < ITERATIONS; i++) {
    for (const eq of testCases) {
        optCount += solveEquationOptimized(eq).length;
    }
}
let optEnd = performance.now();
const optTime = optEnd - optStart;

console.log("\n--- Results ---");
console.log(`Original equality check time: ${origTime.toFixed(2)} ms`);
console.log(`Optimized equality check time: ${optTime.toFixed(2)} ms`);
if (origCount !== optCount) {
    console.error(`Mismatch! Original: ${origCount}, Optimized: ${optCount}`);
} else {
    if (optTime < origTime) {
        const speedup = (origTime / optTime).toFixed(2);
        console.log(`⚡ Optimized version is ${speedup}x faster!`);
    } else {
        console.log("Original was faster...?");
    }
}
