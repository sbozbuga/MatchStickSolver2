import { solveEquation } from './src/solver';
const start = performance.now();
for(let i=0; i<5000; i++) {
    solveEquation('6+4=4');
}
console.log(performance.now() - start);
