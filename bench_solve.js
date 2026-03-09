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

// ---------------------------
// ORIGINAL IMPLEMENTATION
// ---------------------------
const solveEquationOriginal = (equation) => {
    const chars = equation.replace(/\s/g, '').split('');
    const patterns = chars.map(c => [...getPattern(c)]);
    const solutions = new Set();

    for (let i = 0; i < patterns.length; i++) {
        for (let j = 0; j < 7; j++) {
            if (patterns[i][j] === 1) {
                const newPatterns = patterns.map(p => [...p]);
                newPatterns[i][j] = 0;

                for (let k = 0; k < newPatterns.length; k++) {
                    for (let l = 0; l < 7; l++) {
                        if (newPatterns[k][l] === 0) {
                            const testPatterns = newPatterns.map(p => [...p]);
                            testPatterns[k][l] = 1;

                            const testChars = testPatterns.map((p, idx) => patternToChar(p, chars[idx]));
                            if (!testChars.includes(null)) {
                                const testEq = testChars.join('');
                                if (testEq !== equation) {
                                    try {
                                        const [left, right] = testEq.split('=');
                                        if (left && right) {
                                            const leftVal = evaluateExpression(left);
                                            const rightVal = evaluateExpression(right);
                                            if (leftVal !== null && rightVal !== null && leftVal === rightVal) {
                                                solutions.add(testEq);
                                            }
                                        }
                                    } catch (e) { }
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

// ---------------------------
// BOLT OPTIMIZED IMPLEMENTATION
// ---------------------------
const solveEquationOptimized = (equation) => {
    const chars = equation.replace(/\s/g, '').split('');
    const patterns = chars.map(c => [...getPattern(c)]);
    const solutions = new Set();

    for (let i = 0; i < patterns.length; i++) {
        for (let j = 0; j < 7; j++) {
            if (patterns[i][j] === 1) {
                // Mutate heavily in-place directly saving thousands of arrays
                patterns[i][j] = 0;

                for (let k = 0; k < patterns.length; k++) {
                    for (let l = 0; l < 7; l++) {
                        if (patterns[k][l] === 0) {
                            patterns[k][l] = 1;

                            const testChars = patterns.map((p, idx) => patternToChar(p, chars[idx]));
                            if (!testChars.includes(null)) {
                                const testEq = testChars.join('');
                                if (testEq !== equation) {
                                    try {
                                        const [left, right] = testEq.split('=');
                                        if (left && right) {
                                            const leftVal = evaluateExpression(left);
                                            const rightVal = evaluateExpression(right);
                                            if (leftVal !== null && rightVal !== null && leftVal === rightVal) {
                                                solutions.add(testEq);
                                            }
                                        }
                                    } catch (e) { }
                                }
                            }
                            // Backtrack addition
                            patterns[k][l] = 0;
                        }
                    }
                }
                // Backtrack removal
                patterns[i][j] = 1;
            }
        }
    }
    return Array.from(solutions);
};

// BENCHMARK HARNESS
const ITERATIONS = 1000;
const testCases = [
    '6+4=4',
    '5+7=2',
    '9-5=8',
    '2+2=5'
];

console.log(`Running Array Memory Optimization Benchmark with ${ITERATIONS} iterations...`);

let origSolutionsCount = 0;
let optSolutionsCount = 0;

const origStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (const eq of testCases) {
        origSolutionsCount += solveEquationOriginal(eq).length;
    }
}
const origEnd = performance.now();
const origTime = origEnd - origStart;

const optStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (const eq of testCases) {
        optSolutionsCount += solveEquationOptimized(eq).length;
    }
}
const optEnd = performance.now();
const optTime = optEnd - optStart;

console.log("\n--- Results ---");
console.log(`Original memory intensive cloning time: ${origTime.toFixed(2)} ms`);
console.log(`Bolt optimized backtracking time: ${optTime.toFixed(2)} ms`);

if (origSolutionsCount !== optSolutionsCount) {
    console.error(`💥 ALERT! Solutions mismatch! Orig: ${origSolutionsCount}, Opt: ${optSolutionsCount}`);
} else {
    console.log(`\n🎉 Verification Passed: Both algorithms found ${origSolutionsCount} total solutions.`);
    if (optTime < origTime) {
        const speedup = (origTime / optTime).toFixed(2);
        console.log(`⚡ Bolt optimized version is ${speedup}x faster!`);
    } else {
        console.log(`Wait... original was faster?`);
    }
}
