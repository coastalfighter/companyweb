"use client";

import { siteConfig } from "@/lib/site";

/**
 * Last-resort error page for failures in the root layout itself. It replaces the
 * whole document and gets no global CSS, so it is styled inline in the brand colors.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const reference =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : undefined;
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0a0a0a",
          color: "#f4f4f5",
          font: "16px/1.5 system-ui, sans-serif",
        }}
      >
        <title>{`Something broke · ${siteConfig.name}`}</title>
        <main style={{ maxWidth: "34rem", padding: "2rem" }}>
          <h1 style={{ fontSize: "2rem", lineHeight: 1.15, margin: "0 0 1rem" }}>
            Something broke on our side.
          </h1>
          <p style={{ color: "#a3a3ad", margin: "0 0 1.5rem" }}>
            It&apos;s been logged and it&apos;s ours to fix. Try again, or email{" "}
            <a href={`mailto:${siteConfig.email}`} style={{ color: "#a3e635" }}>
              {siteConfig.email}
            </a>
            .
          </p>
          {reference ? (
            <p style={{ color: "#a3a3ad", fontFamily: "ui-monospace, monospace", fontSize: "0.8rem" }}>
              Reference: {reference}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "1rem",
              background: "#a3e635",
              color: "#0a0a0a",
              border: 0,
              borderRadius: "8px",
              padding: "0.75rem 1.25rem",
              font: "inherit",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
