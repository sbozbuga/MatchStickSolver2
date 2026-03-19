const CHAR_CODE_0 = 48;
const CHAR_CODE_9 = 57;
const CHAR_CODE_PLUS = 43;
const CHAR_CODE_MINUS = 45;

export function evaluateExpression(expr: string): number | null {
    if (!expr) return null;

    let result = 0;
    let currentNum = 0;
    let hasNum = false;
    let currentOp = 1;

    for (let i = 0; i < expr.length; i++) {
        const charCode = expr.charCodeAt(i);

        if (charCode >= CHAR_CODE_0 && charCode <= CHAR_CODE_9) {
            currentNum = currentNum * 10 + (charCode - CHAR_CODE_0);
            hasNum = true;
        } else if (charCode === CHAR_CODE_PLUS) {
            if (!hasNum) return null;
            result += currentOp * currentNum;
            currentOp = 1;
            currentNum = 0;
            hasNum = false;
        } else if (charCode === CHAR_CODE_MINUS) {
            if (!hasNum) return null;
            result += currentOp * currentNum;
            currentOp = -1;
            currentNum = 0;
            hasNum = false;
        } else {
            return null; // Invalid character
        }
    }

    if (!hasNum) return null;
    return result + (currentOp * currentNum);
}
