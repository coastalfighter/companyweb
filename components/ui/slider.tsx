"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface SliderProps {
  id: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Change by this much on PageUp / PageDown (blueprint G: ±10). */
  pageStep?: number;
  onValueChange: (value: number) => void;
  /** Spoken value, e.g. "25 hours a week". */
  valueText: string;
  /** Short value shown in the drag tooltip, e.g. "25h". */
  tooltip: string;
  "aria-describedby"?: string;
  className?: string;
}

/**
 * Slider (docs/blueprint/07-component-library.md, G4 `<Slider>`): native range
 * input (free keyboard and screen-reader support) with a 4px track, a lime fill,
 * a 20px Paper thumb, a value tooltip while dragging, and PageUp/PageDown ±10.
 */
export function Slider({
  id,
  value,
  min,
  max,
  step = 1,
  pageStep = 10,
  onValueChange,
  valueText,
  tooltip,
  className,
  ...aria
}: SliderProps) {
  const [dragging, setDragging] = useState(false);
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "PageUp" && event.key !== "PageDown") return;
    event.preventDefault();
    const delta = event.key === "PageUp" ? pageStep : -pageStep;
    onValueChange(Math.min(max, Math.max(min, value + delta)));
  };

  return (
    <div className={cn("relative pt-1", className)}>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(event) => onValueChange(Number(event.target.value))}
        onKeyDown={onKeyDown}
        onPointerDown={() => setDragging(true)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onBlur={() => setDragging(false)}
        className="range-input w-full"
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
        {...aria}
      />
      {dragging ? (
        <span
          aria-hidden
          className="tabular pointer-events-none absolute -top-7 -translate-x-1/2 rounded-xs bg-surface-3 px-1.5 py-0.5 font-mono text-caption text-fg shadow-e2"
          style={{ left: `calc(${fill}% + ${10 - fill * 0.2}px)` }}
        >
          {tooltip}
        </span>
      ) : null}
    </div>
  );
}
