import { performance } from 'perf_hooks';

// Case 1: with filter (c !== '=')
function origReplaceFilter(eq) {
    return eq.replace(/\s/g, '').split('').filter(c => c !== '=');
}
function optLoopFilter(eq) {
    const chars = [];
    for (let i = 0; i < eq.length; i++) {
        const c = eq.charCodeAt(i);
        if (c !== 32 && c !== 61 && c !== 9 && c !== 10 && c !== 13) {
            chars.push(eq[i]);
        }
    }
    return chars;
}

// Case 2: without filter (only remove space)
function origReplace(eq) {
    return eq.replace(/\s/g, '').split('');
}
function optLoop(eq) {
    const chars = [];
    for (let i = 0; i < eq.length; i++) {
        const c = eq.charCodeAt(i);
        if (c !== 32 && c !== 9 && c !== 10 && c !== 13) {
            chars.push(eq[i]);
        }
    }
    return chars;
}

const eq1 = "6 + 4 = 4";
const eq2 = " 1 + 2 = 3 ";
const eq3 = "8-5=3";

console.log(origReplaceFilter(eq1), optLoopFilter(eq1));
console.log(origReplace(eq1), optLoop(eq1));

const ITER = 1000000;

let t0 = performance.now();
for (let i = 0; i < ITER; i++) {
    origReplaceFilter(eq1);
    origReplaceFilter(eq2);
    origReplaceFilter(eq3);
}
console.log("Original Replace+Filter:", performance.now() - t0);

t0 = performance.now();
for (let i = 0; i < ITER; i++) {
    optLoopFilter(eq1);
    optLoopFilter(eq2);
    optLoopFilter(eq3);
}
console.log("Optimized Loop+Filter:", performance.now() - t0);

t0 = performance.now();
for (let i = 0; i < ITER; i++) {
    origReplace(eq1);
    origReplace(eq2);
    origReplace(eq3);
}
console.log("Original Replace:", performance.now() - t0);

t0 = performance.now();
for (let i = 0; i < ITER; i++) {
    optLoop(eq1);
    optLoop(eq2);
    optLoop(eq3);
}
console.log("Optimized Loop:", performance.now() - t0);
