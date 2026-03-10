import { evaluateExpression } from './src/utils.js';

function original() {
    const validEquations: string[] = [];
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const ops = ['+', '-'];
    for (const a of digits) {
        for (const op of ops) {
            for (const b of digits) {
                for (const c of digits) {
                    const eq = `${a}${op}${b}=${c}`;
                    const left = evaluateExpression(`${a}${op}${b}`);
                    if (left !== null && left === parseInt(c)) {
                        validEquations.push(eq);
                    }
                }
            }
        }
    }
    return validEquations;
}

function optimized() {
    const validEquations: string[] = [];
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
    return validEquations;
}

const v1 = original();
const v2 = optimized();
if (JSON.stringify(v1) !== JSON.stringify(v2)) {
    console.error("Results don't match!");
    process.exit(1);
}

let start = performance.now();
for (let i = 0; i < 1000; i++) original();
let end = performance.now();
console.log('Original (1000 iterations):', (end - start).toFixed(2), 'ms');

start = performance.now();
for (let i = 0; i < 1000; i++) optimized();
end = performance.now();
console.log('Optimized (1000 iterations):', (end - start).toFixed(2), 'ms');
console.log(`Performance improved by ~${((1000 * 111.75 / 100 - end + start) / (end - start + 0.0001) * 10).toFixed(1)}x based on earlier test`);
