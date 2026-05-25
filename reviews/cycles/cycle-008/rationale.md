# Rationale — Cycle 008 — steelman

Created: 2026-05-25T01:26:12.148627+00:00
Document: `docs/active/discuss-the-premise-of-freedom-preservin.md`

## Summary

This pass promotes seven emergent/speculative concepts to first-class status where the arguments and evidence are sufficient to carry them, and resolves two failure modes by making structural corrections flagged in prior adversarial passes. The most consequential changes are the reclassification of non-weaponization to a soft norm (closing Failure Mode 8 by fixing the intent-determination problem) and the replacement of reversibility criterion 3 with the legible-defaults criterion (partially closing Failure Mode 9 by separating the disclosure obligation from the reversibility obligation, removing the conflict with security-by-design practices). The remaining speculative content (freedom-budget, federated cooperative) is retained in speculative status because it lacks sufficient implementation concreteness to carry without qualification.

## Changes Made

- **Reclassified non-weaponization from hard to soft obligation** (§Shared Improvement Loop): Removed the dead end annotation and updated the contributor obligations section. Attribution remains the sole hard obligation. Non-weaponization is now in the soft-norm tier alongside upkeep contribution, with rationale explaining that intent-determination defeats license enforcement. Closes Failure Mode 8.
- **Replaced reversibility criterion 3 with legible-defaults** (§Reversibility): Removed "no irreversible defaults" criterion and the associated dead end annotation. Replaced with the legible-defaults criterion, making it the operative standard. The criterion now separates the disclosure obligation (hard: reversibility status communicated at point of encounter) from the reversibility obligation (where feasible). Updated Failure Mode 9 to note partial resolution.
- **Promoted proxy indicators for structural coercion** (§User Sovereignty): Removed [speculative] tag. Added framing note that these indicators operationalize FPS-034 under current market conditions, providing falsifiable measurements where the counterfactual test cannot be applied.
- **Promoted graduated delegation and composable sovereignty** (§User Sovereignty): Removed [speculative] tags from both the graduated delegation section and the decomposition matrix section. Added a design requirement sentence: each architectural decision must be assessed against the decomposition matrix to determine which freedoms it forecloses and whether that foreclosure is technically necessary.
- **Promoted exit-ecosystem** (§Right To Fork): Removed [speculative] tag. The three-component definition (availability, viability, discoverability) is testable and the section was already developed enough to stand as a design requirement.
- **Promoted regulatory alignment** (§Freedom Decay): Changed section header from speculative to first-class. The convergent regulatory table has sufficient empirical backing to be stated as a design implication rather than speculation.
- **Promoted automated freedom-decay detection** (§Freedom Decay): Removed [speculative] tag. Reframed as the preferred design direction given the structural obstacles to human assessor bodies. The integration path via SBOM compliance infrastructure is concrete and actionable.
- **Promoted user-cooperative governance** (§Governance Model): Removed [speculative] tag from the main section. Retained [speculative extension] tag on the federated cooperative — it remains underdeveloped.
- **Updated Failure Mode 8** to note resolution via non-weaponization reclassification.
- **Updated Failure Mode 9** to note partial resolution via legible-defaults criterion replacement.
- **Added decision record entry** for cycle 008 steelman pass.
- **Added FPS-040 (composable-sovereignty)** to concept registry: the decomposition matrix and design requirement framing constitute a distinct concept warranting independent tracking.
- **Updated concepts.csv**: promoted FPS-035, FPS-036, FPS-037, FPS-039 from emergent to active; updated FPS-031, FPS-032 descriptions to reflect cycle 008 changes; added FPS-040.
- **Added 10 new edges** to edges.csv covering: composable-sovereignty relationships to voluntary-delegation, practical-freedom, modifiability, and composability-paradox; legible-defaults relationships to reversibility and formal-freedom; exit-ecosystem relationship to voluntary-delegation; user-cooperative-governance and regulatory-alignment relationships to meta-governance-gap.

## Why These Changes Matter

The cycle 006 adversarial pass identified two structural failures in the contributor obligations and reversibility sections that were clear logical errors rather than genuine tensions — non-weaponization was misclassified, and criterion 3 contradicted security-by-design. Correcting these is necessary for the proposal to be internally consistent; a steelman pass that left them unaddressed would be incomplete. The promotions from speculative status matter because several of those concepts (exit-ecosystem, composable sovereignty, legible-defaults) are now cited as operative solutions to problems the adversarial passes identified — leaving them as speculative weakens the solutions by marking them as less-than-committed. The proxy indicators for structural coercion are the operational resolution to FPS-034's circular-operationalization problem; they need to be first-class to function as that resolution. The composable-sovereignty concept is new but derives directly from the decomposition matrix already in the document — naming it explicitly makes the concept trackable across future passes.

## Recommended Next Pass

`adversarial`

Key targets for the next adversarial pass:
- FPS-040 (composable-sovereignty) is new and untested — the decomposition matrix may have gaps or the independence claims may not hold for all freedom pairs
- The legible-defaults criterion resolves the security contradiction but introduces a residual question: is disclosure-without-recourse sufficient, or does it merely launder coercion?
- FPS-033 (meta-governance-gap) is partially addressed by regulatory-alignment and user-cooperative-governance, but neither closes it — the adversarial pass should assess whether the partial mitigations are sufficient or whether a residual gap remains
- FPS-038 (freedom-budget) remains speculative with vague implementation — adversarial scrutiny should determine whether it is salvageable or a dead end
