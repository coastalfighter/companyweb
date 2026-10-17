#!/usr/bin/env python3
"""WCAG 2.x contrast ratio calculator.

Usage:
  contrast.py FG BG [FG BG ...]       check one or more foreground/background pairs
  contrast.py --json FG BG [...]      same, as JSON

Colors are hex: #RGB, #RRGGBB, or #RRGGBBAA (alpha is composited over BG).
Ratios follow the WCAG 2.2 relative-luminance definition and are reported to two
decimals, truncated rather than rounded so a pair is never reported as passing
when it does not (e.g. 4.499 reports 4.49, not 4.50).
"""

from __future__ import annotations

import json
import math
import re
import sys
from dataclasses import asdict, dataclass

HEX_RE = re.compile(r"^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")

THRESHOLDS = {
    "aa_normal_text": 4.5,
    "aa_large_text": 3.0,
    "aa_non_text": 3.0,
    "aaa_normal_text": 7.0,
    "aaa_large_text": 4.5,
}


def parse_hex(value: str) -> tuple[float, float, float, float]:
    """Return (r, g, b, a) with channels in 0..1. Raises ValueError on bad input."""
    match = HEX_RE.match(value.strip())
    if not match:
        raise ValueError(f"Not a hex color: {value!r} (use #RGB, #RRGGBB or #RRGGBBAA)")
    digits = match.group(1)
    if len(digits) == 3:
        digits = "".join(c * 2 for c in digits)
    channels = [int(digits[i : i + 2], 16) / 255 for i in range(0, len(digits), 2)]
    if len(channels) == 3:
        channels.append(1.0)
    r, g, b, a = channels
    return r, g, b, a


def composite(fg: tuple[float, float, float, float], bg: tuple[float, float, float, float]) -> tuple[float, float, float]:
    """Alpha-composite fg over an opaque bg."""
    if bg[3] < 1.0:
        raise ValueError("Background must be opaque; composite it over its own backdrop first.")
    a = fg[3]
    return tuple(fg[i] * a + bg[i] * (1 - a) for i in range(3))  # type: ignore[return-value]


def _linearize(channel: float) -> float:
    return channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4


def relative_luminance(rgb: tuple[float, float, float]) -> float:
    r, g, b = (_linearize(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(fg_hex: str, bg_hex: str) -> float:
    bg = parse_hex(bg_hex)
    fg_rgb = composite(parse_hex(fg_hex), bg)
    l1 = relative_luminance(fg_rgb)
    l2 = relative_luminance(bg[:3])
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


@dataclass
class Result:
    foreground: str
    background: str
    ratio: float
    aa_normal_text: bool
    aa_large_text: bool
    aa_non_text: bool
    aaa_normal_text: bool
    aaa_large_text: bool


def evaluate(fg_hex: str, bg_hex: str) -> Result:
    raw = contrast_ratio(fg_hex, bg_hex)
    ratio = math.floor(raw * 100) / 100
    # Compare against the unrounded value so truncation never flips a result.
    passes = {name: raw >= limit for name, limit in THRESHOLDS.items()}
    return Result(fg_hex.upper(), bg_hex.upper(), ratio, **passes)


def _mark(ok: bool) -> str:
    return "pass" if ok else "FAIL"


def main(argv: list[str]) -> int:
    as_json = "--json" in argv
    args = [a for a in argv if a != "--json"]
    if not args or len(args) % 2:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    try:
        results = [evaluate(args[i], args[i + 1]) for i in range(0, len(args), 2)]
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    if as_json:
        print(json.dumps([asdict(r) for r in results], indent=2))
        return 0
    print(f"{'FG':<10} {'BG':<10} {'Ratio':>7}  AA-text  AA-large/UI  AAA-text")
    for r in results:
        print(
            f"{r.foreground:<10} {r.background:<10} {r.ratio:>6.2f}:1  "
            f"{_mark(r.aa_normal_text):<7}  {_mark(r.aa_large_text):<11}  {_mark(r.aaa_normal_text)}"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
