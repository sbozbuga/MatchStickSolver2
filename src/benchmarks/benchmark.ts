
import { DIGITS, OPERATORS, EQUALS_SIGN } from '../constants';

type SegmentPattern = [number, number, number, number, number, number, number];

const charToPattern = (char: string): SegmentPattern => {
    if (/\d/.test(char)) return [...DIGITS[parseInt(char)]];
    if (char === '+') return [...OPERATORS['+']];
    if (char === '-') return [...OPERATORS['-']];
    if (char === '=') return [...EQUALS_SIGN];
    return [0, 0, 0, 0, 0, 0, 0];
};

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

export const solveEquationOriginal = (equation: string): string[] => {
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

// Benchmark
const runBenchmark = () => {
    const equations = [
        '6+4=4',
        '9+3=4',
        '8-5=3',
        '1+1=3',
        '5+7=2'
    ];

    console.log('Running benchmark...');
    const start = performance.now();
    let totalSolutions = 0;
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
        for (const eq of equations) {
            const solutions = solveEquationOriginal(eq);
            totalSolutions += solutions.length;
        }
    }

    const end = performance.now();
    console.log(`Completed ${iterations} iterations over ${equations.length} equations.`);
    console.log(`Total solutions found: ${totalSolutions}`);
    console.log(`Total time: ${(end - start).toFixed(2)}ms`);
    console.log(`Average time per solve: ${((end - start) / (iterations * equations.length)).toFixed(2)}ms`);
};

runBenchmark();
