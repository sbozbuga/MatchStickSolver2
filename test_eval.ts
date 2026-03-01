import { safeEvaluate } from './src/utils';
const start = performance.now();
for(let i=0; i<100000; i++) {
    safeEvaluate('6+4');
}
console.log(performance.now() - start);
