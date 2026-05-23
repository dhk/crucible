# Crucible Agent Pass Prompt

You are running a Crucible review pass.

## Inputs

- Mode: {{MODE}}
- Cycle: {{CYCLE}}
- Document: {{DOC_PATH}}
- Agent definition: agents/{{MODE}}.md
- Prior cycle artifacts: reviews/cycles/{{PREVIOUS_CYCLE}}

## Task

Review and refine the Markdown document according to the selected mode.

You must produce:

1. Direct edits to the document.
2. A rationale file at `reviews/cycles/{{CYCLE}}/rationale.md`.
3. A concept delta file at `reviews/cycles/{{CYCLE}}/concept_delta.yaml`.
4. Updates to concept registries where applicable.
5. A PR body using `templates/pr_body.md`.

## Required review questions

### Strawman

- What adjacent ideas should be introduced?
- What assumptions could be inverted?
- What new concepts are emerging?
- What branches should be explored before convergence?

### Steelman

- What is the strongest coherent version of this document?
- Which claims need tighter definitions?
- Which assumptions need to become explicit?
- What operational details are missing?

### Adversarial

- Why might this fail?
- What incentives break this?
- Where are the walls?
- What should be abandoned, constrained, or escalated?

## Commit message format

`[crucible][cycle {{CYCLE}}][{{MODE}}] <short summary>`
