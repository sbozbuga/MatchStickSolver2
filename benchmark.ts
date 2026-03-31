const pattern = [
  [1, 1, 1, 0, 1, 1, 1], // 0
  [0, 0, 1, 0, 0, 1, 0], // 1
  [1, 0, 1, 1, 1, 0, 1], // 2
  [1, 0, 1, 1, 0, 1, 1], // 3
  [0, 1, 1, 1, 0, 1, 0], // 4
  [1, 1, 0, 1, 0, 1, 1], // 5
  [1, 1, 0, 1, 1, 1, 1], // 6
  [1, 0, 1, 0, 0, 1, 0], // 7
  [1, 1, 1, 1, 1, 1, 1], // 8
  [1, 1, 1, 1, 0, 1, 1], // 9
];

// simulate typical puzzle size ~ 15-20 characters
const patterns = Array.from({ length: 20 }, () => pattern[Math.floor(Math.random() * pattern.length)]);

function method1(patterns: number[][]) {
  return patterns.flat().reduce((sum, v) => sum + v, 0);
}

function method2(patterns: number[][]) {
  let count = 0;
  for (let i = 0; i < patterns.length; i++) {
    const p = patterns[i];
    for (let j = 0; j < p.length; j++) {
      count += p[j];
    }
  }
  return count;
}

const iterations = 1_000_000;

const start1 = performance.now();
for (let i = 0; i < iterations; i++) {
  method1(patterns);
}
const end1 = performance.now();

const start2 = performance.now();
for (let i = 0; i < iterations; i++) {
  method2(patterns);
}
const end2 = performance.now();

console.log(`Method 1 (flat.reduce): ${(end1 - start1).toFixed(2)} ms`);
console.log(`Method 2 (nested loop): ${(end2 - start2).toFixed(2)} ms`);
console.log(`Improvement: ${((end1 - start1) / (end2 - start2)).toFixed(2)}x faster`);
