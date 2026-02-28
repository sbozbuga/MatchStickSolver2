## 2023-10-24 - Unsafe eval() in Expression Evaluation
**Vulnerability:** Direct usage of `eval()` to calculate mathematical equations in `QuizWorkspace.tsx` and `SolverWorkspace.tsx`.
**Learning:** Even if the input space seems constrained by character-to-pattern matching, using `eval()` leaves the door open to arbitrary code execution if validation fails or is bypassed.
**Prevention:** Always use a dedicated, strict parser (like a simple loop over matched digits/operators) for evaluating user-provided math expressions, avoiding `eval()` or `new Function()` entirely.

## 2025-02-28 - Unbound String Parsing in Expression Evaluation
**Vulnerability:** The expression evaluator in `safeEvaluate` (`src/utils.ts`) lacked input length validation, posing a Denial of Service (DoS) risk via algorithmic complexity or memory exhaustion when parsing unusually large strings.
**Learning:** Even simple logic that uses string splits and parsing can be prone to DoS when inputs are unbounded. The lack of constraint is particularly risky because user input is manipulated mathematically without prior limits.
**Prevention:** Always enforce a maximum length limit (e.g., `expr.length > 50`) on inputs parsed by mathematical evaluation logic to mitigate DoS vulnerabilities efficiently.
