export type SegmentPattern = [number, number, number, number, number, number, number];

export interface SolutionHighlights {
  removalPatterns: SegmentPattern[];
  additionPatterns: SegmentPattern[];
}
