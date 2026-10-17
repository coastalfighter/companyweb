# Examples, starter palettes and validation

## Applied patterns

Realistic scenarios, not claims about named companies' private design decisions. Adapt to audience, domain and evidence.

| Pattern | Approach | Example | Risk | Check |
|---|---|---|---|---|
| Primary and secondary actions | Brand accent for the main action; quieter outline/text style for secondary | One filled "Place order" button and a quieter "Continue shopping" link | Several saturated buttons compete, or the label lacks contrast | Hover, focus, pressed, disabled, loading states |
| Forms and validation | Semantic error styling with icon and explicit message | Invalid email: red border, error icon, clear instruction associated with the field | Red is the only cue, or the message is far from the field | Keyboard and screen-reader flow |
| Data visualization | Small purpose-defined palette varying lightness, markers, line styles, direct labels | Actual vs forecast: color plus solid/dashed lines | Red/green alone encodes negative/positive | Simulation, grayscale, density, exports |
| Navigation and links | Stable link/action token plus underline or familiar button shape | Inline links underlined in a tested link color; ordinary text styled separately | Decorative text looks interactive | Focus and contrast |
| Dark mode | Map semantic roles to dark variants; don't invert hex | Brand accent gets a brighter variant for text and a separate fill variant for controls | Borders, muted text and states fade | Test both themes |
| Brand landing page | Distinctive hero, restrained accents, clear CTA contrast, neutral reading space | Branded hero, then neutral feature sections and one clear trial action | Brand color floods every section; text over imagery unreadable | Mobile crops and overlays |
| Status and notifications | Semantic tokens with icon and explicit wording | Check icon + "Changes saved"; errors explain the problem and next step | Green used decoratively everywhere dilutes its meaning | Audit the semantic map |

## Starter palettes

Illustrative starting points for prototypes, not final brand recommendations and not pre-certified for every use. Ratios below were calculated with `scripts/contrast.py`.

### A. Neutral-first product palette

| Name | HEX | Suggested role | On white |
|---|---|---|---|
| Ink | `#172033` | Primary text on light surfaces | 16.26:1 — passes AAA |
| Blue | `#2457C5` | Brand accent (after testing) | 6.47:1 — passes AA text |
| Teal | `#12A594` | Restrained secondary use | 3.07:1 — **fails as text**; OK for large text, icons and fills with dark labels |
| Amber | `#F4A340` | Restrained secondary use | 2.06:1 — **fails as text and as non-text UI on white**; use as fill behind dark text, or darken for text |
| Red | `#B42318` | Semantic danger only, with labels | 6.57:1 — passes AA text |
| Green | `#16794B` | Semantic success only, with labels | 5.42:1 — passes AA text |

### B. Sample semantic tokens (light)

| Token | Value | Role | Caution |
|---|---|---|---|
| `surface.canvas` | `#F7F8FA` | Main page background | Test borders and cards against it |
| `surface.raised` | `#FFFFFF` | Cards and dialogs | Add boundaries or elevation where surfaces blend (canvas vs raised is very low contrast) |
| `text.primary` | `#172033` | Main text | 15.30:1 on canvas, 16.26:1 on raised |
| `action.primary.background` | `#2457C5` | Primary action fill | Test label and interaction states |
| `action.primary.label` | `#FFFFFF` | Text on action | 6.47:1 on the fill — passes AA |
| `status.danger` | `#B42318` | Error/danger accent | Don't use color alone |
| `status.success` | `#16794B` | Success accent | Avoid red/green-only comparisons |

### C. Theme mapping example

