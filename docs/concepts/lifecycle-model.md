---
type: concept
status: stub
---

# Concept Lifecycle Model

Every concept in the Crucible registry moves through a defined set of lifecycle states as it is introduced, challenged, refined, and either adopted or discarded.

## States

| State | Meaning |
|---|---|
| `seed` | Introduced but not yet tested |
| `emergent` | Gaining traction across cycles |
| `contested` | Actively challenged by another agent |
| `adopted` | Accepted into the working document |
| `dominant` | Load-bearing — removing it would collapse the argument |
| `fragmented` | Split into multiple successor concepts |
| `deprecated` | Superseded, retained as negative knowledge |
| `archived` | Removed from active registry, preserved in history |
| `resurrected` | Returned from deprecated/archived after new evidence |

## Transitions

State transitions are recorded at each cycle by the agent making the pass. The registry stores the full transition history, not just the current state.

## Open questions

- Should `fragmented` produce explicit child-concept links, or is this implicit in edge data?
- What is the canonical trigger for `resurrected` vs. a new seed concept?
