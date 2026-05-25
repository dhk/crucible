# Rationale — Cycle 002 — steelman

Created: 2026-05-25T00:33:06.273822+00:00
Document: `docs/active/discuss-the-premise-of-freedom-preservin.md`

## Summary

The strawman pass surfaced the right problems — the formal/practical freedom gap, the layered user question, the AI inspectability gap, unresolved tensions — but left them as open critiques rather than strengthened positions. The steelman pass commits to a theoretical synthesis (capability + anti-domination framings), elevates the formal/practical freedom distinction to a document-wide framework, resolves the "who is the user" ambiguity with a layered sovereignty model, provides provisional positions on five of the six open tensions, introduces testable criteria for success and modifiability, and articulates concrete AI-inspectability conditions. The document now argues rather than merely lists.

## Changes Made

- **Cleaned up document header**: removed informal seed-pass language ("starting with...", "Here's the doc:"); converted to a structured design proposal with reference link
- **Added Theoretical Grounding section**: frames the four alternative framings from the strawman and commits to a synthesis (capability + anti-domination), rather than leaving the proposal theoretically uncommitted
- **Promoted formal/practical freedom to document-wide framework**: moved from a section-specific comment in Modifiability to a top-level cross-cutting framework applied throughout all five principles
- **Resolved the layered sovereignty question**: replaced the open question with a Layered Sovereignty Model (end user / administrator / organization) with an explicit domain-specificity priority rule
- **Added provisional position on individual vs. collective sovereignty tension**: individual exit rights take priority; collective resilience is a design responsibility, not a constraint on exit
- **Added Inspectability in AI Systems subsection**: articulates four concrete conditions under which AI systems satisfy inspectability-by-default (auditable training lineage, traceable inference paths, testable decision boundaries, surfaced uncertainty); distinguishes this from post-hoc saliency explanations
- **Added Positive Architectural Obligations subsection under Modifiability**: makes builder obligations explicit (progressive disclosure, documentation, stable interfaces, test infrastructure)
- **Added testable criterion for modifiability**: "modifiable by a competent practitioner working alone with only public documentation"
- **Strengthened Right to Fork with architectural implication**: protocol-level value survives fragmentation; concentration-level value does not — stated as a design requirement
- **Added dependency note to Shared Improvement Loop**: loop depends on practical modifiability; formal permission is insufficient without low activation energy
- **Reorganized Anti-Patterns into core vs. ecosystem categories**: improves structural clarity and exposes which patterns violate which principles
- **Strengthened Governance Model with minimal structure**: added four concrete governance principles (standards as commons, exit rights as floor, transparent governance, separation of stewardship and profit)
- **Added testable success criteria**: five observable conditions that make success non-subjective
- **Converted Open Tensions to include provisional positions**: five of six tensions now have directional answers; Freedom vs. Economic Sustainability remains genuinely open
- **Added AI-specific provisional position**: auditability + testability + interruptibility as the operative standard where full mechanistic transparency is not achievable
- **Added Decision Record entries**: documents the steelman pass's key commitments with rationale

## Why These Changes Matter

The strawman pass is structurally valuable but architecturally incomplete: it identifies the right problems without committing to positions, leaving the proposal vulnerable to the criticism that it is a list of concerns rather than an argument. The steelman pass's central move is to force commitment where the evidence supports it — the formal/practical distinction is strong enough to be a framework, not a caveat; the layered sovereignty model resolves the multi-party question definitively enough to be used; positive obligations are defensible enough to be stated. Providing testable criteria converts the proposal from a manifesto into a specification that can be evaluated against actual systems. The AI-inspectability criteria address the most contemporarily relevant gap in the original document.

## Recommended Next Pass

adversarial
