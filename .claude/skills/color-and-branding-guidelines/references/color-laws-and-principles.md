# Color laws and principles

> **Provenance.** The supplied PDF begins partway through section 04; sections 01–04 (which would hold the principle definitions) were not in the file. The entries below are written to the principle names the PDF's own quick-lookup table uses, drawing on WCAG 2.2, W3C Understanding documents, Material Design 3 and Apple HIG. The "Consistency without monotony" and "Real-world reference patterns" sections are from the PDF. Replace this file if the complete PDF becomes available.

Evidence labels: **Standard** (normative spec — WCAG, platform guidance) · **Research finding** (published study; check scope) · **Heuristic** (established design practice) · **Rule of thumb** (useful starting point, not a law).

---

## Perception and contrast

### Contrast Minimum
**Standard — WCAG 2.2 SC 1.4.3 (AA), 1.4.6 (AAA), 1.4.11 (non-text)**
- Text needs 4.5:1 against its background (3:1 for large text) at AA; 7:1 / 4.5:1 at AAA. Meaningful non-text UI and graphics generally need 3:1.
- Ratios are computed from relative luminance, not perceived hue difference. Two very different hues can have almost the same luminance and fail.
- **Apply:** calculate every pair with `scripts/contrast.py`; include placeholder, hover and focus text; test on every surface the text may sit on.
- **Failure:** pale grey body text; white text on mid-tone brand color; contrast judged by eye on a high-quality monitor.

### Color Context (simultaneous contrast)
**Research finding / Heuristic**
- The same color looks different depending on what surrounds it (lighter on dark, darker on light, shifted in hue next to strong colors). Swatches viewed alone don't predict how a color behaves in the UI.
- **Apply:** review colors on real components and content, on every allowed surface, overlay, image and gradient; check tokens against each other, not only against white.
- **Failure:** a grey that looked fine on a white artboard becomes unreadable on a tinted card; a color "drifts" next to a saturated hero.

### Lightness Contrast
**Heuristic grounded in vision science**
- Lightness (luminance) differences carry structure and legibility far more reliably than hue differences, and survive color-vision deficiency and grayscale.
- **Apply:** make chart series, states and hierarchy differ in lightness as well as hue; check designs in grayscale.
- **Failure:** red and green series of equal lightness; a selected row distinguished only by a hue shift.

### Tonal Scales
**Heuristic — Material Design 3 tonal palettes**
- Each hue needs a stepped scale of lightness (e.g. 50–950 or tone 0–100) so you can pick text, fill, border and surface variants that meet contrast, and remap them per theme.
- **Apply:** build tonal ramps before assigning roles; choose steps per role and theme; keep step spacing perceptually even (an OKLCH-based ramp helps).
- **Failure:** one brand hex used for everything — fill, text, border, and dark mode — with no accessible variants.

### Salience
**Research finding / Heuristic**
- Items that differ strongly from their surroundings (in color, lightness, size or position) draw attention first. Salience is relative: the more things are emphasized, the less any one stands out.
- **Apply:** give the primary action the strongest color contrast on the screen; keep competing elements quieter.
- **Failure:** several saturated buttons, badges and banners competing, so the real primary action is missed.

---

## Meaning and consistency

### Use of Color Is Not Enough
**Standard — WCAG 2.2 SC 1.4.1 Use of Color (A)**
- Color must not be the only visual means of conveying information, indicating an action, prompting a response or distinguishing an element.
- **Apply:** pair status color with text and an icon; underline inline links (or provide 3:1 against surrounding text plus a non-color cue on hover/focus); mark required fields in text; give chart series shapes, line styles or direct labels.
- **Failure:** a red border as the only error signal; selected tab shown only by color.

### Color-Vision Robustness
**Research finding / Standard-adjacent**
- A significant share of people have a color-vision deficiency (most commonly red–green; roughly 1 in 12 men and 1 in 200 women of Northern European ancestry, varying by population). Low vision, aging, glare and cheap displays also reduce color discrimination.
- **Apply:** avoid red/green-only encodings; vary lightness; add redundant cues; use simulators and grayscale as diagnostics, then validate with users.
- **Failure:** positive/negative shown as green/red only; a heat map whose legend can't be decoded.

### Semantic Color Consistency
**Heuristic — Apple HIG, Material Design**
- Once a color means something (action, success, danger, selected), keep that meaning everywhere. Users learn color roles; inconsistency breaks the learned meaning.
- **Apply:** define semantic roles once; never reuse the danger color decoratively or the success green for marketing.
- **Failure:** green as both "success" and a general accent, so "Changes saved" no longer stands out.

### Semantic Tokens
**Heuristic — design-token practice (Material, W3C Design Tokens Community Group)**
- Components reference role-named tokens (`action.primary.background`), not raw values (`blue.700`). Themes remap roles to values.
- **Apply:** see `palette-architecture-and-tokens.md`.
- **Failure:** hard-coded hex values scattered through components, making rebrands and dark mode a rewrite.

