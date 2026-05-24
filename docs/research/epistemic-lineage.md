---
type: research
status: stub
---

# Epistemic Lineage

The question Crucible is ultimately trying to answer: *where did this idea come from, and why did it survive?*

## The problem

Most documents lose their reasoning in production. The final artifact hides:
- Arguments that were made and rejected
- Assumptions that were tested and held
- Concepts that were proposed and killed

This makes documents brittle — readers can't tell which parts are load-bearing and which are incidental.

## Crucible's approach

Store the full debate as a structured artifact alongside the document. Lineage is not prose commentary — it is queryable structured data: which agent introduced a concept, which cycle mutated it, which edges connect it to the broader argument.

## Relationship to provenance research

Data provenance (Buneman et al.) tracks how data flows through transformations. Epistemic lineage tracks how *claims* flow through argumentation. The problems are structurally similar; the domain is different.

## Open questions

- Is concept lineage sufficient, or do we need sentence-level or paragraph-level lineage?
- How does lineage interact with branching? (Two branches may have the same concept with different lineage.)
