/** A client logo at equal optical weight; dashed placeholder when `src` is empty (preview only). */
export function ClientLogoMark({ name, src, aspect }: { name: string; src: string; aspect: number }) {
  // Wide wordmarks get 24px height, square marks 32px (equal optical weight, blueprint E2.1).
  const height = aspect > 2.5 ? 24 : 32;
  const width = Math.round(height * aspect);
  if (!src) {
    // Sample placeholder (design review only).
    return (
      <span
        className="grid place-items-center rounded-xs border border-dashed border-ink-500 font-mono text-[0.625rem] text-fg-subtle"
        style={{ width, height }}
      >
        {name}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- monochrome SVG logos, sized explicitly
    <img
      src={src}
      alt={name}
      width={width}
      height={height}
      className="opacity-70 transition-opacity hover:opacity-100"
    />
  );
}
