export type SegmentPattern = [number, number, number, number, number, number, number];

export interface HistoryEntry {
  id: string;
  equation: string;
  solutions: string[];
}

export interface SolutionHighlights {
  removalPatterns: SegmentPattern[];
  additionPatterns: SegmentPattern[];
}
