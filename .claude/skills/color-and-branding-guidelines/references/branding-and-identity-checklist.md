# Branding, identity and review checklists

Use in discovery, design reviews, handoff and pre-release QA. A checked item means there is **evidence** it works — not that it appears in a mockup. When reporting, mark each relevant item pass, fail, or not verifiable from what was supplied, and say what evidence would verify it.

## A. Brand discovery and strategy
- [ ] Document audience, markets, product category, competitors and core user tasks.
- [ ] Write a positioning statement and three to five desired brand attributes.
- [ ] Identify existing brand assets and legal/brand-owner restrictions.
- [ ] Audit current screens for inconsistent color meanings and duplicated values.
- [ ] Review target-market conventions and culturally sensitive use cases.
- [ ] Define what must remain distinctive and what may adapt for accessibility or platform needs.

## B. Palette creation
- [ ] Choose brand hues from strategy and existing identity, not trend alone.
- [ ] Build tonal variants for surfaces, text, borders, accents and themes.
- [ ] Create neutral and semantic palettes separately from the brand palette.
- [ ] Assign each color a clear role and define where it must not be used.
- [ ] Use 60/30/10 only as an optional exploration aid, not a requirement.
- [ ] Review swatches in context, on real components and actual content.

## C. Accessibility and contrast
- [ ] 4.5:1 for normal text and 3:1 for large text where WCAG AA applies — calculated, not eyeballed.
- [ ] Non-text contrast for meaningful controls, states and graphics under applicable criteria.
- [ ] Color is not the only cue for error, success, warning, selection, required fields, charts or navigation.
- [ ] Color-vision simulation and grayscale checks run as diagnostics.
- [ ] Focus, hover, pressed, disabled, loading and validation states tested.
- [ ] Light/dark themes and supported increased-contrast / forced-color modes tested.
- [ ] Actual backgrounds tested, including overlays, images, gradients and translucent surfaces.

## D. Brand consistency
- [ ] Approved logo assets used, with the brand owner's clear-space and minimum-size rules.
- [ ] Typography, imagery, iconography and color coordinated as one system.
- [ ] Interactive color meanings consistent across pages and components.
- [ ] Accent color reserved for documented roles rather than applied indiscriminately.
- [ ] Brand-safe accessible alternatives documented for problematic pairings.
- [ ] Product UI aligned with marketing without sacrificing usability.

## E. Component design and interaction
- [ ] Tokens defined for default, hover, focus, pressed, selected, disabled, loading, success, warning and error states as relevant.
- [ ] Text, icons and boundaries remain distinguishable against their surfaces.
- [ ] Clickable and selected states don't rely on color alone.
- [ ] Links are styled distinctly from ordinary text.
- [ ] Charts and status chips use labels, shapes, patterns or annotations.
- [ ] Changes are specified as token names, not vague notes like "make it darker".

## F. Handoff and QA
- [ ] Token names, HEX values, roles, contrast evidence and approved combinations provided.
- [ ] Light/dark and responsive screenshots included for important components.
- [ ] Prohibited combinations and the exception/approval path explained.
- [ ] The implemented UI verified, not just the design file.
- [ ] Test date, tool, context and limitations recorded.
- [ ] New screens and palette changes reviewed for regressions before release.

## Brand identity for UI — translation worksheet

For each brand attribute, list observable decisions:

| Attribute | Color | Type | Shape / radius | Imagery & icons | Spacing & density | Motion & voice |
|---|---|---|---|---|---|---|
| e.g. "Precise" | Restrained neutrals, one sharp accent | Tight, geometric sans; tabular numerals | Small radii, crisp 1px borders | Line icons, product shots | Compact, aligned grid | Short, linear transitions; plain wording |

Avoid claims that a color universally evokes an emotion; ground choices in positioning, audience and market research.

## Brand/accessibility conflict handling

1. Quote the exact brand rule and its source (guide, page, version).
2. Show the failing pair with its calculated ratio and who is affected.
3. Propose the smallest brand-preserving fix (adjacent tonal step, larger/bolder text, dark label on brand fill, added underline/icon, scrim over imagery) with its recalculated ratio.
4. If no fix fully preserves the rule, present the trade-off and ask the user or brand owner to decide. Record the decision and exception.
