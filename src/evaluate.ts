import {
  CHAR_CODE_0,
  CHAR_CODE_9,
  CHAR_CODE_PLUS,
  CHAR_CODE_MINUS,
} from "./constants";

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

export function evaluateCharArray(
    chars: (string | null)[],
    start: number,
    end: number,
): number | null {
    if (start >= end) return null;

    let result = 0;
    let currentNum = 0;
    let hasNum = false;
    let currentOp = 1;

    for (let i = start; i < end; i++) {
        const char = chars[i];
        if (char === null) return null;

        const charCode = char.charCodeAt(0);

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
