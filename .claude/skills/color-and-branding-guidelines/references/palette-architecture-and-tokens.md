# Palette architecture and design tokens

A robust UI palette has layers. Primitive colors define the available values; semantic tokens define what those values mean; components apply tokens to specific states. This separation lets a brand evolve without rewriting every component.

## Layers

| Layer | Example | Purpose |
|---|---|---|
| Primitive | `blue.700 = #2457C5` | Raw palette value; not necessarily safe in every context |
| Semantic | `action.primary.background` | Stable meaning mapped to a value in each theme |
| Component | `button.primary.label` | Component-specific application and state behavior |
| Theme / mode | light, dark, high-contrast | Maps semantic roles to suitable values for context |

Components reference semantic (or component) tokens only — never primitives or raw hex.

## Core token families

| Family | Suggested roles | Rules |
|---|---|---|
| Brand | `brand.primary`, `brand.secondary`, `brand.accent` | Identity expression and designated branded actions |
| Surface | `surface.canvas`, `surface.raised`, `surface.sunken`, `surface.overlay` | Clear hierarchy; don't rely only on shadows |
| Text | `text.primary`, `text.secondary`, `text.muted`, `text.inverse` | Test contrast on every allowed surface |
| Action | `action.primary`, `action.secondary`, `action.link`, `action.selected` | Keep interactive meaning consistent; define states |
| Status | `status.success`, `status.warning`, `status.danger`, `status.info` | Pair with text/icon; test foreground/background pairs |
| Structure | `border.default`, `divider.default`, `focus.ring` | Essential boundaries and focus cues must not be too faint |
| Data viz | `data.series.1…n`, `data.positive`, `data.negative` | Color-robust palettes plus direct labels and shapes |

Define state variants where relevant: `.hover`, `.pressed`, `.selected`, `.disabled`, `.focus`, plus `-subtle` backgrounds and `-strong` text variants for status colors.

Separate decorative from essential structure: a `border.subtle` for decorative dividers may be low-contrast; a `border.control` that identifies an input's boundary needs 3:1 against adjacent colors (WCAG SC 1.4.11).

## Palette construction workflow

1. Start with candidate brand hues grounded in positioning and existing assets.
2. Build tonal variants for surfaces, text, borders, accents and themes.
3. Choose neutral backgrounds and text colors before adding many accents.
4. Define semantic colors separately from brand colors — a brand red is not automatically the right error red.
5. Create approved foreground/background pairings and test them with `scripts/contrast.py`.
6. Test actual components: buttons, links, cards, fields, badges, charts, selected rows, focus rings, empty states and notifications.
7. Document each token's role, allowed use and prohibited combinations.

## Palette proportion

60/30/10 can be a starting point for visual balance, but it is not a law. Dense data products, image-led products, dark themes and expressive brands may need different proportions. Let the screen's task and hierarchy set the mix.

## Theme mapping

Map each semantic role to a value per theme. Never mechanically invert. On dark surfaces, saturated brand colors usually need a lighter, less saturated variant for text and a separate variant for fills; borders and muted text need re-testing because they commonly fade.

## Implementation (CSS / Tailwind)

```css
:root {
  --surface-canvas: #F7F8FA;
  --text-primary: #172033;
  --action-primary-bg: #2457C5;
  --action-primary-label: #FFFFFF;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --surface-canvas: #10141C;
    --text-primary: #F2F5F9;
    --action-primary-bg: #8FB0FF;
    --action-primary-label: #10141C; /* white fails on this fill: 2.13:1 */
  }
}
:root[data-theme="dark"] { /* same dark values, for an explicit toggle */ }
@media (forced-colors: active) {
  /* Let system colors win; ensure borders/focus rings use currentColor or system keywords */
}
```

Expose the same variables to Tailwind / shadcn theme config so utilities reference roles (`bg-action-primary`), not primitives (`bg-blue-700`).

## Brand palette brief template

| Field | What to document |
|---|---|
| Brand attributes | 3–5 desired perceptions, translated into observable visual behaviors |
| Core colors | Primary/secondary/accent HEX, RGB, color space, approved use and restrictions |
| Neutral scale | Canvas, surface, text, muted text, border, divider, overlay, inverse |
| Semantic palette | Success, warning, danger, info, selected, focus, disabled and chart roles |
| Approved pairings | Foreground/background combinations with calculated ratios and intended use |
| Themes and states | Light/dark, hover, focus, pressed, disabled, loading, error, success, selected |
| Ownership | Decision-maker, approval workflow, version, date and exception process |
