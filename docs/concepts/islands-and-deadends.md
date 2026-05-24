---
type: concept
status: stub
---

# Islands and Dead Ends

Two classes of negative artifact that Crucible preserves as first-class knowledge.

## Islands

An **island** is a persistent zone of resistance the debate keeps encountering but cannot resolve. It is structural, not incidental — it recurs across multiple cycles and agents.

Examples: an irresolvable tradeoff, an external constraint the system cannot change, a values conflict between stakeholders.

Islands are not failures. They are charted territory. The Observatory surfaces them so future work knows where the debate has stalled and why.

**Schema fields:** `id`, `name`, `severity` (0–1), `cycles` (recurrence list), `desc`

## Dead Ends

A **dead end** is a concept that was introduced and subsequently deprecated or archived — a concept that failed. It is preserved as negative knowledge: explored terrain that should not be re-explored without new information.

**Schema fields:** `id`, `name`, `cycle` (when it died), `agent` (who killed it), `reason` (cause of death)

## Why preserve both

Crucible's core thesis is that the debate history is part of the artifact. Islands and dead ends are the map of where the argument *couldn't* go — equally important as where it did.
