# UX laws and principles

Each entry: evidence label · what it means · where it helps · applied scenario · common failure · checklist · reference. Find the entry by heading; read only what applies.

Contents: [01 Foundational interaction laws](#01-foundational-interaction-laws) · [02 Perception, memory and attention](#02-perception-memory-and-attention) · [03 Cognition, motivation and behavior](#03-cognition-motivation-and-behavior) · [04 Nielsen's usability heuristics](#04-nielsens-usability-heuristics) · [05 Accessibility and inclusive design](#05-accessibility-and-inclusive-design) · [References](#references)

---

## 01 Foundational interaction laws

Use when choosing control size, arranging choices, matching expectations, and deciding how much complexity the interface should absorb.

### Fitts's Law
**Interaction / motor performance · Research-backed model**
- **Means:** time to acquire a target depends on its size and distance. Larger, closer targets are faster and easier to select.
- **Helps:** primary actions, touch controls, dense toolbars, mobile navigation, drag handles, safety-critical controls.
- **Scenario:** in mobile checkout, make the primary action wide and reachable, space controls, avoid tiny close icons. A large button is useless if hidden behind a sticky footer.
- **Failure:** tiny icon-only controls; destructive and safe actions side by side; key actions far from the user's focus.
- **Checklist:** make frequent or high-impact targets easy to locate and activate · use adequate target size and spacing for touch and motor variability · place actions near the content they affect · test on real devices, with keyboard and assistive technology.
- **Ref:** Fitts, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement. *Journal of Experimental Psychology.*

### Hick–Hyman Law
**Decision-making · Research-backed model**
- **Means:** decision time rises with the number and complexity of plausible choices. Not simply "more options are bad" — familiarity and categorization matter.
- **Helps:** navigation, plan selection, settings, onboarding choices, filters, feature discovery.
- **Scenario:** a travel app asks for a trip goal first (work, family, adventure) and then shows relevant options. Categories shrink the initial decision without removing choice.
- **Failure:** dozens of ungrouped menu items; or an over-simplified wizard that hides options experts need.
- **Checklist:** group choices into meaningful categories · show the most relevant first, clearly labeled · use progressive disclosure for secondary settings · don't remove choice where users need comparison or expert control.
- **Ref:** Hick, W. E. (1952). On the rate of gain of information. *Quarterly Journal of Experimental Psychology.*

### Jakob's Law
**Mental models / consistency · Practice principle grounded in user expectations**
- **Means:** people bring expectations from products they already use. Familiar conventions lower learning effort.
- **Helps:** navigation, search, account controls, cart/checkout, tabs, form behavior, platform interactions.
- **Scenario:** a new commerce site puts search in the familiar header spot and uses recognizable cart and account patterns, saving novelty for its distinctive value.
- **Failure:** a novel menu interaction with no discoverable cue; changing standard control behavior for visual originality.
- **Checklist:** use established patterns for common tasks unless research supports a departure · make novel interactions visibly discoverable and learnable · keep internal conventions consistent · audit platform expectations across web, iOS and Android.
- **Ref:** Yablonski, J. (2020). *Laws of UX.*

### Miller's Law and working memory
**Memory / cognition · Research-informed concept; popular shorthand often oversimplified**
- **Means:** working memory is limited. "7±2" is overgeneralized — reduce the need to retain unrelated information rather than forcing menus to seven items.
- **Helps:** multi-step tasks, long forms, verification codes, comparisons, complex dashboards, instructions.
- **Scenario:** keep order number, shipping address and chosen plan visible through checkout so users needn't remember them.
- **Failure:** using 7±2 as a rigid navigation-size rule; arbitrary chunks that don't match user goals.
- **Checklist:** keep task-relevant information visible when needed · chunk by meaning and task, not item count · use summaries, labels, previews and sensible defaults · test recall burden in real tasks.
- **Ref:** Miller, G. A. (1956). The magical number seven, plus or minus two.

### Postel's Law (Robustness Principle)
**Input / system robustness · Practice principle; apply within security and data-integrity constraints**
- **Means:** originally protocol behavior — conservative in what you send, liberal in what you accept. In UX: accept reasonable input variations, normalize safely, communicate clearly.
- **Helps:** phone numbers, dates, addresses, search, file imports, data entry with format variation.
- **Scenario:** a phone field accepts spaces, parentheses and hyphens, stores a normalized number, and shows a clear preview.
- **Failure:** rejecting a valid number over punctuation; or silently accepting ambiguous data that causes harm downstream.
- **Checklist:** accept common valid formats when unambiguous · normalize and validate transparently · explain and resolve ambiguity instead of guessing silently · never apply "be liberal" to security-sensitive or high-stakes validation.
- **Ref:** Postel, J. (1980). RFC 761 / later RFC 793 context.

### Tesler's Law
**Complexity allocation · Practice principle**
- **Means:** some complexity is inherent. Design can reduce, automate or move it, but not always eliminate it.
- **Helps:** tax forms, configuration tools, enterprise workflows, insurance enrollment, advanced settings.
- **Scenario:** a tax product computes totals and checks consistency automatically, shows its assumptions, and asks only for what the user can know.
- **Failure:** making a flow look simple by hiding consequences, or asking users to do calculations the system could do.
- **Checklist:** automate repeatable work when safe and explainable · keep unavoidable complexity visible when it matters · let users inspect or override consequential assumptions · never hide risk to make a flow look short.
- **Ref:** commonly discussed as the law of conservation of complexity.

### Doherty Threshold
**Response time / feedback · Historical performance heuristic**
- **Means:** fast response keeps interaction rhythm smooth. The often-quoted 400 ms is a historical guideline, not a universal modern target.
- **Helps:** search suggestions, filters, validation, saves, navigation, AI generation, data-heavy dashboards.
- **Scenario:** when a filter is applied, update results promptly or show clear progress while preserving context.
- **Failure:** a button that seems dead after a click; a spinner with no status; a skeleton that lingers after content is ready.
- **Checklist:** acknowledge actions immediately · optimize actual and perceived latency separately · show progress for long operations and allow cancel where appropriate · avoid optimistic UI where a failed action would mislead or harm.
- **Ref:** Doherty, W. J., & Thadani, A. J. (1982). The economic value of rapid response time.

---

## 02 Perception, memory and attention

Visual hierarchy communicates structure, relevance, relationships and state. These explain why spacing, contrast, labels and ordering change interpretation.

### Aesthetic–Usability Effect
**Perception / first impressions · Research-backed effect**
- **Means:** people may perceive attractive interfaces as easier to use. Appeal supports trust but can't compensate for broken function or poor accessibility.
- **Helps:** first-run, brand-heavy products, landing pages, trust moments.
- **Scenario:** a coherent layout makes a financial dashboard feel credible — labels, error prevention and task completion still need testing.
- **Failure:** polish concealing confusing IA, weak contrast or unusable interactions.
- **Checklist:** use hierarchy to clarify meaning, not decorate · keep readability, contrast and interaction quality intact · test perceived ease separately from task success · don't infer usability from visual appeal or stakeholder preference.
- **Ref:** Kurosu, M., & Kashimura, K. (1995). Apparent usability vs. inherent usability.

### Peak–End Rule
**Experience and memory · Research-informed cognitive effect**
- **Means:** retrospective judgments are disproportionately shaped by emotionally salient moments and by how an experience ends.
- **Helps:** onboarding, support, purchase completion, cancellation, error recovery, service journeys.
- **Scenario:** after complex setup, show a clear success summary, what happens next, and an easy path to the first meaningful task.
- **Failure:** a cheerful success screen that still leaves users unsure the transaction completed.
- **Checklist:** identify high-friction and high-emotion moments · make completion states accurate, reassuring and actionable · end support and error flows with a clear next step · measure the full journey, not just the final screen.
- **Ref:** Kahneman, D., Fredrickson, B. L., Schreiber, C. A., & Redelmeier, D. A. (1993). When more pain is preferred to less.

### Peak–End and goal completion
**Journey design · Practice principle** (related to but distinct from the Peak–End Rule)
- **Means:** perceived journey quality depends on the moments experienced and whether the task concludes clearly.
- **Helps:** checkout, account creation, document upload, booking, task completion.
- **Scenario:** an upload flow confirms the file name, scan status and next step instead of just disappearing.
- **Failure:** confetti while the actual completion status stays ambiguous.
- **Checklist:** confirm results of consequential actions · show what happens next and when · make failure states as actionable as success states · keep celebration proportional to context and intent.
- **Ref:** use alongside Nielsen's visibility-of-system-status heuristic.

### Von Restorff Effect (Isolation Effect)
**Attention / memory · Research-backed effect**
- **Means:** an item that differs from similar items is more likely to attract attention and be remembered.
- **Helps:** primary CTAs, pricing comparisons, warnings, key status indicators.
- **Scenario:** a pricing table highlights one recommended plan with a restrained badge and stated rationale; alternatives stay readable.
- **Failure:** every button a different bright color, so hierarchy collapses and important actions get harder to find.
- **Checklist:** reserve emphasis for a few meaningful priorities · pair color with text, shape or position · keep destructive and promotional emphasis distinct · check the screen at a glance and in grayscale.
- **Ref:** Von Restorff, H. (1933).

### Serial Position Effect
**Memory / ordering · Research-backed memory effect**
- **Means:** items at the beginning and end of a sequence are recalled more readily than those in the middle.
- **Helps:** navigation menus, onboarding steps, long lists, pricing features, summaries.
- **Scenario:** most-used destinations first, a clearly separated account/help area last, where that matches the IA.
- **Failure:** assuming first and last always win regardless of scanning patterns, context or accessibility.
- **Checklist:** prioritize by user importance and task frequency · use headings and grouping to make long lists scannable · never bury safety, legal or critical information in low-salience positions · validate ordering with search, click and usability data.
- **Ref:** Murdock, B. B. (1962). The serial position effect of free recall.

### Law of Proximity
**Gestalt · Established perceptual principle**
- **Means:** elements close together are perceived as related; spacing communicates hierarchy and relationships.
- **Helps:** forms, cards, tables, dashboards, settings groups, layout.
- **Scenario:** keep a label close to its input, with larger spacing between field groups.
- **Failure:** a label sitting closer to the wrong input; unrelated controls packed together.
- **Checklist:** use consistent spacing tokens to express relationships · keep labels and helper text attached to their control · use whitespace to separate sections · verify grouping at multiple viewport widths.
- **Ref:** Wertheimer, M. (1923). Gestalt research on perceptual organization.

### Law of Similarity
**Gestalt · Established perceptual principle**
- **Means:** visually similar elements are perceived as belonging together or serving similar roles.
- **Helps:** buttons, status chips, links, cards, icons, repeated patterns.
- **Scenario:** all primary actions share one style; secondary actions a distinct, consistent one.
- **Failure:** two identical-looking controls doing very different things; one action changing appearance unpredictably.
- **Checklist:** like actions look alike, different actions look distinct · define reusable component variants · don't rely on color alone for meaning · document exceptions in the design system.
- **Ref:** Gestalt psychology.

### Law of Common Region
**Gestalt · Established perceptual principle**
- **Means:** elements inside a shared boundary are perceived as a group.
- **Helps:** cards, panels, grouped settings, pricing tiers, dashboards.
- **Scenario:** a bordered billing panel holds plan, renewal date and payment method because they share one context.
- **Failure:** too many boxes — "card soup" — obscuring relationships across sections.
- **Checklist:** use boundaries only when they clarify a meaningful group · prefer spacing alone when it suffices · minimize nested containers · don't let borders replace semantic headings or labels.
- **Ref:** Gestalt principles of perceptual grouping.

### Law of Prägnanz (Good Form)
**Gestalt · Established perceptual principle**
- **Means:** people organize ambiguous visuals into the simplest stable pattern.
- **Helps:** icons, data visualization, layout structure, hierarchy, simplification.
- **Scenario:** a dashboard uses a few clear chart forms with direct labels rather than decorative 3D.
- **Failure:** icons simplified into ambiguity; complex data flattened into an inaccurate graphic.
- **Checklist:** prefer coherent structure over ornament · preserve distinctions users need · label unfamiliar icons and encodings · test comprehension, not just neatness.
- **Ref:** Gestalt psychology.

### Law of Uniform Connectedness
**Gestalt · Established perceptual principle**
- **Means:** elements joined by a line, shared background or other connector are perceived as more related.
- **Helps:** timelines, steppers, diagrams, table relationships, selected states.
- **Scenario:** a stepper connects stages and marks the current step with both a label and a distinct state.
- **Failure:** decorative lines joining unrelated items; relationships conveyed only by color.
- **Checklist:** connect only truly related elements · add labels and state markers to connectors · keep connections clear at small sizes and zoom · provide a non-visual reading order for assistive technology.
- **Ref:** Gestalt principles of perceptual grouping.

### Selective Attention
**Attention / hierarchy · Research-informed attention principle**
- **Means:** people focus on what's relevant to their current goal and may miss competing signals.
- **Helps:** dashboards, notifications, alerts, onboarding, dense pages.
- **Scenario:** a task dashboard emphasizes overdue items and next actions; secondary metrics stay available without dominating.
- **Failure:** a critical warning competing with promotional banners and decorative animation.
- **Checklist:** define the primary task for each screen · reserve strong contrast and motion for meaningful signals · use plain labels and predictable placement · test whether users notice critical information unprompted.
- **Ref:** cognitive psychology literature on selective attention; application is contextual.

### Mental Models
**Expectations / learning · Practice principle grounded in cognitive psychology**
- **Means:** users form an internal understanding of how a product works from prior experience, terminology and feedback.
- **Helps:** navigation, file management, permissions, dashboards, AI features.
- **Scenario:** a trash icon moves items to a recoverable deleted-items area with a clear undo path.
- **Failure:** a control's label promises one outcome and triggers another.
- **Checklist:** research users' language and expectations · align labels, behavior and outcomes · explain departures from convention · use prototypes to surface mismatches early.
- **Ref:** Nielsen Norman Group, Match Between the System and the Real World.

### Mere Exposure Effect
**Familiarity / preference · Research-informed effect**
- **Means:** repeated exposure can raise familiarity and sometimes preference — but familiarity doesn't prove trustworthiness or usability.
- **Helps:** brand systems, repeated patterns, onboarding, gradual feature adoption.
- **Scenario:** consistent interaction patterns across screens become familiar over time.
- **Failure:** repeating a harmful, confusing or manipulative pattern and assuming users will come to like it.
- **Checklist:** keep recurring patterns consistent · introduce new behavior with clear cues and safe practice · measure task success, not just familiarity · never use repetition to pressure consent.
- **Ref:** Zajonc, R. B. (1968). Attitudinal effects of mere exposure.

---

## 03 Cognition, motivation and behavior

Reduce avoidable mental effort, help users resume, support progress. Behavioral effects are contextual tendencies, not guarantees.

### Cognitive Load
**Mental effort · Research-informed cognitive framework**
- **Means:** the mental effort a task requires. Remove avoidable effort; keep information needed for sound decisions.
- **Helps:** dense dashboards, enterprise tools, forms, onboarding, complex configuration.
- **Scenario:** a financial dashboard separates balance, recent activity and account actions into recognizable, concisely labeled areas.
- **Failure:** stripping useful context to look minimal; tooltips for basics that should be visible.
- **Checklist:** identify what users must understand before acting · cut irrelevant content and redundant decisions · use labels, grouping, previews and defaults to lower memory effort · don't confuse fewer clicks with lower load.
- **Ref:** Sweller, J. (1988). Cognitive load during problem solving.

### Chunking
**Information organization · Practice principle informed by memory research**
- **Means:** grouping information into meaningful units helps scanning and processing.
- **Helps:** phone numbers, addresses, long codes, navigation, instructions, multi-part forms.
- **Scenario:** show a long reference number in meaningful groups; label each section of a long form by task.
- **Failure:** arbitrary groupings that don't match how users understand or enter the data.
- **Checklist:** chunk by meaning and task · use headings for conceptual groups · keep related information together across breakpoints · let users copy the complete value when grouping is visual only.
- **Ref:** Miller (1956), applied without rigid item counts.

### Choice Overload
**Decision-making · Research-informed effect; context dependent**
- **Means:** large or poorly structured choice sets can raise effort or lower confidence, especially when options are hard to compare.
- **Helps:** plans, filters, catalogs, preferences, feature selection.
- **Scenario:** a plan comparison foregrounds a few decision criteria and offers deeper detail on demand.
- **Failure:** artificially limiting a professional tool when experts need flexibility.
- **Checklist:** make meaningful differences easy to compare · use defaults only when safe and transparent · offer filters and search for large catalogs · let users inspect trade-offs before committing.
- **Ref:** Iyengar, S. S., & Lepper, M. R. (2000). When choice is demotivating.

### Recognition Rather Than Recall
**Memory / discoverability · Established usability heuristic** (also one of Nielsen's ten)
- **Means:** showing options and cues is easier than making users remember information from elsewhere.
- **Helps:** forms, command menus, saved items, settings, filters, onboarding.
- **Scenario:** active filters shown as removable chips.
- **Failure:** a multi-step form asking for data already given earlier.
- **Checklist:** keep needed information visible or easily retrievable · use descriptive labels, not unexplained icons · show current selections and system state · preserve input after recoverable errors.
- **Ref:** Nielsen Norman Group, 10 Usability Heuristics.

### Working Memory
**Temporary storage · Research-informed cognitive concept**
- **Means:** working memory holds and manipulates information briefly; don't make users carry details across steps.
- **Helps:** calculators, comparisons, multi-step workflows, authentication, configuration.
- **Scenario:** a comparison tool keeps selected products side by side and highlights differences.
- **Failure:** switching screens to compare prices, dates or settings.
- **Checklist:** keep comparisons visible together · summarize choices before irreversible actions · autosave and keep drafts where appropriate · avoid memorization and mental arithmetic.
- **Ref:** Baddeley, A. D. (2000). The episodic buffer.

### Goal-Gradient Effect
**Motivation / progress · Research-informed behavioral effect**
- **Means:** effort can increase as people perceive progress toward a goal — progress indicators help only when accurate.
- **Helps:** onboarding, setup, learning paths, uploads, multi-step checkout.
- **Scenario:** a setup checklist shows 3 of 5 done and separates required from optional tasks.
- **Failure:** a fake progress bar; "95% complete" with substantial work left.
- **Checklist:** show genuine progress toward a clear goal · break long processes into meaningful steps · mark optional tasks as optional · never fabricate progress or manufacture urgency.
- **Ref:** Hull, C. L. (1932). The goal-gradient hypothesis.

### Zeigarnik Effect
**Unfinished tasks · Research-informed effect; avoid deterministic claims**
- **Means:** unfinished tasks may stay salient. Use it to help people resume — not to exploit anxiety or fake incompleteness.
- **Helps:** drafts, interrupted workflows, task lists, onboarding, saved progress.
- **Scenario:** an editor restores an unfinished draft with a clear resume action.
- **Failure:** labeling optional tasks "incomplete" to pressure data sharing or upgrades.
- **Checklist:** save work and make resuming easy · show what remains and why it matters · let users dismiss reminders and leave · never use incompleteness to manufacture guilt or urgency.
- **Ref:** Zeigarnik, B. (1927).

### Flow
**Engagement / continuity · Research-informed psychological concept**
- **Means:** focused engagement when challenge matches skill and interruptions are few.
- **Helps:** creative tools, coding environments, editing, games, deep-work software.
- **Scenario:** an editor autosaves silently and avoids needless confirmation dialogs.
- **Failure:** removing all confirmation from high-risk actions "to preserve flow".
- **Checklist:** protect focus during low-risk, reversible work · add complexity as expertise grows · keep critical feedback visible without over-interrupting · let users pause, save and recover.
- **Ref:** Csikszentmihalyi, M. (1990). *Flow.*

### Paradox of the Active User
**Learning / onboarding · Practice principle**
- **Means:** people start using a system immediately instead of reading a manual first; support learning in context.
- **Helps:** first-run, complex tools, feature discovery, setup.
- **Scenario:** a new analytics product offers a sample dashboard, inline explanations and an undoable first action instead of a long mandatory tour.
- **Failure:** forcing everyone through a lengthy walkthrough before any useful action.
- **Checklist:** support safe exploration · give just-in-time guidance near the control · offer examples and sample data · make onboarding skippable when safe and resumable later.
- **Ref:** Carroll, J. M., & Rosson, M. B. (1987). Paradox of the active user.

### Pareto Principle (80/20)
**Prioritization · Practice heuristic**
- **Means:** a minority of causes or features may account for most outcomes. 80/20 is a heuristic, not a law of nature.
- **Helps:** feature prioritization, analytics, support issues, performance work, navigation.
- **Scenario:** usage data shows a few dashboard tasks dominate daily work, so they get clearer access.
- **Failure:** assuming exactly 80/20 without checking data.
- **Checklist:** use evidence to find high-frequency and high-impact tasks · prioritize common tasks *and* rare high-consequence ones · don't neglect accessibility or edge cases because they're less frequent · revisit as needs change.
- **Ref:** associated with Vilfredo Pareto.

### Occam's Razor / Simplicity
**Design reasoning · Reasoning heuristic** (not a UX-specific empirical law)
- **Means:** among solutions that fit the evidence, prefer the one with fewer unnecessary assumptions — without erasing needed capability.
- **Helps:** navigation, onboarding, settings, architecture, design-system decisions.
- **Scenario:** one clear primary action replaces three competing buttons with near-identical outcomes.
- **Failure:** removing a necessary control because the minimal mockup looks cleaner.
- **Checklist:** remove redundant decisions and decorative noise · keep necessary options discoverable · validate simplification against real tasks · document trade-offs and edge cases.

### Parkinson's Law
**Time / task design · Practice heuristic** (a project and workflow observation, not a predictor of individual behavior)
- **Means:** work expands to fill the time available.
- **Helps:** internal tools, approval workflows, form completion, project planning.
- **Scenario:** a review tool makes the required decision and deadline clear without arbitrary time pressure.
- **Failure:** fake countdowns to force conversion; rushing users through consequential choices.
- **Checklist:** make scope and completion criteria explicit · remove avoidable waiting and overhead · use time limits only when the task or safety justifies them · never manufacture urgency to manipulate consent or purchases.
- **Ref:** Parkinson, C. N. (1955).

### Principle of Least Effort
**Task efficiency · Practice principle**
- **Means:** people favor paths that seem to need less effort — but the shortest path isn't always safest, clearest or best.
- **Helps:** search, defaults, repeat actions, account setup, everyday workflows.
- **Scenario:** a returning user repeats a previous report in one action while still reviewing key parameters before running it.
- **Failure:** removing confirmation from an irreversible transfer just to cut clicks.
- **Checklist:** reduce unnecessary steps, not necessary understanding · use safe defaults and explain their effects · keep high-consequence decisions deliberate · measure total effort including errors and recovery.
- **Ref:** Zipf, G. K. (1949). *Human Behavior and the Principle of Least Effort.*

---

## 04 Nielsen's usability heuristics

Broad evaluation principles, not UI specifications. Use for expert reviews, early prototypes and spotting risks before formal testing. All: **Established usability heuristic** · Ref: Nielsen, J. (1994) / Nielsen Norman Group, 10 Usability Heuristics. (Recognition Rather Than Recall is in section 03.)

### Visibility of System Status
- **Means:** keep users informed with timely, relevant feedback.
- **Helps:** saving, loading, uploading, filtering, payment, AI generation, background processing.
- **Scenario:** an upload shows progress, file name, and a success or failure state.
- **Failure:** a submit button silently disabled with no progress indication.
- **Checklist:** acknowledge actions promptly · show progress for long operations · distinguish pending, success, warning and failure · don't claim success until the system confirms it.

### Match Between the System and the Real World
- **Means:** use the audience's language, concepts and sequence, not internal jargon.
- **Helps:** enterprise tools, healthcare, finance, onboarding, customer-facing forms.
- **Scenario:** "Send invoice", not "dispatch AR object".
- **Failure:** abbreviations only the product team understands.
- **Checklist:** use the terms users use in interviews and support tickets · follow the natural order of task information · use familiar icons only when meaning is clear · test comprehension with people outside the team.

### User Control and Freedom
- **Means:** clear ways to cancel, undo, go back or leave an unwanted state.
- **Helps:** dialogs, destructive actions, multi-step flows, editors, settings.
- **Scenario:** undo an archive; return to a prior step without losing entered data.
- **Failure:** a modal with no clear close or cancel; an irreversible destructive action.
- **Checklist:** visible exit from overlays and flows · support undo where practical · preserve work when going back · confirmation proportional to consequence, not on every action.

### Consistency and Standards
- **Means:** consistent labels and patterns within the product; follow platform conventions.
- **Helps:** design systems, navigation, forms, dialogs, mobile interactions.
- **Scenario:** same terminology and validation behavior for the same concept on every screen.
- **Failure:** "Save" means save on one screen and submit-for-approval on another.
- **Checklist:** consistent component states and terminology · respect platform conventions unless evidence supports change · document deliberate exceptions · audit similar tasks across the product.

### Error Prevention
- **Means:** prevent likely mistakes with constraints, good defaults, validation and clear confirmation before consequential actions.
- **Helps:** forms, deletion, payments, permissions, configuration.
- **Scenario:** a form validates a date range before submission and names the field needing attention.
- **Failure:** a vague error only after submitting a long form.
- **Checklist:** prevent predictable errors before submission · inline validation at an appropriate moment · confirm destructive or high-impact actions clearly · keep messages attached to the relevant field.

### Flexibility and Efficiency of Use
- **Means:** work for novices while letting experienced users become efficient.
- **Helps:** enterprise software, repeated workflows, keyboard-heavy and power-user tools.
- **Scenario:** a report builder offers a guided path plus saved templates and shortcuts.
- **Failure:** hidden gestures as the only path; novice screens crowded with expert controls.
- **Checklist:** clear defaults for novices · discoverable shortcuts for frequent users · personalization where it helps recurring tasks · shortcuts never replace accessible standard controls.

### Aesthetic and Minimalist Design
- **Means:** every extra element competes with relevant information; focus on the current goal.
- **Helps:** dashboards, forms, landing pages, onboarding, mobile.
- **Scenario:** a task page foregrounds title, relevant fields and next action; secondary details stay available.
- **Failure:** a minimal screen that hides pricing, constraints or next steps.
- **Checklist:** remove what doesn't help the current task · keep necessary context visible · progressive disclosure for secondary details · minimal visual style ≠ simple interaction.

### Help Users Recognize, Diagnose and Recover from Errors
- **Means:** plain-language errors that explain what happened and how to recover.
- **Helps:** forms, login, payment, uploads, imports, network failures.
- **Scenario:** "We couldn't upload report.csv. The connection was interrupted. Try again; your previous selection is saved."
- **Failure:** "Error 502" with no recovery path, or lost input.
- **Checklist:** state the problem plainly · say what to do next · preserve input where safe · don't blame the user or expose sensitive technical detail.

### Help and Documentation
- **Means:** help is easy to find, task-focused and actionable when needed.
- **Helps:** complex workflows, admin tools, billing, specialized products.
- **Scenario:** an import screen links a concise template and lists accepted formats beside the upload control.
- **Failure:** a generic help-center article as the only support for a specific error.
- **Checklist:** place help near the task · concrete steps and examples · searchable and accessible · keep docs in sync with the current UI.

---

## 05 Accessibility and inclusive design

A core quality attribute, not a finishing pass — it should shape IA, components, content and interaction from the start.

### WCAG-aware inclusive design
**Standards-based guidance**
- **Means:** users can perceive, understand, navigate and operate the experience across abilities and contexts.
- **Helps:** all products — especially forms, navigation, media, authentication, time-sensitive tasks.
- **Scenario:** a form with persistent labels, visible focus, errors associated with fields, sufficient contrast, and accessible status announcements.
- **Failure:** color-only meaning, inaccessible custom controls, focus traps, tiny targets, timeouts without recovery.
- **Checklist:** keyboard access and visible focus · semantic structure and accessible names · contrast, and never color alone · captions or alternatives for meaningful media · zoom/reflow and screen-reader behavior · WCAG 2.2 as conformance reference, validated on the real implementation.
- **Ref:** W3C WAI, WCAG.

### Cognitive accessibility
**Standards-adjacent supplemental guidance**
- **Means:** support users with difficulty in memory, attention, language, planning or complex sequences.
- **Helps:** forms, instructions, errors, authentication, complex and information-heavy tasks.
- **Scenario:** plain language, one clear instruction at a time, visible labels, saved progress, a way back.
- **Failure:** dense text blocks, unexplained abbreviations, unexpected movement, instructions that need memorizing.
- **Checklist:** make page purpose and next steps obvious · literal, concise language and clear headings · instructions next to their controls · avoid unexpected movement and data loss · let users review, correct and resume.
- **Ref:** W3C WAI, Cognitive Accessibility Guidance (supplemental to WCAG 2).

### Accessibility review reminders
- Use WCAG 2.2 as the current conformance reference; never claim conformance from visual inspection alone.
- Test keyboard operation, visible focus, semantic structure, contrast, zoom/reflow, status announcements and common assistive-technology paths.
- Automated tools find some issues; they cannot prove a product is accessible.
- Include users with disabilities in research and testing where feasible.

---

## References

The source guide is an original synthesis; for formal use consult the primary papers and current standards.

- Nielsen Norman Group — 10 Usability Heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- W3C WAI — Supplemental Guidance to WCAG 2 (cognitive accessibility): https://www.w3.org/WAI/WCAG2/supplemental/
- UX Design Institute — Laws of UX overview: https://www.uxdesigninstitute.com/blog/laws-of-ux/
- UX Principles — Laws of UX index: https://uxprinciples.design/laws
- Tognazzini — First Principles of Interaction Design (NN/G): https://www.nngroup.com/articles/first-principles-interaction-design/
- Fitts (1954): https://doi.org/10.1037/h0055392
- Miller (1956): https://doi.org/10.1037/h0043158 — avoid treating 7±2 as a UI item-count rule
- Hick (1952): https://doi.org/10.1080/17470215208416600
- Kurosu & Kashimura (1995): https://dl.acm.org/doi/10.1145/223355.223680
- Sweller (1988): https://doi.org/10.1207/s15516709cog1202_4
- Iyengar & Lepper (2000): https://doi.org/10.1037/0022-3514.79.6.995 — effects depend on context
- Zajonc (1968): https://doi.org/10.1037/h0025848
- Kahneman et al. (1993): https://doi.org/10.1037/0033-295X.100.4.606
- Csikszentmihalyi (1990), *Flow* (book)

Accuracy note: some principles are experimental effects, others professional heuristics or reasoning shorthands, and their evidence differs. Where a primary citation is uncertain the entry says so. Scenarios are illustrative, not claims about any company's internal decisions.
