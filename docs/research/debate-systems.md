---
type: research
status: stub
---

# Prior Art: Debate and Argumentation Systems

Notes on existing systems Crucible draws from or contrasts with.

## Formal argumentation theory

Dung (1995) abstract argumentation frameworks: arguments as nodes, attack relations as edges. Crucible's `contradict` edge type maps directly. Key difference: Crucible is document-oriented, not proposition-oriented — the artifact being debated is a living document, not a fixed claim.

## Structured argument tools

- **Kialo**: human-moderated pro/con trees. Crucible differs: agents, not humans; mutation not just addition.
- **Argument maps**: Toulmin-style claim/warrant/evidence. Crucible captures this implicitly in rationale fields.

## Multi-agent debate (LLM)

Recent work (Du et al. 2023, Khan et al. 2024) on LLM debate for factual accuracy. Crucible's distinction: document refinement, not factual adjudication. The artifact evolves; there is no single correct answer.

## Git as knowledge graph

Crucible's Git-native approach means the debate history is the commit history. Related: Dolt (versioned SQL), LakeFS (versioned object store). Crucible is the first to use Git as a structured debate artifact store with explicit concept lineage.

## Open questions

- Is there prior work on agentic document debate specifically (vs. claim debate)?
- Does Crucible's convergence model have formal properties (termination guarantees)?
