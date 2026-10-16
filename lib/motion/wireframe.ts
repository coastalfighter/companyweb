/**
 * A tiny wireframe engine for the homepage "Engine Room" hero: geometry, rotation and
 * perspective projection for a Canvas 2D renderer. No WebGL and no three.js (~150 KB):
 * the shape is a few hundred lines, and 2D canvas strokes them comfortably at 60fps.
 * Pure functions, unit tested (lib/motion/wireframe.test.ts).
 */

export type Vec3 = readonly [number, number, number];
export type Edge = readonly [number, number];

export interface Mesh {
  vertices: Vec3[];
  edges: Edge[];
}

/** A torus: `major` segments around the ring, `minor` around the tube; both edge directions. */
export function torus(R: number, r: number, major: number, minor: number): Mesh {
  const vertices: Vec3[] = [];
  const edges: Edge[] = [];
  for (let i = 0; i < major; i++) {
    const u = (i / major) * Math.PI * 2;
    for (let j = 0; j < minor; j++) {
      const v = (j / minor) * Math.PI * 2;
      vertices.push([
        (R + r * Math.cos(v)) * Math.cos(u),
        (R + r * Math.cos(v)) * Math.sin(u),
        r * Math.sin(v),
      ]);
    }
  }
  const at = (i: number, j: number) => (i % major) * minor + (j % minor);
  for (let i = 0; i < major; i++) {
    for (let j = 0; j < minor; j++) {
      edges.push([at(i, j), at(i + 1, j)]);
      edges.push([at(i, j), at(i, j + 1)]);
    }
  }
  return { vertices, edges };
}

/** A regular icosahedron (12 vertices, 30 edges) scaled to circumradius `scale`. */
export function icosahedron(scale: number): Mesh {
  const t = (1 + Math.sqrt(5)) / 2;
  const raw: Vec3[] = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1],
  ];
  const norm = Math.hypot(1, t);
  const vertices = raw.map(
    ([x, y, z]) => [(x / norm) * scale, (y / norm) * scale, (z / norm) * scale] as const,
  );
  // Edges join vertices at the minimum distance (2 before normalising).
  const edges: Edge[] = [];
  for (let a = 0; a < raw.length; a++) {
    for (let b = a + 1; b < raw.length; b++) {
      const [ax, ay, az] = raw[a]!;
      const [bx, by, bz] = raw[b]!;
      if (Math.abs(Math.hypot(ax - bx, ay - by, az - bz) - 2) < 1e-6) edges.push([a, b]);
    }
  }
  return { vertices, edges };
}

/** Rotates around X, then Y, then Z (radians). */
export function rotate([x, y, z]: Vec3, rx: number, ry: number, rz: number): Vec3 {
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const cz = Math.cos(rz);
  const sz = Math.sin(rz);
  const y1 = y * cx - z * sx;
  const z1 = y * sx + z * cx;
  const x2 = x * cy + z1 * sy;
  const z2 = -x * sy + z1 * cy;
  return [x2 * cz - y1 * sz, x2 * sz + y1 * cz, z2];
}

/**
 * Perspective projection onto a canvas centred at (cx, cy). `focal` is the pixel scale
 * of a unit at depth 0; the camera sits at +`camera` on z looking at the origin.
 * Returns screen x, y and the depth z (positive = nearer the viewer).
 */
export function project(
  [x, y, z]: Vec3,
  cx: number,
  cy: number,
  focal: number,
  camera = 4,
): [number, number, number] {
  const k = camera / (camera - z);
  return [cx + x * focal * k, cy - y * focal * k, z];
}

/** Maps depth to a stroke alpha bucket (0 = farthest … buckets-1 = nearest). */
export function depthBucket(z: number, extent: number, buckets: number): number {
  const t = Math.min(Math.max((z + extent) / (2 * extent), 0), 1);
  return Math.min(buckets - 1, Math.floor(t * buckets));
}
