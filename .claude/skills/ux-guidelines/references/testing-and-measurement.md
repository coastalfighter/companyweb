# Testing, measurement and prioritization

A principle is useful when it helps the team make a better decision. It is not, by itself, evidence that a design will work for a particular audience.

## Repeatable workflow

User action → system response → clear next step. To improve that loop:

1. **Start with the user task.** Who is doing what, in what context, and what is successful completion?
2. **Identify friction.** Observe confusion, hesitation, errors, backtracking, missed controls or abandonment.
3. **Select a relevant principle.** Use it to explain a plausible cause — don't apply laws because they sound familiar.
4. **Make a testable change.** State what should improve and how it will be measured.
5. **Validate and iterate.** Combine usability tests, analytics, accessibility checks and qualitative feedback.

## Evidence stack

| Method | Best for | Limit to remember |
|---|---|---|
| User interviews | Goals, language, expectations, context, workarounds | What people say may differ from what they do |
| Moderated usability tests | Task breakdowns, errors, mental models | Small samples reveal issues but don't estimate population rates precisely |
| Unmoderated task tests | Comparing flows, structured task observations | Poor task wording or device differences distort results |
| Product analytics | Behavioral patterns, funnels, repeated attempts, trends | Instrumentation gaps and correlation can mislead |
| Accessibility audit | Standards-related issues and assistive-technology behavior | Automated tools alone can't prove accessibility |
| A/B experiment | Comparing outcomes when traffic, sample size and design support it | A local metric lift can harm trust, accessibility or long-term retention |

Recommend the cheapest method that can actually answer the question. Early or low-traffic products usually need moderated tests and accessibility audits before A/B tests.

## Prioritize by impact, frequency and risk

For each issue, record:
- who is affected
- the task and context
- severity if the task fails
- frequency or exposure
- evidence (observed, measured, or hypothesized)
- proposed change
- validation plan

Do not let a low-frequency but high-consequence failure (payments, data loss, safety, legal, accessibility blockers) drop out because a Pareto-style analysis favors common tasks.

Priority guide for findings:
- **High:** blocks or seriously endangers a key task, causes data or money loss, or is an accessibility blocker; or is a moderate problem on a very high-exposure path.
- **Medium:** slows or confuses users on an important task but has a workaround; or high severity on a rare path.
- **Low:** polish, consistency or minor friction with little effect on task success.

State the rationale; don't assign a priority without one.

## Experiment template

```
Observation:     What did we see?
Interpretation:  What might explain it?
Principle:       Which UX law or heuristic is relevant?
Change:          What specific interface behavior will change?
Prediction:      What outcome should improve?
Guardrails:      What must not get worse?
Test:            Which users, tasks, devices and methods will validate the change?
```

## Metrics by surface

| Surface | Metrics |
|---|---|
| Navigation / IA | Task success, time to find a destination, search reformulation, backtracking, support requests |
| Forms | Completion rate, field-level error rate, correction time, abandonment by field, AT task success |
| Checkout | Completion, error recovery, unexpected-cost exits, payment retry rate, customer contacts |
| Dashboards | Time to answer target questions, misinterpretations, drill-down success, exports to external tools |
| Onboarding | Time to first value, setup completion, return rate, feature adoption, onboarding support contacts |
| Search / filtering | Search success, reformulation, zero-result rate, filter removal, time to target item |
| AI interfaces | Correction rate, trust calibration, task success, reversals, hallucination detection, understanding of limits |
| Responsive mobile | Mobile task success, mis-taps, horizontal scrolling, zoom usability, completion by device class |

Always pair a primary metric with at least one guardrail (e.g. conversion with refund rate, support contacts or accessibility task success).
