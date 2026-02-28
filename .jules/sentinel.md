## 2023-10-24 - Unsafe eval() in Expression Evaluation
**Vulnerability:** Direct usage of `eval()` to calculate mathematical equations in `QuizWorkspace.tsx` and `SolverWorkspace.tsx`.
**Learning:** Even if the input space seems constrained by character-to-pattern matching, using `eval()` leaves the door open to arbitrary code execution if validation fails or is bypassed.
**Prevention:** Always use a dedicated, strict parser (like a simple loop over matched digits/operators) for evaluating user-provided math expressions, avoiding `eval()` or `new Function()` entirely.
