
import { DIGITS, OPERATORS, EQUALS_SIGN } from '../constants';
import type { SegmentPattern } from '../types';
import { solveEquation } from '../solver';

// Helper to convert char to pattern
const charToPattern = (char: string): SegmentPattern => {
    if (/\d/.test(char)) return [...DIGITS[parseInt(char)]];
    if (char === '+') return [...OPERATORS['+']];
    if (char === '-') return [...OPERATORS['-']];
    if (char === '=') return [...EQUALS_SIGN];
    return [0, 0, 0, 0, 0, 0, 0];
};

// Helper to convert pattern to char
const patternToChar = (pattern: SegmentPattern, originalChar: string): string | null => {
    if (originalChar === '=') {
        if (pattern.every((v, i) => v === EQUALS_SIGN[i])) return '=';
        return null;
    }

    // Check digits
    for (let i = 0; i <= 9; i++) {
        if (pattern.every((v, idx) => v === DIGITS[i][idx])) return i.toString();
    }

    // Check operators
    if (pattern.every((v, idx) => v === OPERATORS['+'][idx])) return '+';
    if (pattern.every((v, idx) => v === OPERATORS['-'][idx])) return '-';

    return null;
};

// Original Brute-Force Implementation
const solveEquationOriginal = (equation: string): string[] => {
    const chars = equation.replace(/\s/g, '').split('');
    const patterns = chars.map(charToPattern);
    const solutions = new Set<string>();

    for (let i = 0; i < patterns.length; i++) {
        for (let j = 0; j < 7; j++) {
            if (patterns[i][j] === 1) {
                // Try removing stick from i, j
                const newPatterns = patterns.map(p => [...p]);
                newPatterns[i][j] = 0;

                for (let k = 0; k < newPatterns.length; k++) {
                    for (let l = 0; l < 7; l++) {
                        if (newPatterns[k][l] === 0) {
                            // Try adding stick to k, l
                            const testPatterns = newPatterns.map(p => [...p]);
                            testPatterns[k][l] = 1;

                            const testChars = testPatterns.map((p, idx) => patternToChar(p as SegmentPattern, chars[idx]));
                            if (!testChars.includes(null)) {
                                const testEq = testChars.join('');
                                if (testEq !== equation) {
                                    try {
                                        const [left, right] = testEq.split('=');
                                        if (left && right) {
                                            // eslint-disable-next-line no-eval
                                            const leftVal = eval(left);
                                            // eslint-disable-next-line no-eval
                                            const rightVal = eval(right);
                                            if (leftVal === rightVal) {
                                                solutions.add(testEq);
                                            }
                                        }
                                    } catch (e) {
                                        // Ignore invalid equations
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

// Verification and Benchmark
const runVerification = () => {
    const testCases = [
        '6+4=4',
        '5+7=2',
        '9-5=8',
        '2+2=5',
        '5-5=2',
        '4+2=9',
        '3+3=8',
        '1+1=3',
        '9+3=4',
        '6+2=9',
        '0+4=4',
        '8+8=0', // No solution?
        '0+0=0', // Self moves?
        '9+9=9',
        '1-1=1',
        '8-8=8'
    ];

    console.log('Verifying correctness...');
    let passed = 0;

    for (const eq of testCases) {
        const originalSolutions = new Set(solveEquationOriginal(eq));
        const newSolutions = new Set(solveEquation(eq));

        const originalList = Array.from(originalSolutions).sort();
        const newList = Array.from(newSolutions).sort();

        const isEqual = originalList.length === newList.length &&
                        originalList.every((val, index) => val === newList[index]);

        if (isEqual) {
            passed++;
            // console.log(`[PASS] ${eq} -> found ${originalList.length} solutions`);
        } else {
            console.error(`[FAIL] ${eq}`);
            console.error(`  Original: ${JSON.stringify(originalList)}`);
            console.error(`  New:      ${JSON.stringify(newList)}`);
        }
    }

    console.log(`Verification: ${passed}/${testCases.length} passed.`);

    if (passed !== testCases.length) {
        console.error('Verification failed! Aborting benchmark.');
        process.exit(1);
    }

    console.log('\nRunning benchmark...');
    const iterations = 100;

    const startOriginal = performance.now();
    for (let i = 0; i < iterations; i++) {
        for (const eq of testCases) {
            solveEquationOriginal(eq);
        }
    }
    const endOriginal = performance.now();
    const timeOriginal = endOriginal - startOriginal;

    const startNew = performance.now();
    for (let i = 0; i < iterations; i++) {
        for (const eq of testCases) {
            solveEquation(eq);
        }
    }
    const endNew = performance.now();
    const timeNew = endNew - startNew;

    console.log(`Original Implementation: ${timeOriginal.toFixed(2)}ms`);
    console.log(`New Implementation:      ${timeNew.toFixed(2)}ms`);
    console.log(`Speedup:                 ${(timeOriginal / timeNew).toFixed(2)}x`);
};

runVerification();