| Role | Light | Dark | Calculated notes |
|---|---|---|---|
| `surface.canvas` | `#F7F8FA` | `#10141C` | — |
| `surface.raised` | `#FFFFFF` | `#1B2230` | — |
| `text.primary` | `#172033` | `#F2F5F9` | Light 15.30:1 · Dark 16.86:1 on canvas, 14.56:1 on raised |
| `text.secondary` | `#5D6B7C` | `#C0CAD8` | Light 5.12:1 on canvas · Dark 11.13:1 on canvas, 9.62:1 on raised |
| `action.primary.background` | `#2457C5` | `#8FB0FF` | Dark fill **needs a dark label**: white on `#8FB0FF` is 2.13:1 (fails); `#10141C` on it is 8.62:1 |
| `border.default` | `#D9E0E8` | `#3A4558` | Light 1.25:1 on canvas · Dark 1.90:1 on canvas, 1.64:1 on raised — **decorative only**. Inputs and other controls whose boundary identifies them need a separate `border.control` at ≥3:1 |

The dark-theme values illustrate mapping only; don't copy them without testing in components.

## Testing methods

Palette quality can't be evaluated by aesthetic preference alone. Combine standards checks with task-based evidence and consistency audits.

| Method | Question answered | Limit |
|---|---|---|
| Contrast checker | Does this exact pair meet a threshold? | Doesn't assess every accessibility or usability issue |
| Color-vision simulation | Could some hue differences be hard to distinguish? | An approximation; not a replacement for user testing |
| Grayscale review | Does hierarchy survive without hue? | Not a full simulation of anyone's vision |
| Usability testing | Can users understand states and actions while doing tasks? | Needs representative participants and realistic tasks |
| Brand recognition study | Does identity support recognition and intended positioning? | Preference ≠ usability or conversion |
| Implementation audit | Are tokens and states implemented consistently? | Needs a repeatable checklist and an owner |
| A/B experiment | Does a variant improve a defined outcome under controlled conditions? | Guard against local gains that harm accessibility or trust |

## Review record template

```
Screen/component: [name]
Observed issue:   [evidence]
User impact:      [task or understanding affected]
Principle:        [standard, research finding, or heuristic]
Change:           [specific palette/token/component change]
Accessibility:    [pairing, calculated ratio, non-color cue, theme/state]
Brand impact:     [what stays consistent / what changes]
Validation:       [test, metric, owner]
Decision:         [accepted / revise / escalate]
```

## Governance

- Keep a single source of truth for tokens and approved assets.
- Version palette changes and record the reasons for semantic changes.
- Assign ownership for brand identity and accessibility; make escalation explicit.
- Don't let one-off exceptions become undocumented patterns.
- Audit for token drift, contrast regressions, duplicated colors and contradictory status meanings.

## References

- W3C, WCAG 2.2 — https://www.w3.org/TR/WCAG22/
- W3C WAI, Understanding SC 1.4.3 Contrast (Minimum) — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- W3C WAI, Understanding SC 1.4.11 Non-text Contrast — https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- Apple HIG: Color — https://developer.apple.com/design/human-interface-guidelines/color
- Apple HIG: Accessibility — https://developer.apple.com/design/human-interface-guidelines/accessibility
- Material Design 3: Color system — https://m3.material.io/styles/color/system/overview
- Gao et al. (2007), Analysis of cross-cultural color emotion — https://research.chalmers.se/en/publication/77316
- Ou et al. (2012), Cross-cultural comparison of colour emotion for two-colour combinations — https://onlinelibrary.wiley.com/doi/10.1002/col.20648
- Liu & Yang (2022), The good, the bad, and the red — https://pmc.ncbi.nlm.nih.gov/articles/PMC10017663/
- Liu & Yang (2026), Cross-cultural analysis of brand color emotions — https://link.springer.com/article/10.1007/s10791-026-09945-7 (interpret scope critically)
- Nacheva (2019), Color Accessibility: Tools and Techniques for Better UI Designs — user-supplied paper (references WCAG 2.1)
- Ooredoo (2014), Digital Brand Guidelines — user-supplied historical brand guide; rules specific to Ooredoo

Not a substitute for brand-owner approval, current accessibility standards, legal review or user testing.
