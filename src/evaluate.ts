import {
  CHAR_CODE_0,
  CHAR_CODE_9,
  CHAR_CODE_PLUS,
  CHAR_CODE_MINUS,
} from "./constants";

function coreEvaluate(length: number, getCharCode: (index: number) => number): number | null {
    let result = 0;
    let currentNum = 0;
    let hasNum = false;
    let currentOp = 1;

    for (let i = 0; i < length; i++) {
        const charCode = getCharCode(i);

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
    return coreEvaluate(end - start, (i) => {
        const char = chars[start + i];
        return char === null ? -1 : char.charCodeAt(0);
    });
}
