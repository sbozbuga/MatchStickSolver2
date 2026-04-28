import React from "react";
import type { SegmentPattern } from "../types";
import { EqualsSign } from "./EqualsSign";

interface SegmentDisplayProps {
  char: string;
  pattern: SegmentPattern;
  size: { width: number; height: number };
  // Props for interactive mode (QuizWorkspace)
  onSegmentPointerDown?: (segmentIndex: number, e: React.PointerEvent) => void;
  hoveredSegmentIndex?: number | null;
  dataCharIndex?: number;
  // Props for static mode (SolverWorkspace)
  originalPattern?: SegmentPattern;
}

export const SegmentDisplay: React.FC<SegmentDisplayProps> = ({
  char,
  pattern,
  size,
  onSegmentPointerDown,
  hoveredSegmentIndex,
  dataCharIndex,
  originalPattern,
}) => {
  if (char === "=") {
    return <EqualsSign size={size} />;
  }

  const isOperator = char === "+" || char === "-";
  const segments = isOperator
    ? [
        { index: 1, d: "M 25 30 V 50" }, // Vertical
        { index: 3, d: "M 15 40 H 35" }, // Horizontal
      ]
    : [
        { index: 0, d: "M 10 10 H 40" },
        { index: 1, d: "M 10 10 V 40" },
        { index: 2, d: "M 40 10 V 40" },
        { index: 3, d: "M 10 40 H 40" },
        { index: 4, d: "M 10 40 V 70" },
        { index: 5, d: "M 40 40 V 70" },
        { index: 6, d: "M 10 70 H 40" },
      ];

  return (
    <svg
      viewBox="0 0 50 80"
      style={size}
      className={`stroke-current ${!originalPattern ? "text-amber-400" : ""}`}
      strokeWidth="4"
      strokeLinecap="round"
    >
      {segments.map((seg) => {
        const segmentIndex = seg.index;
        const isActive = pattern[segmentIndex] === 1;
        const isHovered = hoveredSegmentIndex === segmentIndex;

        // Static mode coloring (SolverWorkspace)
        if (originalPattern) {
          const wasActive = originalPattern[segmentIndex] === 1;
          let colorClass = "text-amber-400";
          if (isActive && !wasActive) colorClass = "text-emerald-400"; // Added stick
          if (!isActive && wasActive) colorClass = "text-rose-500 opacity-30"; // Removed stick
          if (!isActive && !wasActive) return null;

          return (
            <path
              key={segmentIndex}
              d={seg.d}
              className={`transition-opacity ${colorClass} ${isActive ? "opacity-100" : ""}`}
            />
          );
        }

        // Interactive mode (QuizWorkspace)
        const classes = `transition-opacity cursor-pointer ${
          isActive ? "opacity-100" : "opacity-10"
        }${isHovered ? " text-amber-200 opacity-50" : ""}`;

        return (
          <g key={segmentIndex}>
            <path
              d={seg.d}
              stroke="transparent"
              strokeWidth="8"
              onPointerDown={
                onSegmentPointerDown
                  ? (e) => onSegmentPointerDown(segmentIndex, e)
                  : undefined
              }
              data-char-index={dataCharIndex}
              data-segment-index={segmentIndex}
              style={{ pointerEvents: "auto" }}
            />
            <path
              d={seg.d}
              className={classes}
              style={{ pointerEvents: "none" }}
            />
          </g>
        );
      })}
    </svg>
  );
};
