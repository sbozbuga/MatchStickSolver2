
import { patternToChar } from './src/utils';
import { DIGITS, EQUALS_SIGN, OPERATORS } from './src/constants';
import type { SegmentPattern } from './src/types';

const patterns: SegmentPattern[] = [
  ...Object.values(DIGITS),
  EQUALS_SIGN,
  OPERATORS['+'],
  OPERATORS['-'],
  [0, 0, 0, 0, 0, 0, 0] as SegmentPattern
];

const iterations = 10_000_000;

const start = performance.now();
for (let i = 0; i < iterations; i++) {
  const p = patterns[i % patterns.length];
  patternToChar(p, '');
}
const end = performance.now();

console.log(`patternToChar took: ${(end - start).toFixed(2)} ms for ${iterations} iterations`);
