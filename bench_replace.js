import { performance } from 'perf_hooks';

function originalReplace(eq) {
    return eq.replace(/\s/g, '').split('').filter(c => c !== '=');
}

function originalSplitJoin(eq) {
    return eq.split(' ').join('').split('').filter(c => c !== '=');
}

function optimizedLoop(eq) {
    const chars = [];
    for (let i = 0; i < eq.length; i++) {
        const c = eq[i];
        if (c !== ' ' && c !== '=' && c !== '\t' && c !== '\n' && c !== '\r') {
            chars.push(c);
        }
    }
    return chars;
}

const eq1 = "6 + 4 = 4";
const eq2 = " 1 + 2 = 3 ";
const eq3 = "8-5=3";

console.log(originalReplace(eq1), originalSplitJoin(eq1), optimizedLoop(eq1));

const ITER = 1000000;

let t0 = performance.now();
for (let i = 0; i < ITER; i++) {
    originalReplace(eq1);
    originalReplace(eq2);
    originalReplace(eq3);
}
console.log("Original Replace:", performance.now() - t0);

t0 = performance.now();
for (let i = 0; i < ITER; i++) {
    originalSplitJoin(eq1);
    originalSplitJoin(eq2);
    originalSplitJoin(eq3);
}
console.log("Split Join:", performance.now() - t0);

t0 = performance.now();
for (let i = 0; i < ITER; i++) {
    optimizedLoop(eq1);
    optimizedLoop(eq2);
    optimizedLoop(eq3);
}
console.log("Optimized Loop:", performance.now() - t0);
