export type Operator = '+' | '-';

export interface ParsedEquation {
  a: number;
  op: Operator;
  b: number;
  c: number;
}

export type SegmentPattern = [number, number, number, number, number, number, number];

export interface SolutionHighlights {
  removalPatterns: SegmentPattern[];
  additionPatterns: SegmentPattern[];
}
