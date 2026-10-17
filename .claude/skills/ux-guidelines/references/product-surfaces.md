# Applying principles to common product surfaces

Realistic design scenarios, not claims that a named company used a pattern because of a specific law. Adapt to audience, domain and evidence. Principle details are in `ux-laws-and-principles.md`.

## Navigation and information architecture
- **Problem:** users can't find the primary task among many destinations.
- **Principles:** Jakob's Law, Hick–Hyman Law, Serial Position Effect, Selective Attention, Consistency and Standards.
- **Pattern:** familiar navigation conventions; group related destinations; name items in user language; distinguish global navigation from contextual actions.
- **Example:** a project tool separates Projects, Inbox, Reports and Settings, keeps frequent destinations in stable positions, and offers search for large workspaces.
- **Measure:** task success, time to find a destination, search reformulation, navigation backtracking, support requests.

## Forms and data entry
- **Problem:** users abandon or submit forms with preventable errors.
- **Principles:** Proximity, Recognition Rather Than Recall, Postel's Law (carefully), Error Prevention, Cognitive Accessibility.
- **Pattern:** persistent labels; group related fields; accept reasonable formats; validate at a useful moment; preserve data; explain errors beside the field.
- **Example:** a contact form accepts phone punctuation, labels required fields, shows the expected format only when needed, and keeps valid entries after an error.
- **Measure:** completion rate, field-level error rate, correction time, abandonment by field, assistive-technology task success.

## Checkout and payment
- **Problem:** users hesitate because total cost, progress or next steps are unclear.
- **Principles:** Visibility of System Status, Hick's Law, Tesler's Law, User Control and Freedom, Peak–End Rule.
- **Pattern:** show total cost early; make each step clear; preserve entered information; provide a review step; give an accurate confirmation.
- **Example:** shipping and taxes shown before the final commit, edit paths for address and payment, order confirmed only after server confirmation.
- **Measure:** checkout completion, error recovery, unexpected-cost exits, payment retry rate, customer contacts.

## Dashboards and analytics
- **Problem:** dense data makes the next action hard to identify.
- **Principles:** Selective Attention, Common Region, Similarity, Chunking, Cognitive Load, Pareto Principle.
- **Pattern:** organize by user question; give metrics meaningful labels and units; surface important changes; drill down for detail.
- **Example:** a support dashboard separates workload, SLA risk and trend analysis rather than showing every metric at equal prominence.
- **Measure:** time to answer target questions, misinterpretations, drill-down success, repeated exports to external tools.

## Onboarding and setup
- **Problem:** too many decisions before users experience value.
- **Principles:** Paradox of the Active User, Goal-Gradient Effect, Recognition Rather Than Recall, Jakob's Law, Cognitive Load.
- **Pattern:** reach a useful starting state quickly; safe defaults; real progress; teach in context.
- **Example:** a design tool offers a starter file and optional guided setup; users can skip the tour and return later.
- **Measure:** time to first value, setup completion, return rate, feature adoption, onboarding-related support contacts.

## Search and filtering
- **Problem:** users can't express a query or understand why results appear.
- **Principles:** Postel's Law (carefully), Visibility of System Status, Recognition Rather Than Recall, Hick's Law.
- **Pattern:** accept common query variations; show active filters; clear reset; preserve search terms; explain empty states with recovery options.
- **Example:** a catalog search tolerates spacing and punctuation differences and suggests without silently replacing the query.
- **Measure:** search success, reformulation, zero-result rate, filter removal, time to find a target item.

## AI assistants and generative interfaces
- **Problem:** users can't predict what the system will do, whether it's still working, or whether output is reliable.
- **Principles:** Visibility of System Status, User Control and Freedom, error recovery, Mental Models, Cognitive Load.
- **Pattern:** state capabilities and limits; show processing status; preserve drafts; support editing and undo; expose sources where appropriate; clearly separate generated suggestions from confirmed facts or actions.
- **Example:** an AI writing assistant labels output as a draft, lets users revise before sending, and confirms external actions only after they succeed.
- **Measure:** correction rate, trust calibration, task success, reversals, hallucination detection, understanding of system limits.

## Responsive mobile interfaces
- **Problem:** controls are hard to reach, content overflows, rearrangement breaks relationships.
- **Principles:** Fitts's Law, Proximity, Similarity, Recognition Rather Than Recall, accessibility.
- **Pattern:** prioritize the main task; usable tap targets; keep label–control relationships; support zoom/reflow; no hover-only interactions.
- **Example:** a mobile filter panel with full-width controls and a clear Apply/Reset pattern, with selected filters visible in results.
- **Measure:** mobile task success, mis-taps, horizontal scrolling, zoom usability, completion by device class.
