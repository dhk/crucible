# CLAUDE.md

Crucible is an early-prototype Git-native debate engine (strawman/steelman/
adversarial passes) for design documents and strategy memos. Full
description: [README.md](README.md).

## Before running anything here

This repo's automated workflow runs the Claude CLI with permission
prompts bypassed, gives it broad write access, mutates git history, and
opens a PR on your behalf. Read README's "Architecture and trust
boundary" section and [CONTRIBUTING.md](CONTRIBUTING.md)'s full checklist
before invoking any debate automation — start from a clean checkout,
never on `main`, unrelated credentials/repos kept out of the checkout
first.

## Working rules (see CONTRIBUTING.md for the full list)

- Inspect the implementation before documenting behavior — don't claim
  capabilities (Fossil integration, dry-run mode, a dependency-free
  viewer) the repo doesn't actually have.
- Never commit secrets, tokens, private issue content, or model
  transcripts containing sensitive material.
- Validate with the same checks CI runs: `python3 scripts/validate_registry.py`,
  `python3 scripts/build_graph.py`, `python3 scripts/compute_idea_health.py`,
  `git diff --check`. The graph/health scripts rewrite derived files —
  review `git status --short` after and include only intentional
  generated changes.

## Structure

`agents/` — the strawman/steelman/adversarial role prompts.
`docs/{active,architecture,concepts,design,research,snapshots}` — design
docs by status; see [docs/architecture](docs/architecture) for how the
pieces fit together.
