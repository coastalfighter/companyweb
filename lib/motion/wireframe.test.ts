import { describe, expect, it } from "vitest";
import { depthBucket, icosahedron, project, rotate, torus } from "./wireframe";

describe("wireframe geometry", () => {
  it("builds a closed torus grid", () => {
    const mesh = torus(1, 0.36, 40, 14);
    expect(mesh.vertices).toHaveLength(40 * 14);
    expect(mesh.edges).toHaveLength(40 * 14 * 2);
    for (const [a, b] of mesh.edges) {
      expect(a).toBeLessThan(mesh.vertices.length);
      expect(b).toBeLessThan(mesh.vertices.length);
    }
  });

  it("builds a regular icosahedron at the given radius", () => {
    const mesh = icosahedron(0.42);
    expect(mesh.vertices).toHaveLength(12);
    expect(mesh.edges).toHaveLength(30);
    for (const [x, y, z] of mesh.vertices) expect(Math.hypot(x, y, z)).toBeCloseTo(0.42, 6);
  });

  it("rotates without changing length", () => {
    const v = [0.3, -0.7, 0.2] as const;
    const r = rotate(v, 0.4, 1.1, -0.6);
    expect(Math.hypot(...r)).toBeCloseTo(Math.hypot(...v), 10);
    expect(rotate([1, 0, 0], 0, Math.PI / 2, 0)[2]).toBeCloseTo(-1, 10);
  });

  it("projects the origin to the centre and nearer points larger", () => {
    expect(project([0, 0, 0], 200, 100, 50)).toEqual([200, 100, 0]);
    const near = project([1, 0, 1], 0, 0, 50);
    const far = project([1, 0, -1], 0, 0, 50);
    expect(near[0]).toBeGreaterThan(far[0]);
    // Screen y grows downward.
    expect(project([0, 1, 0], 0, 0, 50)[1]).toBeLessThan(0);
  });

  it("buckets depth from far (0) to near (n-1), clamped", () => {
    expect(depthBucket(-1.4, 1.4, 7)).toBe(0);
    expect(depthBucket(1.4, 1.4, 7)).toBe(6);
    expect(depthBucket(9, 1.4, 7)).toBe(6);
    expect(depthBucket(0, 1.4, 7)).toBe(3);
  });
});
