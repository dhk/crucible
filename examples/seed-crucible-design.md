# Crucible Seed Design

Crucible is a debate engine for refining documents through structured agentic review cycles.

## Thesis

People can create better work products by sending documents through deliberate agentic debate.

## Operating Model

A Markdown document lives in GitHub. Agents review it in alternating modes. Each pass produces commits, rationale, PR summaries, and concept metadata.

## Modes

- Strawman: creates variation.
- Steelman: strengthens the strongest version.
- Adversarial: stress-tests failure modes.

## Export

Crucible emits concept mutation data that Fossil can visualize.
