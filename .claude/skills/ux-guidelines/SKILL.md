---
name: ux-guidelines
description: Create, review, critique or improve UX/UI using established UX laws (Fitts, Hick, Jakob, Miller, Postel, Tesler, Doherty, Gestalt, Peak–End, Von Restorff, Cognitive Load, Goal-Gradient and more), Nielsen's usability heuristics, WCAG-aware accessibility and evidence-based practice. Use for UI critique, wireframe or screenshot review, user-flow design, landing-page review, form and checkout optimization, onboarding, dashboards, search and filtering, navigation and IA, AI/generative interfaces, responsive design, accessibility reviews, design-system recommendations, interaction specs and design handoff. Produces prioritized findings tied to the right principle, with a validation plan.
---

# UX Guidelines

Version 1.0 · Source: "UX Guidelines — Claude Skill Reference", October 2026 edition · Review by: April 2027 (re-check WCAG version and cited guidance).

Help create, review, critique or improve user experiences by tying each recommendation to the UX principle that explains it, then saying how to verify it. Principles generate hypotheses; they are not guarantees.

## Reference files — load only what the task needs

| File | Load when |
|---|---|
| `references/ux-laws-and-principles.md` | You need the definition, scenario, failure mode or checklist for a specific law or heuristic. Search it by heading; don't read it end to end. |
| `references/product-surfaces.md` | The task is a known surface: navigation/IA, forms, checkout, dashboards, onboarding, search/filtering, AI interfaces, responsive mobile. |
| `references/usability-accessibility-checklists.md` | Doing a design review, pre-handoff check, post-implementation QA, or an accessibility pass. |
| `references/testing-and-measurement.md` | Writing a validation plan, choosing a research method, prioritizing issues, or framing an experiment. |

## Workflow

1. **Frame the task.** Who is the user, what are they trying to do, in what context, and what does success look like? Ask only for missing information that would materially change the recommendation. If a useful first pass is possible, state your assumptions and proceed.
2. **Separate facts from assumptions.** When evaluating a screenshot, code or description, say what you observed versus what you are inferring (e.g. "the CTA is below the fold at 390px" vs. "users likely miss it").
3. **Identify friction.** Confusion, hesitation, errors, backtracking, missed controls, abandonment, inaccessible paths.
4. **Select only the relevant principles.** Use the symptom map below. Explain the link between the observed problem and the principle. Never list every law in every response.
5. **Recommend a testable change.** State what should improve and how it would be measured.
6. **Name trade-offs.** A change can improve one principle while worsening another (e.g. fewer steps vs. error prevention; minimalism vs. necessary context).

## Choose a principle by symptom

| Observed symptom | Investigate |
|---|---|
| Users miss a button | Fitts's Law; Selective Attention; visual hierarchy; accessibility |
| Users hesitate among options | Hick–Hyman Law; Choice Overload; Chunking |
| Users don't understand navigation | Jakob's Law; Mental Models; Consistency and Standards; Match to the Real World |
| Users forget details between steps | Working Memory; Recognition Rather Than Recall; Miller's Law |
| Valid data rejected because of format | Postel's Law (carefully); Error Prevention; clear instructions |
| Users unsure whether an action worked | Visibility of System Status; Doherty Threshold; feedback |
| Users can't recover from errors | User Control and Freedom; Help Users Recover from Errors; Error Prevention |
| Screen feels visually chaotic | Proximity; Similarity; Common Region; Prägnanz; Cognitive Load |
| Everything looks equally important | Von Restorff Effect; Selective Attention; Serial Position Effect |
| Users abandon setup | Paradox of the Active User; Goal-Gradient Effect; Cognitive Load |
| Users distrust AI output or actions | Mental Models; Visibility of System Status; User Control; error recovery |
| Looks polished but is hard to use | Aesthetic–Usability Effect; Nielsen's heuristics; usability testing |
| Users with disabilities can't complete tasks | WCAG-aware Inclusive Design; Cognitive Accessibility; semantic and keyboard testing |
| Users pressured by progress or urgency cues | Ethical guardrails; Goal-Gradient Effect; autonomy and informed choice |

## Output format

Start with a **concise assessment** (2–4 sentences: overall state, biggest risk, what's working). Then:

1. **Prioritized findings**, highest first, each with:

   | Field | Content |
   |---|---|
   | Finding | Specific observed issue or risk, grounded in what was supplied or a stated assumption |
   | User impact | Who is affected, which task gets harder, why it matters |
   | Principle | One or two relevant laws/heuristics, accurately characterized with their evidence label |
   | Recommendation | A concrete change a designer or developer can implement |
   | Priority | High / Medium / Low, with rationale from severity, exposure and evidence |
   | Validation | Usability task, accessibility test, metric or research question that would confirm the improvement |

2. **Recommended changes** consolidated into an actionable list.
3. **Accessibility checks** relevant to this design (see below).
4. **Validation plan**: methods, users, tasks, metrics and guardrails (see `references/testing-and-measurement.md`).

For a quick question, scale this down: answer directly, cite the principle, give one way to validate. Use the full format for reviews and critiques.

### Implementation handoff

When the output feeds a build, also specify: component states (default, hover, focus, active, disabled, loading, success, error, empty); responsive behavior; content requirements (real lengths, localization, text expansion); and acceptance criteria.

## Accessibility is core UX

Treat it as part of every review, not a finishing pass. Flag, where relevant: keyboard operation and focus order, visible focus, semantics and accessible names, contrast (text and non-text), target size and spacing, error association with fields, color-only meaning, motion and auto-updating content, zoom/reflow, status announcements, and assistive-technology paths. Use WCAG 2.2 as the conformance reference. Never claim WCAG conformance from visual inspection or automated tools alone.

## Evidence integrity

Each principle carries one of these labels — say which when you cite it:

- **Research-backed model**: a named model or experimental finding with a formal source. Use as a directional prediction; check its assumptions.
- **Established heuristic**: a broad usability principle for evaluating interface quality. Use in reviews; pair with task-based testing.
- **Practice principle**: a rule of thumb from design practice. Treat as a hypothesis, not a law.

Never invent research or statistics, claim a law guarantees conversion, treat "7±2" or "400 ms" or "80/20" as hard rules, or infer usability from visual appeal or stakeholder preference.

Example of a well-formed hypothesis: "Because the booking form asks users to remember details from a previous screen, some users may make more errors. Keeping those details visible beside the form should reduce correction time and improve completion." This beats "Miller's Law says the form must have seven fields."

## Ethical guardrails

Never recommend deceptive urgency, fake scarcity or countdowns, hidden fees, coerced consent, confirmshaming, fabricated progress, manufactured incompleteness, or friction designed to block cancellation. Use attention and salience to support the user's task, not to obscure competing information or exploit vulnerable users. Defaults must be understandable and reversible where practical. Ask only for data with a clear purpose. Design for differing abilities, devices, languages, expertise and environments. If a request asks for a dark pattern, say so and offer an honest alternative that meets the underlying goal.

## Limits

This skill supports design decisions; it does not replace user research, accessibility testing with real users and assistive technology, or domain-specific requirements (legal, medical, financial, safety).
