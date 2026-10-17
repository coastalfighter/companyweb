"use client";

import { CustomCursor } from "./custom-cursor";
import { MagneticField } from "./magnetic-field";
import { PointerSurfaces } from "./pointer-surfaces";

/** Everything that only a mouse or trackpad ever uses, as one lazily loaded chunk. */
export default function PointerLayer() {
  return (
    <>
      <PointerSurfaces />
      <MagneticField />
      <CustomCursor />
    </>
  );
}
