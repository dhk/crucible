# Rationale — Cycle 005 — steelman

Created: 2026-05-25T00:46:50.569544+00:00
Document: `docs/active/discuss-the-premise-of-freedom-preservin.md`

## Summary

This pass integrated five emergent concepts from the cycle-004 strawman pass (FPS-028 through FPS-032) into the document's main body, resolved or partially resolved three dead-end annotations, consolidated a duplicate section, and added two new concrete mechanisms (freedom-decay periodic assessment and reversibility as a sub-principle). The document moves from speculative expansion to committed positions with testable criteria.

## Changes Made

- **Freedom-decay (FPS-028)**: Promoted from unresolved tension §7 to a standalone section (§Freedom Decay and Periodic Assessment) with five concrete decay indicators (documentation staleness, contributor concentration, dependency accumulation, network effect growth, codebase comprehension ceiling), observable metrics for each, and a lightweight periodic assessment mechanism specifying inputs, cadence triggers, intervention threshold, and governance structure.

- **Reversibility (FPS-031)**: Promoted from speculative mention in tension §7 to a standalone sub-principle of User Sovereignty, with precise definition distinguishing it from forkability (collective continuity), data portability (transfer mechanism), and exit rights (permission mechanism). Four testable criteria added: state undo, exit without loss, no irreversible defaults, and degradation transparency.

- **Voluntary delegation (FPS-030)**: Committed to interpretation 3 (structural coercion) as the operative assumption, with explicit acknowledgment that interpretations 1 and 2 are real boundary conditions. Added empirical distinguishing test (exit costs approaching zero + genuine alternatives). Added concrete design implication: the system's obligation is to ensure genuine alternatives exist, not to prevent user choices.

- **Contributor obligations (FPS-032)**: Distinguished hard obligations (attribution, non-weaponization) from soft norms (upkeep contribution). Provided rationale for the hard/soft distinction: upkeep as a hard obligation produces the unfunded-obligation anti-pattern at the individual level; attribution and non-weaponization are binary, low-cost to comply with, and their absence directly degrades the commons.

- **Infrastructure dependency stack (FPS-029)**: Removed [speculative] annotation. Added concrete design implication: systems must document their infrastructure dependency footprint (enumeration of each external dependency with governance status). Added connection to freedom-decay: infrastructure capture is a primary freedom-decay accelerant, and the footprint is both a design artifact and a periodic assessment input.

- **Modifiability dead end**: Replaced with tiered modifiability criterion (solo practitioner / small team of 3–5 / large engineering team) calibrated to system scope. Retained a constrained dead-end annotation covering the frontier AI model case, which the tiered criterion still does not resolve.

- **Security/freedom dead end**: Replaced with a three-condition evidence standard: (1) published threat model at sufficient detail for independent evaluation; (2) restriction scoped narrowly to identified attack surface; (3) no coincident lock-in benefit, or vendor bears burden of demonstrating no less-restrictive alternative. Evidence standard is imperfect — acknowledged as creating security-researcher-level accountability, not user-level — but shifts the burden of justification and creates a scrutinizable public record.

- **Economic sustainability duplicate**: Tension §4 now points to Failure Modes §1 (Economic Gravity) rather than restating the historical evidence. Removes approximately 150 words of redundancy.

- **Temporal framing**: Removed [speculative] annotation; updated to reference the new concrete section.

- **Decision Record and frontmatter**: Added steelman pass entry to Decision Record; updated crucible_state from `strawman` to `steelman`.

## Why These Changes Matter

The strawman pass (cycle 004) correctly expanded the solution space by surfacing five important concepts, but left them all either [speculative] or in unresolved-tensions limbo. The steelman pass's job is to commit where the evidence supports commitment. The key commitments made here:

1. **Structural coercion framing for voluntary delegation** matters because it changes the design target from individual consent enforcement (which is paternalistic) to ensuring genuine alternatives exist (which is structurally achievable). The shift is from a prohibition model to an ecosystem model.

2. **Hard/soft distinction for contributor obligations** matters because it prevents the unfunded-obligation failure mode from occurring at the individual contributor level while still articulating the commons requires reciprocal participation.

3. **Concrete freedom-decay indicators** matter because they convert the abstract temporal framing into something assessable — projects can actually measure whether they are decaying and at what rate. Without indicators, the temporal framing remains philosophical.

4. **Tiered modifiability criterion** matters because the original criterion provided no guidance for the systems where freedom is hardest to secure. The tiered version extends coverage to medium and large systems while preserving the principle.

5. **Evidence standard for security/freedom** matters because the dead-end annotation, while correct that the binary test is unoperationalizable, left the proposal with no mechanism at all. An imperfect but structured evidence standard is better than an acknowledged void.

6. **Reversibility as a named sub-principle** matters because it surfaces a failure mode (irreversibility chills user agency through accumulated exit costs) that forkability and data portability do not address — and that is increasingly relevant as systems accumulate user state.

## Recommended Next Pass

**Adversarial** — the steelman pass has committed to positions that are now testable and attackable:
- The structural coercion framing's empirical distinguishing test (exit costs approaching zero) is falsifiable and should be probed
- The evidence standard for security/freedom has three specific conditions that an adversarial pass should attempt to defeat or game
- The freedom-decay intervention threshold (two of five indicators) is a specific claim that can be challenged on calibration
- The tiered modifiability criterion's large-system definition ("skilled engineering team with public docs") needs adversarial scrutiny — most frontier AI systems fail this even for the engineering-team tier
- The hard/soft distinction for contributor obligations may not survive the anti-domination framing's scrutiny — soft norms enforced by community culture can be a domination mechanism