### Approved Pairings
**Heuristic**
- Document which foreground tokens may sit on which surfaces, with the tested ratio and intended use. Anything not on the list is unapproved until tested.
- **Apply:** publish a pairing matrix per theme; add new pairs only with calculated ratios.
- **Failure:** colors that each pass on white but are combined with each other in implementation and fail.

---

## Restraint and proportion

### Neutral Foundations
**Heuristic**
- Most interface area should be neutral (canvas, surfaces, text, borders) so content and the few meaningful accents are easy to read. Choose neutrals before adding accents.
- **Apply:** establish canvas, surface, text and border scales first; tint neutrals slightly toward the brand hue if it helps cohesion.
- **Failure:** brand color flooding backgrounds, headers and cards, leaving no room for emphasis.

### Limited Emphasis
**Heuristic**
- Reserve strong color for a small number of meaningful priorities per screen; emphasis loses power when used everywhere.
- **Apply:** one primary action per view; restrained badges; strong color for genuine warnings only.
- **Failure:** every button a different bright color; hierarchy collapses.

### 60–30–10 Is a Starting Point, Not a Law
**Rule of thumb**
- A dominant/secondary/accent split can help early exploration. It isn't a scientific law or an accessibility requirement; dense data products, image-led products, dark themes and expressive brands often need different proportions.
- **Apply:** let the screen's task and hierarchy set the mix; don't measure percentages.
- **Failure:** forcing exact proportions, or debating percentages instead of hierarchy.

### Palette Architecture
**Heuristic** — layered primitives → semantic → component → theme. Details in `palette-architecture-and-tokens.md`.

---

## Brand and culture

### Brand Color as Distinctive Asset
**Research finding (marketing science on distinctive brand assets) / Heuristic**
- A consistently used color can become a recognizable brand cue — but only through consistent, repeated use over time, and alongside other assets (logo, type, shape, imagery, voice).
- **Apply:** pick one recognizable accent and use it predictably for designated roles; protect it from dilution.
- **Failure:** changing the accent every campaign; using it so widely it stops signalling anything.

### Brand Identity for UI
**Heuristic**
- Translate brand attributes into observable interface decisions: color roles, type, shape and radius, imagery, iconography, spacing, motion and wording. Color is one asset among several.
- **Apply:** write 3–5 attributes, then for each, list concrete UI behaviors that express it.
- **Failure:** a brand that exists only as a hex code; marketing and product UI that feel like different companies.

### Theme / Platform Adaptation
**Standard-adjacent — Apple HIG, Material Design 3**
- Dark, light and increased-contrast modes need their own mappings of each semantic role. Mechanical inversion breaks contrast and meaning; saturated colors usually need lighter, less saturated variants on dark surfaces. Respect `prefers-color-scheme`, `prefers-contrast` and forced-colors modes.
- **Apply:** map every semantic token per theme; re-test every pair and state in each theme.
- **Failure:** inverted hex values; borders and muted text vanishing in dark mode; brand accent too dim or glaring on black.

### Cultural Context
**Research finding — e.g. Gao et al. 2007; Ou et al. 2012; Liu & Yang 2022, 2026**
- Color associations differ across cultures, markets and domains (red can signal danger, luck, celebration, loss or gain depending on context). Some responses are shared, many aren't.
- **Apply:** review target-market conventions (finance red/green, religious and national associations); research with target users before relying on an association.
- **Failure:** assuming one market's meaning is universal.

### Context-Dependent Emotion
**Research finding — interpret cautiously**
- Color–emotion associations exist on average in some studies but depend heavily on context, combination, culture and individual. No color reliably produces a specific emotion or behavior.
- **Apply:** frame color choices around positioning and audience, not "blue builds trust" claims.
- **Failure:** claiming a color will raise trust or conversion.

---

## From the PDF: consistency without monotony

- Keep identity stable: logo behavior, type hierarchy, primary accent, spacing logic, icon style, image treatment and voice.
- Allow variation within guardrails for campaigns, categories, charts and illustrations, as long as semantic meaning and accessibility remain clear.
- Use brand color selectively. A recognizable accent is more useful when its meaning is predictable than when it appears on every element.
- Treat color as one asset among several. Typography, shapes, photography, wording and interaction behavior reinforce identity.

## From the PDF: real-world reference patterns

- **Ooredoo (user-supplied 2014 brand guide).** Specifies red/grey primary colors and detailed logo, icon and CTA rules. The transferable lesson is governance and repeatability — not copying its palette into another brand.
- **Apple platform guidance.** Judicious color use, stable meanings for color roles, contrast, cultural context and light/dark adaptation — brand accent and platform semantics can coexist.
- **Material Design.** Role-based color maps palette values to functions (primary, surface, outline, semantic states) rather than using raw colors inconsistently.
