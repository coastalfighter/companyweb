/**
 * A coarse dot-matrix world map for the About "Where we work" band (blueprint 8.6):
 * deliberately low-resolution, not a globe. Each row lists the land column ranges
 * at that latitude band; columns are 6° of longitude (-180 → 180), rows are 6.5° of
 * latitude (78°N → 52°S).
 */

export const MAP_COLUMNS = 60;
const LAT_TOP = 78;
const LAT_STEP = 6.5;
const LON_STEP = 6;

// prettier-ignore
const landRows: readonly (readonly [number, number])[][] = [
  [[21, 24], [40, 50]],
  [[2, 5], [9, 18], [20, 25], [30, 32], [33, 56]],
  [[1, 6], [7, 19], [21, 24], [26, 26], [29, 32], [33, 58]],
  [[5, 19], [28, 29], [30, 35], [34, 56]],
  [[7, 17], [28, 36], [36, 54], [56, 56]],
  [[8, 17], [18, 18], [29, 36], [36, 53], [54, 54]],
  [[9, 17], [28, 30], [31, 36], [36, 52], [54, 54]],
  [[10, 16], [28, 35], [36, 40], [41, 51]],
  [[10, 14], [15, 15], [27, 36], [36, 39], [41, 44], [45, 50]],
  [[11, 14], [16, 16], [27, 37], [37, 39], [42, 44], [46, 49], [50, 51]],
  [[13, 15], [27, 38], [43, 43], [47, 49], [50, 51]],
  [[16, 19], [28, 37], [47, 48]],
  [[16, 21], [31, 37], [46, 52]],
  [[16, 23], [32, 37], [48, 55]],
  [[17, 23], [32, 37], [39, 39], [50, 53]],
  [[18, 23], [32, 36], [39, 39], [48, 55]],
  [[18, 22], [32, 36], [48, 55]],
  [[18, 21], [33, 35], [49, 54]],
  [[18, 20], [52, 53], [58, 58]],
  [[18, 19], [57, 57]],
  [[18, 18]],
];

export const MAP_ROWS = landRows.length;

export interface Dot {
  col: number;
  row: number;
}

/** Every land dot on the map (ranges may overlap; each cell appears once). */
export const landDots: readonly Dot[] = Array.from(
  new Set(landRows.flatMap((ranges, row) => ranges.flatMap(([from, to]) => cells(from, to, row)))),
).map((key) => {
  const [col, row] = key.split(":").map(Number) as [number, number];
  return { col, row };
});

function cells(from: number, to: number, row: number): string[] {
  return Array.from({ length: to - from + 1 }, (_, i) => `${from + i}:${row}`);
}

/** The map cell for a coordinate, clamped to the grid. */
export function project(lat: number, lon: number): Dot {
  const col = Math.round((lon + 180) / LON_STEP);
  const row = Math.round((LAT_TOP - lat) / LAT_STEP);
  return {
    col: Math.min(MAP_COLUMNS - 1, Math.max(0, col)),
    row: Math.min(MAP_ROWS - 1, Math.max(0, row)),
  };
}
