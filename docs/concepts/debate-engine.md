---
type: concept
status: stub
---

# Debate Engine

The debate engine is the core orchestration layer of Crucible. It manages the cycle of agentic review passes over a document, routing each pass to the appropriate agent role and collecting the resulting artifacts.

## Responsibilities

- Selecting the next agent and pass mode for each cycle
- Invoking the agent with the current document state
- Collecting and committing the output (document delta, rationale, concept registry updates)
- Deciding when to fork, continue, or terminate a debate thread

## Key concepts

- **Cycle**: a single agent pass. Produces document changes + metadata.
- **Pass mode**: the role the agent plays (`strawman`, `steelman`, `adversarial`).
- **Termination condition**: convergence threshold, cycle cap, or escalation flag.

## Open questions

- How is the next pass mode selected — fixed rotation, adaptive, or user-directed?
- What triggers a branch vs. continuing on main?
