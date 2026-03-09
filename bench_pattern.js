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

function patternToCharOriginal(pattern, originalChar) {
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

function isMatch(p1, p2) {
    for (let i = 0; i < 7; i++) {
        if (p1[i] !== p2[i]) return false;
    }
    return true;
}

function patternToCharOptimized(pattern, originalChar) {
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

const ITERATIONS = 1000000;
const patterns = [
    [1, 1, 1, 0, 1, 1, 1], // 0
    [0, 1, 0, 1, 0, 0, 0], // +
    [1, 0, 0, 0, 0, 0, 1], // =
    [0, 1, 1, 1, 0, 1, 0], // 4
    [0, 0, 0, 1, 0, 0, 0], // -
    [0, 0, 0, 0, 0, 0, 0]  // none
];

console.log(`Running patternToChar Benchmark with ${ITERATIONS} iterations...`);

let origCount = 0;
let optCount = 0;

const origStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (const p of patterns) {
        if (patternToCharOriginal(p, 'x')) origCount++;
        if (patternToCharOriginal(p, '=')) origCount++;
    }
}
const origEnd = performance.now();
const origTime = origEnd - origStart;

const optStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    for (const p of patterns) {
        if (patternToCharOptimized(p, 'x')) optCount++;
        if (patternToCharOptimized(p, '=')) optCount++;
    }
}
const optEnd = performance.now();
const optTime = optEnd - optStart;

console.log("\n--- Results ---");
console.log(`Original time: ${origTime.toFixed(2)} ms`);
console.log(`Optimized time: ${optTime.toFixed(2)} ms`);

if (origCount !== optCount) {
    console.error(`💥 ALERT! Count mismatch! Orig: ${origCount}, Opt: ${optCount}`);
} else {
    console.log(`\n🎉 Verification Passed: Both algorithms returned the same results.`);
    if (optTime < origTime) {
        const speedup = (origTime / optTime).toFixed(2);
        console.log(`⚡ Optimized version is ${speedup}x faster!`);
    } else {
        console.log(`Wait... original was faster?`);
    }
}
