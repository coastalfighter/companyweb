---
name: color-and-branding-guidelines
description: Create, evaluate and document color systems and brand expression for digital interfaces. Use for palette creation, design-token architecture (primitive → semantic → component), brand-to-UI translation, contrast problems and WCAG 2.2 contrast checks, dark mode and theme mapping, semantic status colors, accessible data-visualization palettes, design-system color docs, brand audits and color handoff. Calculates exact contrast ratios with a bundled script instead of guessing.
---

# Color & Branding Guidelines

Version 1.0 · Source: "Color & Branding Guidelines — Claude Skill Reference" (sections 05–12 as supplied; see `references/color-laws-and-principles.md` for how 01–04 were filled) · Review by: April 2027 (re-check WCAG version and platform guidance).

Help designers build color systems that carry the brand, stay readable and accessible, and keep the same meaning everywhere. Principles guide decisions; they don't guarantee outcomes.

## Reference files — load only what the task needs

| File | Load when |
|---|---|
| `references/color-laws-and-principles.md` | You need the definition or rule for a named principle (Contrast Minimum, Color Context, Salience, Distinctive Assets, Cultural Context…). |
| `references/palette-architecture-and-tokens.md` | Building or restructuring a palette, naming tokens, mapping themes, writing a palette brief. |
| `references/accessibility-and-contrast.md` | Any contrast question, status/error colors, charts, color-vision robustness, forced-color or high-contrast modes. |
| `references/branding-and-identity-checklist.md` | Brand discovery, brand audits, design reviews, handoff and pre-release QA. |
| `references/examples-and-validation.md` | Applied patterns (CTAs, forms, charts, links, dark mode, landing pages, notifications), starter palettes, testing methods, review records, governance. |

## Contrast: never guess a ratio

Calculate every foreground/background pair you recommend or criticize:

```bash
python3 .claude/skills/color-and-branding-guidelines/scripts/contrast.py "#FFFFFF" "#2457C5" "#5D6B7C" "#F7F8FA"
```

Pass any number of FG BG pairs; add `--json` for structured output. Alpha (`#RRGGBBAA`) is composited over the background. Ratios are truncated, never rounded up. If you cannot run it, say the ratio is unverified — do not estimate. Report ratios as e.g. "6.47:1 — passes AA normal text".

A passing ratio answers one narrow question about one pair. It doesn't show that the palette is understandable, culturally appropriate, usable in charts, or accessible in every state and theme.

## Workflow

1. **Context first.** Identify the existing brand guidelines and assets, product category, target users and markets, platform, theme support (light/dark/high-contrast) and accessibility target. Ask only for details that materially change the recommendation; otherwise state assumptions and proceed.
2. **Source precedence.** Follow approved brand assets and legal constraints — but a brand rule is not proof of accessibility. Where they conflict, name the exact rule and its source, explain the risk, and propose the *smallest* accessible change that preserves the brand (e.g. keep the brand red as the CTA fill but darken one step so the white label passes; or keep the hue and add an underline). If a genuine trade-off remains, ask the user or brand owner to decide. Never silently override a brand rule.
3. **Select relevant principles only.** Use the symptom map below. Label each as a **standard** (WCAG, platform spec), **research finding**, **heuristic**, or **rule of thumb**.
4. **Translate brand into observable choices.** Brand attributes become concrete decisions across color, typography, shape, imagery, iconography, spacing and motion — not color alone.
5. **Verify.** Run contrast on every recommended pair; check non-color cues, states (hover, focus, pressed, selected, disabled, loading, error, success), both themes, and meaningful graphics.

## Choose a principle by symptom

| Observed symptom | Investigate |
|---|---|
| Text is faint or hard to read | Contrast Minimum; Color Context; Tonal Scales; Theme Adaptation |
| Users miss the primary action | Salience; Semantic Color Consistency; Brand Color as Distinctive Asset |
| Screen feels noisy or over-colored | Neutral Foundations; Limited Emphasis; Palette Architecture |
| Error state is misunderstood | Use of Color Is Not Enough; Semantic Consistency; Color-Vision Robustness |
| Brand feels inconsistent | Distinctive Assets; Semantic Tokens; Brand Identity for UI |
| Works in mockups, fails in implementation | Color Context; Approved Pairings; Theme Adaptation; handoff checklist |
| Dark mode feels wrong | Platform/Theme Adaptation; Tonal Scales; Contrast Minimum |
| Charts are hard to interpret | Color-Vision Robustness; Lightness Contrast; Use of Color Is Not Enough |
| Team argues about exact percentages | 60–30–10 Is a Starting Point, Not a Law; Salience |
| Color meanings unclear across markets | Cultural Context; Context-Dependent Emotion; user research |

## Output format (palette reviews and proposals)

| Section | Content |
|---|---|
| Context & assumptions | Brand, audience, platform, theme, task, constraints, evidence gaps |
| Assessment | What works, what's inconsistent, the highest-impact risk |
| Palette proposal | Tokens, HEX values, roles, allowed contexts, rationale |
| Accessibility | Calculated contrast results, non-color cues, theme and state checks |
| Brand coherence | What stays distinctive, where it varies, any brand/accessibility conflicts |
| Action checklist | Specific design and implementation tasks, prioritized High/Medium/Low with rationale |
| Validation plan | Tools, user tasks, review owner, acceptance criteria, open questions |

Scale down for quick questions: answer, show the calculated ratio, give the fix.

### Handoff

Include token names, HEX values, roles, approved foreground/background pairings with calculated ratios, state and theme variants, prohibited combinations, and acceptance criteria. Specify token names, never vague notes like "make it darker".

## Non-negotiable guardrails

- Never claim a color guarantees trust, conversion, engagement or a specific emotion. Ground emotional or associative claims in the audience, market and positioning, and treat them cautiously.
- Never use color alone for essential information or interaction states.
- Never approve text contrast by eye when a measurable standard applies — calculate it.
- Never copy another company's palette as a substitute for brand strategy.
- Never treat 60/30/10 as a scientific law or an accessibility requirement.
- Never silently override a current brand rule; document the issue and escalate genuine conflicts.
- Never claim WCAG conformance from palette swatches or automated scans alone.
- Never fabricate research, or sacrifice accessibility for decoration.

## Acceptance behavior

This skill should reliably:
- turn a low-contrast palette into a **specific pairing fix** with before/after ratios, not vague advice;
- preserve a brand rule such as a red CTA where possible, with contrast and non-color checks;
- give a red/green chart labels, patterns, shapes or annotations;
- map dark mode by semantic role and test states instead of inverting all colors;
- treat generic color-emotion claims cautiously and ground them in audience and positioning;
- surface, explain and escalate a genuine brand/accessibility conflict.

## Limits

Not a substitute for brand-owner approval, current accessibility standards, legal review or user testing. Verify live standards and platform guidance before shipping.
