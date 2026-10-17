# Usability and accessibility checklists

Use during design reviews, before handoff, and after implementation. A checked item means there is **evidence** it works — not that it appears in a mockup. When reporting, mark each relevant item as pass, fail, or not verifiable from what was supplied, and say what evidence would verify it.

## A. Discovery and problem framing
- [ ] Can the team state the primary user group, task, context and desired outcome?
- [ ] Have user research, analytics, support feedback and known accessibility needs been reviewed?
- [ ] Are user needs separated from stakeholder assumptions and proposed features?
- [ ] Are the highest-impact failure modes and their consequences known?
- [ ] Are measurable success and guardrail metrics defined?
- [ ] Are legal, privacy, security and domain-specific constraints identified?

## B. Information architecture and wireframes
- [ ] Does each screen have a clear purpose and a visible primary task?
- [ ] Are navigation labels understandable to intended users?
- [ ] Are related items grouped by proximity, headings or meaningful containers?
- [ ] Are choices grouped and ordered by user need rather than internal org structure?
- [ ] Can users recognize options instead of memorizing information across screens?
- [ ] Are important secondary actions available without competing with the primary task?
- [ ] Are empty, loading, error, success and permission-denied states designed?

## C. Visual hierarchy and UI
- [ ] Is there a clear hierarchy for title, supporting information, primary action and secondary actions?
- [ ] Are spacing, typography, color and component variants consistent?
- [ ] Is emphasis reserved for meaningful priorities rather than applied to everything?
- [ ] Do labels sit close to the controls they describe?
- [ ] Can users distinguish links, buttons, selected states and disabled states?
- [ ] Does the design remain understandable without relying on color alone?
- [ ] Do visual simplifications preserve necessary information and distinctions?

## D. Interaction behavior
- [ ] Does every interactive action provide appropriate feedback?
- [ ] Are loading and long-running operations communicated honestly?
- [ ] Can users cancel, go back, undo or recover where appropriate?
- [ ] Are destructive and high-consequence actions protected in proportion to their risk?
- [ ] Are validation errors specific, actionable and associated with the relevant input?
- [ ] Is work preserved after recoverable errors or navigation where feasible?
- [ ] Do keyboard, touch, pointer and assistive-technology users have equivalent paths?

## E. Forms and content
- [ ] Does each input have a persistent accessible label?
- [ ] Are required and optional fields clearly distinguished?
- [ ] Are formats and constraints explained before users hit an error?
- [ ] Does the system accept common input variations when safe?
- [ ] Is plain language used instead of internal jargon?
- [ ] Are instructions broken into task-sized steps and placed in context?
- [ ] Can users review and correct information before a consequential submission?

## F. Accessibility and inclusive design
- [ ] Can all functionality be operated by keyboard, with visible focus and logical focus order?
- [ ] Are semantic roles, names, headings, landmarks and form associations correct?
- [ ] Have text and non-text contrast been checked against the relevant WCAG 2.2 criteria?
- [ ] Do controls have usable target sizes and sufficient spacing for the intended context?
- [ ] Is information conveyed through more than color, position, sound or motion alone?
- [ ] Can content zoom and reflow without loss of function?
- [ ] Are animations and auto-updating content controllable where needed (including reduced-motion preferences)?
- [ ] Do errors and status changes work with assistive technology (e.g. announced via live regions)?
- [ ] Has it been tested with actual users and assistive technology where feasible?

## G. Responsive design and implementation
- [ ] Does the layout adapt without losing relationships or hiding essential content?
- [ ] Are breakpoints based on content and behavior rather than device names alone?
- [ ] Are touch targets and spacing suitable for small screens?
- [ ] Are sticky elements obscuring content, focus or validation messages?
- [ ] Do loading, offline, slow-network and retry states behave appropriately?
- [ ] Does the implementation match the component states and behavior documented in the design system?
- [ ] Have real content lengths, localization and text expansion been tested?

## H. Usability testing and release readiness
- [ ] Can representative users complete key tasks without coaching?
- [ ] Have hesitation, wrong turns, repeated actions and recovery attempts been observed?
- [ ] Have the least familiar and highest-risk flows been tested, not only the happy path?
- [ ] Are analytics events and success definitions instrumented correctly?
- [ ] Are accessibility defects triaged by severity and user impact?
- [ ] Are known limitations documented with a remediation plan?
- [ ] Does the final UI reflect what was tested, or did material changes happen afterward?

## Ethical review
- [ ] No concealed fees, difficult cancellation, fake scarcity, fake countdowns or manipulated consent.
- [ ] Progress indicators reflect real progress.
- [ ] Defaults are understandable and reversible where practical.
- [ ] Attention and salience support the user's task rather than obscure competing information.
- [ ] Only data with a clear purpose is requested.
- [ ] Works across differing abilities, devices, languages, expertise levels and environments.
