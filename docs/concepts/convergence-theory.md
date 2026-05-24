---
type: concept
status: stub
---

# Convergence Theory

Convergence describes the degree to which a Crucible debate is settling toward a stable document. It is not a simple measure — a document can converge on a wrong answer, or stall in apparent stability while concealing unresolved islands.

## Convergence score

A 0–1 scalar emitted by the pipeline after each cycle. Inputs:

- Rate of concept mutation (declining = converging)
- Ratio of `adopted`/`dominant` concepts to `contested`/`fragmented`
- Recurrence of islands (flat or declining recurrence = converging)
- Dead-end rate (high early, near-zero late = healthy convergence)

## Convergence states

| Status | Meaning |
|---|---|
| `Converging` | Score trending upward over last 3 cycles |
| `Stalled` | Score flat for 3+ cycles |
| `Escalated` | Human review flagged — debate cannot self-resolve |
| `Terminated` | Debate ended by cap or explicit close |

## Open questions

- Is convergence a lagging indicator? (Score rises after debate quiets, not because it's actually resolved.)
- Should island severity factor into the score, or be reported separately?
