# Accessibility, contrast and inclusive color

Accessibility is part of the brand experience. A beautiful palette that makes text unreadable or statuses ambiguous is not a successful UI palette.

## WCAG 2.2 contrast reference

| Content type | Level AA | Notes |
|---|---|---|
| Normal text | 4.5:1 minimum (SC 1.4.3) | Includes body text, labels, placeholders and text shown on hover/focus |
| Large text | 3:1 minimum | Roughly 24px regular or 18.66px (14pt) bold and above; verify the standard's size/weight definition |
| Meaningful non-text UI / graphics | Generally 3:1 where SC 1.4.11 applies | Visual information needed to identify controls, their states and meaningful graphics; check the exact criterion |
| Focus indicators | SC 2.4.7 visible focus (AA); SC 2.4.13 focus appearance (AAA) | Focus must be visible; aim for a ring with 3:1 against adjacent colors |
| Logotype text | Exempt from SC 1.4.3 | Narrow exemption; interactive logo controls should still be legible where possible |
| Enhanced (AAA) | 7:1 normal; 4.5:1 large (SC 1.4.6) | Stronger target when feasible, not the AA baseline |
| Use of color | SC 1.4.1 (A) | Color can't be the only means of conveying information |

Always calculate with `scripts/contrast.py`. For text over images, gradients or translucent layers, test the worst-case region of the actual background (or add a scrim and test against the scrim).

## Contrast in practice

| Weak example | Better direction | Rule |
|---|---|---|
| Pale grey text on white | Darker text token, or adjust the surface | Measure the exact pair; don't judge by eye |
| Blue link with low contrast | Accessible link variant and keep the underline | Color plus another interactive cue |
| Red error border only | Border + icon + explicit error text | Meaning must not depend on color alone |

When a ratio fails, give the specific fix: the nearest tonal step (or adjusted hex) that passes, recalculated, with before/after ratios. Prefer changing the less brand-critical side of the pair (usually the text or surface, not the brand accent).

## Dual encoding: status color plus another cue

- **Error:** icon + message (e.g. ● "Enter an email like name@example.com")
- **Success:** label + icon (✓ "Changes saved")
- **Warning:** text + symbol (! "Your trial ends in 3 days")

## Use redundant cues

- **Text:** label statuses, required fields, chart series and important categories.
- **Shape and icon:** pair status color with a recognizable symbol and an accessible name where needed.
- **Position:** don't rely on color alone for selected navigation or focus.
- **Pattern and line style:** differentiate chart series with solid/dashed lines, markers, patterns and direct labels.
- **Contrast:** test text and meaningful non-text elements; a hue difference alone isn't enough.
- **Simulation:** use color-vision simulators (protanopia, deuteranopia, tritanopia, achromatopsia) as a diagnostic, then validate with users and other methods.

## Beyond the contrast checker

A checker answers a narrow question about one pair. It doesn't show that the palette is understandable, culturally appropriate, usable in charts, or accessible in every state. Also check:
- focus visibility on every surface and theme
- zoom and reflow (colors and borders still distinguish elements at 200–400%)
- `prefers-contrast: more` and Windows forced-colors / high-contrast modes (custom colors are overridden; borders and focus must still exist)
- `prefers-color-scheme` light and dark
- that semantics (roles, names, states) exist in code, not only in color
- disabled states: exempt from contrast requirements, but must still be recognizable as disabled and not mistaken for enabled

## Data visualization

- Use a small, purpose-defined palette with differences in lightness, plus markers, line styles and direct labels.
- Avoid red/green alone for negative/positive; consider blue/orange plus signs (+/−) and labels.
- Sequential data: single-hue lightness ramp. Diverging: two hues with a neutral midpoint. Categorical: distinct hues with varied lightness, kept to a handful of series.
- Test with simulation, in grayscale, at real density, and in exports (PDF, print, slides).
- For full chart guidance, the `dataviz` skill complements this one.
