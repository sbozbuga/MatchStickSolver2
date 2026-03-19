import { performance } from 'perf_hooks';

// Need to mock or just copy the old unoptimized function
const EQUALS_SIGN = [1, 0, 0, 0, 0, 0, 1];
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

function getPattern(char) {
    if (typeof char === 'string') {
        if (char.length === 1) {
            const code = char.charCodeAt(0);
            if (code >= 48 && code <= 57) return DIGITS[code - 48];
            if (code === 43) return OPERATORS['+'];
            if (code === 45) return OPERATORS['-'];
            if (code === 61) return EQUALS_SIGN;
        } else {
            const digit = parseInt(char, 10);
            if (!isNaN(digit) && DIGITS[digit]) return DIGITS[digit];
        }
        return [0, 0, 0, 0, 0, 0, 0];
    }
    return [0, 0, 0, 0, 0, 0, 0];
}

function isMatch(p1, p2) {
    for (let i = 0; i < 7; i++) {
        if (p1[i] !== p2[i]) return false;
    }
    return true;
}

function patternToChar(pattern, originalChar) {
    if (originalChar === '=') {
        if (isMatch(pattern, EQUALS_SIGN)) return '=';
        return null;
    }
    for (let i = 0; i <= 9; i++) {
        if (isMatch(pattern, DIGITS[i])) return i.toString();
    }
    if (isMatch(pattern, OPERATORS['+'])) return '+';
    if (isMatch(pattern, OPERATORS['-'])) return '-';
    return null;
}

function evaluateExpression(expr) {
    if (!expr) return null;
    let result = 0;
    let currentNum = 0;
    let hasNum = false;
    let currentOp = 1;
    for (let i = 0; i < expr.length; i++) {
        const charCode = expr.charCodeAt(i);
        if (charCode >= 48 && charCode <= 57) {
            currentNum = currentNum * 10 + (charCode - 48);
            hasNum = true;
        } else if (charCode === 43) {
            if (!hasNum) return null;
            result += currentOp * currentNum;
            currentOp = 1;
            currentNum = 0;
            hasNum = false;
        } else if (charCode === 45) {
            if (!hasNum) return null;
            result += currentOp * currentNum;
            currentOp = -1;
            currentNum = 0;
            hasNum = false;
        } else {
            return null;
        }
    }
    if (!hasNum) return null;
    return result + (currentOp * currentNum);
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

function generateRandomPuzzleOriginal() {
    const ALL_PUZZLES = new Set();
    const validEquations = [];
    const ops = ['+', '-'];
    for (let aNum = 0; aNum <= 9; aNum++) {
        for (const op of ops) {
            for (let bNum = 0; bNum <= 9; bNum++) {
                const left = op === '+' ? aNum + bNum : aNum - bNum;
                if (left >= 0 && left <= 9) {
                    validEquations.push(`${aNum}${op}${bNum}=${left}`);
                }
            }
        }
    }

    // Just run subset for bench
    for (const eq of validEquations.slice(0, 5)) {
        const chars = getEquationChars(eq, false);
        const patterns = chars.map(c => [...getPattern(c)]);
        const testChars = patterns.map((p, idx) => patternToChar(p, chars[idx]));
        let nullCount = testChars.filter(c => c === null).length;

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
                                    const testEq = testChars.join('');
                                    if (testEq !== eq) {
                                        try {
                                            const [left, right] = testEq.split('=');
                                            if (left && right) {
                                                const leftVal = evaluateExpression(left);
                                                const rightVal = evaluateExpression(right);
                                                if (leftVal !== null && rightVal !== null && leftVal !== rightVal) {
                                                    ALL_PUZZLES.add(testEq);
                                                }
                                            }
                                        } catch (e) {}
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
    }
    return ALL_PUZZLES;
}


function generateRandomPuzzleOptimized() {
    const ALL_PUZZLES = new Set();
    const validEquations = [];
    const ops = ['+', '-'];
    for (let aNum = 0; aNum <= 9; aNum++) {
        for (const op of ops) {
            for (let bNum = 0; bNum <= 9; bNum++) {
                const left = op === '+' ? aNum + bNum : aNum - bNum;
                if (left >= 0 && left <= 9) {
                    validEquations.push(`${aNum}${op}${bNum}=${left}`);
                }
            }
        }
    }

    // Just run subset for bench
    for (const eq of validEquations.slice(0, 5)) {
        const chars = getEquationChars(eq, false);
        const patterns = chars.map(c => [...getPattern(c)]);
        const testChars = patterns.map((p, idx) => patternToChar(p, chars[idx]));
        let nullCount = testChars.filter(c => c === null).length;

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
                                    // NO JOIN, NO SPLIT
                                    let isEq = true;
                                    for(let ci=0; ci<chars.length; ci++) {
                                        if (testChars[ci] !== chars[ci]) {
                                            isEq = false;
                                            break;
                                        }
                                    }
                                    if (!isEq) {
                                        // Manual evaluate
                                        let eqIdx = testChars.indexOf('=');
                                        if (eqIdx > 0 && eqIdx < testChars.length - 1) {
                                            // Since we have an exact max length, it's basically safe
                                            // The old join/split logic is what we need to replace cleanly
                                            // Let's emulate testEq logic manually without array ops
                                            let leftStr = '';
                                            for(let m=0; m<eqIdx; m++) leftStr += testChars[m];
                                            let rightStr = '';
                                            for(let m=eqIdx+1; m<testChars.length; m++) rightStr += testChars[m];

                                            const leftVal = evaluateExpression(leftStr);
                                            const rightVal = evaluateExpression(rightStr);
                                            if (leftVal !== null && rightVal !== null && leftVal !== rightVal) {
                                                // only join here at the very end when adding
                                                ALL_PUZZLES.add(testChars.join(''));
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
    }
    return ALL_PUZZLES;
}


const ITERATIONS = 10;

console.log(`Running Array Memory Optimization Benchmark with ${ITERATIONS} iterations...`);

let origStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    generateRandomPuzzleOriginal();
}
let origEnd = performance.now();
const origTime = origEnd - origStart;

let optStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    generateRandomPuzzleOptimized();
}
let optEnd = performance.now();
const optTime = optEnd - optStart;

console.log("\n--- Results ---");
console.log(`Original memory intensive cloning time: ${origTime.toFixed(2)} ms`);
console.log(`Bolt optimized backtracking time: ${optTime.toFixed(2)} ms`);
if (optTime < origTime) {
    const speedup = (origTime / optTime).toFixed(2);
    console.log(`⚡ Bolt optimized version is ${speedup}x faster!`);
}
