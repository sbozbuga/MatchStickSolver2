import { generateRandomPuzzle } from './src/utils.js';

const start = performance.now();
for (let i = 0; i < 100; i++) {
    // Clear cache to force regeneration
    // Oh wait, CACHED_PUZZLES is not exported and it caches permanently.
}
